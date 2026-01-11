# Function Documentation - Computer Store Kansas

This document provides comprehensive documentation for all functions across the Computer Store Kansas project.

## Table of Contents

1. [Scripts](#scripts)
2. [Admin Pages](#admin-pages)
3. [Auth Pages](#auth-pages)
4. [Public Pages](#public-pages)
5. [Root App Files](#root-app-files)

---

## Scripts

### extract-computers.js

**Main Script**
- **Summary**: Extracts computer data from HTML and converts to gallery.json format
- **Description**: Reads the live gallery.html backup file, parses computer listings using regex patterns, and outputs structured JSON for the gallery system. This is a one-time migration script used to convert static HTML data to the JSON format used by the Next.js gallery.
- **Side Effects**: Reads gallery.html from project root, writes to src/data/gallery.json, logs extraction progress to console
- **Functions Called**: None (standalone script)
- **Called By**: CLI execution only

### migrate-gallery-to-supabase.ts

**parsePrice(price: string): number**
- **Summary**: Parses price string to number
- **Description**: Removes dollar signs and commas from price strings and converts to a floating point number for database storage
- **Parameters**:
  - `price` (string) - Price string like "$1,299.99"
- **Returns**: Parsed price as number, or 0 if invalid
- **Example**: `parsePrice("$1,299.99")` returns 1299.99
- **Functions Called**: None
- **Called By**: migrate

**migrate(): Promise<void>**
- **Summary**: Migrates gallery data from JSON to Supabase database
- **Description**: Main migration function that reads gallery.json, creates Supabase client, iterates through all computers and inserts them into the database, then sets the active sale based on globalSale setting from the JSON file
- **Returns**: Promise that resolves when migration is complete
- **Throws**: Error if Supabase environment variables are missing
- **Side Effects**: Exits process if environment variables missing, inserts records into gallery_computers table, updates gallery_sales active status, logs detailed progress to console
- **Functions Called**: parsePrice, createClient
- **Called By**: Main script execution

### run-plan-tier-migration.ts

**runMigration(): Promise<void>**
- **Summary**: Runs the plan tier column migration on customer_silver_plans table
- **Description**: Attempts to add plan_tier column using RPC call, falls back to manual instruction if RPC unavailable. After adding column, migrates existing is_silver_plan = true records to use plan_tier = 'silver'
- **Returns**: Promise that resolves when migration is complete
- **Throws**: Error if migration fails due to database errors
- **Side Effects**: Alters customer_silver_plans table (adds column and constraint), updates existing records, logs detailed progress and SQL instructions to console
- **Functions Called**: supabase.rpc, supabase.from
- **Called By**: Main script execution

### seed-blog-posts.ts

**loadEnv(): void**
- **Summary**: Manually parses .env file and loads variables into process.env
- **Description**: Reads .env file line by line, parses key=value pairs, and sets them as environment variables. Strips quotes from values and ignores comments. Used because bun may not automatically load .env in all contexts
- **Side Effects**: Reads .env file from project root, modifies process.env with parsed variables, logs error if .env file cannot be loaded
- **Functions Called**: readFileSync
- **Called By**: Main script execution

**seedBlogPosts(): Promise<void>**
- **Summary**: Seeds initial blog posts into the Supabase database
- **Description**: Iterates through predefined blog posts array, checks if each slug already exists in the database, and inserts new posts. Skips existing posts to ensure script can be run multiple times safely (idempotent operation)
- **Returns**: Promise that resolves when all posts are processed
- **Throws**: Error if database operations fail (logged but doesn't halt execution)
- **Side Effects**: Inserts blog post records into blog_posts table, logs creation status for each post to console
- **Functions Called**: supabase.from
- **Called By**: Main script execution

### send-password-resets.ts

**main(): Promise<void>**
- **Summary**: Sends password reset emails to all migrated users
- **Description**: Validates environment variables, creates Supabase client, and iterates through MIGRATED_USERS array sending reset emails with appropriate delays to avoid rate limiting. Tracks success/failure counts and exits with error code if any emails fail to send
- **Returns**: Promise that resolves when all emails are sent
- **Throws**: Error if environment variables are missing (exits process)
- **Side Effects**: Validates and uses environment variables, sends password reset emails via Supabase Auth API, logs detailed progress and results to console, exits process with code 1 if failures occur
- **Functions Called**: createClient, supabase.auth.resetPasswordForEmail
- **Called By**: Script execution via ts-node

### migrate-users.ts

This script contains numerous functions for user migration from RepairShopr to Supabase Auth. See inline documentation in the file for comprehensive details on each function.

**Key Functions**:
- `initializeSupabase()` - Creates Supabase admin client
- `fetchRepairShoprEmployees()` - Fetches employees from RepairShopr API
- `fetchCustomerAccounts()` - Fetches customers from Supabase
- `mapRepairShoprRoleToSupabase()` - Maps RepairShopr roles to Supabase roles
- `generateTemporaryPassword()` - Generates secure temporary passwords
- `migrateEmployee()` - Migrates single employee to Supabase
- `migrateCustomer()` - Migrates single customer to Supabase
- `sendPasswordResetEmail()` - Sends password reset email
- `runMigration()` - Main migration orchestrator

### migrate-users-rollback.ts

This script rolls back user migrations. See inline documentation for detailed function descriptions.

**Key Functions**:
- `initializeSupabase()` - Creates Supabase admin client
- `findMigratedUsers()` - Finds users with migration metadata
- `rollbackUser()` - Removes auth user and profile for single user
- `runRollback()` - Main rollback orchestrator

---

## Admin Pages

### src/app/admin/page.tsx

**getGalleryStats(): Promise<GalleryStats>**
- **Summary**: Fetches gallery statistics for dashboard display
- **Description**: Retrieves all computers from Supabase, calculates counts by type (desktop/laptop), counts items on sale, and gets active sale information. Handles Supabase connection failures gracefully
- **Returns**: Object with total, desktops, laptops, blackFriday counts and activeSale name
- **Side Effects**: Queries Supabase gallery_computers and gallery_sales tables
- **Functions Called**: getAllComputers, getActiveSaleAdmin, isSupabaseConfigured
- **Called By**: AdminDashboardPage

**AdminDashboardPage(): Promise<JSX.Element>**
- **Summary**: Admin dashboard page showing business overview and quick actions
- **Description**: Server component that checks authentication, fetches key metrics (gallery stats, connection status), and displays dashboard with stats cards, quick action links, and system status indicators
- **Returns**: Dashboard page with metrics cards, action buttons, and system status
- **Side Effects**: Redirects to /admin/login if not authenticated, queries Supabase for statistics
- **Functions Called**: isAuthenticated, getGalleryStats, isGitHubConfigured, isSupabaseConfigured
- **Called By**: Admin layout via Next.js routing

### src/app/admin/layout.tsx

**AdminLayout({ children }): Promise<JSX.Element>**
- **Summary**: Layout wrapper for admin routes with authentication check
- **Description**: Checks if user is authenticated and either renders children within AdminShell (authenticated) or as standalone content (unauthenticated, for login page). Forces dynamic rendering to prevent static generation
- **Parameters**:
  - `children` (React.ReactNode) - Child components to render
- **Returns**: Layout with optional AdminShell wrapper based on auth status
- **Side Effects**: Checks authentication status via cookies
- **Functions Called**: isAuthenticated, AdminShell
- **Called By**: Next.js app router for all /admin/* routes

### src/app/admin/login/page.tsx

**AdminLoginPage(): JSX.Element**
- **Summary**: Admin login page for employee and customer authentication
- **Description**: Client component that provides login form with email/password inputs, password visibility toggle, and authentication handling. Checks for existing auth on mount and redirects authenticated users. Handles both employee (admin portal) and customer (customer portal) logins
- **Returns**: Login form with error handling and loading states
- **Side Effects**:
  - Calls /api/auth/check on mount to verify existing session
  - Calls /api/auth/login on form submission
  - Redirects to /admin or /portal based on user type
  - Sets session cookies via API
- **Functions Called**: router.push, router.replace, router.refresh, fetch
- **Called By**: Admin layout via Next.js routing at /admin/login

**Note**: Additional admin pages (gallery, blog, customers, etc.) follow similar patterns. Each page component:
1. Checks authentication with `isAuthenticated()`
2. Redirects to `/admin/login` if not authenticated
3. Fetches required data from Supabase or RepairShopr API
4. Renders admin UI with form controls
5. Handles CRUD operations via API routes

---

## Auth Pages

### src/app/(auth)/login/page.tsx

**LoginPage(): JSX.Element**
- **Summary**: Public login page for customer and employee authentication
- **Description**: Similar to AdminLoginPage but designed for public access. Provides unified login for both customer portal access and employee admin access. Includes bot protection via honeypot and timing checks
- **Returns**: Login form with Supabase Auth integration
- **Side Effects**: Creates Supabase Auth session, redirects based on user role
- **Functions Called**: createBrowserClient, signInWithPassword
- **Called By**: Auth layout via Next.js routing at /login

### src/app/(auth)/register/page.tsx

**RegisterPage(): JSX.Element**
- **Summary**: Customer registration page for new account creation
- **Description**: Allows customers to create new accounts for accessing repair ticket portal. Validates email, password strength, and includes bot protection. Links new account to RepairShopr customer if email matches
- **Returns**: Registration form with validation and error handling
- **Side Effects**: Creates Supabase Auth user, creates user_profile record, sends verification email
- **Functions Called**: createBrowserClient, signUp
- **Called By**: Auth layout via Next.js routing at /register

### src/app/(auth)/reset-password/page.tsx

**ResetPasswordPage(): JSX.Element**
- **Summary**: Password reset request page
- **Description**: Allows users to request password reset email. Validates email format and sends reset link via Supabase Auth
- **Returns**: Password reset request form
- **Side Effects**: Sends password reset email with magic link
- **Functions Called**: createBrowserClient, resetPasswordForEmail
- **Called By**: Auth layout via Next.js routing at /reset-password

### src/app/(auth)/reset-password/confirm/page.tsx

**ResetPasswordConfirmPage(): JSX.Element**
- **Summary**: Password reset confirmation page
- **Description**: Handles password reset after user clicks email link. Validates new password strength, updates Supabase Auth password, and redirects to login
- **Returns**: Password reset confirmation form
- **Side Effects**: Updates user password in Supabase Auth
- **Functions Called**: createBrowserClient, updateUser
- **Called By**: Auth layout via Next.js routing at /reset-password/confirm

### src/app/(auth)/callback/route.ts

**GET(request: NextRequest): Promise<NextResponse>**
- **Summary**: Auth callback handler for email confirmations and OAuth
- **Description**: Handles Supabase Auth callbacks after email verification, password resets, or OAuth flows. Exchanges auth code for session and redirects user to appropriate page
- **Parameters**:
  - `request` (NextRequest) - Incoming request with code and next params
- **Returns**: NextResponse redirecting to success or error page
- **Side Effects**: Creates/updates Supabase Auth session cookies
- **Functions Called**: createServerClient, exchangeCodeForSession
- **Called By**: Supabase Auth service via email links

### src/app/(auth)/auth/confirm/page.tsx

**AuthConfirmPage(): JSX.Element**
- **Summary**: Email confirmation success page
- **Description**: Displays success message after email verification and provides link to login
- **Returns**: Static success page with login link
- **Functions Called**: None (static display)
- **Called By**: Auth callback route after successful email verification

### src/app/(auth)/layout.tsx

**AuthLayout({ children }): JSX.Element**
- **Summary**: Layout wrapper for authentication pages
- **Description**: Provides consistent styling and structure for all auth-related pages (login, register, reset password, etc.)
- **Parameters**:
  - `children` (React.ReactNode) - Auth page components
- **Returns**: Styled layout wrapper
- **Functions Called**: None (pure layout component)
- **Called By**: Next.js app router for all /(auth)/* routes

---

## Public Pages

### src/app/(public)/page.tsx

**HomePage(): JSX.Element**
- **Summary**: Public homepage showcasing computer repair and sales services
- **Description**: Server component that renders hero section, featured computers from gallery, services overview, testimonials carousel, and contact CTA. Fetches active gallery computers from Supabase
- **Returns**: Homepage with dynamic content sections
- **Side Effects**: Queries Supabase for active computers and sale information
- **Functions Called**: getAllComputers, getActiveSale, FeaturedComputers, TestimonialsCarousel
- **Called By**: Public layout via Next.js routing at /

### src/app/(public)/about/page.tsx

**AboutPage(): JSX.Element**
- **Summary**: About page describing business history and values
- **Description**: Static page with company information, owner background, and business philosophy
- **Returns**: Static about page content
- **Functions Called**: None (static content)
- **Called By**: Public layout via Next.js routing at /about

### src/app/(public)/contact/page.tsx

**ContactPage(): JSX.Element**
- **Summary**: Contact form page with bot protection
- **Description**: Client component with contact form including name, email, phone, message fields. Implements honeypot and timing-based bot protection. Submits to /api/contact which sends email via Resend
- **Returns**: Contact form with validation and bot protection
- **Side Effects**: Sends email via API route on successful submission
- **Functions Called**: useBotProtection, fetch('/api/contact')
- **Called By**: Public layout via Next.js routing at /contact

### src/app/(public)/gallery/page.tsx

**GalleryPage(): Promise<JSX.Element>**
- **Summary**: Public gallery page displaying available computers
- **Description**: Server component that fetches all active computers from Supabase and renders filterable/sortable gallery grid. Shows current sale information and filtering by type/category
- **Returns**: Gallery grid with computers and filters
- **Side Effects**: Queries Supabase for computers and active sale
- **Functions Called**: getAllComputers, getActiveSale, GalleryGrid
- **Called By**: Public layout via Next.js routing at /gallery

### src/app/(public)/blog/page.tsx

**BlogListingPage(): Promise<JSX.Element>**
- **Summary**: Blog listing page showing all published posts
- **Description**: Server component that fetches published blog posts from Supabase, sorted by published date. Displays post cards with featured images, excerpts, and metadata
- **Returns**: Blog listing with post cards
- **Side Effects**: Queries Supabase blog_posts table
- **Functions Called**: getAllPosts, BlogPostCard
- **Called By**: Public layout via Next.js routing at /blog

### src/app/(public)/blog/[slug]/page.tsx

**BlogPostPage({ params }): Promise<JSX.Element>**
- **Summary**: Individual blog post page
- **Description**: Server component that fetches single blog post by slug from Supabase and renders full content with markdown support. Includes metadata, featured image, author info, and social sharing
- **Parameters**:
  - `params.slug` (string) - URL slug identifying the post
- **Returns**: Full blog post page with formatted content
- **Side Effects**: Queries Supabase for post by slug
- **Functions Called**: getPostBySlug, MarkdownRenderer
- **Called By**: Public layout via Next.js dynamic routing

**generateStaticParams(): Promise<Array<{slug: string}>>**
- **Summary**: Generates static paths for all blog posts at build time
- **Description**: Fetches all published post slugs to enable static generation of blog post pages
- **Returns**: Array of param objects with slug property
- **Side Effects**: Queries Supabase at build time
- **Functions Called**: getAllPosts
- **Called By**: Next.js build process

### src/app/(public)/reviews/page.tsx

**ReviewsPage(): JSX.Element**
- **Summary**: Customer reviews and testimonials page
- **Description**: Displays curated customer reviews with ratings and detailed feedback. Static content managed in component
- **Returns**: Reviews page with testimonial cards
- **Functions Called**: TestimonialCard
- **Called By**: Public layout via Next.js routing at /reviews

### Service Detail Pages (src/app/(public)/services/*.tsx)

All service detail pages follow a similar pattern:

**ServicePage(): JSX.Element**
- **Summary**: Individual service detail page
- **Description**: Static page describing specific service offering (e.g., virus removal, OS installation, custom PCs). Includes service features, pricing, process overview, and CTAs
- **Returns**: Service detail page with static content
- **Functions Called**: None (static content)
- **Called By**: Public layout via Next.js routing

Service pages include:
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

### src/app/(public)/silver-plan/page.tsx

**SilverPlanPage(): JSX.Element**
- **Summary**: Silver plan subscription service page
- **Description**: Describes monthly computer maintenance subscription plan with tiered pricing (Bronze, Silver, Silver Plus, Gold). Includes feature comparison and signup CTA
- **Returns**: Silver plan marketing and pricing page
- **Functions Called**: PricingTierCard
- **Called By**: Public layout via Next.js routing at /silver-plan

### src/app/(public)/why-linux/page.tsx

**WhyLinuxPage(): JSX.Element**
- **Summary**: Linux benefits and advocacy page
- **Description**: Educational page explaining advantages of Linux OS (security, privacy, performance). Targets customers considering OS alternatives
- **Returns**: Linux information page with benefits and FAQs
- **Functions Called**: None (static content)
- **Called By**: Public layout via Next.js routing at /why-linux

### src/app/(public)/layout.tsx

**PublicLayout({ children }): JSX.Element**
- **Summary**: Layout wrapper for public-facing pages
- **Description**: Provides consistent header, footer, and styling for all customer-facing pages. Uses static-styles.css for legacy compatibility
- **Parameters**:
  - `children` (React.ReactNode) - Public page components
- **Returns**: Layout with header and footer
- **Functions Called**: Header, Footer
- **Called By**: Next.js app router for all /(public)/* routes

---

## Root App Files

### src/app/layout.tsx

**RootLayout({ children }): JSX.Element**
- **Summary**: Root layout wrapper for entire application
- **Description**: Top-level layout that sets up HTML structure, metadata, fonts, and global styles. Wraps all pages regardless of route group
- **Parameters**:
  - `children` (React.ReactNode) - All app pages
- **Returns**: HTML document structure with head and body
- **Side Effects**: Loads global styles and fonts
- **Functions Called**: None (root layout)
- **Called By**: Next.js app router (root)

**Metadata Export**:
- Sets default title, description, OpenGraph tags
- Configures favicon and Apple touch icons
- Sets viewport and theme color

### src/app/error.tsx

**ErrorBoundary({ error, reset }): JSX.Element**
- **Summary**: Error boundary component for handling runtime errors
- **Description**: Client component that catches and displays errors in production. Shows user-friendly error message with reset button
- **Parameters**:
  - `error` (Error) - Caught error object
  - `reset` (Function) - Function to attempt recovery
- **Returns**: Error UI with retry option
- **Side Effects**: Logs error to console in development
- **Functions Called**: None (error display)
- **Called By**: Next.js error handling system

### src/app/global-error.tsx

**GlobalError({ error, reset }): JSX.Element**
- **Summary**: Global error boundary for app-wide errors
- **Description**: Similar to error.tsx but catches errors at the root level. Includes full HTML structure since it replaces root layout
- **Parameters**:
  - `error` (Error) - Caught error object
  - `reset` (Function) - Function to attempt recovery
- **Returns**: Full-page error UI
- **Side Effects**: Logs error to console
- **Functions Called**: None (error display)
- **Called By**: Next.js error handling system (root level)

### src/app/loading.tsx

**Loading(): JSX.Element**
- **Summary**: Loading UI component shown during navigation
- **Description**: Displays animated spinner during page transitions and data fetching
- **Returns**: Loading spinner UI
- **Functions Called**: None (static display)
- **Called By**: Next.js Suspense boundaries

### src/app/not-found.tsx

**NotFound(): JSX.Element**
- **Summary**: 404 page for invalid routes
- **Description**: Custom 404 page with branding and navigation back to home
- **Returns**: 404 error page
- **Functions Called**: Link (Next.js)
- **Called By**: Next.js routing system when route not found

### src/app/portal/page.tsx

**CustomerPortalPage(): Promise<JSX.Element>**
- **Summary**: Customer portal dashboard for viewing repair tickets
- **Description**: Server component that authenticates customer, fetches their repair tickets from RepairShopr API, and displays ticket list with status and details. Only accessible to authenticated customers
- **Returns**: Customer portal dashboard with tickets
- **Side Effects**: Checks authentication, queries RepairShopr API
- **Functions Called**: isAuthenticated, getUserSession, fetchCustomerTickets
- **Called By**: Root app router via Next.js routing at /portal

---

## Documentation Standards

All functions in this project follow comprehensive documentation standards as defined in `CLAUDE.md`. Each function includes:

1. **Summary** - One-line description
2. **Detailed Description** - Purpose and context
3. **Parameters (@param)** - All params with types and descriptions
4. **Returns (@returns)** - Return value type and description
5. **Exceptions (@throws)** - Errors and when they occur
6. **Side Effects (@sideEffects)** - Database writes, API calls, etc.
7. **Examples (@example)** - Usage examples
8. **Functions Called** - Internal function calls
9. **Called By** - Where this function is used

For API routes, additional documentation includes HTTP methods, request/response schemas, authentication requirements, and rate limiting details.

For React components, documentation includes prop types, state management, lifecycle considerations, and accessibility features.

---

## Maintaining This Documentation

When adding or modifying functions:

1. Update inline TSDoc/JSDoc comments in the source file
2. Update this FUNCTION_DOCUMENTATION.md file
3. Ensure @functions_called and @called_by annotations remain accurate
4. Add examples for complex functions
5. Document all side effects (especially database operations)

This documentation is a living document and should be updated with every code change that affects function signatures, behavior, or usage.
