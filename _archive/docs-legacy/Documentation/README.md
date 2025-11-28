# Computer Store KS - Version 3.0

A modern, performant website for Computer Store Kansas built with Next.js 14, TypeScript, and Tailwind CSS.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Related Documentation](#related-documentation)

## Overview

Computer Store KS Version 3.0 is a complete redesign of the Computer Store Kansas website. The site showcases refurbished computers for sale, provides information about repair services, and allows customers to contact the business through a modern, SEO-optimized web application.

**Business Information:**
- **Name:** Computer Store Kansas / The Computer Store
- **Address:** 2008 SW Gage Blvd, Topeka, KS 66604
- **Phone:** (785) 267-3223
- **Email:** contact@computerstoreks.com
- **Website:** https://computerstoreks.com
- **Hours:** Mon-Fri 10am-6pm, Sat 10am-2pm, Sun Closed
- **Founded:** 2003 by Jim Driggers

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 3** - Utility-first styling
- **Lucide React** - Icon library
- **class-variance-authority** - Component variant management
- **clsx + tailwind-merge** - Conditional class utilities

### Backend/Services
- **Resend** - Email delivery for contact form
- **Next.js API Routes** - Server-side endpoints
- **Zod** - Schema validation

### Infrastructure
- **Docker** - Containerized deployment
- **GitHub Actions** - CI/CD pipeline (when configured)
- **Sharp** - Image optimization

### Gallery System (Legacy v2 Preserved)
- **Express.js API** - Gallery management backend
- **Octokit** - GitHub API integration
- **Multer + Sharp** - Image upload and optimization

## Features

### Core Features
- Responsive, mobile-first design
- Server-side rendering for fast initial load
- SEO optimization with Schema.org markup
- Contact form with email notifications
- Computer gallery with flip-card animations
- Category filtering (Desktops, Laptops)

### SEO Features
- Schema.org LocalBusiness markup
- Product structured data
- FAQ schema support
- OpenGraph and Twitter cards
- Optimized meta tags
- XML sitemap
- robots.txt configuration

### Performance
- Image optimization with Next.js Image
- Automatic code splitting
- CSS optimization with Tailwind
- Tree-shaking for unused icons

### Admin Features
- Web-based gallery management
- Image upload with automatic optimization
- GitHub integration for version control
- Auto-deployment to production

## Quick Start

### Prerequisites
- Node.js 18.17.0 or higher
- Bun (recommended) or npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/MatthewMcManness/Computer_Store_KS.git
cd Computer_Store_KS

# Install dependencies
bun install
# or: npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Start development server
bun run dev
# or: npm run dev
```

The application will be available at http://localhost:3000

### Quick Gallery Manager Setup

For the admin gallery system:

```bash
# Install API dependencies
cd api
bun install

# Configure environment
cp .env.example .env
# Edit .env with GitHub token and admin password

# Start API server
bun start
```

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Application
NEXT_PUBLIC_APP_URL=https://computerstoreks.com

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx

# Contact form recipient
CONTACT_EMAIL=contact@computerstoreks.com
```

For the gallery API (`api/.env`):

```env
# GitHub Integration
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_OWNER=MatthewMcManness
GITHUB_REPO=Computer_Store_KS
GITHUB_BRANCH=Computer-Store-KS

# Admin Authentication
ADMIN_PASSWORD=your_secure_password

# Server
PORT=3001
```

## Project Structure

```
Computer_Store_KS/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout with metadata
│   │   ├── page.tsx            # Home page
│   │   ├── loading.tsx         # Loading state
│   │   ├── globals.css         # Global styles
│   │   └── api/                # API routes (future)
│   │
│   ├── components/
│   │   ├── ui/                 # Base UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── modal.tsx
│   │   │
│   │   ├── layout/             # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── nav.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   └── container.tsx
│   │   │
│   │   ├── home/               # Home page sections
│   │   │   ├── hero-section.tsx
│   │   │   ├── services-preview.tsx
│   │   │   ├── cta-section.tsx
│   │   │   ├── stats-section.tsx
│   │   │   └── testimonials.tsx
│   │   │
│   │   ├── gallery/            # Gallery components
│   │   │   ├── flip-card.tsx
│   │   │   ├── gallery-grid.tsx
│   │   │   ├── category-filter.tsx
│   │   │   └── gallery-skeleton.tsx
│   │   │
│   │   ├── forms/              # Form components
│   │   │   └── contact-form.tsx
│   │   │
│   │   └── seo/                # SEO components
│   │       ├── json-ld.tsx
│   │       └── breadcrumbs.tsx
│   │
│   ├── lib/                    # Utility functions
│   │   ├── constants.ts        # Business info, config
│   │   └── utils.ts            # Helper functions
│   │
│   └── types/                  # TypeScript types
│       └── index.ts
│
├── api/                        # Gallery Manager API
│   ├── gallery-api.js          # Express server
│   └── package.json
│
├── assets/
│   └── gallery/                # Computer images
│
├── public/                     # Static assets
│
├── Documentation/              # Project documentation
│
├── Dockerfile                  # Docker configuration
├── docker-compose.yml          # Docker Compose setup
├── next.config.mjs             # Next.js configuration
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## Available Scripts

```bash
# Development
bun run dev          # Start development server with hot reload
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint
bun run type-check   # Run TypeScript compiler check
bun run clean        # Remove build artifacts

# Gallery API (from /api directory)
bun start            # Start gallery API server
bun install          # Install API dependencies
```

## Related Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Developer setup and conventions
- [GALLERY_SYSTEM.md](./GALLERY_SYSTEM.md) - Gallery management documentation
- [CONTACT_FORM.md](./CONTACT_FORM.md) - Contact form implementation
- [SEO_IMPLEMENTATION.md](./SEO_IMPLEMENTATION.md) - SEO configuration guide
- [CHANGELOG.md](./CHANGELOG.md) - Version history

### Legacy Documentation
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
- [WEB_GALLERY_MANAGER_SETUP.md](./WEB_GALLERY_MANAGER_SETUP.md) - Gallery manager setup
- [DEPLOY_TO_LIVE_SITE.md](./DEPLOY_TO_LIVE_SITE.md) - Live deployment instructions
- [README_WEB_GALLERY.md](./README_WEB_GALLERY.md) - Web gallery documentation

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- iOS Safari (latest)
- Android Chrome (latest)

## License

Proprietary - Computer Store Kansas Internal Use Only

---

For questions or issues, contact the development team or refer to the specific documentation files listed above.
