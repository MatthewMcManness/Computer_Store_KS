# CLAUDE.md

> Think carefully and implement the most concise solution that changes as little code as possible.

> **Self-host migration COMPLETE (cut over 2026-07-05):** moved off Supabase/Resend/Render to self-hosted Postgres + local volume + Cloudflare Access + n8n email on Dokploy. computerstoreks.com now serves from the local Dokploy server via the `csks-prod` Cloudflare tunnel; the domain is on Cloudflare. Render + Supabase kept briefly as rollback, then decommissioned.

## Project Overview

Computer Store KS is the website for a computer repair shop in Topeka, Kansas.

**Live Site:** https://computerstoreks.com
**Hosting:** Local Dokploy server (managed app `csks-app` / `csks-prod-whpiwp`, behind the `csks-prod` Cloudflare tunnel) since the 2026-07-05 cutover. Render is gone. Monitoring via Uptime Kuma.
**Database:** Self-hosted PostgreSQL, accessed via a `pg` connection pool in `src/lib/db.ts`. Five tables.
**Auth:** Cloudflare Access at the edge. Authorized emails: `contact@computerstoreks.com`, `owner@resilientwebsolutions.com`.

### What the site does
- **Public site:** Static marketing pages: homepage, about, contact, services (hub + 12 detail pages), computers (static page), shop (external iframe), reviews, silver-plan, why-linux.
- **In-store slideshow:** A display system for the store TVs: a `/slideshow` index plus per-screen pages (`/01`..`/05`) that render the active slide set from `slideshow_slides`.
- **Admin panel:** Behind Cloudflare Access: manage in-store computers (`/admin/in-store`: add/edit/archive/stock/flyers, activate sales/discounts) and manage the slideshow (`/admin/slideshow`).
- **Google Business reviews:** Pulls and caches reviews via the Google Business Profile integration (`src/lib/google-business`, backed by `oauth_tokens` + `reviews_cache`).
- **Contact form:** Multi-layered spam protection + Cloudflare Turnstile; sends email via a dedicated n8n webhook (no email credentials in the app).

> Note: the in-store computers managed in `/admin/in-store` (`gallery_computers`) are not currently shown on any public page. The public `/computers` page is static marketing content.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14 (App Router) | React framework |
| TypeScript | 5.x (strict mode) | Type-safe JavaScript |
| React | 18 | UI components |
| Tailwind CSS | 3.x | All styling (only styling system) |
| pg (node-postgres) | Latest | PostgreSQL connection pool (`src/lib/db.ts`) |
| Cloudflare Access + jose | Latest | Edge auth; app verifies the Access JWT via `jose` (`src/lib/access-jwt.ts`) |
| n8n webhook | n/a | Contact-form email delivery (no in-app email credentials) |
| Sharp | 0.34.x | Image processing, used only by `scripts/generate-review-qr.js` (not in the app runtime) |
| Zod | 4.x | Form/API input validation |
| Cloudflare Turnstile | Latest | CAPTCHA for contact form |
| Node.js | 22.x | Runtime |
| npm | Latest | Package manager |

## Authentication

Cloudflare Access at the edge, with in-app JWT verification as defense in depth. There is no `/login` page and no Supabase Auth.

- **Authorized emails:** `contact@computerstoreks.com` (defined in `lib/constants.ts` as `AUTHORIZED_EMAIL`) and `owner@resilientwebsolutions.com`.
- **Gating model:** Cloudflare Access protects `/admin` and the non-public `/api/*` routes at the edge. `middleware.ts` re-verifies the `Cf-Access-Jwt-Assertion` JWT via `src/lib/access-jwt.ts` (`jose`) and checks the email against the allow-list. Public pages, `/uploads/*`, and the public API routes pass straight through.
- **Local/dev fallback:** when `CF_ACCESS_TEAM_DOMAIN` is unset (local runs and builds), the Access check falls open so the app still runs. The edge enforces auth in production.
- **No roles, no RBAC, no customer accounts.** Two authorized operators, both gated by Access.

## Database

Self-hosted PostgreSQL, accessed via the `pg` pool in `src/lib/db.ts`. Schema in `db/schema.sql`. Five tables:

| Table | Purpose |
|-------|---------|
| `slideshow_slides` | In-store slideshow slides (image/text, order, active/archived) |
| `gallery_computers` | Computers for sale (name, price, specs, images, stock, active/archived) |
| `gallery_sales` | Sale/discount definitions (type, percent, categories, active flag) |
| `oauth_tokens` | Google Business Profile OAuth refresh token storage |
| `reviews_cache` | Cached Google Business reviews |

