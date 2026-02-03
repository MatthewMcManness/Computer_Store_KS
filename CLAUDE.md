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
│   │   └── why-linux/
│   ├── admin/             # Admin dashboard (protected)
│   │   ├── page.tsx       # Reception Dashboard
│   │   ├── intake/        # Customer intake form
│   │   ├── customers/     # Customer management
│   │   ├── businesses/    # Business management
│   │   ├── tickets/       # Ticket management
│   │   │   ├── page.tsx   # Tickets list with status filters
│   │   │   └── [id]/      # Ticket detail page
│   │   ├── employees/     # Employee management
│   │   ├── gallery/       # Gallery management
│   │   └── blog/          # Blog management
│   └── api/               # API routes
│       ├── auth/          # Authentication endpoints
│       ├── contact/       # Contact form
│       ├── gallery/       # Gallery CRUD + publish
│       ├── blog/          # Blog CRUD + upload
│       └── repairshopr/   # RepairShopr integration
│           └── tickets/   # Ticket APIs + status overrides
├── components/
│   ├── static/            # Header, Footer, TestimonialsCarousel
│   ├── gallery/           # Gallery display components
│   └── admin/             # Admin UI components
│       ├── admin-sidebar.tsx         # Sidebar navigation
│       ├── call-customer-tickets.tsx # Call customer widget
│       └── ...            # Other admin components
├── lib/
│   ├── auth.ts            # RepairShopr session authentication
│   ├── supabase.ts        # Supabase client + ticket status definitions
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
- **Images:** Stored in Supabase Storage
- **Admin:** `/admin/gallery`, `/admin/gallery/new`, `/admin/gallery/[id]`
- **API:** `/api/gallery`, `/api/gallery/[id]`, `/api/gallery/upload`, `/api/gallery/publish`
- **Features:** Desktops, laptops, specs, sale pricing

### Authentication
- **Mode:** RepairShopr API authentication
- **Library:** `src/lib/auth.ts`
- **Sessions:** Encrypted cookies with AES-256-GCM
- **Protected routes:** All `/admin/*` pages

### Employee Portal (Admin)
The admin section serves as an employee portal for computer repair shop operations.

**Reception Dashboard** (`/admin`)
- Customer Intake button (prominent call-to-action)
- Call Customer tickets widget (auto-refreshes every 30s)
- System status indicators

**Tickets System** (`/admin/tickets`)
- **List View**: Search and filter tickets by custom status
  - Desktop: horizontal status filter buttons
  - Mobile: collapsible grid of filter buttons
- **Detail View** (`/admin/tickets/[id]`): Full ticket management
  - Customer info panel with Silver Plan support badge
  - Custom status control (separate from RepairShopr status)
  - Notes timeline (private, public, customer notes merged)
  - Note input for private and public notes
  - Edit modal for ticket fields

**Custom Status System**
Tickets have a custom status layer on top of RepairShopr statuses:
- Stored in `ticket_status_overrides` table (Supabase)
- Status definitions in `ticket_status_definitions` table
- Statuses: new, diagnosing, repairing, data_transferring, installing, waiting_for_parts, building, call_customer, waiting_for_customer_reply, ready_for_pickup, completed

**Sidebar Navigation**
- Reception (dashboard)
- Customers
- Businesses
- Tickets
- Gallery
- Blog Posts
- New Post
- Employees

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

### RepairShopr/Tickets API
```
GET    /api/repairshopr/tickets                    # Search/list tickets (query params: q, status)
GET    /api/repairshopr/tickets/[id]               # Get ticket details
PUT    /api/repairshopr/tickets/[id]               # Update ticket in RepairShopr
GET    /api/repairshopr/tickets/call-customer      # Get tickets with call_customer status
GET    /api/repairshopr/tickets/status-definitions # Get custom status definitions
GET    /api/repairshopr/tickets/status/[id]        # Get status override for ticket
POST   /api/repairshopr/tickets/status/[id]        # Set/update status override
POST   /api/repairshopr/tickets/status-batch       # Get status overrides for multiple tickets
GET    /api/repairshopr/tickets/[id]/notes         # Get ticket notes
POST   /api/repairshopr/tickets/[id]/notes         # Add note to ticket
```

