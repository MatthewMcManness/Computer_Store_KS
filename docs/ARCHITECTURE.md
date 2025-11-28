# Architecture

Computer Store KS is a web application for a computer repair shop featuring a public website, admin gallery management, and flyer generation.

## Dual Architecture

The project maintains **two parallel architectures**:

| Architecture | Status | Use Case |
|--------------|--------|----------|
| **Static HTML + Express API** | Production (computerstoreks.com) | Current live site |
| **Next.js Full-Stack** | Work-in-Progress | Future replacement |

Both architectures share the same **Resend-powered contact API** hosted on Render.

## Technology Stack

### Static HTML Site (Production)

| Layer | Technology |
|-------|------------|
| Frontend | Single-page HTML, Vanilla JavaScript, CSS |
| Configuration | `config.js` - centralized site settings |
| Admin | `admin-gallery.html`, `admin-gallery.js` |
| Flyer Generator | Client-side JavaScript |
| Backend API | Next.js API Routes on Render |
| Email | Resend API (via Next.js) |

### Next.js Application (WIP)

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS 3, Framer Motion |
| Backend API | Next.js API Routes |
| Image Storage | GitHub API (Octokit) |
| Email | Resend API |
| Authentication | Custom session-based auth |

## System Overview

### Production Architecture (Current)

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Client)                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                                   ▼
┌───────────────────┐           ┌───────────────────────────────┐
│   Static HTML     │           │   Next.js on Render           │
│   (index.html)    │           │   computer-store-ks.onrender  │
│                   │           │                               │
│  - Home           │           │   API Routes:                 │
│  - About          │  ──────►  │   - /api/contact (Resend)     │
│  - Services       │  Contact  │   - /api/health               │
│  - Gallery        │   Form    │   - /api/gallery              │
│  - Contact        │           │   - /api/auth                 │
│  - Silver Plan    │           │                               │
└───────────────────┘           └───────────────────────────────┘
                                            │
                    ┌───────────────────────┼───────────────────┐
                    ▼                       ▼                   ▼
            ┌──────────────┐       ┌──────────────┐    ┌──────────────┐
            │  GitHub API  │       │  Resend API  │    │ Session Auth │
            │  (Images)    │       │  (Email)     │    │  (Cookies)   │
            └──────────────┘       └──────────────┘    └──────────────┘
```

### Deployment Configuration

| Service | Platform | URL |
|---------|----------|-----|
| Static Frontend | CDN/Static Host | computerstoreks.com |
| Next.js API | Render | computer-store-ks.onrender.com |
| Contact API | Render (Next.js) | computer-store-ks.onrender.com/api/contact |

## Directory Structure

```
/
├── index.html              # Static site main page (single-page app)
├── style.css               # Static site styles
├── script.js               # Static site JavaScript
├── config.js               # Site configuration (business info, API URLs)
├── admin-gallery.html      # Admin interface for gallery management
├── admin-gallery.js        # Admin JavaScript
├── admin-login.html        # Admin login page
├── add-computer.html       # Form to add computers
├── edit-computer.html      # Form to edit computers
├── assets/                 # Images and media
│   ├── gallery/            # Computer images
│   └── *.png               # Site assets (logo, etc.)
├── checklists/             # Staff checklists
├── Sales Cards/            # Flyer templates
├── backups/                # HTML backups
│
├── src/                    # Next.js application source (WIP)
│   ├── app/                # App Router pages and API routes
│   │   ├── api/            # API route handlers
│   │   │   ├── contact/    # Contact form endpoint
│   │   │   ├── gallery/    # Gallery CRUD endpoints
│   │   │   ├── auth/       # Authentication endpoints
│   │   │   └── health/     # Health check
│   │   ├── admin/          # Admin pages (protected)
│   │   └── ...             # Public pages
│   ├── components/         # React components
│   ├── lib/                # Shared utilities
│   │   ├── auth.ts         # Authentication helpers
│   │   ├── email.ts        # Email sending (Resend)
│   │   ├── github.ts       # GitHub API integration
│   │   └── utils.ts        # General utilities
│   └── types/              # TypeScript type definitions
│
├── api/                    # Legacy Express.js API (for Docker deployment)
│   └── gallery-api.js      # Gallery CRUD + Contact (nodemailer)
│
├── docs/                   # Documentation
├── _archive/               # Deprecated code (preserved for history)
├── Dockerfile              # Docker build for static site + Express API
├── docker-compose.yml      # Docker Compose configuration
└── render.yaml             # Render deployment configuration (Next.js)
```

## Key Components

### Static Site Configuration (`config.js`)

Centralized configuration for:
- Business contact information
- API endpoints (contact form, health check)
- Navigation structure
- Service offerings
- Testimonials
- SEO metadata

### Contact Form Integration

The static site submits contact forms to the Next.js API:

```javascript
// config.js
api: {
  contact_endpoint: "https://computer-store-ks.onrender.com/api/contact",
  health_endpoint: "https://computer-store-ks.onrender.com/api/health"
}
```

Required fields:
- `name` (string)
- `email` (string)
- `subject` (enum: General, Repair, Custom Build, Silver Plan, Other)
- `message` (string, min 10 chars)
- `phone` (optional)

### Gallery Management

Admin interface at `admin-gallery.html` allows:
- Adding/editing computer listings
- Image uploads
- Publishing to GitHub (stores data in repository)

### Flyer Generator

Client-side JavaScript generates printable PDF flyers:
- Standard product flyers
- Black Friday promotional flyers
- Multiple layout options

## Security Considerations

- Admin routes protected by password authentication
- Session tokens stored in HTTP-only cookies
- Environment variables for sensitive data
- Input validation with Zod schemas (Next.js API)
- CORS configured for known domains
- Rate limiting on contact form (3 requests/minute)
- Honeypot field for bot detection

## Data Flow

### Contact Form Submission

1. User fills out form on static site
2. JavaScript validates locally
3. POST to `https://computer-store-ks.onrender.com/api/contact`
4. Next.js API validates with Zod
5. Resend API sends notification + confirmation emails
6. Success/error response returned

### Gallery Management

1. Admin authenticates via login page
2. Admin creates/edits computer listing
3. Images uploaded to GitHub via API
4. Computer data stored as JSON in GitHub repo
5. Public gallery fetches data from GitHub
