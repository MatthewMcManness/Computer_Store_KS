# Architecture Reference

## Directory Structure

```
src/
├── middleware.ts               # Security headers + Cloudflare Access JWT verification
├── app/
│   ├── layout.tsx              # Root layout (global CSS, metadata)
│   ├── error.tsx               # Error boundary page
│   ├── loading.tsx             # Global loading spinner
│   ├── robots.ts               # Dynamic robots.txt
│   ├── sitemap.ts              # Dynamic sitemap.xml
│   ├── (public)/               # Customer-facing static marketing pages
│   │   ├── layout.tsx          # Header + Footer wrapper
│   │   ├── page.tsx            # Homepage
│   │   ├── about/
│   │   ├── contact/
│   │   ├── computers/          # Static marketing page (not a dynamic gallery)
│   │   ├── shop/               # External shop (iframe)
│   │   ├── reviews/
│   │   ├── services/           # Hub + 12 service detail pages
│   │   ├── silver-plan/
│   │   └── why-linux/
│   ├── 01/ .. 05/              # Per-screen in-store slideshow display pages
│   ├── slideshow/              # Slideshow index page
│   ├── admin/                  # Employee panel (Cloudflare Access protected)
│   │   ├── page.tsx            # Dashboard
│   │   ├── in-store/           # Computer CRUD + archive + stock
│   │   └── slideshow/          # Slideshow CRUD + archive + reorder
│   ├── uploads/[...path]/      # Serves uploaded images from the local volume (UPLOADS_DIR)
│   └── api/
│       ├── contact/            # Contact form submission
│       ├── health/             # Health check endpoint
│       ├── google-business/    # OAuth start/callback, token refresh, reviews
│       ├── in-store/           # Computer CRUD, stock, archive, restore, sale
│       └── slideshow/          # Slide CRUD, reorder, archive, restore, image upload
├── components/
│   ├── admin/                  # Admin panel (sidebar, shell, header, table, form, sale dropdown)
│   ├── forms/                  # ContactForm
│   ├── reviews/                # ReviewsDisplay, ReviewsWidget
│   ├── seo/                    # JSON-LD structured data
│   ├── static/                 # Header, Footer
│   └── ui/                     # Reusable primitives (Button, Input, Modal, Card, etc.)
├── hooks/                      # useBotProtection, useFingerprint, useInteractionTracking, useDarkMode
├── lib/                        # Business logic modules
│   ├── constants.ts            # Business info, locations, hours, authorized email
│   ├── db.ts                   # Postgres connection pool (pg), query() + withTransaction()
│   ├── access-jwt.ts           # Cloudflare Access JWT verification (jose)
│   ├── gallery.ts              # Computer CRUD + sale pricing logic
│   ├── slideshow.ts            # Slideshow slide CRUD + ordering
│   ├── google-business/        # Google Business Profile reviews (oauth, cache, reviews, selection)
│   ├── email.ts                # Contact email via the n8n webhook
│   ├── flyer-generator.ts      # Printable HTML sales flyer
│   ├── spam-detection.ts       # Multi-layer spam scoring engine
│   ├── spam-patterns.ts        # Spam keyword/pattern detection
│   ├── disposable-email.ts     # Throwaway email domain list
│   ├── rate-limiter.ts         # In-memory rate limiter factory
│   ├── request-helpers.ts      # IP extraction utility
│   └── utils.ts                # cn() for Tailwind class merging, truncate()
└── types/                      # TypeScript type definitions (gallery, slideshow, google-business)
```

## Key Systems

### Data Layer (Postgres)

All database access goes through `lib/db.ts`, a single `pg` connection pool. It exposes `query()` for parameterized queries and `withTransaction()` for multi-statement transactions. There is no ORM and no Supabase client. `DATABASE_URL` configures the connection; when it is unset the helpers throw.

### In-Store Computer Admin

Admin-managed inventory of computers for sale. Managed at `/admin/in-store`; the records live in `gallery_computers`.

- **Data layer:** `lib/gallery.ts`, all CRUD operations via `lib/db.ts`.
- **Not public:** these records are not currently rendered on any public page. The public `/computers` page is static marketing content.
- **Sale pricing:** Admin activates a sale, then `applySalePricing()` calculates discounted prices for eligible categories. The `blackFriday` field on computers holds sale data (named historically, used for ALL sales now).
- **Soft delete:** "Deleting" a computer archives it (`is_active=false`). Can be restored or permanently deleted from the archived page.
- **Stock tracking:** Each computer has a `stock_quantity` field, adjustable via the admin table.
- **Images:** `gallery_computers` has `image_url`/`thumbnail_url` columns, but the current admin form (`components/admin/computer-form.tsx`) submits only name, type, category, price, stock, and specs. Image upload is not wired into the current in-store form.

