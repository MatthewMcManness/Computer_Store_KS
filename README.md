# Computer Store KS

A web application for a computer repair shop featuring a public-facing website, admin gallery management system, and flyer generator for promotions.

## Live Site

- **Website**: [computerstoreks.com](https://computerstoreks.com)
- **API**: [computer-store-ks.onrender.com](https://computer-store-ks.onrender.com)

## Architecture

The site is built with **Next.js 14** (App Router) running on Render:

| Feature | Technology |
|---------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | CSS (static-styles.css for public pages, Tailwind for admin) |
| Backend API | Next.js API Routes |
| Image Storage | GitHub API (Octokit) |
| Email | Resend API |
| Authentication | RepairShopr OAuth + session-based auth |

## Quick Start

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Run development server
bun run dev
# Open http://localhost:3000

# Build for production (must set NODE_ENV)
NODE_ENV=production bun run build
```

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── (public)/       # Customer-facing pages
│   │   │   ├── page.tsx    # Home
│   │   │   ├── about/
│   │   │   ├── services/
│   │   │   ├── gallery/
│   │   │   ├── contact/
│   │   │   ├── silver-plan/
│   │   │   └── black-friday/
│   │   ├── admin/          # Admin dashboard (protected)
│   │   ├── api/            # API route handlers
│   │   └── static-styles.css
│   ├── components/
│   │   ├── static/         # Header, Footer, TestimonialsCarousel
│   │   ├── admin/
│   │   └── gallery/
│   ├── data/
│   │   └── gallery.json    # Computer inventory
│   └── lib/                # Utilities (auth, email, github)
├── public/assets/          # Static assets (logos, images)
├── docs/                   # Documentation
├── _archive/               # Deprecated static HTML site (historical reference)
└── render.yaml             # Render deployment configuration
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and components
- [Development](docs/DEVELOPMENT.md) - Setup and development guide
- [Deployment](docs/DEPLOYMENT.md) - Production deployment on Render
- [API Reference](docs/API.md) - API endpoints with examples
- [Features](docs/FEATURES.md) - Application features
- [Authentication](docs/AUTHENTICATION.md) - Auth system documentation

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run type-check` | TypeScript type checking |

## Environment Variables

Required for deployment (see `.env.example`):

| Variable | Description |
|----------|-------------|
| `SESSION_SECRET` | Session encryption key |
| `AUTH_MODE` | `repairshopr` or `password` |
| `REPAIRSHOPR_SUBDOMAIN` | RepairShopr account subdomain |
| `ADMIN_PASSWORD` | Fallback password auth |
| `GITHUB_TOKEN` | GitHub API access for gallery images |
| `GITHUB_OWNER` | GitHub username |
| `GITHUB_REPO` | Repository name |
| `RESEND_API_KEY` | Email service for contact form |

## Features

- **Public Website**: Home, About, Services, Gallery, Contact, Silver Plan, Black Friday pages
- **Admin Dashboard**: Gallery management with image uploads
- **Flyer Generator**: Create printable promotional flyers
- **Contact Form**: Email notifications via Resend API
- **Gallery**: Computer inventory with filtering and Black Friday pricing

## Deployment

The site deploys automatically to Render on push to the `Computer-Store-KS` branch.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## License

Private - All rights reserved
# Trigger rebuild Mon Dec 15 01:39:50 PM CST 2025
