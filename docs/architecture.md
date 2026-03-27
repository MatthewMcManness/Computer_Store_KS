# Architecture Reference

## Directory Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (global CSS, metadata)
│   ├── error.tsx               # Error boundary page
│   ├── loading.tsx             # Global loading spinner
│   ├── robots.ts               # Dynamic robots.txt
│   ├── sitemap.ts              # Dynamic sitemap.xml
│   ├── (public)/               # Customer-facing pages
│   │   ├── layout.tsx          # Header + Footer wrapper
│   │   ├── page.tsx            # Homepage
│   │   ├── about/
│   │   ├── contact/
│   │   ├── gallery/            # Photo gallery
│   │   ├── in-store-pcs/       # Computers for sale
│   │   ├── reviews/
│   │   ├── services/           # Hub + 12 service detail pages
│   │   ├── silver-plan/
│   │   └── why-linux/
│   ├── admin/                  # Employee panel (Google OAuth protected)
│   │   ├── layout.tsx          # Sidebar + auth check
│   │   ├── page.tsx            # Dashboard
│   │   ├── in-store/           # Computer CRUD + archive + stock
│   │   └── photo-gallery/      # Photo upload + management
│   ├── (auth)/
│   │   └── login/              # Google sign-in page
│   ├── auth/
│   │   └── callback/           # OAuth callback handler
│   └── api/
│       ├── auth/               # check, logout
│       ├── contact/            # Contact form submission
│       ├── health/             # Health check endpoint
│       ├── in-store/           # Computer CRUD, stock, archive, restore, sale, upload
│       └── photo-gallery/      # Photo CRUD + upload
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
│   ├── gallery.ts              # Computer CRUD + sale pricing logic
│   ├── photo-gallery.ts        # Photo CRUD
│   ├── image-upload.ts         # Shared image processing pipeline (Sharp → WebP)
│   ├── email.ts                # Resend API email sending
│   ├── flyer-generator.ts      # Printable HTML sales flyer
│   ├── supabase.ts             # Database clients (public + admin)
│   ├── supabase-auth.ts        # Auth helpers (session, authorized check)
│   ├── spam-detection.ts       # Multi-layer spam scoring engine
│   ├── spam-patterns.ts        # Spam keyword/pattern detection
│   ├── disposable-email.ts     # Throwaway email domain list
│   ├── rate-limiter.ts         # In-memory rate limiter factory
│   ├── request-helpers.ts      # IP extraction utility
│   └── utils.ts                # cn() for Tailwind class merging, truncate()
└── types/                      # TypeScript type definitions (gallery, photo-gallery)
```

## Key Systems

### In-Store Computer Gallery

The main feature. Admin adds computers with photos, specs, and prices. Customers browse them on `/in-store-pcs`.

- **Data layer:** `lib/gallery.ts` — all CRUD operations
- **Image pipeline:** Upload → Sharp converts to WebP → full-size (2048px) + thumbnail (400px) → Supabase Storage
- **Sale pricing:** Admin activates a sale → `applySalePricing()` calculates discounted prices for eligible categories. The `blackFriday` field on computers holds sale data (named historically, used for ALL sales now).
- **Soft delete:** "Deleting" a computer archives it (`is_active=false`). Can be restored or permanently deleted from the archived page.
- **Stock tracking:** Each computer has a `stock_quantity` field, adjustable via the admin table.

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
5. **Email delivery** — Notification to store + confirmation to customer, sent in parallel

### Photo Gallery

Simple CRUD for photos on `/gallery`. Same Sharp image processing pipeline as computers. Admin uploads from `/admin/photo-gallery`.

### Auth Flow

Detailed annotation in `middleware.ts`. Summary:

1. Every request hits middleware → security headers added
2. Public routes pass through (no auth check)
3. Protected routes → read Supabase session cookie → verify email matches `AUTHORIZED_EMAIL`
4. Login: `/login` → Google OAuth → `/auth/callback` → email check → session set → `/admin`
5. Wrong email → signed out and redirected to `/login?error=unauthorized`

### Flyer Generator

`lib/flyer-generator.ts` builds a printable HTML page with computer specs, price, and sale info. Opens in a new browser tab for printing. Used from the admin computer table.

## Configuration Files

| File | Purpose |
|------|---------|
| `render.yaml` | Render deployment blueprint |
| `.nvmrc` | Node.js version (22) |
| `tailwind.config.js` | Custom theme (colors, fonts, spacing) |
| `next.config.mjs` | Next.js config (standalone output) |
| `tsconfig.json` | TypeScript strict mode settings |
| `.env.example` | Environment variable template |