### RepairShopr/Customers API
```
GET    /api/repairshopr/customers                  # Search customers (query: q)
GET    /api/repairshopr/customers/[id]             # Get customer details
GET    /api/repairshopr/customers/[id]/tickets     # Get customer's tickets
```

## Database Schema

### Blog Tables (Supabase)
- `blog_posts` - Main posts table
- `blog_categories` - Post categories
- `blog_tags` - Post tags
- `blog_post_tags` - Post-tag junction table

See `docs/database/blog-schema.sql` for full schema.

### Ticket Status Tables (Supabase)
- `ticket_status_definitions` - Custom status definitions with display names, sort order, and customer visibility settings
- `ticket_status_overrides` - Per-ticket custom status overrides linked to RepairShopr ticket IDs

Key fields in `ticket_status_definitions`:
- `status` (PK) - Status key (e.g., 'call_customer')
- `display_name` - Human-readable name (e.g., 'Call Customer')
- `repairshopr_status` - Corresponding RepairShopr status
- `show_customer_question` - Whether to show question input
- `customer_visible_status` - Status shown to customers
- `sort_order` - Display order in UI

Key fields in `ticket_status_overrides`:
- `repairshopr_ticket_id` - RepairShopr ticket ID
- `custom_status` - Current custom status
- `customer_question` - Optional customer question text

## Git Branching Strategy

This project uses a **direct Production workflow** with **local testing before push**:

| Branch | Purpose | Deployment |
|--------|---------|------------|
| `Production` | Live site & active development | Render → computerstoreks.com |

**Workflow:**
1. Work directly in the `Production` branch
2. Run `npm run dev` and test changes locally at `http://localhost:3000`
3. Share localhost link with user for review
4. Once user approves, commit and push to `Production`
5. Render auto-deploys from `Production`

**Commands:**
```bash
# Ensure on Production branch
git checkout Production

# Test locally
npm run dev
# Verify at http://localhost:3000
# Share link with user for approval

# After user approval, commit and push
git add <files>
git commit -m "feat: description"
git push origin Production
```

**Important:** Always test locally and get user approval before pushing to `Production`.

## Deployment

### Render Configuration
- **Build command:** `bun run build`
- **Start command:** `bun run start`
- **Environment:** Add all required env vars in Render dashboard

### Post-Deployment
1. Run blog schema in Supabase SQL Editor
2. Verify environment variables in Render
3. Test admin login and blog functionality

## Code Documentation Standards

**MANDATORY:** All functions in this codebase MUST have comprehensive documentation comments. This is a non-negotiable requirement for all new code and any code that is modified.

### Documentation Requirements

Every function MUST include the following elements in its docstring/JSDoc comment:

#### 1. Summary (Required)
A brief, one-line description of the function's purpose. This appears in generated documentation summaries.

#### 2. Detailed Description (When Necessary)
Further elaboration on what the function does, its role in the system, or the rationale behind the chosen approach. Should explain the "why" and intent, not just the "what" or "how".

#### 3. Parameters (@param) (Required for all params)
A list of all parameters including:
- **Name** - Parameter name
- **Type** - TypeScript type
- **Description** - What information it provides, any preconditions, units, or constraints

#### 4. Return Value (@returns) (Required)
Description of the value and type the function returns, including what it represents.

#### 5. Exceptions/Errors (@throws) (When Applicable)
List of any exceptions or errors the function might raise and the conditions under which they occur.

#### 6. Side Effects (@sideEffects) (When Applicable)
Any effects the function has beyond returning a value:
- Modifying database state
- Writing to files or storage
- Making network requests
- Updating global state
- Setting cookies
- Logging for audit purposes

#### 7. Assumptions/Preconditions (When Applicable)
Conditions that must be true before the function is called, or assumptions about inputs/environment.

