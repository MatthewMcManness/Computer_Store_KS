# Architecture

Computer Store KS is a Next.js 14 web application for a computer repair shop featuring a public website, admin gallery management, and flyer generation.

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Frontend | React 18, TypeScript |
| Styling | CSS (static-styles.css for public), Tailwind CSS (admin) |
| Backend API | Next.js API Routes |
| Blog Database | Supabase (PostgreSQL) |
| Image Storage | GitHub API (Gallery), Supabase Storage (Blog) |
| Email | Resend API |
| Authentication | RepairShopr OAuth + session-based auth |
| Deployment | Render (standalone output) |

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Client)                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js on Render                               │
│              computer-store-ks.onrender.com                  │
│                                                              │
│  Public Pages (src/app/(public)/):                          │
│  - / (Home)           - /about        - /services           │
│  - /gallery           - /contact      - /silver-plan        │
│  - /black-friday      - /blog         - /reviews            │
│  - /why-linux                                               │
│                                                              │
│  Admin Pages (src/app/admin/):                              │
│  - /admin/login       - /admin/gallery  - /admin/blog       │
│                                                              │
│  API Routes (src/app/api/):                                 │
│  - /api/contact       - /api/gallery    - /api/auth         │
│  - /api/blog          - /api/health                         │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌───────────────────┐
│  GitHub API  │  │  Resend API  │  │ RepairShopr OAuth │
│  (Images)    │  │  (Email)     │  │  (Authentication) │
└──────────────┘  └──────────────┘  └───────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────┐
│                    Supabase                           │
│  - PostgreSQL (blog posts, categories, tags)         │
│  - Storage (blog images)                             │
└──────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── app/
│   ├── (public)/                 # Route group for customer pages
│   │   ├── layout.tsx            # Public layout (Header + Footer)
│   │   ├── page.tsx              # Home page
│   │   ├── about/page.tsx
│   │   ├── services/page.tsx     # + /services/[slug] detail pages
│   │   ├── gallery/page.tsx      # Loads from src/data/gallery.json
│   │   ├── contact/page.tsx      # Contact form + Google Maps
│   │   ├── blog/                 # Blog system (Supabase)
│   │   │   ├── page.tsx          # Blog listing with search/filters
│   │   │   └── [slug]/page.tsx   # Individual blog posts
│   │   ├── reviews/page.tsx
│   │   ├── why-linux/page.tsx
│   │   ├── silver-plan/page.tsx
│   │   └── black-friday/page.tsx
│   │
│   ├── admin/                    # Admin dashboard (protected)
│   │   ├── layout.tsx            # Admin layout (sidebar)
│   │   ├── admin.css             # Tailwind styles for admin
│   │   ├── page.tsx              # Dashboard
│   │   ├── login/page.tsx
│   │   ├── gallery/              # Gallery management
│   │   └── blog/                 # Blog management
│   │       ├── page.tsx          # Blog posts list
│   │       ├── new/page.tsx      # Create new post
│   │       └── [id]/page.tsx     # Edit existing post
│   │
│   ├── api/                      # API route handlers
│   │   ├── contact/route.ts      # Contact form (Resend)
│   │   ├── gallery/route.ts      # Gallery CRUD
│   │   ├── blog/                 # Blog API
│   │   │   ├── route.ts          # GET/POST blog posts
│   │   │   ├── [slug]/route.ts   # GET/PUT/DELETE individual posts
│   │   │   └── upload/route.ts   # Image uploads to Supabase
│   │   ├── auth/                 # Authentication
│   │   └── health/route.ts       # Health check
│   │
│   ├── layout.tsx                # Root layout
│   ├── not-found.tsx             # 404 page
│   ├── global-error.tsx          # 500 error page
│   └── static-styles.css         # CSS for public pages
│
├── components/
│   ├── static/                   # Public page components
│   │   ├── Header.tsx            # Navigation with active states
│   │   ├── Footer.tsx            # Contact info, admin link
│   │   └── TestimonialsCarousel.tsx
│   ├── admin/                    # Admin components
│   └── gallery/                  # Gallery display components
│
├── data/
│   └── gallery.json              # Computer inventory (8 computers)
│
└── lib/
    ├── auth.ts                   # Session-based authentication
    ├── repairshopr.ts            # RepairShopr OAuth integration
    ├── email.ts                  # Resend email sending
    ├── github.ts                 # GitHub API for image storage
    ├── supabase.ts               # Supabase client + blog types
    └── utils.ts                  # General utilities

public/
└── assets/                       # Static files served at /assets/*
    ├── title.png                 # Main logo (512x236)
    ├── logo.png                  # Circular logo
    ├── logo_outlined.png
    ├── rws-logo.svg              # Footer credit logo
    ├── silver_plan.png
    └── gallery/                  # Computer images
```

## Route Groups

Next.js App Router uses route groups (folders in parentheses) to organize pages without affecting URL paths:

### `(public)` Route Group
- Contains all customer-facing pages
- Uses `static-styles.css` for styling (matches original static site design)
- Includes Header and Footer components
- Uses `dynamic = 'force-dynamic'` to avoid prerendering issues

### `admin` Route Group
- Contains admin dashboard pages
- Protected by authentication middleware
- Uses Tailwind CSS for styling
- Sidebar navigation

## Key Components

### Header (`src/components/static/Header.tsx`)
- Responsive navigation with hamburger menu for mobile
- Active state highlighting based on current path
- Scroll-triggered styling changes
- Links: Home, About, Services, Gallery, Black Friday, Silver Plan, Contact

### Footer (`src/components/static/Footer.tsx`)
- Business contact information
- Admin login link
- Resilient Web Solutions credit

### Gallery Page (`src/app/(public)/gallery/page.tsx`)
- Loads data from `src/data/gallery.json`
- Filter buttons: All, Desktops, Laptops, Refurbished, Custom Builds
- Flip card design with specs on back
- Black Friday sale badges and pricing

### Contact Page (`src/app/(public)/contact/page.tsx`)
- Contact form with validation
- Posts to `/api/contact`
- Google Maps embed
- Business hours display

## Data Flow

### Contact Form Submission
1. User fills out form on `/contact`
2. Client-side validation
3. POST to `/api/contact`
4. Server validates with Zod schema
5. Resend API sends notification to business + confirmation to user
6. Success/error response displayed

### Gallery Data
1. Gallery page imports `src/data/gallery.json`
2. Data transformed to component format
3. Filter state managed in React
4. Images served from `/assets/gallery/` or GitHub

### Authentication
1. User visits `/admin/login`
2. RepairShopr OAuth flow or password authentication
3. Session token stored in HTTP-only cookie
4. Middleware protects `/admin/*` routes

## Security

- Admin routes protected by authentication middleware
- Session tokens in HTTP-only cookies
- Environment variables for sensitive data
- Input validation with Zod schemas
- CORS configured for known domains
- Rate limiting on contact form
- Honeypot field for bot detection

## Deployment

### Render Configuration (`render.yaml`)
```yaml
services:
  - type: web
    name: computer-store-ks
    env: node
    buildCommand: npm install && npm run build && cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public
    startCommand: node .next/standalone/server.js
```

### Build Requirements
- `NODE_ENV=production` must be set for build
- `output: 'standalone'` in `next.config.mjs`
- Static assets copied to standalone folder

## Historical Note

The original static HTML site is preserved in `_archive/` for reference. It was migrated to Next.js in December 2025 to enable:
- Server-side API integration (Google Reviews planned)
- Better SEO with proper routing
- Unified codebase for public site and admin dashboard
