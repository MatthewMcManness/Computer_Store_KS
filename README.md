# Computer Store KS

Website for Computer Store Kansas, a computer repair shop in Topeka, KS.

**Live Site:** [computerstoreks.com](https://computerstoreks.com)

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework (App Router) |
| TypeScript | Type-safe JavaScript (strict mode) |
| Tailwind CSS | Styling |
| Supabase | PostgreSQL database + Google OAuth |
| Resend | Contact form email |
| Render | Hosting (auto-deploys from Production branch) |

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
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key (server-side only) |
| `RESEND_API_KEY` | Email service |
| `NOTIFICATION_EMAIL` | Contact form recipient |
| `NEXT_PUBLIC_SITE_URL` | Public site URL |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare CAPTCHA |
| `TURNSTILE_SECRET_KEY` | Cloudflare CAPTCHA (server-side) |

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public pages (home, about, services, etc.)
│   ├── (auth)/            # Login page
│   ├── admin/             # Admin dashboard (protected)
│   ├── api/               # API routes
│   └── auth/              # OAuth callback
├── components/
│   ├── static/            # Header, Footer
│   ├── admin/             # Admin UI (sidebar, forms, tables)
│   ├── forms/             # Contact form
│   ├── reviews/           # Google reviews display
│   ├── seo/               # JSON-LD schemas
│   └── ui/                # Reusable UI primitives
├── lib/                   # Utilities (gallery, photo-gallery, image-upload, etc.)
├── hooks/                 # Custom hooks (bot protection, fingerprint, dark mode)
└── types/                 # TypeScript type definitions
```

## Deployment

Push to `Production` branch triggers auto-deploy on Render.

## License

Private - All rights reserved
