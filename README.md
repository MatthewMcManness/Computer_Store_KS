# Computer Store KS

A web application for a computer repair shop featuring a public-facing website, admin gallery management system, and flyer generator for promotions.

## Live Site

- **Website**: [computerstoreks.com](https://computerstoreks.com)
- **API**: [computer-store-ks.onrender.com](https://computer-store-ks.onrender.com)

## Architecture

The project maintains **two parallel architectures**:

| Architecture | Status | Description |
|--------------|--------|-------------|
| Static HTML + API | **Production** | Single-page HTML site with JavaScript navigation |
| Next.js Full-Stack | Work-in-Progress | Modern React-based replacement |

Both use the same **Resend-powered contact API** on Render.

## Quick Start

### Static Site (Production)

The static site just needs a web server:

```bash
# Serve static files
npx serve -s . -l 3000
# Open http://localhost:3000
```

### Next.js Development

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Run development server
bun run dev
# Open http://localhost:3000
```

## Technology Stack

### Static Site (Production)
- **Frontend**: Single-page HTML, Vanilla JavaScript, CSS
- **Configuration**: `config.js` for centralized settings
- **Backend API**: Next.js on Render (contact form via Resend)

### Next.js (WIP)
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Image Storage**: GitHub API
- **Email**: Resend API

## Project Structure

```
├── index.html          # Static site main page
├── style.css           # Static site styles
├── script.js           # Static site JavaScript
├── config.js           # Site configuration (API URLs, business info)
├── admin-*.html        # Admin interface pages
├── assets/             # Images and media
├── src/                # Next.js application (WIP)
├── api/                # Legacy Express API (Docker deployment)
├── docs/               # Documentation
└── _archive/           # Deprecated code (preserved for history)
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and dual architecture
- [Development](docs/DEVELOPMENT.md) - Setup and development guide
- [Deployment](docs/DEPLOYMENT.md) - Production deployment (Render, Docker)
- [API Reference](docs/API.md) - API endpoints with examples
- [Features](docs/FEATURES.md) - Application features

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start Next.js development server |
| `bun run build` | Build Next.js for production |
| `bun run start` | Start Next.js production server |
| `bun run lint` | Run ESLint |
| `bun run type-check` | TypeScript type checking |

## Environment Variables

Required for Next.js/Render deployment (see `.env.example`):

| Variable | Description |
|----------|-------------|
| `ADMIN_PASSWORD` | Admin authentication |
| `GITHUB_TOKEN` | GitHub API access for images |
| `GITHUB_OWNER` | GitHub username |
| `GITHUB_REPO` | Repository name |
| `RESEND_API_KEY` | Email service for contact form |

## Features

- **Public Website**: Home, About, Services, Gallery, Contact, Silver Plan pages
- **Admin Dashboard**: Gallery management with image uploads
- **Flyer Generator**: Create printable promotional flyers (standard + Black Friday)
- **Contact Form**: Email notifications via Resend API

## Deployment

### Current Production

| Service | Platform | URL |
|---------|----------|-----|
| Static Frontend | CDN | computerstoreks.com |
| Contact API | Render | computer-store-ks.onrender.com |

### Alternative: Docker

```bash
docker compose up -d
# Static site on :3000, Express API on :3001
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## License

Private - All rights reserved
