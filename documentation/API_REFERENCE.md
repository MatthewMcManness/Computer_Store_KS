# Computer Store KS - API Reference

> Comprehensive documentation for all API endpoints in the Computer Store KS application.

**Last Updated:** 2026-01-12
**API Version:** 1.0.0
**Base URL:** `https://computerstoreks.com/api` (Production) | `http://localhost:3000/api` (Development)

---

## Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [Admin APIs](#admin-apis)
3. [RepairShopr APIs](#repairshopr-apis)
4. [Content APIs](#content-apis)
5. [Integration APIs](#integration-apis)
6. [Health Check](#health-check)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

---

## Authentication APIs

### POST /api/auth/login

Authenticates a user with email and password credentials.

**Authentication:** None required
**Status:** Production

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes (repairshopr mode) | User's email address |
| `password` | string | Yes | User's password |

#### Response (Success - 200)

```json
{
  "success": true,
  "user": {
    "email": "user@example.com",
    "name": "John Doe",
    "role": "technician",
    "userType": "employee"
  },
  "redirectUrl": "/admin"
}
```

#### Response (Rate Limited - 429)

```json
{
  "success": false,
  "error": "Too many login attempts. Please try again later.",
  "code": "RATE_LIMITED"
}
```

#### Response (Invalid Credentials - 401)

```json
{
  "success": false,
  "error": "Invalid email or password",
  "code": "INVALID_CREDENTIALS"
}
```

#### Side Effects

- Creates user session with encrypted cookie
- Records login attempt for rate limiting
- Triggers background RepairShopr sync for employee logins
- Logs authentication attempt for audit

---

### POST /api/auth/logout

Destroys the user's active session.

**Authentication:** None required (will destroy any active session)
**Status:** Production

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Side Effects

- Destroys session in database/storage
- Clears authentication cookies

---

### GET /api/auth/check

Checks current authentication status and returns user information.

**Authentication:** None required
**Status:** Production

#### Response (Authenticated - 200)

```json
{
  "authenticated": true,
  "user": {
    "email": "user@example.com",
    "name": "John Doe",
    "role": "technician",
    "userType": "employee"
  },
  "roles": ["technician", "lead_developer"],
  "redirectUrl": "/admin",
  "locationContext": {
    "currentLocationId": 1,
    "currentLocationName": "Main Store",
    "hasGlobalAccess": false,
    "availableLocations": [...]
  }
}
```

#### Response (Not Authenticated - 200)

```json
{
  "authenticated": false
}
```

---

## Admin APIs

### GET /api/admin/employees

Lists all employee profiles (non-customer users).

**Authentication:** Required (employee)
**Status:** Production

#### Response (Success - 200)

```json
{
  "employees": [
    {
      "id": "uuid",
      "email": "employee@example.com",
      "full_name": "John Doe",
      "role": "technician",
      "roles": ["technician"],
      "created_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /api/admin/employees

Creates a new employee via Supabase invite.

**Authentication:** Required (management access - manager, owner, or lead_developer)
**Status:** Production

#### Request Body

```json
{
  "email": "newemployee@example.com",
  "full_name": "Jane Smith",
  "roles": ["technician", "lead_developer"],
  "repairshopr_user_id": 12345
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Employee email address |
| `full_name` | string | Yes | Full name |
| `roles` | string[] | Yes | Array of roles (or legacy `role` string) |
| `repairshopr_user_id` | number | No | RepairShopr user ID for linking |

**Valid Roles:**
- Business roles (one required): `receptionist`, `technician`, `lead_technician`, `manager`, `owner`
- Add-on roles: `lead_developer`

#### Response (Success - 201)

```json
{
  "message": "Employee invited successfully. They will receive an email to set their password.",
  "employee": { ... }
}
```

#### Response (Conflict - 409)

```json
{
  "error": "A user with this email already exists"
}
```

#### Side Effects

- Creates Supabase auth user
- Sends invite email to new employee
- Creates user_profiles record

---

### GET /api/admin/employees/[id]

Gets a single employee by ID.

**Authentication:** Required (employee)
**Status:** Production

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Employee UUID |

#### Response (Success - 200)

```json
{
  "employee": {
    "id": "uuid",
    "email": "employee@example.com",
    "full_name": "John Doe",
    "role": "technician",
    "roles": ["technician"],
    "repairshopr_user_id": 12345
  }
}
```

---

### PUT /api/admin/employees/[id]

Updates an employee's profile.

**Authentication:** Required (management access)
**Status:** Production

#### Request Body

```json
{
  "full_name": "John Smith",
  "roles": ["technician", "lead_developer"],
  "repairshopr_user_id": 12345
}
```

#### Response (Success - 200)

```json
{
  "message": "Employee updated successfully",
  "employee": { ... }
}
```

---

### DELETE /api/admin/employees/[id]

Deletes an employee (deactivates in Supabase Auth).

**Authentication:** Required (management access)
**Status:** Production

#### Response (Success - 200)

```json
{
  "message": "Employee deactivated successfully"
}
```

---

### GET /api/admin/search

Universal search across customers, businesses, tickets, and invoices.

**Authentication:** Required (employee)
**Status:** Production

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query (minimum 2 characters) |

#### Response (Success - 200)

```json
{
  "results": [
    {
      "id": 12345,
      "type": "customer",
      "title": "John Doe",
      "subtitle": "john@example.com",
      "href": "/admin/customers/12345",
      "protectionPlan": "silver"
    },
    {
      "id": 67890,
      "type": "ticket",
      "title": "#1234: Computer not turning on",
      "subtitle": "Status: In Progress",
      "href": "/admin/tickets?id=67890"
    }
  ],
  "query": "john"
}
```

**Result Types:** `customer`, `business`, `ticket`, `invoice`

---

### POST /api/admin/sync

Triggers a RepairShopr data sync operation.

**Authentication:** Required (admin role only)
**Status:** Production

#### Request Body

```json
{
  "type": "full"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Sync type |

**Valid Sync Types:**
- `full` - Sync all entities in order
- `customers` - Sync only customers
- `tickets` - Sync only tickets
- `ticket_comments` - Sync only ticket comments
- `assets` - Sync only assets
- `invoices` - Sync only invoices
- `products` - Sync only products
- `payments` - Sync only payments

#### Response (Success - 200)

```json
{
  "success": true,
  "type": "full",
  "result": {
    "success": true,
    "totalSynced": 1523,
    "duration": "45s"
  }
}
```

#### Side Effects

- Upserts records to Supabase tables (rs_customers, rs_tickets, etc.)
- Creates sync log entries

---

### GET /api/admin/sync

Gets sync status and recent logs.

**Authentication:** Required (employee)
**Status:** Production

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `logs` | number | 10 | Number of recent logs to return |

#### Response (Success - 200)

```json
{
  "counts": {
    "customers": 1500,
    "tickets": 3200,
    "invoices": 2100,
    "assets": 890
  },
  "logs": [
    {
      "id": 1,
      "sync_type": "full",
      "status": "completed",
      "synced_count": 1523,
      "created_at": "2026-01-12T00:00:00Z"
    }
  ]
}
```

---

### GET /api/admin/customer-accounts

Gets a customer portal account by RepairShopr customer ID.

**Authentication:** Required (employee)
**Status:** Production

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `customer_id` | number | Yes | RepairShopr customer ID |

#### Response (Success - 200)

```json
{
  "account": {
    "id": "uuid",
    "email": "customer@example.com",
    "repairshopr_customer_id": 12345,
    "first_name": "John",
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

---

### POST /api/admin/customer-accounts

Creates or updates a customer portal account.

**Authentication:** Required (employee)
**Status:** Production

#### Request Body

```json
{
  "email": "customer@example.com",
  "password": "securepassword123",
  "repairshopr_customer_id": 12345,
  "first_name": "John"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Customer email |
| `password` | string | Yes | Password (min 8 characters) |
| `repairshopr_customer_id` | number | Yes | RepairShopr customer ID |
| `first_name` | string | No | Customer's first name |

#### Response (Success - 201)

```json
{
  "account": { ... },
  "action": "created"
}
```

---

### DELETE /api/admin/customer-accounts

Deletes a customer portal account.

**Authentication:** Required (employee)
**Status:** Production

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `customer_id` | number | Yes | RepairShopr customer ID |

---

### GET /api/admin/asset-plans

Gets protection plans for assets.

**Authentication:** Required (employee)
**Status:** Production

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `customer_id` | number | No | Filter by customer |
| `asset_id` | number | No | Get plan for specific asset |

---

### POST /api/admin/asset-plans

Creates a protection plan for an asset.

**Authentication:** Required (employee)
**Status:** Production

#### Request Body

```json
{
  "repairshopr_asset_id": 12345,
  "repairshopr_customer_id": 67890,
  "plan_tier": "silver",
  "eset_license_key": "XXXX-XXXX-XXXX"
}
```

---

### GET /api/admin/silver-plan

Gets protection plan status for a customer.

**Authentication:** Required (employee)
**Status:** Production

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `customer_id` | number | Yes | RepairShopr customer ID |

#### Response (Success - 200)

```json
{
  "is_silver_plan": true,
  "plan_tier": "silver",
  "plan": { ... }
}
```

---

### POST /api/admin/silver-plan

Sets protection plan tier for a customer.

**Authentication:** Required (employee)
**Status:** Production

#### Request Body

```json
{
  "customer_id": 12345,
  "plan_tier": "silver"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `customer_id` | number | Yes | RepairShopr customer ID |
| `plan_tier` | string | Yes | Plan tier: `null`, `bronze`, `silver`, `silver-plus`, `gold` |

#### Side Effects

- Updates Supabase customer_protection_plans table
- Syncs to RepairShopr custom field (except bronze, which is Supabase-only)

---

### POST /api/admin/set-location

Sets the current location for users with global access.

**Authentication:** Required (employee with global access)
**Status:** Production

#### Request Body

```json
{
  "location_id": 1
}
```

---

### GET /api/admin/migrate-users

Gets migration status and preview counts.

**Authentication:** Required (admin role)
**Status:** Production

#### Response (Success - 200)

```json
{
  "ready": true,
  "configuration": {
    "supabaseConfigured": true,
    "repairShoprConfigured": true
  },
  "current": {
    "authUsers": 45,
    "userProfiles": 42,
    "customerAccounts": 150
  }
}
```

---

### POST /api/admin/migrate-users

Triggers user migration from RepairShopr and customer_accounts to Supabase Auth.

**Authentication:** Required (admin role)
**Status:** Production

#### Request Body

```json
{
  "dryRun": true,
  "employeesOnly": false,
  "customersOnly": false,
  "skipEmails": false
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `dryRun` | boolean | false | Preview changes without making modifications |
| `employeesOnly` | boolean | false | Only migrate employees |
| `customersOnly` | boolean | false | Only migrate customers |
| `skipEmails` | boolean | false | Skip sending password reset emails |

#### Response (Success - 200)

```json
{
  "success": true,
  "dryRun": false,
  "message": "Migration completed successfully",
  "stats": {
    "employeesProcessed": 10,
    "employeesCreated": 8,
    "employeesSkipped": 2,
    "employeesFailed": 0,
    "customersProcessed": 150,
    "customersCreated": 145,
    "customersSkipped": 5,
    "customersFailed": 0,
    "emailsSent": 153,
    "emailsFailed": 0
  },
  "log": [ ... ]
}
```

---

## RepairShopr APIs

### GET /api/repairshopr/customers

Searches customers in RepairShopr.

**Authentication:** Required (employee)
**Status:** Production

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query |

---

### GET /api/repairshopr/customers/[id]

Gets customer details from RepairShopr.

**Authentication:** Required (employee)
**Status:** Production

---

### GET /api/repairshopr/customers/[id]/tickets

Gets all tickets for a customer.

**Authentication:** Required (employee)
**Status:** Production

---

### GET /api/repairshopr/customers/[id]/invoices

Gets all invoices for a customer.

**Authentication:** Required (employee)
**Status:** Production

---

### GET /api/repairshopr/customers/[id]/payments

Gets all payments for a customer.

**Authentication:** Required (employee)
**Status:** Production

---

### GET /api/repairshopr/customers/[id]/assets

Gets all assets for a customer.

**Authentication:** Required (employee)
**Status:** Production

---

### GET /api/repairshopr/customers/[id]/family

Gets family members for a customer (linked contacts).

**Authentication:** Required (employee)
**Status:** Production

---

### GET /api/repairshopr/tickets

Lists/searches tickets with optional filtering.

**Authentication:** Required (employee)
**Status:** Production

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search query |
| `status` | string | Filter by custom status |
| `location_id` | number | Filter by location |

---

### GET /api/repairshopr/tickets/[id]

Gets full ticket details including notes and status override.

**Authentication:** Required (employee)
**Status:** Production

---

### PUT /api/repairshopr/tickets/[id]

Updates a ticket in RepairShopr.

**Authentication:** Required (employee)
**Status:** Production

---

### GET /api/repairshopr/tickets/[id]/status

Gets custom status override for a ticket.

**Authentication:** Required (employee)
**Status:** Production

---

### POST /api/repairshopr/tickets/[id]/status

Sets or updates custom status override for a ticket.

**Authentication:** Required (employee)
**Status:** Production

#### Request Body

```json
{
  "status": "call_customer",
  "customer_question": "Need to confirm part availability"
}
```

---

### POST /api/repairshopr/tickets/[id]/comment

Adds a comment/note to a ticket.

**Authentication:** Required (employee)
**Status:** Production

#### Request Body

```json
{
  "subject": "Note subject",
  "body": "Note content...",
  "hidden": false,
  "do_not_email": true
}
```

---

### GET /api/repairshopr/tickets/[id]/public-notes

Gets public notes for a ticket (customer-visible).

**Authentication:** Required (employee)
**Status:** Production

---

### GET /api/repairshopr/tickets/status-definitions

Gets all custom status definitions.

**Authentication:** Required (employee)
**Status:** Production

#### Response (Success - 200)

```json
{
  "definitions": [
    {
      "status": "new",
      "display_name": "New",
      "repairshopr_status": "New",
      "show_customer_question": false,
      "customer_visible_status": "We've received your device",
      "sort_order": 1
    }
  ]
}
```

---

### POST /api/repairshopr/tickets/status-batch

Gets status overrides for multiple tickets at once.

**Authentication:** Required (employee)
**Status:** Production

#### Request Body

```json
{
  "ticket_ids": [1234, 5678, 9012]
}
```

---

### GET /api/repairshopr/tickets/call-customer

Gets tickets with "call_customer" status for the call widget.

**Authentication:** Required (employee)
**Status:** Production

---

### POST /api/repairshopr/tickets/sync-statuses

Syncs RepairShopr status changes to custom statuses.

**Authentication:** Required (employee)
**Status:** Production

---

### GET /api/repairshopr/businesses

Lists businesses from synced data.

**Authentication:** Required (employee)
**Status:** Production

---

### GET /api/repairshopr/businesses/customers

Gets customers associated with a business.

**Authentication:** Required (employee)
**Status:** Production

---

### GET /api/repairshopr/assets

Lists assets with optional filtering.

**Authentication:** Required (employee)
**Status:** Production

---

### GET /api/repairshopr/assets/[id]

Gets asset details.

**Authentication:** Required (employee)
**Status:** Production

---

### GET /api/repairshopr/families/[id]

Gets family details including linked contacts.

**Authentication:** Required (employee)
**Status:** Production

---

### GET /api/repairshopr/migration-progress

Gets RepairShopr to Supabase migration progress.

**Authentication:** Required (employee)
**Status:** Production

---

## Content APIs

### GET /api/blog

Lists blog posts.

**Authentication:** Optional (admin for all posts)
**Status:** Production

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `admin` | boolean | Include draft/unpublished posts (requires auth) |
| `metadata` | boolean | Include categories and tags |

#### Response (Success - 200)

```json
{
  "posts": [
    {
      "id": "uuid",
      "title": "Blog Post Title",
      "slug": "blog-post-title",
      "excerpt": "Brief description...",
      "content": "Full markdown content...",
      "status": "published",
      "author_name": "John Doe",
      "created_at": "2026-01-01T00:00:00Z"
    }
  ],
  "categories": [ ... ],
  "tags": [ ... ]
}
```

---

### POST /api/blog

Creates a new blog post.

**Authentication:** Required (employee)
**Status:** Production

#### Request Body

```json
{
  "title": "New Blog Post",
  "content": "Markdown content...",
  "excerpt": "Brief description",
  "slug": "new-blog-post",
  "category_id": "uuid",
  "tag_ids": ["uuid1", "uuid2"],
  "status": "draft",
  "featured_image_url": "https://..."
}
```

---

### GET /api/blog/[id]

Gets a single blog post by ID or slug.

**Authentication:** Optional
**Status:** Production

---

### PUT /api/blog/[id]

Updates a blog post.

**Authentication:** Required (employee)
**Status:** Production

---

### DELETE /api/blog/[id]

Deletes a blog post.

**Authentication:** Required (employee)
**Status:** Production

---

### POST /api/blog/upload

Uploads an image for blog posts.

**Authentication:** Required (employee)
**Status:** Production

#### Request Body

FormData with `file` field containing the image.

#### Response (Success - 200)

```json
{
  "success": true,
  "url": "https://...",
  "thumbnail": "https://..."
}
```

---

### GET /api/gallery

Lists computers in the gallery.

**Authentication:** Optional (admin for inactive items)
**Status:** Production

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `admin` | boolean | Include inactive computers (requires auth) |
| `includeInactive` | boolean | Include inactive computers |

#### Response (Success - 200)

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Gaming PC",
      "type": "desktop",
      "category": "refurbished",
      "price": 599.99,
      "image_url": "https://...",
      "specs": [
        { "label": "CPU", "value": "Intel i7-10700" }
      ]
    }
  ]
}
```

---

### POST /api/gallery

Adds a new computer to the gallery.

**Authentication:** Required (employee)
**Status:** Production

#### Request Body

```json
{
  "name": "Gaming PC",
  "type": "desktop",
  "category": "refurbished",
  "price": 599.99,
  "image_url": "https://...",
  "thumbnail_url": "https://...",
  "specs": [
    { "label": "CPU", "value": "Intel i7-10700" }
  ],
  "sort_order": 0
}
```

---

### GET /api/gallery/[id]

Gets a single computer by ID.

**Authentication:** Optional
**Status:** Production

---

### PUT /api/gallery/[id]

Updates a computer in the gallery.

**Authentication:** Required (employee)
**Status:** Production

---

### DELETE /api/gallery/[id]

Deletes a computer from the gallery.

**Authentication:** Required (employee)
**Status:** Production

---

### POST /api/gallery/upload

Uploads an image for gallery items.

**Authentication:** Required (employee)
**Status:** Production

---

### GET /api/gallery/sale

Gets current sale settings.

**Authentication:** None
**Status:** Production

#### Response (Success - 200)

```json
{
  "success": true,
  "data": {
    "currentSale": "winter-sale",
    "saleConfig": {
      "type": "winter-sale",
      "name": "Winter Sale",
      "discount": 15
    },
    "availableSales": [ ... ]
  }
}
```

---

### POST /api/gallery/sale

Updates global sale setting.

**Authentication:** Required (employee)
**Status:** Production

#### Request Body

```json
{
  "saleType": "winter-sale"
}
```

---

### POST /api/contact

Submits a contact form message.

**Authentication:** None
**Status:** Production

#### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "785-555-0123",
  "subject": "General",
  "message": "I have a question about..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Sender's name (max 100 chars) |
| `email` | string | Yes | Sender's email |
| `phone` | string | No | Phone number (max 20 chars) |
| `subject` | enum | Yes | `General`, `Repair`, `Custom Build`, `Protection Plans`, `Other` |
| `message` | string | Yes | Message (10-5000 chars) |

**Hidden Fields (Bot Protection):**
- `website` - Honeypot field
- `_timing` - Page load timestamp
- `_hp_email2`, `_hp_phone_confirm`, `_hp_url` - Additional honeypots
- `_turnstile` - Cloudflare Turnstile token
- `_interaction` - Interaction tracking data
- `_fingerprint` - Browser fingerprint data

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Thank you for your message! We will get back to you within 24 hours."
}
```

#### Side Effects

- Sends notification email to staff
- Sends confirmation email to sender
- Logs submission with spam score

---

## Integration APIs

### GET /api/google-business

Gets all Google Business Profile data (aggregate).

**Authentication:** None (public data)
**Status:** Production

---

### GET /api/google-business/reviews

Gets Google Business reviews with statistics.

**Authentication:** None
**Status:** Production

#### Response (Success - 200)

```json
{
  "success": true,
  "data": {
    "reviews": [ ... ],
    "stats": {
      "totalReviews": 150,
      "averageRating": 4.8
    }
  }
}
```

---

### GET /api/google-business/posts

Gets Google Business posts.

**Authentication:** None
**Status:** Production

---

### GET /api/google-business/info

Gets business information from Google Business Profile.

**Authentication:** None
**Status:** Production

---

### GET /api/ninjaone/devices

Lists devices from NinjaOne RMM.

**Authentication:** Required (employee)
**Status:** Production

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `organization_id` | number | Filter by organization |
| `device_type` | string | Filter by device type |

---

### GET /api/ninjaone/devices/[id]

Gets device details with RepairShopr mapping.

**Authentication:** Required (employee)
**Status:** Production

---

### GET /api/ninjaone/devices/customer/[email]

Gets devices by customer email or name.

**Authentication:** Required (employee)
**Status:** Production

---

### POST /api/webhooks/repairshopr

Receives webhook events from RepairShopr for real-time sync.

**Authentication:** Optional signature validation (REPAIRSHOPR_WEBHOOK_SECRET)
**Status:** Production

#### Headers

| Header | Description |
|--------|-------------|
| `x-repairshopr-signature` | HMAC-SHA256 signature (optional) |

#### Request Body

```json
{
  "event_type": "ticket.updated",
  "ticket": {
    "id": 12345,
    "number": "1234",
    "subject": "Computer repair",
    "status": "In Progress"
  }
}
```

**Supported Events:**
- `customer.created`, `customer.updated`
- `ticket.created`, `ticket.updated`, `ticket.status_changed`
- `invoice.created`, `invoice.updated`, `invoice.paid`
- `asset.created`, `asset.updated`

#### Response (Success - 200)

```json
{
  "success": true,
  "processed": ["ticket:12345"],
  "duration": "45ms"
}
```

#### Side Effects

- Upserts records to Supabase tables
- Creates status override for new tickets

---

### GET /api/webhooks/repairshopr

Health check for webhook endpoint.

**Authentication:** None
**Status:** Production

#### Response (Success - 200)

```json
{
  "status": "ok",
  "message": "RepairShopr webhook endpoint is active",
  "signature_validation": "enabled"
}
```

---

### GET /api/customers/portal-account

Checks if a customer has a portal account.

**Authentication:** Required (employee)
**Status:** Production

---

### POST /api/customers/portal-account

Creates a portal account for a customer.

**Authentication:** Required (employee)
**Status:** Production

---

## Health Check

### GET /api/health

System health check endpoint.

**Authentication:** None
**Status:** Production

#### Response (Success - 200)

```json
{
  "status": "ok",
  "timestamp": "2026-01-12T00:00:00Z",
  "supabaseConfigured": true,
  "supabaseAdminConfigured": true,
  "githubConnected": true,
  "database": {
    "success": true,
    "customerCount": 1500,
    "error": null
  },
  "env": {
    "hasSupabaseUrl": true,
    "hasSupabaseAnonKey": true,
    "hasSupabaseServiceKey": true
  }
}
```

**Status Values:**
- `ok` - All systems operational
- `degraded` - Some services unavailable

---

## Error Handling

All API endpoints return consistent error responses:

### Standard Error Response

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `RATE_LIMITED` | 429 | Too many requests |
| `INVALID_CREDENTIALS` | 401 | Authentication failed |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `SERVER_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service not configured |

---

## Rate Limiting

### Login Endpoint

- **Limit:** 5 attempts per IP
- **Window:** 15 minutes
- **Header:** `Retry-After` (seconds until reset)

### Contact Form

- **Limit:** 10 requests per IP
- **Window:** 1 minute
- **Headers:** `X-RateLimit-Remaining`, `Retry-After`

### General API

Rate limiting is handled by Render at the infrastructure level.

---

## Authentication Methods

### Session Cookie

Most admin endpoints use encrypted session cookies set during login.

**Cookie Name:** `session`
**Encryption:** AES-256-GCM
**Expiry:** 24 hours

### API Key (RepairShopr)

For RepairShopr API calls, the employee's session token is used to authenticate requests to the RepairShopr API.

### Webhook Signature (Optional)

For RepairShopr webhooks, optional HMAC-SHA256 signature validation using `REPAIRSHOPR_WEBHOOK_SECRET`.

---

## Environment Variables

See `.env.example` for complete list. Key API-related variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# RepairShopr
REPAIRSHOPR_SUBDOMAIN=
REPAIRSHOPR_API_KEY=
REPAIRSHOPR_WEBHOOK_SECRET=

# NinjaOne
NINJAONE_CLIENT_ID=
NINJAONE_CLIENT_SECRET=

# Email
RESEND_API_KEY=
NOTIFICATION_EMAIL=

# Authentication
SESSION_SECRET=
```
