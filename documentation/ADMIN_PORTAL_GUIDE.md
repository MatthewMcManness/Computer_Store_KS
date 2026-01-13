# Computer Store KS - Admin/Employee Portal Guide

**Version:** 2.0 (with Role-Based Access Control)
**Last Updated:** January 2026

## Table of Contents

1. [Overview](#overview)
2. [Authentication & Access](#authentication--access)
3. [Dashboard Pages](#dashboard-pages)
4. [Role-Based Access Control](#role-based-access-control)
5. [Key Features](#key-features)
6. [UI Components](#ui-components)
7. [Technical Architecture](#technical-architecture)

---

## Overview

### Purpose

The Admin/Employee Portal is the internal management interface for The Computer Store KS repair shop operations. It provides comprehensive tools for:

- Customer intake and management
- Ticket tracking and status updates
- Family group management
- Employee account administration
- Gallery inventory management
- Blog content management
- Data synchronization with RepairShopr

### Who Uses It

The portal serves different staff roles with appropriate access levels:

- **Reception** - Front desk operations, customer intake, ticket management
- **Technicians** - Repair work tracking, technical dashboards
- **Lead Technicians** - Team oversight, ticket assignment
- **Managers** - Employee management, blog access, business operations
- **Owner** - Full system access
- **Add-on Roles** - Social media (blog), Lead Developer (IT superuser)

### Access URL

- **Production:** `https://computerstoreks.com/admin`
- **Development:** Development Render deployment URL + `/admin`

---

## Authentication & Access

### Login System

The portal uses **Supabase Authentication** with encrypted session cookies.

**Login Process:**
1. Navigate to `/admin/login`
2. Enter employee email and password
3. System validates credentials against Supabase Auth
4. Creates encrypted session (8-hour expiry)
5. Sets HTTP-only session cookies
6. Redirects to appropriate dashboard based on role

**Session Security:**
- Sessions encrypted with AES-256-GCM
- HTTP-only cookies (XSS protection)
- Secure flag in production (HTTPS only)
- SameSite: lax (CSRF protection)
- 8-hour automatic expiration

**Password Requirements:**
- Managed through Supabase Auth
- Minimum 6 characters (Supabase default)
- Case-sensitive
- Email verification optional

### Role Assignment

User roles are stored in the `user_profiles` table in Supabase:

```typescript
interface UserProfile {
  id: string;               // Supabase Auth UUID
  email: string;
  full_name: string;
  role: string;             // Primary role (legacy field)
  roles: string[];          // Array of roles (new multi-role system)
  location_id: string | null;  // Assigned location
  repairshopr_user_id: number;
  created_at: string;
}
```

**Role Types:**

- **Business Hierarchy Roles** - Single role per user (linear inheritance):
  - `receptionist` → `technician` → `lead_technician` → `manager` → `owner`

- **Add-on Roles** - Can be combined with any business role:
  - `social_media` - Blog access for users below Manager level
  - `lead_developer` - IT superuser with full system access

---

## Dashboard Pages

### Reception Dashboard (`/admin`)

**Primary Features:**
- **Customer Intake Button** - Prominent call-to-action for new tickets
- **Call Customer Widget** - Auto-refreshing list of tickets requiring customer contact (30s refresh)
- **System Status** - Supabase and GitHub connection indicators

**Who Can Access:** All employees (requires `view_reception_dashboard` permission)

**Key Components:**
```typescript
<CallCustomerTickets />  // Auto-refresh widget
```

---

### Customer Management (`/admin/customers`)

**Features:**
- Searchable customer list with pagination (50 per page)
- Protection plan filtering (ESET, Silver, Silver+)
- Customer detail view with:
  - Contact information
  - Protection plan badge
  - Linked tickets, invoices, assets
  - Family associations
- **Add Customer** modal with portal password setup
- **Edit Customer** modal with:
  - Contact info editing
  - Assets migration status tracking
  - Protection plan indicators

**Protection Plans:**
- **ESET** - Basic antivirus protection
- **Silver** - Standard protection plan
- **Silver+** - Premium protection plan with additional benefits

**Migration Tracking:**
The system tracks migration from customer-level to asset-level protection plans:
- Progress indicator shows migration percentage
- `assets_updated` flag per customer
- Prevents marking customers as migrated without assets

**Who Can Access:**
- View: `view_customers`
- Create/Edit: `manage_customers`

---

### Business Management (`/admin/businesses`)

**Features:**
- Business account listing
- Separate from individual customers
- Links to associated contacts and tickets

**Business vs Individual:**
- Business accounts can have multiple linked contacts
- Useful for companies with multiple employees
- Separate billing and contact workflows

**Who Can Access:**
- View: `view_businesses`
- Manage: `manage_businesses`

---

### Ticket System (`/admin/tickets`)

#### Ticket List Page

**Features:**
- **Search** - By ticket #, customer name, or subject
- **Status Filters** - Desktop horizontal layout, mobile collapsible grid
- **Status Badges** - Color-coded custom status display
- Real-time status from custom status system

**Filter Options:**
- All tickets
- New
- Diagnosing
- Repairing
- Data Transferring
- Installing
- Waiting for Parts
- Building
- Call Customer (highlighted in red)
- Waiting for Customer Reply
- Ready for Pickup
- Completed (not shown in active filters)

**Display Information:**
- Ticket number and subject
- Customer name
- Status badge with custom display name
- Time since creation

**Who Can Access:**
- View: `view_tickets`
- Filter/Search: All with view access

---

#### Ticket Detail Page (`/admin/tickets/[id]`)

**Layout: Three-Column Design**

**Left Sidebar (Customer Info Panel):**
- Customer profile with avatar
- Protection plan badge (Silver Plan with sparkle icon)
- Contact information (email, phone, business, address)
- Portal access status (Active/No Password with visual indicator)

**Center Column (Main Content):**

**Header:**
- Back button
- Ticket number
- Custom status badge
- Subject line
- Edit button

**Notes Timeline:**
Three types of notes with visual distinction:
1. **Private Notes** (Internal Only)
   - Amber border and background
   - EyeOff icon
   - Not sent to RepairShopr
   - For internal staff communication

2. **Staff Comments** (RepairShopr)
   - Blue border and background
   - Eye icon
   - Standard RepairShopr comments
   - Visible to staff only

3. **Public Notes** (Customer Communication)
   - Green border and background
   - Eye icon
   - Sent to customer via SMS/email through RepairShopr
   - Can be deleted by staff
   - Shows "Delete" button

4. **Customer Notes** (From Customer)
   - Purple border and background
   - User icon
   - Replies from customer
   - Read-only

**Note Input:**
- Private note input with "Send" button (amber)
- Public note input with "Send" button (green)
- Both inputs at bottom of notes section

**Right Sidebar (Status Control):**
- **Status Dropdown** - Select custom status
- **Customer Question Field** - Appears for statuses that require it:
  - `call_customer`
  - `waiting_for_customer_reply`
- **Update Status Button** - Blue with check icon
- **Ticket Metadata:**
  - Created date
  - Last updated date
  - Problem type

**Who Can Access:**
- View: `view_tickets`
- Edit: `manage_tickets`
- Status changes sync to RepairShopr via API

---

#### Custom Status System

The portal implements a custom ticket status layer **on top of** RepairShopr statuses:

**Database Tables:**
```sql
-- Status definitions with display names
ticket_status_definitions:
  - status (PK, e.g., 'call_customer')
  - display_name (e.g., 'Call Customer')
  - repairshopr_status (e.g., 'Customer Reply')
  - show_customer_question (boolean)
  - customer_visible_status (e.g., 'We Have a Question')
  - sort_order
  - is_active

-- Per-ticket status overrides
ticket_status_overrides:
  - repairshopr_ticket_id
  - custom_status
  - customer_question (optional text)
  - updated_by
  - timestamps
```

**Status Mapping:**

| Custom Status | RepairShopr Status | Customer Sees | Question? |
|---------------|-------------------|---------------|-----------|
| new | New | Received | No |
| diagnosing | In Progress | Being Diagnosed | No |
| repairing | In Progress | Being Repaired | No |
| data_transferring | In Progress | Data Transfer in Progress | No |
| installing | In Progress | Installation in Progress | No |
| waiting_for_parts | Waiting for Parts | Waiting for Parts | No |
| building | In Progress | Being Built | No |
| call_customer | Customer Reply | We Have a Question | **Yes** |
| waiting_for_customer_reply | Customer Reply | Awaiting Your Response | **Yes** |
| ready_for_pickup | Done Shelf | Ready for Pickup | No |
| completed | Resolved | Completed | No |

**How It Works:**
1. Staff selects custom status in portal UI
2. System stores override in `ticket_status_overrides`
3. Corresponding RepairShopr status updated via API
4. Customer portal displays customer-friendly status text
5. Question field shown when status requires it

**Benefits:**
- More granular status tracking than RepairShopr provides
- Customer-friendly status messages
- Ability to ask specific questions per status
- Maintains compatibility with RepairShopr workflow

---

#### Edit Ticket Modal

**Fields:**
- Subject
- Problem Type
- Priority (Low/Medium/High/Urgent)
- RepairShopr Status (read-only, managed via custom status)

**Validation:**
- Subject required
- Changes sync to RepairShopr immediately

---

### Family Management (`/admin/families`)

**NEW FEATURE** - Family group management system.

**Features:**
- **Family List** with pagination
- **Protection Plan Filtering** - Filter families by plan tier
- **Create Family** - Modal with name input
- **Family Detail View** - Shows all family members
- **Delete Family** - Only allowed for empty families

**Family Structure:**
- Each family has a unique name (e.g., "Smith Family")
- Multiple customers can belong to one family
- Protection plans can be tracked at family level
- Useful for household-level service tracking

**Use Cases:**
- Track protection plans for entire households
- Family discounts and billing
- Shared service history
- Multi-device support tracking

**Display:**
- Desktop: Table with columns (Family Name, Members, Protection Plan, Actions)
- Mobile: Cards with icon and summary

**Who Can Access:**
- View: `view_families`
- Create/Edit/Delete: `manage_families`

---

### Gallery Management (`/admin/gallery`)

**Features:**
- Computer inventory management
- Desktop/Laptop categorization
- Image upload to Supabase Storage
- Pricing and specifications
- Sale/Black Friday pricing controls
- Publish to live site

**Computer Types:**
- Desktop (refurbished/custom/new)
- Laptop (refurbished/custom/new)

**Who Can Access:**
- View: `view_gallery`
- Edit: `manage_gallery`

---

### Blog Management (`/admin/blog`)

**Features:**
- Post creation and editing
- Draft/Published status
- Categories and tags
- Featured images
- Markdown content editor
- SEO-friendly slugs

**Post Management:**
- `/admin/blog` - List all posts
- `/admin/blog/new` - Create new post
- `/admin/blog/[id]` - Edit existing post

**Who Can Access:**
- View: `view_blog`
- Create/Edit/Delete: `manage_blog`
- **Auto-granted to:** Manager, Owner, Lead Developer
- **Can be added to:** Any role via `social_media` add-on

---

### Employee Management (`/admin/employees`)

**Features:**
- Employee list with role badges
- **Add Employee** (`/admin/employees/new`)
- **Edit Roles** - Multi-role modal with:
  - Business role selection (radio buttons)
  - Add-on role toggles (checkboxes)
  - Visual role descriptions
- **Delete Employee** - With confirmation (cannot delete self)

**Role Badge Colors:**
- Receptionist: Green
- Technician: Blue
- Lead Technician: Indigo
- Manager: Amber
- Owner: Purple
- Social Media: Pink
- Lead Developer: Red

**Employee Creation Flow:**
1. Create Supabase Auth user
2. Create `user_profiles` entry
3. Assign business role + optional add-ons
4. Send password setup email (optional)

**Who Can Access:**
- View: `view_employees`
- Create/Edit/Delete: `manage_employees`
- **Restricted to:** Manager, Owner, Lead Developer

---

### Sync Page (`/admin/sync`)

**Features:**
- RepairShopr data synchronization
- Customer data sync
- Ticket status sync
- Manual trigger for data refresh

**Who Can Access:**
- View: `view_data_sync`
- Trigger: `manage_data_sync`
- **Restricted to:** Lead Developer only

---

### Additional Pages

**POS (`/admin/pos`):**
- Point of sale interface
- Requires: `use_pos`

**Leads (`/admin/leads`):**
- Sales lead tracking
- Requires: `view_leads`, `manage_leads`

**Invoices (`/admin/invoices`):**
- Invoice management
- Requires: `view_invoices`, `manage_invoices`

**Quotes (`/admin/quotes`):**
- Quote generation
- Requires: `use_quotes`

**Tech Dashboard (`/admin/tech`):**
- Technician-specific view
- Requires: `view_tech_dashboard`

**Lead Tech Dashboard (`/admin/lead-tech`):**
- Lead technician oversight
- Requires: `view_lead_tech_dashboard`

**Intake (`/admin/intake`):**
- Multi-step customer intake wizard
- Customer search → Create/Select → Device info → Ticket creation → Success
- Requires: `manage_intake`

---

## Role-Based Access Control

### Permission Model

The portal uses a **hierarchical role system with add-ons**:

**Business Hierarchy** (linear inheritance):
```
receptionist
    ↓ (inherits from)
technician
    ↓
lead_technician
    ↓
manager
    ↓
owner (all permissions)
```

**Add-on Roles** (combinable):
- `social_media` - Grants blog access
- `lead_developer` - Full superuser access

### Permission Matrix

| Feature | Receptionist | Technician | Lead Tech | Manager | Owner | Social Media | Lead Dev |
|---------|-------------|-----------|----------|---------|-------|-------------|----------|
| Reception Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | - | ✓ |
| Customer Management | ✓ | ✓ | ✓ | ✓ | ✓ | - | ✓ |
| Families | ✓ | ✓ | ✓ | ✓ | ✓ | - | ✓ |
| Tickets (View) | ✓ | ✓ | ✓ | ✓ | ✓ | - | ✓ |
| Tickets (Manage) | ✓ | ✓ | ✓ | ✓ | ✓ | - | ✓ |
| POS | ✓ | ✓ | ✓ | ✓ | ✓ | - | ✓ |
| Invoices | ✓ | ✓ | ✓ | ✓ | ✓ | - | ✓ |
| Leads | ✓ | ✓ | ✓ | ✓ | ✓ | - | ✓ |
| Quotes | ✓ | ✓ | ✓ | ✓ | ✓ | - | ✓ |
| Tech Dashboard | - | ✓ | ✓ | ✓ | ✓ | - | ✓ |
| Gallery | - | ✓ | ✓ | ✓ | ✓ | - | ✓ |
| Ticket Assignment | - | - | ✓ | ✓ | ✓ | - | ✓ |
| Blog | - | - | - | ✓ | ✓ | ✓ | ✓ |
| Employee Management | - | - | - | ✓ | ✓ | - | ✓ |
| Data Sync | - | - | - | - | - | - | ✓ |

### Permission Definitions

All permissions are defined in `src/types/roles.ts`:

```typescript
type Permission =
  // General
  | 'view_admin_dashboard'
  // Reception
  | 'view_reception_dashboard'
  | 'manage_intake'
  | 'view_customers'
  | 'manage_customers'
  | 'view_families'
  | 'manage_families'
  | 'view_businesses'
  | 'manage_businesses'
  | 'view_tickets'
  | 'manage_tickets'
  | 'view_invoices'
  | 'manage_invoices'
  | 'use_pos'
  | 'view_leads'
  | 'manage_leads'
  | 'use_quotes'
  // Technician
  | 'view_tech_dashboard'
  | 'manage_ticket_work'
  | 'view_gallery'
  | 'manage_gallery'
  // Lead Tech
  | 'view_lead_tech_dashboard'
  | 'assign_tickets'
  // Social Media
  | 'view_blog'
  | 'manage_blog'
  // Management
  | 'view_employees'
  | 'manage_employees'
  // Admin
  | 'view_data_sync'
  | 'manage_data_sync';
```

### Sidebar Navigation

The sidebar is **dynamically filtered** based on user permissions:

**Sections:**
1. **Reception** - Customer intake, tickets, invoices, POS, leads, quotes
2. **Technician** - Tech dashboard, ticket work, gallery
3. **Lead Tech** - Lead tech dashboard
4. **Social Media** - Blog posts
5. **Management** - Employees
6. **Admin** - Data sync

**Collapsible Behavior:**
- Each section can be expanded/collapsed
- Expanded state saved in localStorage
- Mobile: Full-width overlay menu
- Desktop: Fixed sidebar (expanded or icon-only)

**Location Selector:**
- Shown for users with global access (multi-location roles)
- Shows location badge for single-location users
- Hidden when sidebar is collapsed

---

## Key Features

### Call Customer Widget

**Location:** Reception Dashboard (`/admin`)

**Purpose:** Displays tickets that need customer contact.

**Features:**
- Auto-refresh every 30 seconds
- Shows tickets with `call_customer` status
- Displays:
  - Ticket number and subject
  - Customer name
  - Time since status changed
  - Customer question (if provided)
- Click to navigate to ticket detail

**Visual Design:**
- Red icon (Phone) for urgency
- Rounded card with border
- Header with ticket count
- Refresh button (manual trigger)
- Empty state: Green check icon with "No tickets need customer calls"

---

### Protection Plan System

**Plan Tiers:**
1. **ESET** - Basic antivirus protection
2. **Silver** - Standard protection with benefits
3. **Silver+** - Premium tier with enhanced benefits

**Visual Indicators:**
- **Badges** - Color-coded plan badges on customer cards
- **Card Styling** - Border highlights for plan customers:
  - ESET: Green border
  - Silver: Blue/silver border
  - Silver+: Amber/gold border with special styling

**Tracking Levels:**
1. **Customer-Level** (Legacy) - Stored in `customer_silver_plans` table
2. **Asset-Level** (New) - Stored in `asset_protection_plans` table per device

**Migration Tracking:**
- `assets_updated` flag in `rs_customers` table
- Progress bar on customers list showing migration %
- Prevents marking customers as migrated without assets

---

### Customer Intake Wizard

**Location:** `/admin/intake`

**Steps:**
1. **Customer Search** - Find existing or create new
2. **Customer Form** - Contact details (if new)
3. **Device Information** - Device type, make, model, issue
4. **Ticket Creation** - Problem description, priority
5. **Success** - Confirmation with ticket number

**Features:**
- Multi-step progress indicator
- Validation at each step
- Back/Next navigation
- Auto-save draft (optional)
- Portal password setup for new customers

---

### Real-Time Features

**Auto-Refresh:**
- Call Customer widget: 30 seconds
- Ticket status badges: On page load
- Protection plan indicators: Lazy-loaded

**Optimistic UI Updates:**
- Status changes show immediately
- Notes appear before server confirmation
- Rollback on error

---

## UI Components

### Core Admin Components

**Location:** `src/components/admin/`

#### AdminSidebar

**Purpose:** Main navigation sidebar with collapsible sections.

**Features:**
- Role-based filtering
- Collapsible sections with localStorage persistence
- Location selector (for multi-location users)
- Mobile responsive (overlay mode)
- Icon-only collapsed state

**Component:**
```tsx
<AdminSidebar
  mode="expanded" | "collapsed" | "hidden"
  mobileMenuOpen={boolean}
  onCloseMobileMenu={() => void}
  onLogout={() => void}
/>
```

---

#### AdminHeader

**Purpose:** Top navigation bar with user menu.

**Features:**
- Sidebar toggle button
- Page title
- User profile menu
- Logout option

---

#### CallCustomerTickets

**Purpose:** Widget showing tickets needing customer contact.

**Features:**
- Auto-refresh (30s interval)
- Click to navigate to ticket
- Shows customer question if provided
- Time since status change

**Component:**
```tsx
<CallCustomerTickets />
```

**API Endpoint:** `GET /api/repairshopr/tickets/call-customer`

---

#### IntakeWizard

**Purpose:** Multi-step customer intake process.

**Components:**
- `CustomerSearchStep` - Search existing customers
- `CustomerFormStep` - Create new customer
- `DeviceStep` - Device information
- `TicketStep` - Problem description
- `SuccessStep` - Confirmation

**Features:**
- Step validation
- Progress indicator
- Back/Next navigation
- Portal password setup modal

---

### Ticket Components

**TicketList:**
- Searchable, filterable ticket list
- Status badges
- Customer info
- Click to navigate

**TicketDetail:**
- Three-column layout
- Customer info panel
- Notes timeline (private/public/staff/customer)
- Status control sidebar
- Edit modal

**StatusBadge:**
- Color-coded badges
- Custom status display names
- Tooltip with description

---

### Customer Components

**CustomerList:**
- Pagination (50 per page)
- Search by name/email
- Plan tier filtering
- Protection plan badges
- Migration progress indicator

**CustomerDetail:**
- Contact information
- Protection plan indicator
- Linked tickets, invoices, assets
- Family association
- Portal access status

---

### Family Components

**FamilyList:**
- Pagination
- Plan filtering
- Create family modal
- Delete confirmation (empty families only)

**FamilyDetail:**
- Member list
- Protection plan summary
- Add/remove members

---

### Employee Components

**EmployeeList:**
- Role badges (color-coded)
- Created date
- Edit/Delete actions
- Cannot delete self

**EmployeeEditRoles Modal:**
- Business role selection (radio)
- Add-on role toggles (checkboxes)
- Role descriptions
- Visual role icons and colors

---

## Technical Architecture

### Frontend Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State:** React hooks (useState, useEffect, useCallback)

### Backend Stack

- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth + custom session encryption
- **External API:** RepairShopr REST API
- **API Routes:** Next.js API routes (`src/app/api/`)

### Key Libraries

**Client-Side:**
```typescript
// State management
useState, useEffect, useCallback, useRouter

// UI Components
import { Loader2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
```

**Server-Side:**
```typescript
// Authentication
import { isAuthenticated, getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// RepairShopr API
import { createRepairShoprClient } from '@/lib/repairshopr'
```

### Database Schema

**Key Tables:**

```sql
-- User authentication and profiles
user_profiles (
  id UUID PRIMARY KEY,           -- Supabase Auth UUID
  email TEXT,
  full_name TEXT,
  role TEXT,                     -- Legacy single role
  roles TEXT[],                  -- New multi-role system
  location_id TEXT,
  repairshopr_user_id INTEGER,
  repairshopr_customer_id INTEGER,
  created_at TIMESTAMP
)

-- Ticket custom status tracking
ticket_status_definitions (
  status TEXT PRIMARY KEY,
  display_name TEXT,
  repairshopr_status TEXT,
  show_customer_question BOOLEAN,
  customer_visible_status TEXT,
  sort_order INTEGER,
  is_active BOOLEAN
)

ticket_status_overrides (
  repairshopr_ticket_id INTEGER PRIMARY KEY,
  custom_status TEXT,
  customer_question TEXT,
  updated_by TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Protection plans (legacy customer-level)
customer_silver_plans (
  repairshopr_customer_id INTEGER PRIMARY KEY,
  is_silver_plan BOOLEAN,       -- Legacy field
  plan_tier TEXT,                -- 'eset', 'silver', 'silver-plus'
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Protection plans (new asset-level)
asset_protection_plans (
  repairshopr_asset_id INTEGER PRIMARY KEY,
  repairshopr_customer_id INTEGER,
  plan_tier TEXT,                -- 'eset', 'silver', 'silver-plus'
  eset_status TEXT,              -- 'protected', 'expired', 'unprotected'
  eset_expiry TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Migration tracking
rs_customers (
  repairshopr_id INTEGER PRIMARY KEY,
  assets_updated BOOLEAN,        -- Has this customer been migrated?
  -- Other RepairShopr synced data
)

-- Public notes for customer communication
ticket_public_notes (
  id UUID PRIMARY KEY,
  repairshopr_ticket_id INTEGER,
  repairshopr_customer_id INTEGER,
  author_name TEXT,
  author_email TEXT,
  content TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Family groups
families (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

family_members (
  family_id INTEGER,
  customer_id INTEGER,
  PRIMARY KEY (family_id, customer_id)
)
```

### API Routes

**Authentication:**
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - Session destruction
- `GET /api/auth/check` - Session validation

**Customers:**
- `GET /api/repairshopr/customers` - List with filters
- `GET /api/repairshopr/customers/[id]` - Customer details
- `POST /api/repairshopr/customers` - Create customer
- `PUT /api/repairshopr/customers/[id]` - Update customer
- `DELETE /api/repairshopr/customers/[id]` - Delete customer

**Tickets:**
- `GET /api/repairshopr/tickets` - List with filters
- `GET /api/repairshopr/tickets/[id]` - Ticket details
- `PUT /api/repairshopr/tickets/[id]` - Update ticket
- `GET /api/repairshopr/tickets/call-customer` - Call customer list
- `GET /api/repairshopr/tickets/status-definitions` - Status definitions
- `GET /api/repairshopr/tickets/status/[id]` - Get status override
- `PUT /api/repairshopr/tickets/status/[id]` - Set status override
- `POST /api/repairshopr/tickets/status-batch` - Batch status fetch
- `GET /api/repairshopr/tickets/[id]/notes` - Get ticket notes
- `POST /api/repairshopr/tickets/[id]/notes` - Add note
- `GET /api/repairshopr/tickets/[id]/public-notes` - Get public notes
- `POST /api/repairshopr/tickets/[id]/public-notes` - Create public note
- `DELETE /api/repairshopr/tickets/[id]/public-notes` - Delete public note

**Families:**
- `GET /api/repairshopr/families` - List families
- `GET /api/repairshopr/families/[id]` - Family details
- `POST /api/repairshopr/families` - Create family
- `PUT /api/repairshopr/families/[id]` - Update family
- `DELETE /api/repairshopr/families/[id]` - Delete family

**Employees:**
- `GET /api/admin/employees` - List employees
- `GET /api/admin/employees/[id]` - Employee details
- `PUT /api/admin/employees/[id]` - Update employee roles
- `DELETE /api/admin/employees/[id]` - Delete employee

**Gallery:**
- `GET /api/gallery` - List computers
- `POST /api/gallery` - Create computer
- `PUT /api/gallery/[id]` - Update computer
- `DELETE /api/gallery/[id]` - Delete computer
- `POST /api/gallery/upload` - Upload image

**Blog:**
- `GET /api/blog` - List posts
- `POST /api/blog` - Create post
- `PUT /api/blog/[id]` - Update post
- `DELETE /api/blog/[id]` - Delete post
- `POST /api/blog/upload` - Upload image

### Session Management

**Session Cookie Structure:**
```typescript
interface SessionData {
  userId: number;              // RepairShopr user/customer ID
  supabaseUserId: string;      // Supabase Auth UUID
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'limited';
  roles: string[];             // Multi-role array
  userType: 'employee' | 'customer';
  location_id?: string | null;
  apiToken?: string;           // RepairShopr API token (employees only)
  expiresAt: number;
}
```

**Encryption:**
- Algorithm: AES-256-GCM
- Key derivation: PBKDF2 from `SESSION_SECRET`
- IV: Random 16 bytes per session
- Auth tag: 16 bytes

**Cookie Settings:**
- Name: `admin_session`
- HttpOnly: true
- Secure: true (production)
- SameSite: lax
- MaxAge: 28800 (8 hours)

**Role Cookie (for Edge Middleware):**
- Name: `user_role`
- Contains: user's primary role
- Used for route protection in middleware

### Security Features

**XSS Protection:**
- HTTP-only cookies
- Input sanitization
- Content Security Policy headers

**CSRF Protection:**
- SameSite cookies
- Origin validation on mutations

**SQL Injection Prevention:**
- Parameterized queries (Supabase)
- Input validation

**Authentication:**
- Encrypted sessions
- Secure password hashing (Supabase bcrypt)
- Session expiration

**Authorization:**
- Role-based access control
- Permission checking on every route
- Middleware protection for admin routes

---

## Conclusion

The Admin/Employee Portal is a comprehensive management interface designed for efficient repair shop operations. With role-based access control, real-time updates, and seamless integration with RepairShopr, it provides staff with the tools they need to deliver excellent customer service.

For technical implementation details, see:
- `src/types/roles.ts` - Role definitions and permissions
- `src/lib/auth.ts` - Authentication logic
- `src/lib/supabase.ts` - Database operations
- `src/components/admin/` - UI components

For questions or support, contact the development team at Resilient Web Solutions.
