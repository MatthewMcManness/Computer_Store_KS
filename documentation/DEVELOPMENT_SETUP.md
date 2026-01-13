# Development Setup Guide

This guide covers everything you need to set up a local development environment for Computer Store KS.

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Initial Setup](#2-initial-setup)
3. [Running the Application](#3-running-the-application)
4. [Project Structure Guide](#4-project-structure-guide)
5. [Development Workflow](#5-development-workflow)
6. [Testing](#6-testing)
7. [Database Development](#7-database-development)
8. [Common Tasks](#8-common-tasks)
9. [Debugging](#9-debugging)
10. [IDE Setup](#10-ide-setup)

---

## 1. Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 20.11.x | Runtime environment (see `.node-version`) |
| Bun | Latest | Package manager and runtime |
| Git | Latest | Version control |
| Code Editor | VS Code recommended | Development IDE |

### Installing Node.js

The project requires Node.js 20.11.x. Use a version manager for easy switching:

```bash
# Using nvm (recommended)
nvm install 20.11.0
nvm use 20.11.0

# Verify installation
node --version  # Should show v20.11.x
```

The `.node-version` file ensures consistency across environments.

### Installing Bun

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows (via npm)
npm install -g bun

# Verify installation
bun --version
```

### Recommended VS Code Extensions

| Extension | ID | Purpose |
|-----------|-----|---------|
| TypeScript and JavaScript | `ms-vscode.vscode-typescript-next` | Enhanced TS support |
| Tailwind CSS IntelliSense | `bradlc.vscode-tailwindcss` | Tailwind autocomplete |
| ESLint | `dbaeumer.vscode-eslint` | Code linting |
| Prettier | `esbenp.prettier-vscode` | Code formatting |
| PostCSS Language Support | `csstools.postcss` | PostCSS syntax |
| GitLens | `eamodio.gitlens` | Git integration |
| Error Lens | `usernamehw.errorlens` | Inline error display |
| Auto Rename Tag | `formulahendry.auto-rename-tag` | JSX/HTML tag renaming |

---

## 2. Initial Setup

### Clone Repository

```bash
git clone https://github.com/MatthewMcManness/Computer_Store_KS.git
cd Computer_Store_KS
```

### Switch to Development Branch

```bash
git checkout Development
git pull origin Development
```

### Install Dependencies

```bash
bun install
```

This installs all dependencies defined in `package.json` and creates a `bun.lock` file.

### Environment Configuration

1. **Copy the example environment file:**

```bash
cp .env.example .env.local
```

2. **Configure required values:**

Open `.env.local` and fill in the necessary values. Here is the minimum configuration for local development:

```bash
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Supabase (REQUIRED for blog and database features)
NEXT_PUBLIC_SUPABASE_URL=https://gzcmwpcxnwlgknhjijic.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Authentication (REQUIRED for admin panel)
AUTH_MODE=repairshopr
REPAIRSHOPR_SUBDOMAIN=thecomputerstore
SESSION_SECRET=generate_with_openssl_rand_hex_32

# Bot Protection (use test keys for development)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

3. **Optional values for full functionality:**

```bash
# Email (contact form)
RESEND_API_KEY=re_your_key
NOTIFICATION_EMAIL=your_email@example.com

# GitHub (gallery management)
GITHUB_TOKEN=ghp_your_token
GITHUB_OWNER=MatthewMcManness
GITHUB_REPO=Computer_Store_KS
GITHUB_BRANCH=Development

# Analytics (optional)
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### Generate Session Secret

The `SESSION_SECRET` must be exactly 64 hex characters:

```bash
# Using openssl
openssl rand -hex 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Which Values Can Be Mocked

| Variable | Can Mock? | Notes |
|----------|-----------|-------|
| Supabase keys | No | Required for database features; get from Supabase dashboard |
| SESSION_SECRET | Generate locally | Use command above |
| TURNSTILE keys | Yes | Test keys provided in `.env.example` |
| RESEND_API_KEY | Yes | Contact form won't send, but app works |
| GITHUB_TOKEN | Yes | Gallery upload disabled, viewing works |
| REPAIRSHOPR_SUBDOMAIN | No | Required for admin auth |

---

## 3. Running the Application

### Development Mode

```bash
bun run dev
```

This starts the Next.js development server with hot module replacement at `http://localhost:3000`.

**Features in dev mode:**
- Fast Refresh (instant updates on save)
- Error overlay with stack traces
- Source maps for debugging
- API routes available at `/api/*`

### Production Build

```bash
# Build the application
bun run build

# Start production server
bun run start
```

The build creates a standalone output in `.next/standalone/` optimized for deployment.

### Type Checking

```bash
bun run type-check
```

Runs TypeScript compiler without emitting files to check for type errors. This is separate from the build process.

### Linting

```bash
bun run lint
```

Runs ESLint to check for code style issues.

### Clean Build

```bash
bun run clean
```

Removes `.next/`, `out/`, and `node_modules/` directories for a fresh start.

---

## 4. Project Structure Guide

### Directory Overview

```
Computer_Store_KS/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (public)/          # Public pages (customer-facing)
│   │   ├── admin/             # Admin dashboard (protected)
│   │   ├── api/               # API route handlers
│   │   ├── auth/              # Authentication pages
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage (redirects)
│   ├── components/
│   │   ├── admin/             # Admin UI components
│   │   ├── animations/        # Animation components
│   │   ├── forms/             # Form components
│   │   ├── gallery/           # Gallery display
│   │   ├── home/              # Homepage sections
│   │   ├── layout/            # Layout wrappers
│   │   ├── reviews/           # Review components
│   │   ├── seo/               # SEO components
│   │   ├── static/            # Header, Footer, etc.
│   │   └── ui/                # Reusable UI primitives
│   ├── lib/                   # Utility functions and integrations
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript type definitions
│   ├── data/                  # Static data (gallery.json)
│   ├── styles/                # Global CSS files
│   └── middleware.ts          # Auth and routing middleware
├── public/                    # Static assets
├── docs/                      # Project documentation
│   ├── database/              # Database schemas
│   └── supabase/              # Supabase configuration
├── documentation/             # Business documentation
├── .claude/                   # Project management configs
└── scripts/                   # Utility scripts
```

### Key Files

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Authentication, routing, security headers |
| `src/lib/auth.ts` | RepairShopr authentication logic |
| `src/lib/supabase.ts` | Supabase client and queries |
| `src/lib/email.ts` | Resend email integration |
| `src/lib/github.ts` | GitHub API for gallery images |
| `src/data/gallery.json` | Computer inventory data |
| `tailwind.config.js` | Tailwind CSS configuration |
| `next.config.mjs` | Next.js configuration |
| `render.yaml` | Render deployment blueprint |

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `AdminSidebar.tsx` |
| Pages | lowercase with hyphens | `silver-plan/page.tsx` |
| Utilities | camelCase | `formatDate.ts` |
| Types | PascalCase | `BlogPost.ts` |
| API Routes | lowercase | `route.ts` |
| CSS/Styles | kebab-case | `static-styles.css` |

### Route Groups

- `(public)` - Customer-facing pages with static site styling
- `admin` - Admin dashboard with Tailwind styling (requires auth)

---

## 5. Development Workflow

### Git Branching Strategy

| Branch | Purpose | Auto-deploys to |
|--------|---------|-----------------|
| `Production` | Live customer site | computerstoreks.com |
| `Development` | Staging/testing | csk-development.onrender.com |

### Making Changes

1. **Start from Development branch:**
   ```bash
   git checkout Development
   git pull origin Development
   ```

2. **Create a feature branch (optional for small changes):**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make changes and test locally:**
   ```bash
   bun run dev
   # Test at http://localhost:3000
   ```

4. **Commit with descriptive message:**
   ```bash
   git add .
   git commit -m "feat: add user authentication"
   ```

5. **Push to remote:**
   ```bash
   git push origin Development
   # Or: git push origin feature/your-feature-name
   ```

6. **Create PR to merge to Production when ready.**

### Commit Message Format

```
type: description

# Types:
# feat     - New feature
# fix      - Bug fix
# docs     - Documentation only
# refactor - Code refactoring
# test     - Adding tests
# chore    - Maintenance tasks
```

### Code Style

**TypeScript Strict Mode:**
The project uses strict TypeScript settings defined in `tsconfig.json`:
- `strict: true`
- `noUncheckedIndexedAccess: true`
- `noImplicitOverride: true`

**Tailwind Patterns:**
```typescript
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Use cn() helper for conditional classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Example usage
<button className={cn(
  'px-4 py-2 rounded-lg',
  isActive && 'bg-blue-600 text-white',
  disabled && 'opacity-50 cursor-not-allowed'
)}>
```

**Component Patterns:**
```typescript
// Prefer named exports
export function MyComponent({ prop }: Props) {
  return <div>{prop}</div>
}

// Use TypeScript interfaces for props
interface Props {
  prop: string
  optional?: number
}
```

### Documentation Requirements

All functions MUST have comprehensive JSDoc comments (see `CLAUDE.md` for full requirements):

```typescript
/**
 * Brief summary of what the function does.
 *
 * Detailed description explaining purpose and approach.
 *
 * @param paramName - Description of parameter
 * @returns Description of return value
 *
 * @throws {ErrorType} When this error occurs
 *
 * @sideEffects
 * - Modifies database state
 * - Sends email notification
 *
 * @example
 * const result = await myFunction(input)
 *
 * @functions_called helperFunction, validateInput
 * @called_by ParentComponent, ApiRouteHandler
 *
 * @version 1.0.0 - 2026-01-12T00:00:00Z - Initial implementation
 */
```

---

## 6. Testing

### Test Files Location

Test files are located alongside their source files or in dedicated directories:

```
src/
├── lib/
│   ├── auth.ts
│   ├── auth.test.ts           # Unit tests
│   ├── repairshopr.ts
│   ├── repairshopr.test.ts
│   └── ...
├── __tests__/
│   └── auth-integration.test.ts  # Integration tests
└── middleware.test.ts
```

### Running Tests

Currently, the project uses direct test files. To run tests:

```bash
# TypeScript tests can be run with ts-node
npx ts-node --compiler-options '{"module":"CommonJS"}' src/lib/auth.test.ts
```

### Test Patterns

```typescript
// Example test structure
import { describe, it, expect } from 'your-test-framework'

describe('functionName', () => {
  it('should handle valid input', () => {
    const result = functionName('valid-input')
    expect(result).toBe('expected-output')
  })

  it('should throw on invalid input', () => {
    expect(() => functionName('')).toThrow('Error message')
  })
})
```

### Manual Testing Checklist

Before committing changes, verify:

- [ ] Page renders without errors
- [ ] No TypeScript errors (`bun run type-check`)
- [ ] No console errors in browser
- [ ] Mobile responsive layout works
- [ ] Admin authentication works
- [ ] API endpoints return expected data

---

## 7. Database Development

### Supabase Overview

The project uses Supabase (PostgreSQL) for:
- Blog posts and categories
- Ticket status overrides
- Customer data syncing
- Session management

### Database Schema

Schema files are in `docs/database/`:
- `blog-schema.sql` - Blog tables
- Ticket status tables defined in `src/lib/supabase.ts`

### Local Supabase (Optional)

For offline development or testing schema changes:

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize local Supabase
supabase init

# Start local instance
supabase start

# Apply migrations
supabase db push
```

Update `.env.local` to point to local instance:
```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_local_service_key
```

### Creating Migrations

```bash
# Generate migration from changes
supabase db diff -f migration_name

# Apply migration
supabase db push
```

### Database Changes Workflow

1. Make schema changes in Supabase dashboard or local instance
2. Generate migration file
3. Test locally
4. Commit migration file
5. Apply to production via Supabase dashboard

---

## 8. Common Tasks

### Adding a New API Route

1. **Create route file:**
   ```
   src/app/api/your-route/route.ts
   ```

2. **Implement handler:**
   ```typescript
   import { NextRequest, NextResponse } from 'next/server'

   /**
    * Handles GET requests for your-route.
    *
    * @param request - Incoming request object
    * @returns JSON response with data
    *
    * @version 1.0.0 - Initial implementation
    */
   export async function GET(request: NextRequest): Promise<NextResponse> {
     try {
       // Your logic here
       return NextResponse.json({ data: 'result' })
     } catch (error) {
       return NextResponse.json(
         { error: 'Internal server error' },
         { status: 500 }
       )
     }
   }
   ```

3. **Add authentication if needed:**
   ```typescript
   import { getSession } from '@/lib/auth'

   export async function GET(request: NextRequest) {
     const session = await getSession(request)
     if (!session) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
     }
     // Continue with authenticated logic
   }
   ```

### Adding a New Component

1. **Create component file:**
   ```
   src/components/feature/MyComponent.tsx
   ```

2. **Implement with TypeScript:**
   ```typescript
   'use client'  // Only if using hooks or browser APIs

   interface MyComponentProps {
     title: string
     children?: React.ReactNode
   }

   /**
    * Displays a feature component with title.
    *
    * @param title - Component title text
    * @param children - Optional child elements
    * @returns Rendered component
    *
    * @version 1.0.0 - Initial implementation
    */
   export function MyComponent({ title, children }: MyComponentProps) {
     return (
       <div className="p-4 bg-white rounded-lg shadow">
         <h2 className="text-xl font-bold">{title}</h2>
         {children}
       </div>
     )
   }
   ```

3. **Export from index (if using barrel exports):**
   ```typescript
   // src/components/feature/index.ts
   export { MyComponent } from './MyComponent'
   ```

### Adding a New Page

1. **Create page directory and file:**
   ```
   src/app/(public)/your-page/page.tsx
   ```

2. **Implement page component:**
   ```typescript
   import { Metadata } from 'next'

   export const metadata: Metadata = {
     title: 'Your Page Title | Computer Store KS',
     description: 'Page description for SEO',
   }

   /**
    * Your page component.
    *
    * @returns Rendered page content
    *
    * @version 1.0.0 - Initial implementation
    */
   export default function YourPage() {
     return (
       <main className="container mx-auto px-4 py-8">
         <h1>Your Page</h1>
       </main>
     )
   }
   ```

3. **For admin pages, add auth check:**
   ```typescript
   // src/app/admin/your-page/page.tsx
   import { redirect } from 'next/navigation'
   import { getSession } from '@/lib/auth'

   export default async function AdminPage() {
     const session = await getSession()
     if (!session) {
       redirect('/admin/login')
     }

     return <div>Admin content</div>
   }
   ```

### Modifying Database Schema

1. **Plan the change** - Write SQL migration

2. **Test locally** - Apply to local Supabase

3. **Update TypeScript types:**
   ```typescript
   // src/types/database.ts
   export interface NewTable {
     id: string
     name: string
     created_at: string
   }
   ```

4. **Update Supabase queries:**
   ```typescript
   // src/lib/supabase.ts
   export async function getNewItems() {
     const { data, error } = await supabase
       .from('new_table')
       .select('*')

     if (error) throw error
     return data
   }
   ```

5. **Apply to production** via Supabase dashboard SQL editor

---

## 9. Debugging

### Common Issues

**Type Errors:**
```bash
# Check all types
bun run type-check

# Common fixes:
# - Add explicit type annotations
# - Check for null/undefined with optional chaining (?.)
# - Use type guards for unknown types
```

**Build Failures:**
```bash
# Clean and rebuild
bun run clean
bun install
bun run build

# Check for:
# - Missing dependencies
# - Import path errors (@/ alias)
# - Dynamic imports with server components
```

**API Errors:**
```typescript
// Add detailed logging
console.log('Request:', request.url)
console.log('Body:', await request.json())
console.log('Headers:', Object.fromEntries(request.headers))

// Check Response
const response = await fetch(url)
console.log('Status:', response.status)
console.log('Data:', await response.json())
```

**Authentication Issues:**
- Verify `SESSION_SECRET` is set (64 hex chars)
- Check `AUTH_MODE` matches configuration
- Ensure cookies are not blocked
- Test in incognito mode

### Debug Tools

**Browser DevTools:**
- Console: JavaScript errors, logs
- Network: API requests/responses
- Application: Cookies, storage
- React DevTools: Component state

**VS Code Debugging:**
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "bun run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

**Console Logging:**
```typescript
// Server-side (appears in terminal)
console.log('[API]', { endpoint, data })

// Client-side (appears in browser console)
console.log('[Component]', { state, props })
```

**Network Inspection:**
- Use browser Network tab to inspect API calls
- Check request/response headers
- Verify payload format
- Monitor for failed requests (red entries)

---

## 10. IDE Setup

### VS Code Settings

Create `.vscode/settings.json` (not committed to repo):

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

### VS Code launch.json

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "bun run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    },
    {
      "name": "Next.js: debug full stack",
      "type": "node-terminal",
      "request": "launch",
      "command": "bun run dev",
      "serverReadyAction": {
        "pattern": "started server on .+, url: (https?://.+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    }
  ]
}
```

### Recommended Keyboard Shortcuts

| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| Go to File | Cmd+P | Ctrl+P |
| Go to Symbol | Cmd+Shift+O | Ctrl+Shift+O |
| Find References | Shift+F12 | Shift+F12 |
| Rename Symbol | F2 | F2 |
| Format Document | Shift+Alt+F | Shift+Alt+F |
| Quick Fix | Cmd+. | Ctrl+. |
| Toggle Terminal | Ctrl+` | Ctrl+` |

### TypeScript Configuration

The project's `tsconfig.json` includes:
- Path aliases (`@/*` maps to `./src/*`)
- Strict mode enabled
- Incremental compilation for faster rebuilds

Import example:
```typescript
// Instead of relative paths
import { auth } from '../../../lib/auth'

// Use aliases
import { auth } from '@/lib/auth'
```

---

## Quick Reference

### Commands

```bash
bun install          # Install dependencies
bun run dev          # Start dev server (http://localhost:3000)
bun run build        # Production build
bun run start        # Start production server
bun run type-check   # TypeScript validation
bun run lint         # ESLint check
bun run clean        # Remove build artifacts
```

### Environment Files

| File | Purpose | Committed? |
|------|---------|------------|
| `.env.example` | Template with documentation | Yes |
| `.env.local` | Local development values | No |
| `.env` | Alternative local config | No |

### Key URLs

| Environment | URL |
|-------------|-----|
| Local Development | http://localhost:3000 |
| Development/Staging | https://csk-development.onrender.com |
| Production | https://computerstoreks.com |

### Support

- **Project Documentation:** `docs/` directory
- **Business Info:** `documentation/business_info.md`
- **Troubleshooting:** `docs/troubleshooting/`
- **Database Schemas:** `docs/database/`
