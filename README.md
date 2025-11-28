# Computer Store KS

A modern web application for a computer repair shop featuring a public-facing website, admin gallery management system, and flyer generator for promotions.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/MatthewMcManness/Computer_Store_KS.git
cd Computer_Store_KS

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

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Image Storage**: GitHub API
- **Email**: Resend API
- **Deployment**: Docker, PM2

## Project Structure

```
├── src/           # Next.js application source
│   ├── app/       # App Router pages and API routes
│   ├── components/ # React components
│   └── lib/       # Utilities and integrations
├── api/           # Legacy Express API (preserved)
├── public/        # Static assets
├── docs/          # Documentation
└── _archive/      # Deprecated code (preserved for history)
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and components
- [Development](docs/DEVELOPMENT.md) - Setup and development guide
- [Deployment](docs/DEPLOYMENT.md) - Production deployment
- [API Reference](docs/API.md) - API endpoints
- [Features](docs/FEATURES.md) - Application features

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run type-check` | TypeScript type checking |

## Environment Variables

Required environment variables (see `.env.example`):

- `ADMIN_PASSWORD` - Admin authentication
- `GITHUB_TOKEN` - GitHub API access for images
- `GITHUB_OWNER` / `GITHUB_REPO` - Repository for gallery data
- `RESEND_API_KEY` - Email service for contact form

## Features

- **Public Website**: Home, About, Services, Gallery, Contact pages
- **Admin Dashboard**: Gallery management with image uploads
- **Flyer Generator**: Create printable promotional flyers
- **Contact Form**: Email notifications via Resend

## License

Private - All rights reserved