#### 8. Usage Examples (@example) (For Complex Functions)
Brief code snippet showing how to use the function.

#### 9. References/Links (@see) (When Applicable)
Links to external documentation, standards, algorithms, or related functions.

#### 10. Function Call Graph (Required)
- **@functions_called** - List of functions this function calls internally
- **@called_by** - List of functions/components that call this function

#### 11. Version History (@version) (Required)
A chronological log of changes made to the function. Each entry includes:
- **Version number** - Semantic versioning (1.0.0 for initial, increment as needed)
- **Date** - ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)
- **Description** - Brief description of what changed

**Important:** Only log functional changes to the code itself. Do NOT create new version entries for:
- Adding/updating documentation comments
- Updating @called_by or @functions_called lists
- Formatting or whitespace changes

**Format:**
```
@version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
@version 1.1.0 - 2026-01-15T10:30:00Z - Added input validation
@version 1.2.0 - 2026-01-20T14:45:00Z - Improved error handling
```

### TSDoc/JSDoc Format Template

```typescript
/**
 * Brief one-line summary of what the function does.
 *
 * Detailed description explaining the purpose, approach, and any
 * important context about why this function exists or how it works.
 *
 * @param paramName - Description of the parameter (include type info, constraints, units)
 * @param options - Configuration options object
 * @param options.timeout - Request timeout in milliseconds (default: 5000)
 *
 * @returns Description of return value and its type
 *
 * @throws {ErrorType} Description of when this error is thrown
 * @throws {AnotherError} Another error condition
 *
 * @sideEffects
 * - Creates a record in the database
 * - Sends an email notification
 * - Logs the action for audit purposes
 *
 * @example
 * // Basic usage
 * const result = await myFunction(input);
 *
 * // With options
 * const result = await myFunction(input, { timeout: 10000 });
 *
 * @see https://external-docs.com/reference for algorithm details
 * @see relatedFunction for similar functionality
 *
 * @functions_called helperFunction, validateInput, sendNotification
 * @called_by ParentComponent, ApiRouteHandler
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
```

### Examples by File Type

#### API Route Handler
```typescript
/**
 * Authenticates a user with their email and password credentials.
 *
 * Validates the provided credentials against RepairShopr API,
 * creates an encrypted session token, and sets HTTP-only cookies.
 * Implements rate limiting to prevent brute force attacks.
 *
 * @param request - The incoming Next.js request containing JSON body with email and password
 * @returns NextResponse with session token and user data on success, error message on failure
 *
 * @throws {AuthenticationError} When credentials are invalid (401)
 * @throws {RateLimitError} When too many login attempts detected (429)
 * @throws {ValidationError} When email or password format is invalid (400)
 *
 * @sideEffects
 * - Creates session record in session store
 * - Sets HTTP-only session cookie with 24-hour expiry
 * - Logs authentication attempt for security audit
 *
 * @example
 * // POST /api/auth/login
 * // Body: { "email": "user@example.com", "password": "secret" }
 * const response = await fetch('/api/auth/login', {
 *   method: 'POST',
 *   body: JSON.stringify({ email, password })
 * });
 *
 * @functions_called validateCredentials, createSession, setSessionCookie, logAuditEvent
 * @called_by LoginPage, AdminLoginPage
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
```

#### React Component
```typescript
/**
 * Displays a filterable grid of computers available for sale.
 *
 * Renders computer cards with specs, images, and pricing. Supports
 * filtering by category (desktop/laptop) and sorting by price.
 * Uses virtualization for performance with large inventories.
 *
 * @param computers - Array of computer objects to display
 * @param initialCategory - Optional category to filter by on mount (default: 'all')
 * @param onSelect - Callback fired when a computer card is clicked
 *
 * @returns {JSX.Element} Grid of computer cards with filter controls
 *
 * @sideEffects
 * - Updates URL query params when filters change
 * - Tracks page views via analytics
 *
 * @example
 * <GalleryGrid
 *   computers={computers}
 *   initialCategory="desktop"
 *   onSelect={(computer) => router.push(`/gallery/${computer.id}`)}
 * />
 *
 * @functions_called useFilteredComputers, CategoryFilter, FlipCard
 * @called_by GalleryPage, AdminGalleryPage
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export function GalleryGrid({ computers, initialCategory, onSelect }: GalleryGridProps): JSX.Element {
```

