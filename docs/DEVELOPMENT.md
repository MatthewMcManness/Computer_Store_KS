# Development Guide

This guide covers setting up and running Computer Store KS locally.

## Prerequisites

- **Node.js**: 20.11.0+ (see `.node-version`)
- **Bun** (recommended) or npm
- **Git**
- **GitHub Account** (for gallery image storage)
- **Resend Account** (for contact form emails)
- **RepairShopr Account** (for customer/repair management integration)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/MatthewMcManness/Computer_Store_KS.git
cd Computer_Store_KS

# Install dependencies
bun install
# or: npm install

# Set up environment
cp .env.example .env
# Edit .env with your values (see Environment Variables below)

# Run development server
bun run dev
# or: npm run dev

# Open http://localhost:3000
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

### Required

| Variable | Description |
|----------|-------------|
| `ADMIN_PASSWORD` | Password for admin gallery access |
| `GITHUB_TOKEN` | GitHub Personal Access Token with repo permissions |
| `GITHUB_OWNER` | GitHub username or organization |
| `GITHUB_REPO` | Repository name |
| `GITHUB_BRANCH` | Branch for gallery data |
| `RESEND_API_KEY` | Resend API key for emails |
| `NOTIFICATION_EMAIL` | Email to receive contact form submissions |

### RepairShopr Integration

| Variable | Description |
|----------|-------------|
| `REPAIRSHOPR_SUBDOMAIN` | Your RepairShopr subdomain (e.g., `thecomputerstore` for thecomputerstore.repairshopr.com) |

### Optional

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Application URL (default: http://localhost:3000) |
| `NEXTAUTH_SECRET` | Session encryption secret |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key |

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server with hot reload |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run type-check` | Run TypeScript type checking |
| `bun run clean` | Remove build artifacts |

## Project Structure

```
src/
├── app/                # Next.js App Router
│   ├── api/            # API endpoints
│   ├── admin/          # Admin pages (protected)
│   └── [page]/         # Public pages
├── components/         # React components by feature
├── lib/                # Shared utilities and integrations
├── data/               # Static data files
├── styles/             # Global CSS
└── types/              # TypeScript definitions
```

## Development Workflow

### Creating a New Page

1. Create a folder in `src/app/` (e.g., `src/app/new-page/`)
2. Add `page.tsx` with the page component
3. Optionally add a client component (`new-page-client.tsx`)

### Creating a New Component

1. Identify the appropriate folder in `src/components/`
2. Create the component file (e.g., `MyComponent.tsx`)
3. Export from the folder's index if applicable

### Adding an API Endpoint

1. Create a folder in `src/app/api/` (e.g., `src/app/api/my-endpoint/`)
2. Add `route.ts` with HTTP method handlers

```typescript
// src/app/api/my-endpoint/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello' });
}
```

## RepairShopr Integration

The application integrates with [RepairShopr](https://www.repairshopr.com/) for customer authentication and repair ticket management.

### Configuration

1. Set `REPAIRSHOPR_SUBDOMAIN` in your `.env` file to your RepairShopr subdomain
2. The API client is located at `src/lib/repairshopr.ts`

### Usage

```typescript
import { RepairShoprClient, createRepairShoprClient } from '@/lib/repairshopr';

// Using factory function (reads subdomain from environment)
const client = createRepairShoprClient();

// Or manual configuration
const client = new RepairShoprClient({ subdomain: 'yoursubdomain' });

// Sign in and get API token
const { api_key, user } = await client.signIn('user@example.com', 'password');

// Get current user info
const { user } = await client.getMe(api_key);
```

### API Methods

| Method | Description |
|--------|-------------|
| `signIn(email, password)` | Authenticate user, returns API key and user info |
| `getMe(apiToken)` | Get current authenticated user details |

### Rate Limiting

RepairShopr enforces a rate limit of 180 requests per minute. The client automatically tracks requests and will throw a `RepairShoprAPIError` with code `RATE_LIMIT_EXCEEDED` if the limit is reached.

```typescript
// Check rate limit status
const { remaining, limit, resetMs } = client.getRateLimitStatus();
```

### Error Handling

```typescript
import { RepairShoprAPIError } from '@/lib/repairshopr';

try {
  await client.signIn(email, password);
} catch (error) {
  if (error instanceof RepairShoprAPIError) {
    console.error(`Error ${error.code}: ${error.message}`);
    // Handle specific error codes:
    // - UNAUTHORIZED: Invalid credentials
    // - RATE_LIMIT_EXCEEDED: Too many requests
    // - NETWORK_ERROR: Connection issues
    // - VALIDATION_ERROR: Invalid input
  }
}
```

## Code Conventions

### TypeScript
- Use strict mode
- Define types in `src/types/`
- Prefer interfaces for object shapes

### React Components
- Use functional components with hooks
- Server components by default, `'use client'` when needed
- Props interfaces defined above component

### Styling
- Use Tailwind CSS utility classes
- No separate CSS files for components
- Use `cn()` utility for conditional classes

### File Naming
- Components: `PascalCase.tsx`
- Utilities: `kebab-case.ts`
- Pages: `page.tsx` (Next.js convention)

## Testing

Run tests using Bun's built-in test runner:

```bash
bun test
```

Test files should use the `.test.ts` extension and be placed alongside the code they test.

## Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
bun run clean
bun install
bun run build
```

### Environment Issues
- Ensure `.env` file exists with all required variables
- Check that GitHub token has `repo` scope
- Verify Resend API key is valid
- Confirm RepairShopr subdomain is correct

### Port Already in Use
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## Legacy API

The `api/` directory contains a legacy Express.js API that was used before Next.js API routes. It's preserved for reference but the Next.js API routes in `src/app/api/` are the active implementation.