### In-Store Slideshow

A display system for the store TVs. Slides live in `slideshow_slides` and are managed at `/admin/slideshow`.

- **Data layer:** `lib/slideshow.ts` (CRUD, ordering, archive/restore) via `lib/db.ts`.
- **Display pages:** `/slideshow` (index) and `/01`..`/05` (per-screen) render the active slide set.
- **Image upload:** `POST /api/slideshow/upload` writes the raw image to the uploads volume (`UPLOADS_DIR`) and returns a same-origin `/uploads/<filename>` URL, which the new-slide form then stores on the slide record.
- **Unattended display:** the TVs have no login. `GET /api/slideshow` is public and returns active-only slides; all slideshow writes stay behind Cloudflare Access.

### Google Business Reviews

`lib/google-business/` pulls reviews from the Google Business Profile API and caches them.

- **OAuth:** refresh token is obtained via `/api/google-business/oauth/start` and `/api/google-business/oauth/callback`, stored in `oauth_tokens`.
- **Reviews:** fetched and cached in `reviews_cache`; served to the site via `GET /api/google-business/reviews`.
- **Display:** `components/reviews/` (ReviewsDisplay, ReviewsWidget).

### Image Storage

Uploaded images are written to a local volume at `UPLOADS_DIR` (default `/data/uploads`) and served by `src/app/uploads/[...path]/route.ts`. The route rejects any path containing `..` and caches responses immutably for one year. There is no Supabase Storage.

### Contact Form Spam Protection

Multi-layered pipeline (detailed annotation in `api/contact/route.ts`):

1. **Rate limiting** — 10 requests per minute per IP
2. **Zod validation** — Schema checks all fields
3. **Spam scoring** via `calculateSpamScore()`:
   - Honeypot fields (3 hidden inputs bots fill in)
   - Timing check (form filled too fast = bot)
   - Content analysis (gibberish, keyboard walks, excessive caps/links)
   - Name validation (real name vs spam)
   - Spam patterns (keywords like "viagra", "bitcoin", "SEO")
   - Disposable email detection
   - Interaction tracking (mouse/keyboard behavior)
   - Browser fingerprint consistency
   - Cloudflare Turnstile CAPTCHA verification
4. **Score thresholds:**
   - ≥70 → Silent fake success (tricks bots into thinking it worked)
   - ≥40 → Block with error message
   - <40 → Legitimate, send email
5. **Email delivery:** Notification to store + confirmation to customer (see Email Delivery below)

### Email Delivery

`lib/email.ts` sends mail by POSTing a JSON payload to the n8n webhook at `CSKS_CONTACT_WEBHOOK_URL`. The n8n workflow validates `CSKS_CONTACT_WEBHOOK_SECRET` and sends from `no-reply@computerstoreks.com` via the store's Google Workspace. The app never holds email credentials. If the webhook env vars are missing, `sendEmail()` returns `{ success: false }` without throwing. There is no Resend integration.

### Auth Flow

Cloudflare Access at the edge, re-verified in `middleware.ts` for defense in depth. Detailed annotation in `middleware.ts`. Summary:

1. Every request hits middleware, security headers added.
2. Only `/admin/*` and non-public `/api/*` are protected. Public pages, `/uploads/*`, and the public API routes pass straight through.
3. Cloudflare Access gates the protected paths at the edge. The middleware re-verifies the `Cf-Access-Jwt-Assertion` header via `lib/access-jwt.ts` (`jose`), then checks the email against the allow-list (`AUTHORIZED_EMAIL` plus `owner@resilientwebsolutions.com`).
4. There is no in-app login page. Cloudflare Access provides the login UI. A failed API check returns 401; a failed page check redirects to `/`.
5. When `CF_ACCESS_TEAM_DOMAIN` is unset (local dev and builds), the Access check falls open so the app still runs. The edge enforces auth in production.

### Flyer Generator

`lib/flyer-generator.ts` builds a printable HTML page with computer specs, price, and sale info. Opens in a new browser tab for printing. Used from the admin computer table.

## Configuration Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Container build for the Dokploy deploy |
| `render.yaml` | Legacy Render blueprint (being retired at the Dokploy cutover) |
| `db/schema.sql` | PostgreSQL schema (the five live tables) |
| `.nvmrc` | Node.js version (22) |
| `tailwind.config.js` | Custom theme (colors, fonts, spacing) |
| `next.config.mjs` | Next.js config (standalone output) |
| `tsconfig.json` | TypeScript strict mode settings |
| `.env.example` | Environment variable template |
