# Computer Store KS - Component Library

> Comprehensive documentation for all React components in the Computer Store KS project.

**Last Updated:** 2026-01-12
**React Version:** 18+
**TypeScript:** Strict Mode Enabled

---

## Table of Contents

1. [Component Categories](#component-categories)
2. [UI Components](#ui-components)
3. [Admin Components](#admin-components)
4. [Layout Components](#layout-components)
5. [Gallery Components](#gallery-components)
6. [Home Components](#home-components)
7. [Reviews Components](#reviews-components)
8. [SEO Components](#seo-components)
9. [Forms Components](#forms-components)
10. [Animation Components](#animation-components)
11. [Static Components](#static-components)
12. [Component Hierarchy](#component-hierarchy)
13. [Shared TypeScript Interfaces](#shared-typescript-interfaces)

---

## Component Categories

| Category | Location | Count | Description |
|----------|----------|-------|-------------|
| UI | `src/components/ui/` | 10 | Core reusable UI primitives |
| Admin | `src/components/admin/` | 12 | Admin dashboard components |
| Layout | `src/components/layout/` | 5 | Page structure components |
| Gallery | `src/components/gallery/` | 4 | Computer gallery display |
| Home | `src/components/home/` | 5 | Homepage sections |
| Reviews | `src/components/reviews/` | 2 | Google reviews display |
| SEO | `src/components/seo/` | 2 | Structured data & breadcrumbs |
| Forms | `src/components/forms/` | 1 | Contact form with spam protection |
| Animations | `src/components/animations/` | 1 | Framer Motion utilities |
| Static | `src/components/static/` | 2 | Public site header/footer |

---

## UI Components

### Button

**File:** `src/components/ui/button.tsx`
**Status:** Production
**Uses:** Class Variance Authority (CVA), Lucide Icons

**Purpose:** Primary button component with multiple variants, sizes, and loading states.

**Props Interface:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

**Variants:**
| Variant | Description |
|---------|-------------|
| `primary` | Blue background, white text |
| `secondary` | Gray background |
| `outline` | Border only, transparent background |
| `ghost` | No background, hover effect |
| `destructive` | Red/danger styling |
| `link` | Text link appearance |

**Sizes:** `sm`, `md` (default), `lg`, `icon`

**Usage Example:**
```tsx
<Button variant="primary" size="lg" isLoading={isSubmitting}>
  Submit
</Button>

<Button variant="outline" leftIcon={<Phone className="h-4 w-4" />}>
  Call Now
</Button>
```

---

### Card

**File:** `src/components/ui/card.tsx`
**Status:** Production
**Pattern:** Compound Component

**Purpose:** Flexible card container with semantic sub-components.

**Exports:**
- `Card` - Main container
- `CardHeader` - Header section with spacing
- `CardTitle` - Card heading (h3)
- `CardDescription` - Muted description text
- `CardContent` - Main content area
- `CardFooter` - Footer with flex layout

**Usage Example:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Computer Repair</CardTitle>
    <CardDescription>Expert diagnosis and repair</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content goes here...</p>
  </CardContent>
  <CardFooter>
    <Button>Learn More</Button>
  </CardFooter>
</Card>
```

---

### Input

**File:** `src/components/ui/input.tsx`
**Status:** Production

**Purpose:** Form input with label, error state, and helper text.

**Props Interface:**
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}
```

**Features:**
- Automatic ID generation from label
- Required indicator asterisk
- Error styling with red border
- ARIA attributes for accessibility

**Usage Example:**
```tsx
<Input
  label="Email"
  name="email"
  type="email"
  error={errors.email}
  required
  placeholder="john@example.com"
/>
```

---

### Textarea

**File:** `src/components/ui/textarea.tsx`
**Status:** Production

**Purpose:** Multi-line text input with same pattern as Input.

**Props Interface:**
```typescript
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}
```

**Usage Example:**
```tsx
<Textarea
  label="Message"
  name="message"
  rows={5}
  error={errors.message}
  required
/>
```

---

### Select

**File:** `src/components/ui/select.tsx`
**Status:** Production

**Purpose:** Native select dropdown with consistent styling.

**Props Interface:**
```typescript
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}
```

**Features:**
- ChevronDown icon indicator
- Placeholder option support
- Consistent form field patterns

**Usage Example:**
```tsx
<Select
  label="Subject"
  name="subject"
  options={[
    { value: 'repair', label: 'Computer Repair' },
    { value: 'custom', label: 'Custom Build' },
  ]}
  placeholder="Select a subject"
  required
/>
```

---

### Modal

**File:** `src/components/ui/modal.tsx`
**Status:** Production

**Purpose:** Accessible modal dialog with focus trap and keyboard handling.

**Props Interface:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}
```

**Features:**
- Escape key to close
- Click overlay to close
- Focus trap (first focusable element)
- Body scroll lock
- ARIA attributes

**Usage Example:**
```tsx
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Confirm Action"
  description="Are you sure you want to proceed?"
>
  <div className="flex gap-2">
    <Button onClick={handleConfirm}>Confirm</Button>
    <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
  </div>
</Modal>
```

---

### Badge

**File:** `src/components/ui/badge.tsx`
**Status:** Production

**Purpose:** Small status indicators and labels.

**Variants:**
| Variant | Color |
|---------|-------|
| `default` | Primary blue |
| `secondary` | Gray |
| `success` | Green |
| `warning` | Yellow |
| `destructive` | Red |
| `outline` | Border only |
| `info` | Blue |

**Usage Example:**
```tsx
<Badge variant="success">In Stock</Badge>
<Badge variant="warning">On Sale</Badge>
```

---

### Skeleton

**File:** `src/components/ui/skeleton.tsx`
**Status:** Production

**Purpose:** Loading placeholder with pulse animation.

**Usage Example:**
```tsx
<Skeleton className="h-4 w-3/4" />
<Skeleton className="h-32 w-full rounded-lg" />
```

---

### ChatWidget

**File:** `src/components/ui/chat-widget.tsx`
**Status:** Production

**Purpose:** Floating chat widget for quick customer inquiries.

**Features:**
- Multi-step conversation flow (name, email, message)
- Form submission to `/api/contact`
- Auto-show after 3 second delay
- Desktop only (hidden on mobile)
- Attention pulse animation

**State Machine:**
`greeting` -> `name` -> `email` -> `message` -> `sending` -> `sent`/`error`

---

### MobileCallButton

**File:** `src/components/ui/mobile-call-button.tsx`
**Status:** Production

**Purpose:** Sticky call-to-action button for mobile users.

**Features:**
- Fixed position at bottom of screen
- Shows after 100px scroll
- Mobile-only (`md:hidden`)
- Pulse animation on phone icon

---

## Admin Components

### AdminShell

**File:** `src/components/admin/admin-shell.tsx`
**Status:** Production

**Purpose:** Main admin layout wrapper with persistent sidebar and header.

**Props Interface:**
```typescript
interface AdminShellProps {
  children: React.ReactNode;
}
```

**Features:**
- Three sidebar modes: `expanded`, `collapsed`, `hidden`
- LocalStorage persistence of sidebar state
- Keyboard shortcut (Escape) to close mobile menu
- Responsive resize handling

**Sidebar Mode Type:**
```typescript
type SidebarMode = 'expanded' | 'collapsed' | 'hidden';
```

---

### AdminSidebar

**File:** `src/components/admin/admin-sidebar.tsx`
**Status:** Production

**Purpose:** Role-based navigation sidebar with collapsible sections.

**Features:**
- Role-based filtering using RBAC system
- Collapsible section groups
- Location selector for multi-location access
- Mobile overlay with slide-out animation
- LocalStorage persistence of collapsed sections

---

### AdminHeader

**File:** `src/components/admin/admin-header.tsx`
**Status:** Production

**Purpose:** Admin dashboard header with search and controls.

**Props Interface:**
```typescript
interface AdminHeaderProps {
  onMenuToggle: () => void;
  onSidebarToggle: () => void;
  sidebarMode: SidebarMode;
  isMobileMenuOpen: boolean;
}
```

**Features:**
- Global search with autocomplete
- Dark mode toggle
- Sidebar mode cycle button
- Mobile menu hamburger

---

### ComputerForm

**File:** `src/components/admin/computer-form.tsx`
**Status:** Production

**Purpose:** Dynamic form for adding/editing gallery computers.

**Features:**
- Dynamic spec fields based on computer type/category
- Image upload integration
- Sale pricing options
- Form validation

---

### GalleryTable

**File:** `src/components/admin/gallery-table.tsx`
**Status:** Production

**Purpose:** Admin table for gallery computer management.

**Features:**
- Edit/Delete actions
- Generate flyer action
- Thumbnail preview
- Sort and filter

---

### ImageUpload

**File:** `src/components/admin/image-upload.tsx`
**Status:** Production

**Purpose:** Drag-and-drop image upload with progress tracking.

**Features:**
- Drag-and-drop zone
- Click to browse
- Progress bar during upload
- File type validation (JPG, PNG, WebP, GIF, HEIC)
- Max file size: 50MB

---

### LocationSelector

**File:** `src/components/admin/location-selector.tsx`
**Status:** Production

**Purpose:** Location dropdown for multi-location access.

**Features:**
- Only visible to users with global access
- Stores selection in cookie
- Updates data context on change

---

### CallCustomerTickets

**File:** `src/components/admin/call-customer-tickets.tsx`
**Status:** Production

**Purpose:** Widget showing tickets with "Call Customer" status.

**Features:**
- Auto-refresh every 30 seconds
- Quick click-to-call
- Expandable ticket details

---

### Intake Wizard Components

Located in `src/components/admin/intake-wizard/`:

| Component | Purpose |
|-----------|---------|
| `IntakeWizard` | Multi-step wizard container |
| `CustomerSearchStep` | Search existing customers |
| `CustomerFormStep` | New customer registration |
| `DeviceStep` | Device information collection |
| `TicketStep` | Ticket creation details |
| `SuccessStep` | Confirmation and next steps |
| `PasswordSetupModal` | Customer portal password setup |

---

## Layout Components

### Header

**File:** `src/components/layout/header.tsx`
**Status:** Production

**Purpose:** Public site header with navigation and CTAs.

**Features:**
- Scroll-triggered shadow
- Logo with business name
- Desktop navigation
- Phone CTA
- Quote button
- Mobile nav integration

---

### Footer

**File:** `src/components/layout/footer.tsx`
**Status:** Production

**Purpose:** Site footer with contact info and links.

**Sections:**
- Company info and social links
- Quick navigation links
- Contact information (address, phone, email)
- Business hours
- Copyright and legal links

---

### Nav

**File:** `src/components/layout/nav.tsx`
**Status:** Production

**Purpose:** Desktop navigation links.

**Features:**
- Active state highlighting
- Uses `NAV_ITEMS` from constants
- Hidden on mobile (`md:flex`)

---

### MobileNav

**File:** `src/components/layout/mobile-nav.tsx`
**Status:** Production

**Purpose:** Mobile slide-out navigation menu.

**Features:**
- Hamburger toggle
- Overlay backdrop
- Body scroll lock
- Auto-close on route change
- CTA button at bottom

---

### Container

**File:** `src/components/layout/container.tsx`
**Status:** Production

**Purpose:** Centered content wrapper with responsive padding.

**Props Interface:**
```typescript
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}
```

**Usage Example:**
```tsx
<Container>
  <h1>Page Title</h1>
  <p>Content with max-width and padding...</p>
</Container>

<Container as="section" className="py-12">
  <SectionContent />
</Container>
```

---

## Gallery Components

### GalleryGrid

**File:** `src/components/gallery/gallery-grid.tsx`
**Status:** Production

**Purpose:** Animated grid display of computers.

**Props Interface:**
```typescript
interface GalleryGridProps {
  computers: Computer[];
  isLoading?: boolean;
  emptyMessage?: string;
}
```

**Features:**
- Staggered animation on load
- Loading skeleton state
- Empty state message
- Responsive grid (1-4 columns)

---

### CategoryFilter

**File:** `src/components/gallery/category-filter.tsx`
**Status:** Production

**Purpose:** Category filter buttons for gallery.

**Categories:**
- All
- Desktop
- Laptop
- Custom
- Refurbished

**Props Interface:**
```typescript
interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}
```

---

### FlipCard

**File:** `src/components/gallery/flip-card.tsx`
**Status:** Production

**Purpose:** Interactive card that flips to reveal specifications.

**Props Interface:**
```typescript
interface FlipCardProps {
  id: string;
  name: string;
  category: 'desktop' | 'laptop' | 'custom' | 'refurbished';
  price: number;
  imageFront: string;
  imageBack?: string;
  specs: ComputerSpec;
  inStock?: boolean;
  className?: string;
}
```

**Features:**
- Click/keyboard to flip
- Front: Image, name, price, category badge
- Back: Detailed specifications
- Keyboard accessible (Enter/Space)

---

### GallerySkeleton

**File:** `src/components/gallery/gallery-skeleton.tsx`
**Status:** Production

**Purpose:** Loading placeholder for gallery grid.

**Exports:**
- `GallerySkeleton` - Grid of skeleton cards
- `CategoryFilterSkeleton` - Filter button skeletons

---

## Home Components

### HeroSection

**File:** `src/components/home/hero-section.tsx`
**Status:** Production

**Purpose:** Homepage hero with headline, highlights, CTAs, and stats.

**Features:**
- Gradient background with pattern
- Animated text reveal
- Highlight checklist
- CTA buttons (Quote, Call)
- Animated stat cards

---

### ServicesPreview

**File:** `src/components/home/services-preview.tsx`
**Status:** Production

**Purpose:** Grid preview of main services.

**Services Displayed:**
- Computer Repair
- Refurbished Computers
- Custom Builds
- Data Recovery

---

### StatsSection

**File:** `src/components/home/stats-section.tsx`
**Status:** Production

**Purpose:** Business statistics display.

**Stats:**
- 20+ Years in Business
- 10,000+ Happy Customers
- 25,000+ Computers Repaired
- 98% Satisfaction Rate

---

### Testimonials

**File:** `src/components/home/testimonials.tsx`
**Status:** Production

**Purpose:** Customer testimonial carousel.

**Features:**
- Auto-play (5s interval)
- Pause on hover
- Navigation arrows and dots
- Star ratings

---

### CtaSection

**File:** `src/components/home/cta-section.tsx`
**Status:** Production

**Purpose:** Call-to-action section with contact options.

**Features:**
- Primary color background
- Call and quote buttons
- Business hours display

---

## Reviews Components

### ReviewsDisplay

**File:** `src/components/reviews/ReviewsDisplay.tsx`
**Status:** Production

**Purpose:** Full reviews page display with Google Business integration.

**Features:**
- Fetches from `/api/google-business/reviews`
- Loading skeleton
- Fallback reviews if API unavailable
- Average rating and count display
- Owner reply support

---

### ReviewsWidget

**File:** `src/components/reviews/ReviewsWidget.tsx`
**Status:** Production

**Purpose:** Compact reviews display for homepage.

**Props Interface:**
```typescript
interface ReviewsWidgetProps {
  maxReviews?: number; // default: 6
}
```

**Features:**
- Paginated display (3 per page)
- Navigation arrows
- "Write a review" link
- Filters to 4+ star reviews

---

## SEO Components

### LocalBusinessSchema

**File:** `src/components/seo/json-ld.tsx`
**Status:** Production

**Purpose:** Schema.org LocalBusiness structured data.

**Includes:**
- Business name and contact
- Address and geo coordinates
- Opening hours
- Service types
- Social media links

---

### ProductSchema

**File:** `src/components/seo/json-ld.tsx`
**Status:** Production

**Purpose:** Schema.org Product structured data for computers.

**Props Interface:**
```typescript
interface ProductSchemaProps {
  name: string;
  description: string;
  image: string;
  price: number;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  sku?: string;
}
```

---

### FAQSchema

**File:** `src/components/seo/json-ld.tsx`
**Status:** Production

**Purpose:** Schema.org FAQPage structured data.

**Props Interface:**
```typescript
interface FAQSchemaProps {
  questions: Array<{ question: string; answer: string }>;
}
```

---

### Breadcrumbs

**File:** `src/components/seo/breadcrumbs.tsx`
**Status:** Production

**Purpose:** Visual breadcrumb navigation with Schema.org markup.

**Props Interface:**
```typescript
interface BreadcrumbsProps {
  items: Array<{ label: string; href?: string }>;
  className?: string;
}
```

---

## Forms Components

### ContactForm

**File:** `src/components/forms/contact-form.tsx`
**Status:** Production

**Purpose:** Contact form with multi-layer spam protection.

**Features:**
- Honeypot fields (hidden inputs)
- Timing validation (min fill time)
- Cloudflare Turnstile CAPTCHA
- Interaction tracking
- Browser fingerprinting
- Rate limiting feedback
- Client-side validation

**Subject Options:**
- General Inquiry
- Computer Repair
- Custom Build
- Protection Plans
- Other

---

## Animation Components

### Motion Utilities

**File:** `src/components/animations/motion.tsx`
**Status:** Production

**Purpose:** Framer Motion animation variants and wrapper components.

**Exported Variants:**
```typescript
export const fadeInUp: Variants;
export const fadeIn: Variants;
export const slideInLeft: Variants;
export const slideInRight: Variants;
export const scaleIn: Variants;
export const staggerContainer: Variants;
```

**Exported Components:**

| Component | Purpose |
|-----------|---------|
| `MotionContainer` | Scroll-triggered animation wrapper |
| `MotionSection` | Section with stagger effect |
| `MotionCard` | Card with hover lift effect |
| `MotionButton` | Button with press effect |
| `PageTransition` | Page enter/exit transitions |
| `MotionHeading` | Animated heading (h1-h4) |

**Usage Example:**
```tsx
<MotionSection>
  <MotionCard index={0}>First card</MotionCard>
  <MotionCard index={1}>Second card</MotionCard>
</MotionSection>

<MotionHeading as="h1" className="text-4xl">
  Page Title
</MotionHeading>
```

---

## Static Components

### Header (Static)

**File:** `src/components/static/Header.tsx`
**Status:** Production

**Purpose:** Public site header with services dropdown menu.

**Features:**
- Scroll-triggered styling
- Services mega-dropdown (desktop only)
- Mobile hamburger menu
- Active link highlighting
- Login link

**Services Dropdown Links:**
- Custom-Built PCs (featured)
- Data Transfer & Cloning
- OS Installation
- Laptops
- Refurbished Desktops
- Diagnostics
- Virus & Malware Removal
- Hardware Upgrades
- Windows Debloat
- Antivirus & Protection
- Why Linux?
- Protection Plans

---

### Footer (Static)

**File:** `src/components/static/Footer.tsx`
**Status:** Production

**Purpose:** Simple public site footer.

**Content:**
- Phone number link
- Address
- Copyright
- Resilient Web Solutions credit

---

## Component Hierarchy

```
App
+-- (Public Pages)
|   +-- Header (static/)
|   +-- Container (layout/)
|   |   +-- HeroSection (home/)
|   |   +-- ServicesPreview (home/)
|   |   +-- StatsSection (home/)
|   |   +-- ReviewsWidget (reviews/)
|   |   +-- Testimonials (home/)
|   |   +-- CtaSection (home/)
|   +-- Footer (static/)
|   +-- ChatWidget (ui/)
|   +-- MobileCallButton (ui/)
|
+-- (Admin Pages)
    +-- AdminShell (admin/)
        +-- AdminSidebar (admin/)
        |   +-- LocationSelector (admin/)
        +-- AdminHeader (admin/)
        +-- [Page Content]
            +-- GalleryTable (admin/)
            +-- ComputerForm (admin/)
            +-- ImageUpload (admin/)
            +-- IntakeWizard (admin/intake-wizard/)
            +-- CallCustomerTickets (admin/)
```

---

## Shared TypeScript Interfaces

### Core Types (`src/types/index.ts`)

```typescript
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

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
}
```

### Gallery Types (`src/types/gallery.ts`)

```typescript
interface GallerySpec {
  label: string;
  value: string;
}

interface GalleryComputer {
  id: string;
  name: string;
  type: 'desktop' | 'laptop';
  category: 'custom' | 'refurbished' | 'new';
  price: string;
  image: string;
  thumbnail?: string;
  specs: GallerySpec[];
  blackFriday?: BlackFridayData;
  created_at?: string;
  updated_at?: string;
}

interface BlackFridayData {
  enabled: boolean;
  originalPrice: string;
  salePrice: string;
  discount: number;
}

type SaleType = 'none' | 'black-friday';
```

### Role Types (`src/types/roles.ts`)

```typescript
type BusinessRole = 'receptionist' | 'technician' | 'lead_technician' | 'manager' | 'owner';
type AddOnRole = 'social_media' | 'lead_developer';
type EmployeeRole = BusinessRole | AddOnRole;
type CustomerRole = 'customer';
type UserRole = EmployeeRole | CustomerRole;

type Permission =
  | 'view_admin_dashboard'
  | 'manage_intake'
  | 'view_customers'
  | 'manage_customers'
  | 'view_tickets'
  | 'manage_tickets'
  | 'view_gallery'
  | 'manage_gallery'
  | 'view_blog'
  | 'manage_blog'
  // ... (see full list in types/roles.ts)
```

### Location Types (`src/types/locations.ts`)

```typescript
type LocationSlug = 'topeka' | 'holton';

interface Location {
  id: string;
  slug: LocationSlug;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
  is_active: boolean;
  sort_order: number;
}
```

### Google Business Types (`src/types/google-business.ts`)

```typescript
interface DisplayReview {
  id: string;
  authorName: string;
  authorPhoto?: string;
  rating: number;
  text?: string;
  date: string;
  reply?: {
    text: string;
    date: string;
  };
}

interface GoogleBusinessCache {
  reviews?: {
    data: DisplayReview[];
    fetchedAt: string;
    averageRating: number;
    totalCount: number;
  };
}
```

---

## Component Development Guidelines

### Creating New Components

1. **File Location:** Place in appropriate category folder
2. **TypeScript:** Export props interface
3. **Documentation:** Add JSDoc comments with `@version` tag
4. **Accessibility:** Include ARIA attributes where needed
5. **Styling:** Use Tailwind CSS with `cn()` utility
6. **Testing:** Add unit tests in same directory

### Component Template

```tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface MyComponentProps {
  /** Description of prop */
  propName: string;
  /** Optional prop with default */
  optional?: boolean;
  className?: string;
}

/**
 * Brief description of component purpose.
 *
 * @param props - Component properties
 * @returns JSX element
 *
 * @version 1.0.0 - 2026-01-12T00:00:00Z - Initial implementation
 */
export function MyComponent({
  propName,
  optional = false,
  className,
}: MyComponentProps) {
  return (
    <div className={cn('base-styles', className)}>
      {/* Component content */}
    </div>
  );
}
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-12 | Initial documentation |
