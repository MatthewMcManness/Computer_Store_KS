# TypeScript Type Definitions

> Comprehensive documentation of all TypeScript types used in the Computer Store KS application.

**Last Updated:** 2026-01-12

---

## Table of Contents

1. [Type Files Overview](#1-type-files-overview)
2. [Core Type Definitions](#2-core-type-definitions)
3. [API Response Types](#3-api-response-types)
4. [Component Props Types](#4-component-props-types)
5. [Form Types](#5-form-types)
6. [Integration Types](#6-integration-types)
7. [Type Relationships](#7-type-relationships)
8. [Best Practices](#8-best-practices)

---

## 1. Type Files Overview

### src/types/index.ts

The main type definitions file containing common types used throughout the application.

**Exported Types:**
| Type | Purpose |
|------|---------|
| `Computer` | Legacy computer product with full details |
| `ComputerSpecs` | Hardware specifications for computers |
| `Service` | Service offering with pricing |
| `ContactFormData` | Contact form submission data |
| `RepairRequest` | Repair service request tracking |
| `ApiResponse<T>` | Generic API response wrapper |
| `PaginatedResponse<T>` | Paginated API response with metadata |
| `NavItem` | Navigation menu item structure |
| `BusinessHours` | Single day operating hours |
| `WeeklyHours` | Complete weekly schedule |

**Re-exports:** All types from `./google-business`

---

### src/types/roles.ts

Role-Based Access Control (RBAC) system definitions.

**Role Types:**
| Type | Description |
|------|-------------|
| `BusinessRole` | Hierarchy: receptionist, technician, lead_technician, manager, owner |
| `AddOnRole` | Additional roles: social_media, lead_developer |
| `EmployeeRole` | Union of BusinessRole and AddOnRole |
| `CustomerRole` | Customer portal access |
| `UserRole` | Union of all roles |
| `Permission` | Permission identifiers for route/feature access |
| `IconName` | Lucide React icon names |

**Interfaces:**
| Interface | Purpose |
|-----------|---------|
| `SidebarItem` | Individual sidebar menu item |
| `SidebarSection` | Collapsible sidebar section |

**Constants:**
| Constant | Description |
|----------|-------------|
| `ROLE_HIERARCHY` | Inheritance chain for business roles |
| `BUSINESS_ROLE_LEVEL` | Numeric level for role comparison |
| `ROLE_PERMISSIONS` | Permissions granted to each role |
| `SIDEBAR_CONFIG` | Complete sidebar navigation structure |
| `ROUTE_PERMISSIONS` | Route-to-permission mapping |
| `ROLE_LABELS` | Human-readable role labels |
| `ROLE_DESCRIPTIONS` | Role descriptions for UI |

---

### src/types/locations.ts

Multi-location support type definitions.

**Types:**
| Type | Description |
|------|-------------|
| `LocationSlug` | URL-friendly location identifier: 'topeka' or 'holton' |

**Interfaces:**
| Interface | Purpose |
|-----------|---------|
| `Location` | Full location object from database |
| `LocationOption` | Minimal info for dropdowns |

**Constants:**
| Constant | Value |
|----------|-------|
| `ALL_LOCATION_SLUGS` | `['topeka', 'holton']` |
| `DEFAULT_LOCATION` | `'topeka'` |
| `LOCATION_CONFIG` | Location metadata for display |
| `GLOBAL_ACCESS_ROLES` | Roles with multi-location access |
| `LOCATION_COOKIE_NAME` | `'selected_location'` |
| `LOCATION_COOKIE_MAX_AGE` | 30 days in seconds |

**Functions:**
| Function | Purpose |
|----------|---------|
| `getLocationName(slug)` | Get display name for location |
| `isValidLocation(slug)` | Validate location slug |
| `canAccessAllLocations(roles)` | Check if user has global access |
| `getLocationFilter(...)` | Get location filter for queries |

---

### src/types/google-business.ts

Google Business Profile API integration types.

**Raw API Types:**
| Type | Description |
|------|-------------|
| `GoogleBusinessReview` | Review from GBP API |
| `GoogleBusinessPost` | Post from GBP API |
| `GoogleBusinessHours` | Operating hours from API |
| `GoogleBusinessLocation` | Full location info from API |

**Display Types (Frontend-friendly):**
| Type | Description |
|------|-------------|
| `DisplayReview` | Simplified review for UI |
| `DisplayPost` | Simplified post for UI |
| `DisplayBusinessInfo` | Simplified business info |

**API/Cache Types:**
| Type | Description |
|------|-------------|
| `GoogleBusinessApiResponse<T>` | API response wrapper |
| `GoogleBusinessCache` | Cache structure for API data |

---

### src/types/gallery.ts

Gallery computer inventory system types.

**Types:**
| Type | Description |
|------|-------------|
| `SaleType` | Sale event identifier: 'none' or 'black-friday' |

**Interfaces:**
| Interface | Purpose |
|-----------|---------|
| `GallerySpec` | Computer specification (label/value pair) |
| `BlackFridayData` | Sale pricing data |
| `GalleryComputer` | Complete computer listing |
| `SaleConfig` | Sale event configuration |
| `GallerySale` | Sale record from database |
| `GalleryData` | Legacy JSON-based gallery data (deprecated) |
| `GalleryApiResponse<T>` | Gallery API response wrapper |
| `ImageUploadResponse` | Image upload API response |
| `ComputerFormData` | Admin form data for computers |
| `CreateComputerInput` | Database insert input |
| `UpdateComputerInput` | Database update input |

**Constants:**
| Constant | Description |
|----------|-------------|
| `AVAILABLE_SALES` | Array of sale configurations |

---

## 2. Core Type Definitions

### Computer Types

```typescript
// Legacy computer type (src/types/index.ts)
interface Computer {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: 'desktop' | 'laptop' | 'all-in-one';
  price: number;
  originalPrice?: number;
  description: string;
  specs: ComputerSpecs;
  images: string[];
  inStock: boolean;
  featured: boolean;
  condition: 'excellent' | 'good' | 'fair';
  warranty: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ComputerSpecs {
  processor: string;
  ram: string;
  storage: string;
  graphics?: string;
  display?: string;
  os: string;
  ports?: string[];
  wireless?: string;
  battery?: string;
}

// Gallery computer type (src/types/gallery.ts)
interface GalleryComputer {
  id: string;                            // UUID from Supabase
  name: string;
  type: 'desktop' | 'laptop';
  category: 'custom' | 'refurbished' | 'new';
  price: string;                         // Display format "$599.99"
  image: string;
  thumbnail?: string;                    // 400x300 WebP
  specs: GallerySpec[];
  blackFriday?: BlackFridayData;
  created_at?: string;
  updated_at?: string;
}

interface GallerySpec {
  label: string;                         // e.g., "Processor"
  value: string;                         // e.g., "Intel Core i5-10400"
}
```

**Usage Context:**
- `Computer` - Legacy type, may be unused. Check if gallery uses GalleryComputer instead.
- `GalleryComputer` - Active type for admin gallery and public display.

---

### Role & Permission Types

```typescript
type BusinessRole =
  | 'receptionist'
  | 'technician'
  | 'lead_technician'
  | 'manager'
  | 'owner';

type AddOnRole = 'social_media' | 'lead_developer';

type Permission =
  | 'view_admin_dashboard'
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
  | 'view_tech_dashboard'
  | 'manage_ticket_work'
  | 'view_gallery'
  | 'manage_gallery'
  | 'view_lead_tech_dashboard'
  | 'assign_tickets'
  | 'view_blog'
  | 'manage_blog'
  | 'view_employees'
  | 'manage_employees'
  | 'view_data_sync'
  | 'manage_data_sync';
```

**Usage Example:**
```typescript
import { hasPermission } from '@/lib/auth';

if (hasPermission(userRoles, 'manage_gallery')) {
  // Allow gallery management
}
```

---

### Location Types

```typescript
type LocationSlug = 'topeka' | 'holton';

interface Location {
  id: string;                  // UUID
  slug: LocationSlug;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;            // e.g., 'America/Chicago'
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface LocationOption {
  slug: LocationSlug;
  name: string;
  is_active: boolean;
}
```

**Usage Example:**
```typescript
import { getLocationFilter, canAccessAllLocations } from '@/types/locations';

const locationId = getLocationFilter(
  userRoles,
  userLocationId,
  selectedLocation
);
```

---

### Ticket Status Types

```typescript
// src/lib/supabase.ts
type TicketCustomStatus =
  | 'new'
  | 'diagnosing'
  | 'repairing'
  | 'data_transferring'
  | 'installing'
  | 'waiting_for_parts'
  | 'building'
  | 'call_customer'
  | 'waiting_for_customer_reply'
  | 'ready_for_pickup'
  | 'completed';

interface TicketStatusOverride {
  id: string;
  repairshopr_ticket_id: number;
  custom_status: TicketCustomStatus;
  customer_question: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

interface TicketStatusDefinition {
  status: TicketCustomStatus;
  display_name: string;
  description: string | null;
  repairshopr_status: string;
  show_customer_question: boolean;
  customer_visible_status: string | null;
  sort_order: number;
  is_active: boolean;
}
```

---

## 3. API Response Types

### Generic Response Wrapper

```typescript
// src/types/index.ts
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Usage
const response: ApiResponse<GalleryComputer[]> = {
  success: true,
  data: computers,
  message: 'Computers fetched successfully'
};
```

### Paginated Response

```typescript
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Usage
const paginatedCustomers: PaginatedResponse<RepairShoprCustomer> = {
  items: customers,
  total: 100,
  page: 1,
  pageSize: 25,
  totalPages: 4
};
```

### Gallery-Specific Responses

```typescript
// src/types/gallery.ts
interface GalleryApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface ImageUploadResponse {
  success: boolean;
  filename: string;
  path: string;
  url: string;
  thumbnailUrl?: string;
  thumbnailPath?: string;
}
```

### Google Business Response

```typescript
// src/types/google-business.ts
interface GoogleBusinessApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
  cachedAt?: string;
}
```

---

## 4. Component Props Types

### Admin Components

```typescript
// AdminHeader
interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

// AdminShell
interface AdminShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

// AdminSidebar
interface AdminSidebarProps {
  currentPath: string;
  userRoles: string[];
}

// GalleryTable
interface GalleryTableProps {
  computers: GalleryComputer[];
  onEdit: (computer: GalleryComputer) => void;
  onDelete: (id: string) => void;
}

// ComputerForm
interface ComputerFormProps {
  computer?: GalleryComputer;
  onSubmit: (data: ComputerFormData) => Promise<void>;
  onCancel: () => void;
}

// ImageUpload
interface ImageUploadProps {
  onUpload: (response: ImageUploadResponse) => void;
  currentImage?: string;
  accept?: string;
}

// LocationSelector
interface LocationSelectorProps {
  currentLocation: string | null;
  onLocationChange: (location: string) => void;
  disabled?: boolean;
}

// SaleDropdown
interface SaleDropdownProps {
  currentSale: SaleType;
  onSaleChange: (sale: SaleType) => void;
}
```

### Intake Components

```typescript
// CustomerSearchStep
interface CustomerSearchStepProps {
  onSelectCustomer: (customer: RepairShoprCustomer) => void;
  onCreateNew: () => void;
}

// CustomerFormStep
interface CustomerFormStepProps {
  initialData?: Partial<RepairShoprCustomer>;
  onSubmit: (customer: RepairShoprCustomer) => void;
  onBack: () => void;
}

// DeviceStep
interface DeviceStepProps {
  customerId: number;
  onSelectDevice: (asset: RepairShoprAsset) => void;
  onCreateNew: () => void;
  onBack: () => void;
}

// TicketStep
interface TicketStepProps {
  customer: RepairShoprCustomer;
  asset: RepairShoprAsset;
  onSubmit: (ticket: RepairShoprTicket) => void;
  onBack: () => void;
}

// SuccessStep
interface SuccessStepProps {
  ticket: RepairShoprTicket;
  onStartNew: () => void;
}

// PasswordSetupModal
interface PasswordSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: number;
}
```

### Gallery Components

```typescript
// GalleryGrid
interface GalleryGridProps {
  computers: GalleryComputer[];
  onSelect?: (computer: GalleryComputer) => void;
  isAdmin?: boolean;
}

// CategoryFilter
interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

// FlipCard
interface FlipCardProps {
  computer: GalleryComputer;
  onClick?: () => void;
  isAdmin?: boolean;
}

// GallerySkeleton
interface GallerySkeletonProps {
  count?: number;
}
```

### Layout Components

```typescript
// Container
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

// Header
interface HeaderProps {
  transparent?: boolean;
  fixed?: boolean;
}

// Nav
interface NavProps {
  items: NavItem[];
  currentPath: string;
}

// MobileNav
interface MobileNavProps {
  items: NavItem[];
  isOpen: boolean;
  onClose: () => void;
}

// Modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}
```

### UI Components

```typescript
// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

// Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

// Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

// Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

// Badge
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}
```

### Animation Components

```typescript
// MotionContainer
interface MotionContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

// MotionSection
interface MotionSectionProps {
  children: React.ReactNode;
  className?: string;
}

// MotionCard
interface MotionCardProps {
  children: React.ReactNode;
  className?: string;
  index?: number;
}

// MotionButton
interface MotionButtonProps extends ButtonProps {
  whileHover?: object;
  whileTap?: object;
}

// PageTransition
interface PageTransitionProps {
  children: React.ReactNode;
}

// MotionHeading
interface MotionHeadingProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  className?: string;
}
```

### SEO Components

```typescript
// LocalBusinessSchema
interface LocalBusinessSchemaProps {
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  phone: string;
  url: string;
  hours?: string[];
}

// ProductSchema
interface ProductSchemaProps {
  name: string;
  description: string;
  price: number;
  image?: string;
  availability?: 'InStock' | 'OutOfStock';
}

// FAQSchema
interface FAQSchemaProps {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

// Breadcrumbs
interface BreadcrumbsProps {
  items: Array<{
    label: string;
    href?: string;
  }>;
}
```

---

## 5. Form Types

### Contact Form

```typescript
// src/types/index.ts
interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// Extended with spam detection (src/lib/spam-detection.ts)
interface ExtendedFormData extends ContactFormData {
  honeypot?: string;
  timestamp?: number;
  userAgent?: string;
}
```

### Repair Request Form

```typescript
interface RepairRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  issueDescription: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
```

### Computer Form (Admin)

```typescript
// src/types/gallery.ts
interface ComputerFormData {
  name: string;
  type: 'desktop' | 'laptop';
  category: 'custom' | 'refurbished' | 'new';
  price: string;                        // Display format
  image: string;
  thumbnail?: string;
  specs: GallerySpec[];
}

// Database input types
interface CreateComputerInput {
  name: string;
  type: 'desktop' | 'laptop';
  category: 'refurbished' | 'custom' | 'new';
  price: number;                        // Numeric for DB
  image_url?: string;
  thumbnail_url?: string;
  specs?: GallerySpec[];
  sort_order?: number;
}

interface UpdateComputerInput {
  name?: string;
  type?: 'desktop' | 'laptop';
  category?: 'refurbished' | 'custom' | 'new';
  price?: number;
  image_url?: string;
  thumbnail_url?: string;
  specs?: GallerySpec[];
  is_active?: boolean;
  sort_order?: number;
}
```

### Blog Post Form

```typescript
// src/lib/supabase.ts
interface CreateBlogPostInput {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image_url?: string;
  featured_image_thumbnail?: string;
  category_id?: string;
  author_name: string;
  author_email?: string;
  status?: 'draft' | 'published' | 'archived';
  published_at?: string;
  tag_ids?: string[];
}

interface UpdateBlogPostInput {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  featured_image_url?: string;
  featured_image_thumbnail?: string | null;
  category_id?: string | null;
  author_name?: string;
  author_email?: string;
  status?: 'draft' | 'published' | 'archived';
  published_at?: string | null;
  tag_ids?: string[];
}
```

---

## 6. Integration Types

### RepairShopr Types

Located in `src/lib/repairshopr.ts`:

```typescript
// Configuration
interface RepairShoprConfig {
  subdomain: string;
  baseUrl?: string;
}

// User/Employee
interface RepairShoprUser {
  id: number;
  email: string;
  full_name: string;
  phone?: string | null;
  mobile?: string | null;
  created_at?: string;
  updated_at?: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  business_name?: string | null;
  role?: string | null;
  admin?: boolean;
}

// Customer
interface RepairShoprCustomer {
  id: number;
  firstname: string;
  lastname: string;
  fullname: string;
  business_name?: string | null;
  email: string;
  phone?: string | null;
  mobile?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  created_at?: string;
  updated_at?: string;
  tags?: string[] | null;
  is_silver_plan?: boolean;
  custom_fields?: Record<string, unknown> | null;
}

// Asset/Device
interface RepairShoprAsset {
  id: number;
  name: string;
  asset_type_name?: string | null;
  customer_id: number;
  properties?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

// Ticket
interface RepairShoprTicket {
  id: number;
  number: string;
  subject: string;
  customer_id: number;
  customer_business_then_name?: string;
  status?: string;
  problem_type?: string;
  created_at?: string;
  updated_at?: string;
  due_date?: string;
  resolved_at?: string;
  priority?: string;
}

interface RepairShoprTicketDetail extends RepairShoprTicket {
  comments?: RepairShoprTicketComment[];
  timers?: RepairShoprTimerEntry[];
  customer?: RepairShoprCustomer;
  assets?: RepairShoprAsset[];
}

// Ticket Comment
interface RepairShoprTicketComment {
  id: number;
  created_at: string;
  updated_at: string;
  ticket_id: number;
  subject?: string;
  body: string;
  tech?: string;
  hidden: boolean;
  user_id?: number;
}

// Invoice
interface RepairShoprInvoice {
  id: number;
  number: string;
  customer_id: number;
  total: string;
  balance_due: string;
  status?: string;
  date?: string;
  due_date?: string;
  is_paid?: boolean;
  line_items?: RepairShoprLineItem[];
}

// Line Item
interface RepairShoprLineItem {
  id: number;
  item: string;
  name?: string;
  description?: string;
  quantity: number;
  price: string;
  cost?: string;
  total?: string;
  taxable?: boolean;
}

// Product
interface RepairShoprProduct {
  id: number;
  name: string;
  description?: string;
  sku?: string;
  upc_code?: string;
  price_retail?: string;
  price_cost?: string;
  quantity?: number;
  category?: string;
  location?: string;
}

// Payment
interface RepairShoprPayment {
  id: number;
  invoice_id: number;
  customer_id: number;
  amount: string;
  payment_method?: string;
  reference?: string;
  applied_at?: string;
}

// Business
interface RepairShoprBusiness {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

// Auth Responses
interface SignInResponse {
  api_key: string;
  user: RepairShoprUser;
  admin: boolean;
  two_factor_required: boolean;
  subdomain: string;
  permissions: Record<string, Record<string, boolean>>;
}

// Input Types
interface CreateCustomerInput {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  business_name?: string;
}

interface CreateTicketInput {
  customer_id: number;
  subject: string;
  problem_type?: string;
  status?: string;
  asset_id?: number;
  due_date?: string;
  user_id?: number;
  comment_body?: string;
}

interface AddTicketCommentInput {
  subject?: string;
  body: string;
  tech?: string;
  hidden?: boolean;
  do_not_email?: boolean;
  sms_body?: string;
}

// Protection Plan Type
type ProtectionPlanTier = 'eset' | 'silver' | 'silver-plus' | null;
```

---

### NinjaOne Types

Located in `src/lib/ninjaone.ts`:

```typescript
// Configuration
interface NinjaOneConfig {
  apiUrl: string;
  clientId: string;
  clientSecret: string;
  accessToken?: string;
}

// Hardware Info
interface NinjaOneHardware {
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  processorName?: string;
  processorCores?: number;
  ramGb?: number;
  diskDrives?: Array<{
    name?: string;
    sizeGb?: number;
    freeGb?: number;
    type?: 'SSD' | 'HDD' | 'NVMe' | 'Unknown';
  }>;
  biosVersion?: string;
  biosDate?: string;
}

// Operating System
interface NinjaOneOS {
  name: string;
  version?: string;
  build?: string;
  architecture?: '32-bit' | '64-bit';
  lastBootTime?: string;
}

// Network Adapter
interface NinjaOneNetworkAdapter {
  name: string;
  macAddress?: string;
  ipAddresses?: string[];
  type?: 'Ethernet' | 'WiFi' | 'Virtual' | 'Unknown';
}

// Device (Normalized)
interface NinjaOneDevice {
  id: number;
  name: string;
  systemName?: string;
  os: string;
  osDetails?: NinjaOneOS;
  status: 'online' | 'offline' | 'unknown';
  lastSeen: Date;
  lastContact?: Date;
  hardware: NinjaOneHardware;
  networkAdapters?: NinjaOneNetworkAdapter[];
  deviceClass?: 'WINDOWS_WORKSTATION' | 'WINDOWS_SERVER' | 'MAC' | 'LINUX' | 'CLOUD_MONITOR' | 'VMWARE_HOST' | 'UNKNOWN';
  organizationId?: number;
  organizationName?: string;
  locationId?: number;
  locationName?: string;
  notes?: string;
  customFields?: Record<string, unknown>;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Organization
interface NinjaOneOrganization {
  id: number;
  name: string;
  description?: string;
  nodeApprovalMode?: string;
  locations?: Array<{
    id: number;
    name: string;
    address?: string;
  }>;
}

// Device Mapping (Links NinjaOne to RepairShopr)
interface DeviceMapping {
  id: string;
  repairshoprAssetId: number;
  ninjaoneDeviceId: number;
  deviceName?: string;
  serialNumber?: string;
  ownerUserId?: string;
  lastSyncAt: Date;
  syncStatus: 'synced' | 'pending' | 'error' | 'stale';
  syncError?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Error Response
interface NinjaOneErrorResponse {
  error?: string;
  error_description?: string;
  resultCode?: string;
  errorMessage?: string;
}
```

---

### Supabase Types

Located in `src/lib/supabase.ts` and `src/lib/supabase-auth.ts`:

```typescript
// Blog Category
interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

// Blog Tag
interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

// Blog Post
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  featured_image_thumbnail: string | null;
  category_id: string | null;
  author_name: string;
  author_email: string | null;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category?: BlogCategory | null;
  tags?: BlogTag[];
}

// User Profile
interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: LegacyUserRole;           // Deprecated
  roles: string[];                // New multi-role system
  location_id: string | null;
  repairshopr_user_id: number | null;
  repairshopr_customer_id: number | null;
  protection_plan_tier: 'bronze' | 'silver' | 'gold' | null;
  created_at: string;
  updated_at: string;
}

// Authenticated User
interface AuthenticatedUser {
  user: User;                     // Supabase User type
  session: Session;               // Supabase Session type
  profile: UserProfile | null;
}

// Customer Protection Plan
interface CustomerProtectionPlan {
  id: string;
  repairshopr_customer_id: number;
  plan_tier: ProtectionPlanTier;
  expiration_date: string | null;
  created_at: string;
  updated_at: string;
}

// Asset Protection Plan
interface AssetProtectionPlan {
  id: string;
  repairshopr_asset_id: number;
  repairshopr_customer_id: number;
  plan_tier: ProtectionPlanTier;
  expiration_date: string | null;
  created_at: string;
  updated_at: string;
}

// Customer Protection Summary
interface CustomerProtectionSummary {
  customer_id: number;
  customer_tier: ProtectionPlanTier;
  assets: Array<{
    asset_id: number;
    asset_name: string;
    tier: ProtectionPlanTier;
    expiration: string | null;
  }>;
}
```

---

### Session Types

Located in `src/lib/session-store.ts` and `src/lib/session-cookie.ts`:

```typescript
// Session Store Types
interface Session {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
  locationId: string | null;
  apiKey?: string;
  createdAt: number;
  expiresAt: number;
}

interface CreateSessionData {
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
  locationId?: string | null;
  apiKey?: string;
}

// Session Cookie Types
interface SessionData {
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
  locationId: string | null;
  repairshoprUserId: number | null;
  apiKey?: string;
  expiresAt: number;
}

interface SafeSessionData {
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
  locationId: string | null;
  repairshoprUserId: number | null;
}

interface CreateSessionInput {
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
  locationId?: string | null;
  repairshoprUserId?: number | null;
  apiKey?: string;
}
```

---

### Spam Detection Types

Located in `src/lib/spam-detection.ts` and `src/lib/spam-patterns.ts`:

```typescript
// Spam Score Result
interface SpamScoreResult {
  isSpam: boolean;
  score: number;                  // 0-100, higher = more spammy
  reasons: string[];
  confidence: 'low' | 'medium' | 'high';
}

// Content Analysis
interface ContentAnalysis {
  hasExcessiveLinks: boolean;
  hasSpamKeywords: boolean;
  hasEncodedContent: boolean;
  linkCount: number;
  keywordMatches: string[];
}

// Spam Pattern Result
interface SpamPatternResult {
  isSpam: boolean;
  reason: string;
  pattern?: string;
}
```

---

### Audit Types

Located in `src/lib/audit.ts`:

```typescript
// Audit Log Entry
interface AuditLogEntry {
  action: string;
  entityType: string;
  entityId: string | number;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// Employee Info
interface EmployeeInfo {
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
}

// Audit Log Record (Database)
interface AuditLogRecord {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
```

---

### Data Sync Types

Located in `src/lib/repairshopr-sync.ts`:

```typescript
// Sync Result
interface SyncResult {
  success: boolean;
  synced: number;
  errors: number;
  errorMessages?: string[];
}

// Full Sync Result
interface FullSyncResult {
  customers: SyncResult;
  tickets: SyncResult;
  assets: SyncResult;
}

// Sync Log Entry
interface SyncLogEntry {
  id: string;
  sync_type: string;
  started_at: string;
  completed_at: string | null;
  status: 'running' | 'completed' | 'failed';
  items_synced: number;
  errors: number;
  error_details: string[] | null;
}
```

---

## 7. Type Relationships

### Hierarchy Diagram

```
UserRole
  ├── EmployeeRole
  │     ├── BusinessRole (receptionist → technician → lead_technician → manager → owner)
  │     └── AddOnRole (social_media, lead_developer)
  └── CustomerRole (customer)

Permission → SidebarItem → SidebarSection → SIDEBAR_CONFIG
           → ROUTE_PERMISSIONS (route protection)

Location
  └── LocationSlug → LocationOption
                   → LOCATION_CONFIG

GalleryComputer
  ├── GallerySpec[]
  ├── BlackFridayData
  └── SaleType → SaleConfig → GallerySale

RepairShoprTicket
  ├── RepairShoprTicketDetail (extends)
  │     ├── RepairShoprTicketComment[]
  │     ├── RepairShoprTimerEntry[]
  │     ├── RepairShoprCustomer
  │     └── RepairShoprAsset[]
  └── TicketStatusOverride (Supabase layer)
        └── TicketCustomStatus

BlogPost
  ├── BlogCategory
  └── BlogTag[]

UserProfile
  ├── roles: string[] → Permission[]
  └── location_id → Location

DeviceMapping
  ├── repairshoprAssetId → RepairShoprAsset
  └── ninjaoneDeviceId → NinjaOneDevice
```

### Cross-System Type Mapping

| System A | System B | Mapping |
|----------|----------|---------|
| `RepairShoprAsset` | `NinjaOneDevice` | `DeviceMapping` |
| `RepairShoprTicket` | `TicketStatusOverride` | `repairshopr_ticket_id` |
| `RepairShoprCustomer` | `CustomerProtectionPlan` | `repairshopr_customer_id` |
| `RepairShoprUser` | `UserProfile` | `repairshopr_user_id` |
| `BusinessRole` | `Permission[]` | `ROLE_PERMISSIONS` |

---

## 8. Best Practices

### Type Naming Conventions

| Pattern | Usage | Example |
|---------|-------|---------|
| `PascalCase` | Interfaces and Types | `GalleryComputer`, `UserRole` |
| `camelCase` | Properties and methods | `createdAt`, `isActive` |
| `SCREAMING_SNAKE_CASE` | Constants | `ROLE_PERMISSIONS`, `DEFAULT_LOCATION` |
| `*Props` suffix | Component props | `ButtonProps`, `AdminHeaderProps` |
| `*Input` suffix | Create/Update DTOs | `CreateComputerInput`, `UpdateBlogPostInput` |
| `*Response` suffix | API responses | `SignInResponse`, `ImageUploadResponse` |

### Type vs Interface

**Use `interface` when:**
- Defining object shapes that may be extended
- Creating component props
- Defining API response structures

```typescript
interface GalleryComputer {
  id: string;
  name: string;
  // ...
}
```

**Use `type` when:**
- Creating union types
- Defining literal types
- Creating aliases for primitives

```typescript
type BusinessRole = 'receptionist' | 'technician' | 'lead_technician' | 'manager' | 'owner';
type SaleType = 'none' | 'black-friday';
type ProtectionPlanTier = 'eset' | 'silver' | 'silver-plus' | null;
```

### Generic Type Patterns

**API Response Wrapper:**
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Usage
const response: ApiResponse<GalleryComputer[]> = await fetchComputers();
```

**Paginated Response:**
```typescript
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Usage
const customers: PaginatedResponse<RepairShoprCustomer> = await getCustomers(page);
```

### Discriminated Unions

```typescript
// Status-based discriminated union
type TicketStatus =
  | { status: 'new'; assignedTo?: never }
  | { status: 'in_progress'; assignedTo: string }
  | { status: 'completed'; assignedTo: string; resolvedAt: Date };

// Type guard
function isCompleted(ticket: TicketStatus): ticket is { status: 'completed'; assignedTo: string; resolvedAt: Date } {
  return ticket.status === 'completed';
}
```

### Type Guards

```typescript
// src/types/roles.ts
function isAddOnRole(role: string): role is AddOnRole {
  return ADD_ON_ROLES.includes(role as AddOnRole);
}

function isBusinessRole(role: string): role is BusinessRole {
  return BUSINESS_ROLES.includes(role as BusinessRole);
}

// src/types/locations.ts
function isValidLocation(slug: string): slug is LocationSlug {
  return ALL_LOCATION_SLUGS.includes(slug as LocationSlug);
}
```

### Optional vs Required Properties

**Use optional (`?`) when:**
- Property may not be present in API responses
- Property has a sensible default
- Property is optional in forms

**Use required when:**
- Property is essential for the object's identity
- Property must be provided at creation time
- Property is always present in the data

```typescript
interface GalleryComputer {
  id: string;              // Required - always present
  name: string;            // Required - essential for display
  thumbnail?: string;      // Optional - may not exist
  blackFriday?: BlackFridayData;  // Optional - only during sales
}
```

### Null vs Undefined

**Use `null` when:**
- Explicitly indicating "no value" from database
- API returns null for missing data

**Use `undefined` when:**
- Property is optional and not provided
- Default parameter values

```typescript
interface Location {
  address: string | null;   // Database may have null
  phone: string | null;
  timezone: string;         // Always has a value
}

interface LocationOption {
  name?: string;            // May not be provided
}
```

---

## File Locations Summary

| File | Purpose |
|------|---------|
| `src/types/index.ts` | Core application types |
| `src/types/roles.ts` | RBAC types and configuration |
| `src/types/locations.ts` | Multi-location types |
| `src/types/google-business.ts` | Google Business API types |
| `src/types/gallery.ts` | Gallery/computer inventory types |
| `src/lib/repairshopr.ts` | RepairShopr API types |
| `src/lib/ninjaone.ts` | NinjaOne RMM types |
| `src/lib/supabase.ts` | Blog, ticket, protection plan types |
| `src/lib/supabase-auth.ts` | Authentication types |
| `src/lib/session-store.ts` | Session management types |
| `src/lib/session-cookie.ts` | Cookie session types |
| `src/lib/spam-detection.ts` | Spam detection types |
| `src/lib/audit.ts` | Audit logging types |
| `src/lib/repairshopr-sync.ts` | Data sync types |
