# CLAUDE.md

> Think carefully and implement the most concise solution that changes as little code as possible.

## Project Overview

Computer Store KS is a website for a computer repair shop featuring:
- Public-facing website (Next.js 14, React 18, TypeScript, Tailwind)
- Admin gallery management system
- Flyer generator for promotions
- Contact form with email notifications (Resend)

## Architecture

### Active Code
- `src/` - Next.js 14 application (App Router)
  - `src/app/(public)/` - Public pages (Home, About, Services, Gallery, Contact, Silver Plan, Black Friday)
  - `src/app/admin/` - Admin pages (protected)
  - `src/app/api/` - API route handlers
  - `src/components/static/` - Static site components (Header, Footer, TestimonialsCarousel)
  - `src/components/gallery/` - Gallery components
  - `src/components/admin/` - Admin components
  - `src/lib/` - Utilities (auth, email, github, flyer-generator)
  - `src/data/gallery.json` - Gallery computer inventory data
- `api/` - Legacy Express.js backend (preserved, mostly unused)
- `public/assets/` - Static assets (logos, gallery images)
- `docs/` - Project documentation

### Route Groups
- `(public)` - Customer-facing pages with static site styling (`static-styles.css`)
- `admin` - Admin dashboard with Tailwind styling (`admin.css`)

### Archived Code (DO NOT USE)
- `_archive/` - Deprecated static HTML site and legacy docs
  - This code is preserved for historical reference only
  - **Do NOT reference files in `_archive/` for current development**

## Key Files

### Frontend (src/)
- `src/app/(public)/page.tsx` - Homepage
- `src/app/(public)/layout.tsx` - Public layout with Header/Footer
- `src/app/admin/` - Admin pages (protected)
- `src/app/api/` - API route handlers
- `src/components/static/` - Header, Footer, TestimonialsCarousel
- `src/components/gallery/` - Gallery components
- `src/components/admin/` - Admin components
- `src/app/static-styles.css` - CSS for public pages (matches original static site)

### Utilities (src/lib/)
- `auth.ts` - Session-based authentication
- `github.ts` - GitHub API for image storage
- `email.ts` - Resend email integration
- `flyer-generator.ts` - PDF flyer generation

### Configuration
- `.env` - Environment variables (not committed)
- `.env.example` - Example environment config
- `next.config.mjs` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS config

## Project-Specific Instructions

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.

## Project Management

This project uses **Bast + CCPM** for spec-driven development.

### Quick Start Workflow
```bash
/pm:prd-new <feature>      # Create requirements
/pm:prd-parse <feature>    # Plan implementation
/pm:epic-decompose <feature> # Break into tasks
/pm:epic-sync <feature>    # Sync to GitHub
/pm:issue-start <number>   # Start parallel work
```

See [PM_GUIDE.md](.claude/PM_GUIDE.md) for complete documentation.

## Tool Preferences

- **Python:** Always use `uv` (not pip)
- **Node:** Always use `bun` (not npm)
- **Docker:** Always use `docker compose` (not docker-compose)

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";

// import .css files directly and it works
import './index.css';

import { createRoot } from "react-dom/client";

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.md`.

## Development Workflow

1. Run `bun install` to install dependencies
2. Copy `.env.example` to `.env` and configure
3. Run `bun run dev` for development
4. Run `bun run build` before committing

## Important Patterns

- Use TypeScript strict mode
- Components organized by feature in `src/components/`
- API routes in `src/app/api/`
- Use Tailwind for styling (no separate CSS files)
- Authentication via session cookies (see `src/lib/auth.ts`)
- Gallery images stored in GitHub via API (see `src/lib/github.ts`)
