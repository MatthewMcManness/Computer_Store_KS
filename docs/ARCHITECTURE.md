# Architecture

Computer Store KS is a modern web application for a computer repair shop featuring a public website, admin gallery management, and flyer generation.

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS 3, Framer Motion |
| Backend API | Next.js API Routes, Express.js (legacy gallery API) |
| Image Storage | GitHub API (Octokit) |
| Email | Resend API |
| Authentication | Custom session-based auth |
| Deployment | Docker, PM2, Nginx |

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Client)                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Public Pages   │  │   Admin Pages   │  │  API Routes │ │
│  │  - Home          │  │  - Login        │  │  - /contact │ │
│  │  - About         │  │  - Gallery      │  │  - /gallery │ │
│  │  - Services      │  │  - New/Edit     │  │  - /auth    │ │
│  │  - Gallery       │  │                 │  │  - /health  │ │
│  │  - Contact       │  │                 │  │             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  GitHub API  │  │  Resend API  │  │ Express API  │
│  (Images)    │  │  (Email)     │  │  (Legacy)    │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Directory Structure

```
/
├── src/                    # Next.js application source
│   ├── app/                # App Router pages and API routes
│   │   ├── api/            # API route handlers
│   │   ├── admin/          # Admin pages (protected)
│   │   ├── about/          # About page
│   │   ├── contact/        # Contact form page
│   │   ├── gallery/        # Public gallery
│   │   ├── services/       # Services page
│   │   └── silver-plan/    # Silver plan page
│   ├── components/         # React components
│   │   ├── admin/          # Admin-specific components
│   │   ├── animations/     # Animation components
│   │   ├── forms/          # Form components
│   │   ├── gallery/        # Gallery components
│   │   ├── home/           # Homepage components
│   │   ├── layout/         # Layout components (Header, Footer)
│   │   ├── seo/            # SEO components
│   │   └── ui/             # Reusable UI components
│   ├── lib/                # Shared utilities
│   │   ├── auth.ts         # Authentication helpers
│   │   ├── constants.ts    # App constants
│   │   ├── email.ts        # Email sending (Resend)
│   │   ├── flyer-generator.ts  # PDF flyer generation
│   │   ├── github.ts       # GitHub API integration
│   │   └── utils.ts        # General utilities
│   ├── data/               # Static data files
│   ├── styles/             # Global styles
│   └── types/              # TypeScript type definitions
├── api/                    # Legacy Express.js API
│   └── gallery-api.js      # Gallery CRUD operations
├── public/                 # Static assets
├── docs/                   # Documentation
└── _archive/               # Deprecated code (preserved for history)
```

## Key Components

### Authentication (`src/lib/auth.ts`)
- Session-based authentication using HTTP-only cookies
- Admin password stored in environment variable
- Middleware protection for admin routes

### GitHub Integration (`src/lib/github.ts`)
- Uses Octokit REST API for GitHub operations
- Stores gallery images in GitHub repository
- Manages computer listings as JSON data in repo

### Email System (`src/lib/email.ts`)
- Resend API for transactional emails
- Contact form notifications
- HTML email templates

### Flyer Generator (`src/lib/flyer-generator.ts`)
- Generates printable PDF flyers for computers
- Supports multiple flyer layouts (standard, Black Friday)
- Client-side PDF generation

## Data Flow

### Gallery Management
1. Admin authenticates via `/admin/login`
2. Admin creates/edits computer listing
3. Images uploaded to GitHub via API
4. Computer data stored as JSON in GitHub repo
5. Public gallery fetches data from GitHub

### Contact Form
1. User submits contact form
2. API validates input with Zod
3. Email sent via Resend API
4. Success/error response returned

## Security Considerations

- Admin routes protected by middleware
- Session tokens stored in HTTP-only cookies
- Environment variables for sensitive data
- Input validation with Zod schemas
- CSRF protection via SameSite cookies
