# CLAUDE.md

> Think carefully and implement the most concise solution that changes as little code as possible.

## Project Overview

Computer Store KS is a website for a computer repair shop in Topeka, Kansas featuring:
- Public-facing website (Next.js 14, React 18, TypeScript, Tailwind)
- Blog system with Supabase backend
- Admin gallery management system
- Admin blog management system
- Flyer generator for promotions
- Contact form with email notifications (Resend)

**Live Site:** https://computerstoreks.com
**Hosting:** Render
**Database:** Supabase (PostgreSQL)

## Architecture

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + custom CSS (`static-styles.css`)
- **Database:** Supabase (PostgreSQL) for blog
- **Image Storage:** GitHub API for gallery, Supabase/GitHub for blog
- **Authentication:** RepairShopr API
- **Email:** Resend
- **Hosting:** Render

### Directory Structure
```
src/
├── app/
│   ├── (public)/          # Public pages (customer-facing)
│   │   ├── page.tsx       # Homepage
│   │   ├── about/
│   │   ├── blog/          # Blog listing and posts
│   │   ├── contact/
│   │   ├── gallery/
│   │   ├── reviews/
│   │   ├── services/      # Services hub + 10 service detail pages
│   │   ├── silver-plan/
│   │   ├── black-friday/
│   │   └── why-linux/
│   ├── admin/             # Admin dashboard (protected)
│   │   ├── page.tsx       # Dashboard
│   │   ├── gallery/       # Gallery management
│   │   └── blog/          # Blog management
│   └── api/               # API routes
│       ├── auth/          # Authentication endpoints
│       ├── contact/       # Contact form
│       ├── gallery/       # Gallery CRUD + publish
│       └── blog/          # Blog CRUD + upload
├── components/
│   ├── static/            # Header, Footer, TestimonialsCarousel
│   ├── gallery/           # Gallery display components
│   └── admin/             # Admin UI components
├── lib/
│   ├── auth.ts            # RepairShopr session authentication
│   ├── supabase.ts        # Supabase client + blog operations
│   ├── github.ts          # GitHub API for image storage
│   ├── email.ts           # Resend email integration
│   └── flyer-generator.ts # PDF flyer generation
└── data/
    └── gallery.json       # Gallery computer inventory
```

### Route Groups
- `(public)` - Customer-facing pages with static site styling
- `admin` - Admin dashboard with Tailwind styling (protected)

### Archived Code (DO NOT USE)
- `_archive/` - Deprecated static HTML site and legacy docs
- `api/` - Legacy Express.js backend (preserved, mostly unused)

## Key Systems

### Blog System
- **Database:** Supabase PostgreSQL
- **Schema:** `docs/database/blog-schema.sql`
- **Public pages:** `/blog` (listing), `/blog/[slug]` (individual posts)
- **Admin pages:** `/admin/blog` (list), `/admin/blog/new` (create), `/admin/blog/[id]` (edit)
- **API routes:** `/api/blog`, `/api/blog/[id]`, `/api/blog/upload`
- **Features:** Categories, tags, markdown content, featured images, draft/published status

### Gallery System
- **Data:** `src/data/gallery.json`
- **Images:** Stored in GitHub repository via API
- **Admin:** `/admin/gallery`, `/admin/gallery/new`, `/admin/gallery/[id]`
- **API:** `/api/gallery`, `/api/gallery/[id]`, `/api/gallery/upload`, `/api/gallery/publish`
- **Features:** Desktops, laptops, Black Friday pricing, specs

### Authentication
- **Mode:** RepairShopr API authentication
- **Library:** `src/lib/auth.ts`
- **Sessions:** Encrypted cookies with AES-256-GCM
- **Protected routes:** All `/admin/*` pages

### Services Pages
Individual detail pages for each service:
- `/services` - Main services hub
- `/services/data-services` - Data Transfer & Cloning
- `/services/os-installation` - OS Installation
- `/services/custom-computers` - Custom-Built PCs
- `/services/laptops` - Laptops
- `/services/desktops` - Refurbished Desktops
- `/services/diagnostics` - Diagnostics
- `/services/virus-removal` - Virus & Malware Removal
- `/services/upgrades` - Hardware Upgrades
- `/services/debloat` - Windows Debloat
- `/services/antivirus` - Antivirus & Protection

## Environment Variables

### Required for Full Functionality
```bash
# Supabase (Blog)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# GitHub (Gallery images)
GITHUB_TOKEN=ghp_xxx
GITHUB_OWNER=MatthewMcManness
GITHUB_REPO=Computer_Store_KS
GITHUB_BRANCH=Computer-Store-KS

# Authentication
AUTH_MODE=repairshopr
REPAIRSHOPR_SUBDOMAIN=thecomputerstore
SESSION_SECRET=<64-hex-chars>

# Email (Contact form)
RESEND_API_KEY=re_xxx
NOTIFICATION_EMAIL=contact@computerstoreks.com
```

See `.env.example` for full list with documentation.

## Development

### Commands
```bash
bun install          # Install dependencies
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
```

### Tool Preferences
- **Package manager:** Bun (not npm/yarn)
- **Python:** uv (not pip)
- **Docker:** docker compose (not docker-compose)

### Important Patterns
- Use TypeScript strict mode
- Components organized by feature in `src/components/`
- API routes in `src/app/api/`
- Public pages use `static-styles.css`, admin uses Tailwind
- Authentication via session cookies (see `src/lib/auth.ts`)
- Gallery images stored in GitHub via API
- Blog images can be uploaded or external URLs

## API Reference

### Blog API
```
GET    /api/blog              # List published posts (public)
GET    /api/blog?admin=true   # List all posts (admin)
POST   /api/blog              # Create post (admin)
GET    /api/blog/[id]         # Get post by ID or slug
PUT    /api/blog/[id]         # Update post (admin)
DELETE /api/blog/[id]         # Delete post (admin)
POST   /api/blog/upload       # Upload image (admin)
```

### Gallery API
```
GET    /api/gallery           # List all computers
POST   /api/gallery           # Add computer (admin)
GET    /api/gallery/[id]      # Get single computer
PUT    /api/gallery/[id]      # Update computer (admin)
DELETE /api/gallery/[id]      # Delete computer (admin)
POST   /api/gallery/upload    # Upload image (admin)
POST   /api/gallery/publish   # Publish to GitHub (admin)
```

### Auth API
```
POST   /api/auth/login        # Login with RepairShopr
POST   /api/auth/logout       # Logout
GET    /api/auth/session      # Get current session
```

## Database Schema

### Blog Tables (Supabase)
- `blog_posts` - Main posts table
- `blog_categories` - Post categories
- `blog_tags` - Post tags
- `blog_post_tags` - Post-tag junction table

See `docs/database/blog-schema.sql` for full schema.

## Deployment

### Render Configuration
- **Build command:** `bun run build`
- **Start command:** `bun run start`
- **Environment:** Add all required env vars in Render dashboard

### Post-Deployment
1. Run blog schema in Supabase SQL Editor
2. Verify environment variables in Render
3. Test admin login and blog functionality

## Project Management

This project uses **Bast + CCPM** for spec-driven development.

```bash
/pm:prd-new <feature>      # Create requirements
/pm:prd-parse <feature>    # Plan implementation
/pm:epic-decompose <feature> # Break into tasks
/pm:epic-sync <feature>    # Sync to GitHub
/pm:issue-start <number>   # Start parallel work
```

See [PM_GUIDE.md](.claude/PM_GUIDE.md) for complete documentation.
