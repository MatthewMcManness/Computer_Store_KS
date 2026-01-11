# API Integrations Guide

> Comprehensive reference for all external API connections and internal utilities in the Computer Store KS codebase.

**Last Updated:** 2026-01-11T15:28:09Z

---

## Table of Contents

1. [Integration Overview](#integration-overview)
2. [Supabase (Database & Auth)](#1-supabase-database--auth)
3. [RepairShopr (CRM & Ticketing)](#2-repairshopr-crm--ticketing)
4. [NinjaOne RMM (Device Monitoring)](#3-ninjaone-rmm-device-monitoring)
5. [GitHub API (Image Storage)](#4-github-api-image-storage)
6. [Resend (Email Service)](#5-resend-email-service)
7. [Google Business Profile](#6-google-business-profile)
8. [Cloudflare Turnstile (CAPTCHA)](#7-cloudflare-turnstile-captcha)
9. [Internal Utilities](#8-internal-utilities)
10. [Environment Variables Reference](#9-environment-variables-reference)
11. [Integration Status](#10-integration-status)

---

## Integration Overview

| Service | Purpose | File(s) | Usage Count | Status |
|---------|---------|---------|-------------|--------|
| **Supabase** | Database, Auth, Blog | `supabase.ts`, `supabase-auth.ts`, `supabase-server.ts` | 190 occurrences / 16 files | ✅ Active |
| **RepairShopr** | Customer/Ticket CRM | `repairshopr.ts`, `repairshopr-sync.ts`, `auth.ts` | 120 occurrences / 25 files | ✅ Active |
| **NinjaOne RMM** | Device Monitoring | `ninjaone.ts` | 27 occurrences / 5 files | ✅ Active |
| **GitHub API** | Gallery Image Storage | `github.ts` | 4 occurrences / 1 file | ✅ Active |
| **Resend** | Transactional Email | `email.ts` | 8 occurrences / 2 files | ✅ Active |
| **Google Business** | Reviews & Posts | `google-business.ts` | 19 occurrences / 7 files | ✅ Active |
| **Cloudflare Turnstile** | Bot Protection | `spam-detection.ts` | Integrated | ✅ Active |
| **ESET** | Antivirus Integration | — | — | ❌ Not Integrated |

---

## 1. Supabase (Database & Auth)

**Files:** `src/lib/supabase.ts`, `src/lib/supabase-auth.ts`, `src/lib/supabase-server.ts`

**Purpose:** PostgreSQL database for blog, gallery, customer sync, and user authentication.

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...          # Client-side (public)
SUPABASE_SERVICE_ROLE_KEY=eyJ...              # Server-side only (bypasses RLS)
```

### Client Instances

| Export | Type | Description | Use Case |
|--------|------|-------------|----------|
| `supabase` | Browser client | Uses anon key, respects RLS | Client components |
| `supabaseAdmin` | Server client | Uses service role key | Server actions, API routes |
| `createFreshAdminClient()` | Factory | Creates isolated admin client | Auth flows (prevents session tainting) |

### Blog Functions

| Function | Description | Called By |
|----------|-------------|-----------|
| `getPublishedPosts()` | List all published blog posts | `/blog` page |
| `getBlogPost(id)` | Get post by ID or slug | `/blog/[slug]` page |
| `createPost(input)` | Create new blog post | Admin blog editor |
| `updatePost(id, input)` | Update existing post | Admin blog editor |
| `deletePost(id)` | Soft delete a post | Admin blog list |
| `getCategories()` | List all blog categories | Blog sidebar, editor |
| `getTags()` | List all tags | Blog editor |

### Gallery Functions

| Function | Description | Called By |
|----------|-------------|-----------|
| `getGalleryComputers()` | List all computers from Supabase | `/gallery` page |
| `getGalleryComputer(id)` | Get single computer | `/gallery/[id]` page |
| `createGalleryComputer(input)` | Add computer to inventory | Admin gallery form |
| `updateGalleryComputer(id, input)` | Update computer details | Admin gallery form |
| `deleteGalleryComputer(id)` | Remove computer | Admin gallery list |

### Sync Functions

| Function | Description | Called By |
|----------|-------------|-----------|
| `syncCustomerToSupabase(customer)` | Sync RepairShopr customer | RepairShopr sync job |
| `syncTicketToSupabase(ticket)` | Sync RepairShopr ticket | RepairShopr sync job |
| `getTicketStatusDefinitions()` | Get ticket status list | Admin intake form |
| `createSyncLog(data)` | Log sync operation | Sync jobs |

### Database Tables

```
blog_posts          - Blog articles with markdown content
blog_categories     - Blog post categories
blog_tags           - Tag definitions
blog_post_tags      - Post-tag junction table
gallery_computers   - Computer inventory (mirrors gallery.json)
customers           - Synced RepairShopr customers
tickets             - Synced RepairShopr tickets
sync_logs           - Sync operation history
user_profiles       - User roles and metadata
audit_logs          - Action audit trail
```

---

## 2. RepairShopr (CRM & Ticketing)

**Files:** `src/lib/repairshopr.ts` (1,788 lines), `src/lib/repairshopr-sync.ts`, `src/lib/auth.ts`

**Purpose:** Customer relationship management, ticket tracking, device assets, employee authentication.

### Environment Variables
```bash
REPAIRSHOPR_SUBDOMAIN=thecomputerstore     # Account subdomain
REPAIRSHOPR_API_KEY=xxx                     # Admin API token
AUTH_MODE=repairshopr                       # Authentication mode
```

### API Details
- **Base URL:** `https://{subdomain}.repairshopr.com/api/v1`
- **Auth:** Bearer token in Authorization header
- **Pagination:** Max 100 per page, use `page` parameter

### Core Functions

| Function | Description | Usage | Called By |
|----------|-------------|-------|-----------|
| `createRepairShoprClient()` | Factory for API client | High (25+ files) | All RepairShopr operations |
| `signIn(email, password)` | Authenticate user | Medium | Login API route |
| `getMe(apiKey)` | Get current user info | Medium | Auth flows |
| `getCustomers()` | List all customers | High | Admin search, sync |
| `getCustomer(id)` | Get single customer | High | Customer detail pages |
| `searchCustomers(query, limit)` | Search by name/email | High | Admin customer search |
| `updateCustomer(id, data)` | Update customer record | Medium | Admin forms |
| `getTickets()` | List all tickets | High | Admin dashboard, sync |
| `getTicket(id)` | Get ticket details | High | Ticket detail page |
| `getTicketComments(id)` | Get ticket comments | Medium | Ticket detail page |
| `updateTicketStatus(id, status)` | Change ticket status | Medium | Admin actions |
| `addTicketComment(id, text)` | Add comment to ticket | Medium | Admin actions |
| `getAssets()` | List customer devices | Medium | Asset management |
| `getAsset(id)` | Get device details | Medium | Device detail page |
| `getInvoices()` | List invoices | Low | Billing pages |
| `getProducts()` | List products/services | Low | Product catalog |
| `getPayments()` | List payments | Low | Payment history |

### Protection Plan Functions

| Function | Description | Used For |
|----------|-------------|----------|
| `getProtectionPlanTier(customer)` | Detect Silver/Silver+ plan | Plan badge display |
| `isProtectionPlanCustomer(customer)` | Check if has any plan | Conditional UI |
| `getCustomersWithPlans()` | List all plan members | Admin reporting |

**Plan Detection Logic:**
- Checks `plan_name` field for "silver" or "silver plus"
- Checks custom fields with answer IDs (4027=silver, 4028=silver-plus)
- Checks customer tags for plan keywords

### Sync Functions (`repairshopr-sync.ts`)

| Function | Description | Frequency |
|----------|-------------|-----------|
| `triggerSyncIfNeeded()` | Conditional sync trigger | On API calls |
| `syncAllCustomers()` | Full customer sync | Manual/scheduled |
| `syncAllTickets()` | Full ticket sync | Manual/scheduled |
| `syncCustomerData(customerId)` | Sync single customer | On customer view |

---

## 3. NinjaOne RMM (Device Monitoring)

**File:** `src/lib/ninjaone.ts` (900+ lines)

**Purpose:** Remote device monitoring, hardware inventory, device status tracking.

### Environment Variables
```bash
NINJAONE_API_URL=https://app.ninjarmm.com    # Regional URL
NINJAONE_CLIENT_ID=xxx                        # OAuth2 Client ID
NINJAONE_CLIENT_SECRET=xxx                    # OAuth2 Client Secret
```

### Regional URLs
- **US:** `https://app.ninjarmm.com`
- **EU:** `https://eu.ninjarmm.com`
- **Oceania:** `https://oc.ninjarmm.com`

### Core Functions

| Function | Description | Usage | Called By |
|----------|-------------|-------|-----------|
| `createNinjaOneClient()` | Factory for NinjaOne client | Medium | Device operations |
| `getAccessToken()` | OAuth2 token retrieval | Internal | All API calls |
| `getDevices()` | List all monitored devices | Medium | Admin device list |
| `getDevice(id)` | Get specific device details | Medium | Device detail page |
| `getDeviceCustomFields(id)` | Get device custom fields | Low | Extended device info |
| `getDevicesByCustomer(email)` | Find devices by customer | Medium | Customer portal |
| `mapToRepairShoprAsset(device)` | Convert to RS format | Low | Asset sync |
| `refreshToken()` | Refresh OAuth token | Internal | Token management |

### Device Data Structure
```typescript
interface NinjaDevice {
  id: number;
  systemName: string;
  dnsName: string;
  lastContact: string;
  offline: boolean;
  os: {
    name: string;
    manufacturer: string;
    architecture: string;
    buildNumber: string;
  };
  system: {
    manufacturer: string;
    model: string;
    biosSerialNumber: string;
    serialNumber: string;
  };
  processors: Array<{ name: string; cores: number }>;
  memory: { total: number };
  volumes: Array<{ name: string; size: number; free: number }>;
}
```

### Caching & Rate Limiting
- In-memory cache with 5-minute TTL
- Exponential backoff on rate limit (429)
- Graceful degradation when API unavailable

---

## 4. GitHub API (Image Storage)

**File:** `src/lib/github.ts`

**Purpose:** Store and manage gallery images in the GitHub repository.

### Environment Variables
```bash
GITHUB_TOKEN=ghp_xxx                   # Personal Access Token
GITHUB_OWNER=MatthewMcManness          # Repository owner
GITHUB_REPO=Computer_Store_KS          # Repository name
GITHUB_BRANCH=Computer-Store-KS        # Target branch
```

### Functions

| Function | Description | Usage | Called By |
|----------|-------------|-------|-----------|
| `isGitHubConfigured()` | Check if GitHub is configured | Low | Config validation |
| `getFileFromGitHub(path)` | Get file content | Low | File retrieval |
| `getFileSha(path)` | Get file SHA for updates | Internal | Update operations |
| `uploadImageToGitHub(filename, buffer, msg)` | Upload new image | Medium | Gallery upload |
| `updateFileOnGitHub(path, content, msg)` | Update existing file | Low | Gallery publish |
| `deleteFileFromGitHub(path, msg)` | Delete file | Low | Image removal |
| `createFileOnGitHub(path, content, msg)` | Create new file | Low | Initial upload |

### Image Storage Path
```
public/assets/gallery/{type}/{filename}
  - type: 'desktop' | 'laptop'
  - filename: UUID + extension
```

### Library
Uses `@octokit/rest` for GitHub API v3 integration.

---

## 5. Resend (Email Service)

**File:** `src/lib/email.ts`

**Purpose:** Send transactional emails for contact form submissions.

### Environment Variables
```bash
RESEND_API_KEY=re_xxx                              # API key
NOTIFICATION_EMAIL=contact@computerstoreks.com     # Business inbox
```

### Functions

| Function | Description | Usage | Called By |
|----------|-------------|-------|-----------|
| `sendEmail(options)` | Low-level email send | Internal | Other email functions |
| `sendContactNotification(data)` | Notify business of submission | High | Contact API route |
| `sendContactConfirmation(data)` | Send confirmation to user | High | Contact API route |

### Email Templates
- **Contact Notification:** HTML email with submission details
- **Contact Confirmation:** Thank you email with business info

### API Details
- **Endpoint:** `https://api.resend.com/emails`
- **Auth:** Bearer token
- **From:** `Computer Store Kansas <contact@computerstoreks.com>`

---

## 6. Google Business Profile

**File:** `src/lib/google-business.ts`

**Purpose:** Fetch customer reviews, business posts, and location information from Google Business Profile.

### Environment Variables
```bash
GOOGLE_BUSINESS_CLIENT_ID=xxx           # OAuth2 Client ID
GOOGLE_BUSINESS_CLIENT_SECRET=xxx       # OAuth2 Client Secret
GOOGLE_BUSINESS_REFRESH_TOKEN=xxx       # Refresh token
GOOGLE_BUSINESS_ACCOUNT_ID=xxx          # Account ID
GOOGLE_BUSINESS_LOCATION_ID=xxx         # Location ID
```

### Functions

| Function | Description | Usage | Called By |
|----------|-------------|-------|-----------|
| `isGoogleBusinessConfigured()` | Check configuration | Low | Config validation |
| `fetchReviews(pageSize?)` | Get customer reviews | Medium | Reviews page/widget |
| `fetchPosts(pageSize?)` | Get business posts | Low | Homepage, updates |
| `fetchBusinessInfo()` | Get business details | Low | Footer, about page |
| `fetchAllGoogleBusinessData()` | Parallel fetch all | Medium | Initial page load |
| `getCachedReviewsStats()` | Get cached stats | Medium | Review badge |
| `clearCache()` | Clear all caches | Low | Manual refresh |
| `clearCacheType(type)` | Clear specific cache | Low | Selective refresh |

### Caching
- 15-minute in-memory cache
- Separate caches for reviews, posts, info
- Automatic cache invalidation

### API Endpoints
- **Business Info:** `https://mybusinessbusinessinformation.googleapis.com/v1`
- **Reviews/Posts:** `https://mybusiness.googleapis.com/v4`

---

## 7. Cloudflare Turnstile (CAPTCHA)

**Files:** `src/lib/spam-detection.ts`, `src/components/forms/contact-form.tsx`

**Purpose:** Bot protection for contact form submissions.

### Environment Variables
```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=xxx     # Public key (client-side)
TURNSTILE_SECRET_KEY=xxx                # Private key (server-side)
```

### Test Keys (Development)
```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

### Integration Points

| Component | Purpose |
|-----------|---------|
| `ContactForm` | Renders Turnstile widget |
| `calculateSpamScore()` | Verifies token server-side |
| Contact API route | Validates before processing |

### Verification Endpoint
`https://challenges.cloudflare.com/turnstile/v0/siteverify`

---

## 8. Internal Utilities

### Authentication (`src/lib/auth.ts`)

| Function | Description |
|----------|-------------|
| `getAuthMode()` | Get configured auth mode (repairshopr/legacy) |
| `authenticateWithRepairShopr(email, pass)` | RepairShopr login |
| `authenticateWithSupabase(email, pass)` | Supabase login |
| `createSession(user)` | Create encrypted session cookie |
| `destroySession()` | Clear session cookies |
| `getCurrentUser()` | Get logged-in user |
| `isAuthenticated()` | Check auth status |
| `verifyPassword(password)` | Legacy password check |
| `checkAuthFromRequest(request)` | Middleware auth check |

### Session Management (`src/lib/session-cookie.ts`)

| Function | Description |
|----------|-------------|
| `encryptSession(data)` | AES-256-GCM encryption |
| `decryptSession(token)` | Decrypt session token |
| `createSessionData(input, apiToken?)` | Build session object |
| `getSafeSession(session)` | Strip sensitive data |

### Spam Detection (`src/lib/spam-detection.ts`)

| Function | Description |
|----------|-------------|
| `calculateSpamScore(data)` | Multi-factor spam scoring |
| `isLikelySpam(score)` | Threshold check (>50 = spam) |
| `getSpamReasons(score, details)` | Human-readable reasons |

**Spam Score Factors:**
- Turnstile verification (30 pts if failed)
- Honeypot fields (25 pts if filled)
- Interaction tracking (20 pts if no interactions)
- Browser fingerprint (15 pts if suspicious)
- Disposable email (20 pts if detected)
- Content patterns (10-30 pts for spam phrases)
- Submission timing (10 pts if too fast)

### Audit Logging (`src/lib/audit.ts`)

| Function | Description |
|----------|-------------|
| `createAuditLog(action, details, userId)` | Log user action |
| `getAuditLogs(filters)` | Query audit history |

### Utilities (`src/lib/utils.ts`)

| Function | Description |
|----------|-------------|
| `cn(...classes)` | Tailwind class merger |
| `formatPhoneNumber(phone)` | Format US phone |
| `formatCurrency(amount)` | Format USD |
| `slugify(text)` | URL-safe slug |
| `truncate(text, length)` | Truncate with ellipsis |
| `absoluteUrl(path)` | Build absolute URL |

### Constants (`src/lib/constants.ts`)

| Export | Description |
|--------|-------------|
| `BUSINESS_INFO` | Business name, phone, address, hours |
| `SITE_CONFIG` | Site title, description, URL |
| `NAV_ITEMS` | Navigation menu structure |
| `SERVICES` | Service offerings list |

### Flyer Generator (`src/lib/flyer-generator.ts`)

| Function | Description |
|----------|-------------|
| `generateFlyer(computer)` | Create PDF sales flyer |
| `generateFlyerHTML(computer)` | Create HTML flyer |

---

## 9. Environment Variables Reference

### Required for Production

```bash
# Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# RepairShopr (CRM)
REPAIRSHOPR_SUBDOMAIN=thecomputerstore
REPAIRSHOPR_API_KEY=xxx
AUTH_MODE=repairshopr

# Authentication
SESSION_SECRET=<64-hex-chars>

# Email (Contact Form)
RESEND_API_KEY=re_xxx
NOTIFICATION_EMAIL=contact@computerstoreks.com

# Bot Protection
NEXT_PUBLIC_TURNSTILE_SITE_KEY=xxx
TURNSTILE_SECRET_KEY=xxx
```

### Optional Integrations

```bash
# GitHub (Gallery Images)
GITHUB_TOKEN=ghp_xxx
GITHUB_OWNER=MatthewMcManness
GITHUB_REPO=Computer_Store_KS
GITHUB_BRANCH=Computer-Store-KS

# NinjaOne RMM
NINJAONE_API_URL=https://app.ninjarmm.com
NINJAONE_CLIENT_ID=xxx
NINJAONE_CLIENT_SECRET=xxx

# Google Business Profile
GOOGLE_BUSINESS_CLIENT_ID=xxx
GOOGLE_BUSINESS_CLIENT_SECRET=xxx
GOOGLE_BUSINESS_REFRESH_TOKEN=xxx
GOOGLE_BUSINESS_ACCOUNT_ID=xxx
GOOGLE_BUSINESS_LOCATION_ID=xxx

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-xxx
NEXT_PUBLIC_GTM_ID=GTM-xxx

# Google Maps
GOOGLE_MAPS_API_KEY=xxx
```

---

## 10. Integration Status

### Active Integrations ✅

| Service | Status | Notes |
|---------|--------|-------|
| Supabase | ✅ Fully Active | Primary database, blog, auth |
| RepairShopr | ✅ Fully Active | Customer/ticket management |
| NinjaOne RMM | ✅ Active | Device monitoring |
| GitHub API | ✅ Active | Gallery image storage |
| Resend | ✅ Active | Contact form emails |
| Google Business | ✅ Active | Reviews display |
| Cloudflare Turnstile | ✅ Active | Bot protection |

### Not Integrated ❌

| Service | Status | Notes |
|---------|--------|-------|
| ESET | ❌ Not Integrated | No current API integration |
| Cloudinary | ❌ Configured Only | Env vars exist but unused |

### Potential Future Integrations

| Service | Purpose | Priority |
|---------|---------|----------|
| ESET | Antivirus license management | Medium |
| Stripe | Payment processing | Low |
| Twilio | SMS notifications | Low |
| QuickBooks | Accounting sync | Low |

---

## Quick Reference: "How Do I...?"

| Task | Use This |
|------|----------|
| Authenticate a user | `authenticateWithSupabase()` or `authenticateWithRepairShopr()` |
| Get customer info | `repairshoprClient.getCustomer(id)` |
| Search customers | `repairshoprClient.searchCustomers(query)` |
| Get blog posts | `getPublishedPosts()` |
| Upload gallery image | `uploadImageToGitHub()` |
| Send email | `sendContactNotification()` |
| Check protection plan | `getProtectionPlanTier(customer)` |
| Get device info | `ninjaClient.getDevice(id)` |
| Fetch reviews | `fetchReviews()` |
| Validate CAPTCHA | `calculateSpamScore()` with Turnstile token |
| Log audit event | `createAuditLog()` |
| Create session | `createSession(user)` |
| Check auth | `isAuthenticated()` or `getCurrentUser()` |

---

## Adding New Integrations

When adding a new external API integration:

1. **Create lib file:** `src/lib/{service-name}.ts`
2. **Add env vars:** Update `.env.example` with required variables
3. **Document functions:** Follow code documentation standards (see CLAUDE.md)
4. **Add to this guide:** Update this file with new integration details
5. **Create API routes:** If needed, add routes in `src/app/api/{service}/`
6. **Add error handling:** Include rate limiting, retries, graceful degradation
7. **Add caching:** Consider in-memory caching for frequently accessed data

### Template for New Integration

```typescript
/**
 * {ServiceName} API Integration
 *
 * Purpose: {Brief description}
 *
 * @see https://{service-docs-url}
 *
 * Environment Variables:
 * - {SERVICE}_API_KEY - API authentication key
 * - {SERVICE}_BASE_URL - API base URL (optional)
 *
 * @version 1.0.0 - {date} - Initial implementation
 */

// Check configuration
export function is{ServiceName}Configured(): boolean {
  return !!(process.env.{SERVICE}_API_KEY);
}

// Create client
export function create{ServiceName}Client() {
  if (!is{ServiceName}Configured()) {
    throw new Error('{ServiceName} is not configured');
  }
  // Return client instance
}
```
