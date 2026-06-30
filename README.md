# Computer Store KS

Website for Computer Store Kansas, a computer repair shop in Topeka, KS.

**Live Site:** [computerstoreks.com](https://computerstoreks.com)

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework (App Router) |
| TypeScript | Type-safe JavaScript (strict mode) |
| Tailwind CSS | Styling |
| PostgreSQL (via `pg`) | Self-hosted database, connection pool in `src/lib/db.ts` |
| Cloudflare Access | Edge auth for `/admin` and protected API routes |
| n8n webhook | Contact-form email delivery |
| Dokploy | Hosting (self-hosted, behind the RWS Cloudflare tunnel) |

## Development

```bash
nvm use              # Use Node 22 from .nvmrc
npm ci               # Install dependencies
npm run dev          # Start at localhost:3000
npm run build        # Production build
```

## Environment Variables

See `.env.example`. Required variables:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `UPLOADS_DIR` | Local volume path for uploaded images (default `/data/uploads`) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL |
| `CSKS_CONTACT_WEBHOOK_URL` | n8n webhook for contact-form email |
| `CSKS_CONTACT_WEBHOOK_SECRET` | Shared secret for the contact webhook |
| `NOTIFICATION_EMAIL` | Contact form recipient |
| `GOOGLE_OAUTH_CLIENT_ID` | Google Business Profile OAuth (reviews) |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google Business Profile OAuth (reviews) |
| `GOOGLE_OAUTH_REDIRECT_URI` | Google Business Profile OAuth callback URL |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare CAPTCHA |
| `TURNSTILE_SECRET_KEY` | Cloudflare CAPTCHA (server-side) |
| `CF_ACCESS_TEAM_DOMAIN` | Cloudflare Access team domain (JWT verification) |
| `CF_ACCESS_AUD` | Cloudflare Access application AUD tag |

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public marketing pages (home, about, services, computers, etc.)
│   ├── admin/             # Admin dashboard (in-store + slideshow), gated by Cloudflare Access
│   ├── 01..05, slideshow/ # In-store slideshow display pages for the store TVs
│   ├── api/               # API routes
│   └── uploads/           # Serves uploaded images from the local volume (UPLOADS_DIR)
├── components/
│   ├── static/            # Header, Footer
│   ├── admin/             # Admin UI (sidebar, forms, tables)
│   ├── forms/             # Contact form
│   ├── reviews/           # Google reviews display
│   ├── seo/               # JSON-LD schemas
│   └── ui/                # Reusable UI primitives
├── lib/                   # Utilities (db, gallery, slideshow, google-business, email, etc.)
├── middleware.ts          # Security headers + Cloudflare Access JWT verification
├── hooks/                 # Custom hooks (bot protection, fingerprint, dark mode)
└── types/                 # TypeScript type definitions
```

## Deployment

The site is hosted on the self-hosted Dokploy server behind the RWS Cloudflare tunnel. The exact deploy process is being finalized at the Dokploy cutover (in progress as of 2026-06-30). Always test locally and get approval before deploying.

## License

Private - All rights reserved