#### Utility Function
```typescript
/**
 * Validates an email against a list of known disposable email providers.
 *
 * Checks the domain portion of the email against a curated list of
 * temporary/disposable email services to prevent spam signups.
 * The list is updated periodically from external sources.
 *
 * @param email - The email address to validate (must be properly formatted)
 * @returns true if email uses a disposable domain, false otherwise
 *
 * @throws {TypeError} When email parameter is not a string
 *
 * @example
 * isDisposableEmail('test@tempmail.com') // Returns true
 * isDisposableEmail('user@gmail.com')    // Returns false
 * isDisposableEmail('invalid')           // Throws TypeError
 *
 * @see DISPOSABLE_DOMAINS constant in spam-patterns.ts
 * @see https://github.com/disposable/disposable-email-domains
 *
 * @functions_called extractDomain, normalizeEmail
 * @called_by validateContactForm, RegisterPage, ContactForm
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export function isDisposableEmail(email: string): boolean {
```

#### Custom Hook
```typescript
/**
 * Custom hook for detecting and preventing bot/spam form submissions.
 *
 * Implements multiple detection strategies including honeypot fields,
 * timing analysis, and interaction tracking. Should be used with all
 * public-facing forms to reduce spam without affecting user experience.
 *
 * @param options - Configuration options for bot detection
 * @param options.minTimeMs - Minimum time before submission allowed (default: 3000)
 * @param options.honeypotName - Name of hidden honeypot field (default: 'website')
 * @param options.trackInteractions - Whether to track mouse/keyboard events (default: true)
 *
 * @returns Object containing:
 *   - honeypotProps: Props to spread on hidden input element
 *   - isBot: Boolean indicating if current submission appears automated
 *   - validate: Function to call before form submission, returns boolean
 *   - reset: Function to reset tracking state
 *
 * @sideEffects
 * - Adds event listeners for user interactions on mount
 * - Stores timestamps and interaction counts in component state
 * - Removes event listeners on unmount
 *
 * @example
 * function ContactForm() {
 *   const { honeypotProps, validate } = useBotProtection({ minTimeMs: 5000 });
 *
 *   const handleSubmit = (e) => {
 *     e.preventDefault();
 *     if (!validate()) {
 *       console.log('Bot detected');
 *       return;
 *     }
 *     // Submit form...
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input type="hidden" {...honeypotProps} />
 *       {/* form fields *\/}
 *     </form>
 *   );
 * }
 *
 * @functions_called useInteractionTracking, useFingerprint, useRef, useEffect
 * @called_by ContactForm, RegistrationForm, CommentForm
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export function useBotProtection(options?: BotProtectionOptions): BotProtectionResult {
```

### Best Practices

1. **Keep comments up-to-date:** Outdated comments are worse than no comments. Update documentation as part of every code change.

2. **Be clear and professional:** Use proper grammar, spelling, and complete sentences. Avoid jargon or overly casual language.

3. **Prioritize self-documenting code:** Use clear function, class, and variable names. The better your code is written, the fewer comments you need.

4. **Document the "why", not the "what":** Explain rationale and intent, not obvious code mechanics.

5. **Include realistic examples:** Examples should be copy-paste ready and demonstrate common use cases.

6. **Keep @functions_called and @called_by accurate:** Update these when refactoring or adding new call sites.

7. **Document edge cases:** Note any special handling for null/undefined, empty arrays, or boundary conditions.

### Enforcement

- **Code reviews:** All PRs must include proper documentation for new/modified functions
- **Pre-commit:** Consider adding JSDoc validation to pre-commit hooks
- **IDE support:** Configure IDE to show documentation warnings for undocumented functions

---

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