- The Supabase-era tables `photo_gallery` and `user_profiles` were dropped in the migration. They are orphaned (no code references) and were not migrated.
- **Uploaded images** live on a local volume (`UPLOADS_DIR`, default `/data/uploads`), served by `src/app/uploads/[...path]/route.ts`. No Supabase Storage.

## Environment Variables

These are the only variables the code reads (confirmed via `grep -rhoE "process\.env\.[A-Z_0-9]+" src`).

```bash
# Database (REQUIRED)
DATABASE_URL=postgres://user:pass@host:5432/dbname

# Image uploads (volume path; defaults to /data/uploads)
UPLOADS_DIR=/data/uploads

# Site URL
NEXT_PUBLIC_SITE_URL=https://computerstoreks.com

# Contact form email via n8n webhook (REQUIRED for contact form)
CSKS_CONTACT_WEBHOOK_URL=https://n8n.resilientwebsolutions.com/webhook/csks-contact
CSKS_CONTACT_WEBHOOK_SECRET=
NOTIFICATION_EMAIL=contact@computerstoreks.com

# Google Business Profile OAuth (reviews integration)
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URI=https://computerstoreks.com/api/google-business/oauth/callback

# Cloudflare Turnstile (optional in dev)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=

# Cloudflare Access (edge auth; unset locally to fall open)
CF_ACCESS_TEAM_DOMAIN=
CF_ACCESS_AUD=

# Runtime (set by the platform)
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
```

See `.env.example` for the documented template. **Never commit real keys.**

## Development

```bash
npm install              # Install dependencies
npm run dev              # Dev server at localhost:3000
npm run build            # Production build (same command the Dokploy Dockerfile build runs)
npm run lint             # ESLint
npm run type-check       # TypeScript strict mode check
npm ci && npm run build  # Clean production build, test before deploying
```

**Tool rules:**
- `npm` only, do NOT use bun/yarn/pnpm (keep a single lockfile)
- Node.js 22.x (pinned in `.nvmrc` and `package.json` engines)
- Only `package-lock.json` should exist (no yarn.lock, bun.lockb, etc.)

**Code patterns:**
- TypeScript strict mode — no `// @ts-ignore`
- All styling is Tailwind — no CSS modules, no separate stylesheets
- Server Components by default. `'use client'` only for interactivity
- Business logic in `lib/` modules — API routes are thin handlers
- Every file has a JSDoc header comment (see `docs/comment-style.md`)

## Git & Deployment

> **Live on Dokploy since the 2026-07-05 cutover.** Full, current deploy steps are in `.claude/rules/branch-operations.md`. Short version: push to the `mirror` repo (`m318m972/computer-store-ks-mirror`, branch `migrate-dokploy-selfhost`), then trigger the Dokploy deploy (`application.deploy`, applicationId `4Vo5XO4DlcFTu25HpFjxb`). A GitHub push alone does NOT deploy. There is no push-to-Render flow anymore.

General workflow: work on the branch, test locally, get explicit user approval before deploying.

```bash
npm run dev                    # Test at http://localhost:3000
# Share localhost link with user for review
# WAIT for explicit user approval before pushing
npm run build                  # Verify production build passes
git add <files>
git commit -m "feat: description"
```

**There is no staging environment.** Always test locally and get approval before any deploy.

**Commit convention:** `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`

### Deploy target (Dokploy)
- **Hosting:** local Dokploy server (managed app `csks-app` / `csks-prod-whpiwp`, applicationId `4Vo5XO4DlcFTu25HpFjxb`), reached through the `csks-prod` Cloudflare tunnel.
- **Monitoring:** Uptime Kuma (replaces UptimeRobot).
- **Health check:** `/api/health`.
- **Node.js 22.**

### Deploy Checklist
1. `npm run dev`, test at http://localhost:3000
2. Get approval
3. `npm run build` passes
4. Push to `mirror` (branch `migrate-dokploy-selfhost`), then trigger `application.deploy` for applicationId `4Vo5XO4DlcFTu25HpFjxb`
5. Verify `/api/health` on live site

## Reference Docs

Read these when working on specific areas:

| Doc | When to read |
|-----|-------------|
| `docs/architecture.md` | Understanding the codebase structure, key systems, and how they connect |
| `docs/api-reference.md` | Working on API routes or debugging API behavior |
| `docs/comment-style.md` | Adding new files or functions — follow the commenting conventions |
