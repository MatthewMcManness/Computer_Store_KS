# Public Website Guide - Computer Store KS

## 1. Overview

### Purpose
The public-facing website for Computer Store Kansas serves customers seeking computer repair, custom builds, refurbished computers, and protection plans in Topeka, Kansas.

### Target Audience
- Home computer users needing repairs or upgrades
- Small businesses requiring IT support
- Customers interested in refurbished or custom-built computers
- Linux enthusiasts and those looking for Windows alternatives

### Live URL
**Production:** https://computerstoreks.com

### Technology Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Custom CSS (`static-styles.css`) + Tailwind for UI components
- **Database:** Supabase PostgreSQL (blog and gallery)
- **Email:** Resend API
- **Spam Protection:** Cloudflare Turnstile + custom bot detection
- **Analytics:** Google Analytics (G-EQ3ML3VTCZ)
- **Hosting:** Render

---

## 2. Homepage (`/`)

The homepage serves as the primary entry point and establishes trust with potential customers.

### Sections

#### Hero Section
- **Title:** "Computer Store Kansas" logo image
- **Tagline:** "Your Go-To Technology Center Since 2003"
- **Purpose:** Immediate brand recognition and trust signals

#### Stats Section
- **20+ Years of Experience**
- **2003 - Locally Owned Since**
- **1000+ Satisfied Customers**
- Features floating card animations with diamond accent decorations
- Overlaps hero section for modern design

#### Founder Story Section
- Personal message from owner Max Beyer
- Emphasizes local ownership and personal care
- Quote: "Every computer that comes through our doors has a story..."
- Establishes emotional connection with customers

#### Services Overview
Three-card layout introducing main service categories:
1. **Computer Service** - Diagnostics, repairs, upgrades
2. **Protection Plans** - Antivirus, malware protection, support
3. **New Computer Sales** - Custom builds and refurbished systems

#### 5 Reasons to Choose Computer Store Kansas
Numbered benefit items (01-05):
1. **Expertise and Experience** - 20+ years
2. **Fast and Reliable Service** - Quick response times
3. **Honest, Transparent Pricing** - Clear estimates upfront
4. **We Protect Your Data** - Backup first priority
5. **Local & Personal** - Community-focused service

#### Reviews Section
- `<ReviewsWidget />` component
- Displays Google Business reviews or fallback testimonials
- Auto-rotating carousel with pagination
- Shows rating stars, customer names, and review text
- Links to full reviews page

#### Call-to-Action Section
- Primary CTA: "Talk to an Expert" button
- Links to contact page
- Reinforces service availability

### Components Used
- `static-styles.css` for styling
- `ReviewsWidget` from `@/components/reviews/ReviewsWidget`
- Standard hero, section, and card layouts

---

## 3. Service Pages (`/services/*`)

### Main Services Hub (`/services`)

Central navigation for all service offerings with sections:

#### Featured Services
Two highlighted offerings:
1. **Custom-Built PCs** - Links to `/services/custom-computers`
2. **Why Linux?** - Links to `/why-linux`

#### All Services Grid
11 service cards with icons, descriptions, and links:
- **Diagnostics** (🔍) - Flat fee troubleshooting
- **Virus & Malware Removal** (🛡️)
- **Data Transfer & Cloning** (💾)
- **OS Installation** (💻)
- **Hardware Upgrades** (⚡)
- **Windows Debloat** (🧹)
- **Antivirus & Protection** (🔒)
- **Custom-Built PCs** (🖥️) - Featured
- **Laptops** (💼)
- **Refurbished Desktops** (🖱️)
- **Protection Plans** (🛡️) - Special styling

#### Not Sure CTA
Encourages diagnostics for unclear issues

### Individual Service Pages

All service detail pages follow consistent structure:
- Hero section with service name
- Main content with pricing/details
- Feature lists or benefit grids
- Process explanation
- FAQ or common questions
- CTA to contact page

#### `/services/diagnostics`
- **Flat Fee Model:** Diagnostic fee rolls into repair cost
- **Comprehensive Testing:** Hardware, software, performance, boot issues
- **Common Symptoms:** Won't turn on, crashes, slow performance, etc.
- **Process Steps:** Drop off → Diagnose → Quote → Repair
- **Turnaround:** Same day or within 48 hours

#### `/services/data-services`
- Data transfer between computers
- Drive cloning
- Data recovery from failed drives
- File migration and organization

#### `/services/os-installation`
- Fresh Windows or Linux installation
- Dual-boot setup options
- Windows license included in service
- Migration of data and settings

#### `/services/custom-computers`
- Gaming rigs, workstations, servers
- Quality parts selection
- Professional cable management
- Free lifetime diagnostics on builds
- Transparent pricing, no commission

#### `/services/laptops`
- New Asus and Lenovo laptops
- Quality refurbished options
- Custom orders available
- Setup and configuration included

#### `/services/desktops`
- Refurbished desktop computers
- Cleaned, tested, and ready to work
- Business-grade hardware
- Warranty included

#### `/services/virus-removal`
- Complete malware removal
- Rootkit and spyware elimination
- System disinfection
- Protection setup post-removal

#### `/services/upgrades`
- RAM, SSD, graphics cards
- Processor upgrades
- Power supply replacement
- Cooling improvements

#### `/services/debloat`
- Remove pre-installed bloatware
- Optimize Windows performance
- Free on purchased computers
- Registry cleanup

#### `/services/antivirus`
- Professional antivirus software
- Anti-scam protection
- Regular updates
- Email and web protection

---

## 4. Content Pages

### About Page (`/about`)

**Purpose:** Build trust and establish local credibility

**Sections:**
1. **Our Story**
   - Serving Topeka since 2003
   - Certified, experienced technicians
   - Full range of home and business services
   - Community-focused approach

2. **Why Choose Us?**
   - Reliability
   - Personalized Approach
   - Timely Delivery
   - High Standards

3. **CTA:** "Ready to Experience the Difference?"

### Contact Page (`/contact`)

**Features:**
- Two-column layout: form (left) + business info (right)
- Google Maps embed
- Real-time form validation
- Status messages (success, error, rate-limited)

**Contact Form Fields:**
- Name (required)
- Email (required)
- Phone (optional)
- Subject dropdown:
  - General Inquiry
  - Computer Repair
  - Custom Build
  - Protection Plans
  - Other
- Message (required, min 10 chars)

**Business Information:**
- **Address:** 2008 SW Gage Blvd, Topeka, KS 66604
- **Phone:** 785-267-3223
- **Email:** contact@computerstoreks.com
- **Hours:**
  - Monday-Friday: 10:00 am - 6:00 pm
  - Saturday: 10:00 am - 2:00 pm
  - Sunday: Closed

**Spam Protection:** See Section 10 for details

### Reviews Page (`/reviews`)

**Purpose:** Display all Google Business reviews

**Features:**
- Full listing of customer reviews
- Star ratings
- Review text
- Customer names and dates
- Filtering and sorting options
- Link to leave a review on Google

**Component:** `ReviewsDisplay` from `@/components/reviews/ReviewsDisplay`

### Silver Plan Page (`/silver-plan`)

**Purpose:** Promote computer protection plans

**Two-Tier Plan Structure:**

#### Silver Plan ($24.99/month)
**Target:** Home users, families, remote workers
**Features:**
- Antivirus software included
- 50% discount on virus removal
- 50% off house calls
- 50% off account recovery
- Remote support (4 hrs/month)
- Performance monitoring & alerts
- 15% discount on labor
- Priority scheduling
- Free in-store diagnostics
- Email support (24-48hr response)
- Quarterly system health check

**Badge:** Animated silver gradient with shine effect

#### Silver Plus Plan ($34.99/device/month)
**Target:** Small businesses and professionals
**Features:**
- All Silver features PLUS:
- $35 service calls (65% off)
- 6 hours/month remote support
- 25% off all labor charges
- Business-grade antivirus
- Priority business scheduling
- Proactive system monitoring
- Monthly system health reports
- Business hours phone support

**Badge:** Animated silver with gold "Plus" text

**Commitment:** 3-month minimum for both plans

### Why Linux Page (`/why-linux`)

**Purpose:** Educate about Linux as Windows alternative

**Key Arguments:**

#### The Windows 11 Problem
- Strict hardware requirements exclude older computers
- Windows 10 support ends October 2025
- Linux offers third path: keep hardware, stay secure

#### Benefits (Numbered 1-6)
1. **Runs Great on Older Hardware** - Breathes new life
2. **Completely Free** - No licenses or subscriptions
3. **More Secure** - Stronger security model
4. **No Bloatware** - Clean installation
5. **Respects Your Privacy** - No tracking or data collection
6. **No Forced Updates** - User controls timing

#### Additional Benefits
- Reduce e-waste
- No Microsoft account required
- No vendor lock-in
- Lightning fast
- Regular updates for years
- Fully customizable

#### Common Questions (FAQ Style)
- **Can I still use my programs?** - LibreOffice, browsers, streaming work
- **Is it hard to learn?** - Familiar interface, smooth transition
- **What about gaming?** - Steam native, many games work
- **What if I need help?** - Ongoing support provided
- **Can I try it without committing?** - Dual-boot available

#### Services Offered
1. **Consultation** - Assess needs, explain options
2. **Installation** - Full setup and configuration
3. **Setup & Training** - File transfer, program setup
4. **Ongoing Support** - Help after installation

---

## 5. Blog System (`/blog`)

### Blog Listing Page (`/blog`)

**Data Source:** Supabase `blog_posts` table

**Features:**
- Server-rendered with ISR (revalidate every 5 minutes)
- Grid layout of blog cards
- Sidebar with categories
- Published posts only (status = 'published')

**BlogPostCard Component:**
- Featured image (thumbnail or full)
- Category badge
- Post title (links to slug)
- Excerpt
- Author name
- Published date
- Tags

**Sidebar:**
- Category list with links
- Format: `/blog?category={slug}`

**Empty State:**
- "No posts yet" message when no published posts

### Blog Post Page (`/blog/[slug]`)

**Dynamic route with slug-based lookup**

**Content:**
- Full featured image
- Post title (h1)
- Author, date, category
- Markdown body (rendered)
- Tags display
- Related posts (optional)

**Schema.org Markup:**
- Article structured data for SEO
- Author information
- Published/modified dates

**Revalidation:** ISR with 5-minute cache

---

## 6. Gallery (`/gallery`)

### Purpose
Display available computers for sale (desktops, laptops, custom builds, refurbished).

### Data Source
- API endpoint: `/api/gallery`
- Backend: Supabase Storage for images
- Real-time inventory

### Features

#### Filter Buttons
- All Computers (default)
- Desktops
- Laptops
- Refurbished
- Custom Builds

Filters update URL query param: `?filter={category}`

#### Gallery Grid
- Responsive card grid
- Flip-card animation on hover
- Front: Computer image
- Back: Specs and pricing

#### Computer Cards
**Front Side:**
- Computer image (thumbnail)
- Black Friday badge (if `isBlackFridaySale`)

**Back Side:**
- Computer name
- Price display:
  - Regular price
  - Sale price (if applicable)
  - Savings percentage badge
- Specs list (CPU, RAM, storage, GPU, etc.)

#### Pricing Display
```typescript
// Regular pricing
<span className="current-price">$299.00</span>

// Sale pricing
<span className="original-price">$399.00</span>
<span className="sale-price">$299.00</span>
<span className="savings-badge">Save 25%</span>
```

#### Loading States
- "Loading gallery..." spinner
- Error state with retry button
- Empty state: "No computers found"

#### CTA Section
"Interested in a Computer?" → Contact page

### Gallery Card Structure
```typescript
interface GalleryItem {
  id: string;
  name: string;
  category: 'desktop' | 'laptop';
  type: 'refurbished' | 'custom' | 'new';
  price: number;
  salePrice?: number;
  imageUrl: string;
  thumbnailUrl?: string;
  specs: Array<{ label: string; value: string }>;
  isBlackFridaySale?: boolean;
}
```

---

## 7. Customer Portal (`/portal`)

### Current Status: Coming Soon

**Purpose:** Future customer dashboard for ticket tracking and service history.

**Access:**
- Authentication required
- Redirects employees to `/admin`
- Redirects unauthenticated to `/admin/login`

**Planned Features:**
1. **Track Repairs** - View ticket status
2. **Service History** - Past repairs and invoices
3. **Messages** - Communicate with tech team

**Current Display:**
- "Coming Soon" badge
- Feature preview cards
- Contact information for immediate needs
- Phone: (785) 267-3223
- Address: 2008 SW Gage Blvd, Topeka, KS 66604

**Design:**
- Blue gradient background
- White content card
- Wrench icon
- RWS footer credit

---

## 8. SEO Features

### Structured Data (JSON-LD)

#### LocalBusiness Schema (`/components/seo/json-ld.tsx`)

**Included on all public pages via layout:**
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Computer Store Kansas",
  "description": "Professional computer repair since 2003",
  "url": "https://computerstoreks.com",
  "telephone": "785-267-3223",
  "email": "contact@computerstoreks.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "2008 SW Gage Blvd",
    "addressLocality": "Topeka",
    "addressRegion": "KS",
    "postalCode": "66604",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 39.0473,
    "longitude": -95.689
  },
  "openingHours": [
    "Mo-Fr 10:00-18:00",
    "Sa 10:00-14:00"
  ],
  "foundingDate": "2003",
  "founder": {
    "@type": "Person",
    "name": "Jim Driggers"
  },
  "serviceType": [
    "Computer Repair",
    "Virus Removal",
    "Hardware Repair",
    "Computer Diagnostics",
    "Protection Plans",
    "Computer Sales"
  ]
}
```

#### Product Schema
Used for gallery items (computers for sale):
```json
{
  "@type": "Product",
  "name": "Refurbished Dell Desktop",
  "offers": {
    "@type": "Offer",
    "price": 299.99,
    "priceCurrency": "USD",
    "availability": "InStock"
  }
}
```

#### Breadcrumbs Schema
Automatically generated on all pages with breadcrumb navigation.

### Meta Tags

**All pages include:**
- `title` - Page-specific SEO title
- `description` - 155-character meta description
- Open Graph tags (Facebook/social sharing)
- Twitter Card tags

**Example:**
```typescript
export const metadata: Metadata = {
  title: 'Computer Repair Services in Topeka, KS',
  description: 'Expert computer repair since 2003...',
  openGraph: {
    title: 'Computer Repair Services',
    description: 'Professional service in Topeka',
    url: 'https://computerstoreks.com/services',
  },
};
```

### Breadcrumbs Component

**Location:** `/components/seo/breadcrumbs.tsx`

**Features:**
- Visual breadcrumb navigation
- Schema.org BreadcrumbList markup
- Home icon for first item
- ChevronRight separators
- Current page highlighted

**Usage:**
```tsx
<Breadcrumbs
  items={[
    { label: 'Services', href: '/services' },
    { label: 'Diagnostics' }
  ]}
/>
```

### Sitemap
Auto-generated by Next.js for search engines.

---

## 9. UI Components

### Layout Components

#### Header (`/components/static/Header.tsx`)
- Logo (title image)
- Desktop navigation menu
- Mobile hamburger menu
- Phone number (desktop)
- Sticky positioning

**Navigation Links:**
- Home
- About
- Services (dropdown/submenu)
- Gallery
- Blog
- Reviews
- Contact

#### Footer (`/components/static/Footer.tsx`)
- Business information
- Quick links
- Service links
- Social media icons
- Business hours
- Copyright notice
- "Created by Resilient Web Solutions" credit

#### Mobile Call Button (`/components/ui/mobile-call-button.tsx`)
- Fixed bottom-right on mobile only
- Phone icon
- Direct tel: link
- Appears < 768px viewport

#### Chat Widget (`/components/ui/chat-widget.tsx`)
- Fixed bottom-right on desktop
- Chat icon bubble
- Opens contact form or live chat
- Appears > 768px viewport

### Home Components

#### Hero Section (`/components/home/hero-section.tsx`)
Uses modern components but shown on static homepage:
- Primary gradient background
- Grid pattern overlay
- Stat cards with hover effects
- Motion animations (framer-motion)

#### Services Preview (`/components/home/services-preview.tsx`)
- Four service cards
- Icon badges
- Links to service pages
- "View All Services" CTA

#### Stats Section (`/components/home/stats-section.tsx`)
- Four stat items
- Large numbers with labels
- Border-top/bottom styling

#### Testimonials (`/components/home/testimonials.tsx`)
- Auto-rotating carousel
- Manual navigation buttons
- Dot pagination
- Quote styling
- Star ratings
- 5-second auto-advance

#### CTA Section (`/components/home/cta-section.tsx`)
- Primary color background
- Centered layout
- Phone and contact buttons
- Business hours display

### Gallery Components

#### Gallery Grid (`/components/gallery/gallery-grid.tsx`)
- Responsive grid layout
- Computer card rendering
- Loading/error states

#### Flip Card (`/components/gallery/flip-card.tsx`)
- 3D flip animation
- Front: image
- Back: specs and price
- Hover trigger

#### Category Filter (`/components/gallery/category-filter.tsx`)
- Button group
- Active state styling
- Click handlers for filtering

#### Gallery Skeleton (`/components/gallery/gallery-skeleton.tsx`)
- Placeholder cards during loading
- Shimmer animation effect

### Review Components

#### ReviewsWidget (`/components/reviews/ReviewsWidget.tsx`)
- Fetches from `/api/google-business/reviews`
- Fallback to hardcoded reviews
- Carousel navigation
- Google logo badge
- Star rating component
- "Write a review" CTA button

#### ReviewsDisplay (`/components/reviews/ReviewsDisplay.tsx`)
- Full-page review listing
- Filtering and sorting
- Pagination
- Individual review cards

### Form Components

#### Contact Form (`/components/forms/contact-form.tsx`)

**Features:**
- Real-time validation
- Error messages per field
- Cloudflare Turnstile CAPTCHA
- Honeypot fields (hidden)
- Bot detection hooks
- Success/error states
- Loading state on submit

**Anti-Spam System:** See Section 10

### SEO Components

#### JSON-LD Schema (`/components/seo/json-ld.tsx`)
Three schema types:
- `LocalBusinessSchema` - Business information
- `ProductSchema` - Gallery items
- `FAQSchema` - FAQ pages

#### Breadcrumbs (`/components/seo/breadcrumbs.tsx`)
- Visual navigation
- Schema.org markup
- Home icon
- Chevron separators

### Shared UI Components

Located in `/components/ui/`:

#### Button (`button.tsx`)
- Variants: primary, secondary, outline, ghost
- Sizes: sm, md, lg
- Loading state
- Icon support (left/right)

#### Card (`card.tsx`)
- CardHeader, CardTitle, CardDescription
- CardContent, CardFooter
- Flexible composition

#### Badge (`badge.tsx`)
- Color variants
- Size options

#### Input (`input.tsx`)
- Label integration
- Error state
- Helper text
- Controlled component

#### Textarea (`textarea.tsx`)
- Similar to Input
- Row count prop
- Auto-resize option

#### Select (`select.tsx`)
- Dropdown select
- Option list
- Placeholder support

#### Modal (`modal.tsx`)
- Overlay backdrop
- Close button
- Accessible (ESC to close)

#### Skeleton (`skeleton.tsx`)
- Loading placeholder
- Shimmer animation

---

## 10. Contact Form & Spam Protection

### Multi-Layer Spam Detection System

The contact form implements defense-in-depth against bots and spam.

### Layer 1: Cloudflare Turnstile

**Managed CAPTCHA alternative** (more user-friendly than reCAPTCHA)

**Implementation:**
```tsx
import { Turnstile } from '@marsidev/react-turnstile';

<Turnstile
  siteKey={NEXT_PUBLIC_TURNSTILE_SITE_KEY}
  onSuccess={(token) => setTurnstileToken(token)}
  onError={() => setTurnstileToken('')}
  onExpire={() => setTurnstileToken('')}
/>
```

**Token validation on server:** `/api/contact` verifies token with Cloudflare

### Layer 2: Honeypot Fields

**Hidden fields that humans won't fill but bots will:**

```tsx
// Primary honeypot
<input name="website" className="absolute left-[-9999px]" />

// Additional honeypots
<input name="_hp_email2" type="email" />
<input name="_hp_phone_confirm" type="tel" />
<input name="_hp_url" type="url" />
```

**Server-side check:** Any honeypot filled = spam

### Layer 3: Timing Analysis

**Track form submission timing:**
- Form loads, timer starts
- Submissions < 3 seconds = likely bot
- Submissions 3-5 seconds = suspicious
- Submissions > 5 seconds = likely human

**Hook:** `useBotProtection()` from `@/hooks/useBotProtection`

### Layer 4: Interaction Tracking

**Monitor user behavior:**
- Mouse movements
- Keyboard events
- Click events
- Scroll activity

**Scoring system:**
- Mouse moves: +2 points each
- Clicks: +3 points each
- Keypresses: +1 point each
- Scroll: +2 points each

**Threshold:** Score < 5 = suspicious

**Hook:** `useInteractionTracking()` from `@/hooks/useInteractionTracking`

### Layer 5: Browser Fingerprinting

**Collect browser characteristics:**
- Canvas fingerprint
- WebGL fingerprint
- Font list
- Audio fingerprint
- Screen resolution
- Timezone
- Language
- Plugins

**Spam indicators:**
- Known bad fingerprints (database)
- Suspicious browser characteristics
- Inconsistent data

**Hook:** `useFingerprint()` from `@/hooks/useFingerprint`

### Layer 6: Disposable Email Detection

**Block temporary email services:**
- Check email domain against list
- Common disposables: tempmail.com, guerrillamail.com, etc.

**Server-side validation** in `/api/contact`

### Layer 7: Rate Limiting

**Prevent submission flooding:**
- Max 5 submissions per IP per hour
- 429 status code returned when exceeded
- Sliding window algorithm

**Implementation:** API route middleware

### Data Flow

**Client → Server submission:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "785-555-0123",
  "subject": "Repair",
  "message": "My computer won't boot",
  "_timing": 12345,
  "_hp_email2": "",
  "_hp_phone_confirm": "",
  "_hp_url": "",
  "_turnstile": "token...",
  "_interaction": {
    "score": 15,
    "maxScore": 20,
    "isHumanLike": true,
    "spamScore": 0.1
  },
  "_fingerprint": {
    "visitorId": "abc123",
    "confidence": 0.95,
    "simpleFingerprint": "hash...",
    "spamScore": 0.05
  }
}
```

**Server-side validation checks:**
1. Cloudflare Turnstile token
2. All honeypots empty
3. Timing reasonable (> 3 sec)
4. Interaction score sufficient
5. Fingerprint not blacklisted
6. Email not disposable
7. Rate limit not exceeded

**If spam detected:** 400 response, no email sent

**If legitimate:** Email sent via Resend API

### Email Notification

**Sent via Resend:**
```typescript
await resend.emails.send({
  from: 'Contact Form <noreply@computerstoreks.com>',
  to: process.env.NOTIFICATION_EMAIL,
  subject: `New Contact: ${data.name}`,
  html: emailTemplate,
});
```

**Email includes:**
- Customer name, email, phone
- Subject selection
- Message
- Timestamp
- Source: website

---

## 11. Mobile Optimization

### Responsive Design

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Key Features:**

#### Mobile Navigation
- Hamburger menu icon
- Full-screen drawer
- Stacked nav links
- Close button

#### Touch Targets
- Minimum 44x44px
- Adequate spacing
- No hover-only interactions

#### Images
- Next.js Image optimization
- Responsive srcsets
- Loading="lazy"
- Blur placeholder

#### Forms
- Large input fields
- Touch-friendly buttons
- Native select dropdowns
- Mobile keyboard types

#### Typography
- Fluid font sizing
- Readable line lengths
- Adequate contrast

#### Gallery
- Single column on mobile
- Touch swipe for filters
- Card tap (no hover)

#### Performance
- Code splitting
- Route prefetching
- Lazy loading components
- Minimal JavaScript

---

## 12. Analytics & Tracking

### Google Analytics 4

**Measurement ID:** G-EQ3ML3VTCZ

**Implementation:** `/app/(public)/layout.tsx`

```tsx
<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-EQ3ML3VTCZ"
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-EQ3ML3VTCZ');
  `}
</Script>
```

**Tracked Events:**
- Page views (automatic)
- Contact form submissions
- Phone clicks
- Service page views
- Gallery interactions

### Custom Event Tracking

**Can be added via:**
```tsx
gtag('event', 'contact_form_submit', {
  event_category: 'Contact',
  event_label: 'Main Form',
});
```

---

## 13. Performance Optimization

### Next.js Optimizations

#### Image Optimization
- Automatic format conversion (WebP, AVIF)
- Responsive images
- Lazy loading
- Blur placeholders

**Usage:**
```tsx
<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={false} // true for LCP images
/>
```

#### Code Splitting
- Automatic route-based splitting
- Dynamic imports for large components:
```tsx
const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <Skeleton />,
});
```

#### ISR (Incremental Static Regeneration)
- Blog pages revalidate every 5 minutes
- Static at build, fresh on demand
```tsx
export const revalidate = 300; // 5 minutes
```

#### Font Optimization
- Next.js font loading
- Preload critical fonts
- Font display swap

### Loading States

**Skeleton components:**
- Gallery loading skeleton
- Blog post skeleton
- General content skeleton

**Suspense boundaries:**
```tsx
<Suspense fallback={<LoadingSkeleton />}>
  <DataComponent />
</Suspense>
```

### Bundle Size

**Keep JavaScript minimal:**
- Tree shaking enabled
- Remove unused dependencies
- Analyze bundle: `npm run build`
- Check bundle-analyzer report

---

## 14. Accessibility (a11y)

### WCAG 2.1 Level AA Compliance

#### Semantic HTML
- Proper heading hierarchy (h1 → h6)
- Semantic tags: `<nav>`, `<main>`, `<article>`, `<aside>`
- Button vs link usage (action vs navigation)

#### ARIA Labels
```tsx
<button aria-label="Close modal">
  <X />
</button>

<nav aria-label="Main navigation">
  {/* links */}
</nav>
```

#### Keyboard Navigation
- Tab order logical
- Skip to main content link
- Focus visible indicators
- No keyboard traps

#### Color Contrast
- Text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- Interactive elements: visible focus

#### Form Accessibility
```tsx
<label htmlFor="email">Email Address</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby="email-error"
/>
{hasError && (
  <span id="email-error" role="alert">
    {errorMessage}
  </span>
)}
```

#### Image Alt Text
- Descriptive alt for content images
- Empty alt for decorative images
- Logo images include company name

#### Screen Reader Support
- Proper landmark regions
- Live regions for dynamic content
- Hidden text for icon buttons

---

## 15. Content Management

### Blog CMS

**Admin Access:** `/admin/blog`

**Features:**
- Create, edit, delete posts
- Markdown editor with preview
- Featured image upload
- Category management
- Tag management
- Draft/published status
- SEO fields (title, description, slug)

**Workflow:**
1. Create draft post
2. Write content in Markdown
3. Upload featured image
4. Set category and tags
5. Preview post
6. Publish when ready

**Database:** Supabase `blog_posts` table

### Gallery CMS

**Admin Access:** `/admin/gallery`

**Features:**
- Add/edit/delete computers
- Image upload to Supabase Storage
- Spec builder (CPU, RAM, storage, etc.)
- Pricing (regular and sale)
- Category/type selection
- Black Friday sale toggle
- Publish/unpublish

**Workflow:**
1. Add new computer
2. Upload images
3. Fill specs and pricing
4. Set category and type
5. Save and publish

**Data Storage:**
- Images: Supabase Storage
- Metadata: Supabase `gallery_computers` table

---

## 16. Environment Variables

### Required for Public Site

```bash
# Supabase (Blog & Gallery)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Cloudflare Turnstile (Contact Form)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x...

# Resend (Email Notifications)
RESEND_API_KEY=re_...
NOTIFICATION_EMAIL=contact@computerstoreks.com

# Google Business (Reviews)
GOOGLE_BUSINESS_API_KEY=AIza...
GOOGLE_BUSINESS_ACCOUNT_ID=...
GOOGLE_BUSINESS_LOCATION_ID=...

# Next.js
NEXT_PUBLIC_SITE_URL=https://computerstoreks.com
```

---

## 17. Deployment

### Render Configuration

**Build Command:**
```bash
npm run build
```

**Start Command:**
```bash
npm run start
```

**Environment:**
- Node.js 22.x
- npm (matches local)

**Auto-Deploy:**
- Push to `Production` branch → production deploy
- Push to `Development` branch → dev site

### Pre-Deployment Checklist

- [ ] All environment variables set in Render
- [ ] Supabase tables and storage configured
- [ ] Blog schema applied
- [ ] Gallery seed data added
- [ ] Resend domain verified
- [ ] Turnstile site keys configured
- [ ] Google Analytics tracking code active
- [ ] Test contact form submission
- [ ] Verify blog posts display
- [ ] Check gallery loading
- [ ] Test mobile navigation
- [ ] Run Lighthouse audit

### Post-Deployment Testing

1. **Homepage loads correctly**
2. **All navigation links work**
3. **Contact form submits successfully**
4. **Blog posts display and paginate**
5. **Gallery filters and cards work**
6. **Mobile menu functions**
7. **Images load with optimization**
8. **Google reviews display**
9. **Analytics tracking active**

---

## 18. Maintenance

### Regular Tasks

#### Weekly
- Check contact form submissions
- Review spam/false positives
- Monitor uptime (Render dashboard)
- Review analytics for traffic

#### Monthly
- Update blog content
- Add new gallery items
- Review and respond to reviews
- Check broken links
- Update service pricing if changed

#### Quarterly
- Dependency updates (`npm outdated`)
- Security audit (`npm audit`)
- Performance audit (Lighthouse)
- Content refresh (outdated info)

### Monitoring

**Uptime Monitoring:**
- UptimeRobot or similar
- Monitor: https://computerstoreks.com
- Alert on downtime

**Error Tracking:**
- Next.js error pages
- Render logs
- Console errors

**Performance:**
- Google PageSpeed Insights
- Core Web Vitals
- Load time tracking

---

## 19. Common Issues & Solutions

### Contact Form Not Sending

**Check:**
1. Resend API key valid
2. NOTIFICATION_EMAIL set correctly
3. Turnstile tokens validating
4. No rate limit hit (429 errors)
5. Honeypot not accidentally filled

**Debug:** Check Render logs for API errors

### Gallery Images Not Loading

**Check:**
1. Supabase Storage bucket public
2. Image URLs correct in database
3. CORS configured on storage bucket
4. Image files actually uploaded

### Blog Posts Not Displaying

**Check:**
1. Posts have `published` status
2. `published_at` date is in past
3. Supabase connection working
4. Revalidation working (ISR)

### Reviews Not Showing

**Check:**
1. Google Business API credentials valid
2. Fallback reviews displaying if API fails
3. Network request succeeding
4. CORS not blocking API calls

---

## 20. Future Enhancements

### Planned Features

1. **Customer Portal**
   - Ticket tracking
   - Service history
   - Invoice downloads
   - Direct messaging

2. **Online Booking**
   - Appointment scheduling
   - Service selection
   - Calendar integration

3. **Live Chat**
   - Real-time support
   - Bot for common questions
   - Hand-off to technician

4. **Knowledge Base**
   - Self-help articles
   - Troubleshooting guides
   - Video tutorials

5. **Inventory Search**
   - Advanced filtering
   - Price range slider
   - Spec comparison

6. **Testimonials Submission**
   - Customer testimonial form
   - Photo upload
   - Moderation workflow

---

## Appendix

### File Structure

```
src/
├── app/
│   ├── (public)/                 # Public route group
│   │   ├── page.tsx              # Homepage
│   │   ├── layout.tsx            # Public layout (Header, Footer)
│   │   ├── about/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx          # Blog listing
│   │   │   └── [slug]/page.tsx   # Individual post
│   │   ├── contact/page.tsx
│   │   ├── gallery/page.tsx
│   │   ├── reviews/page.tsx
│   │   ├── services/
│   │   │   ├── page.tsx          # Services hub
│   │   │   ├── diagnostics/page.tsx
│   │   │   ├── data-services/page.tsx
│   │   │   ├── os-installation/page.tsx
│   │   │   ├── custom-computers/page.tsx
│   │   │   ├── laptops/page.tsx
│   │   │   ├── desktops/page.tsx
│   │   │   ├── virus-removal/page.tsx
│   │   │   ├── upgrades/page.tsx
│   │   │   ├── debloat/page.tsx
│   │   │   └── antivirus/page.tsx
│   │   ├── silver-plan/page.tsx
│   │   └── why-linux/page.tsx
│   ├── portal/page.tsx           # Customer portal (coming soon)
│   └── api/
│       ├── contact/route.ts      # Contact form handler
│       ├── gallery/route.ts      # Gallery API
│       ├── blog/route.ts         # Blog API
│       └── google-business/
│           └── reviews/route.ts  # Google reviews API
├── components/
│   ├── static/
│   │   ├── Header.tsx            # Site header
│   │   └── Footer.tsx            # Site footer
│   ├── home/
│   │   ├── hero-section.tsx
│   │   ├── services-preview.tsx
│   │   ├── stats-section.tsx
│   │   ├── testimonials.tsx
│   │   └── cta-section.tsx
│   ├── gallery/
│   │   ├── gallery-grid.tsx
│   │   ├── flip-card.tsx
│   │   ├── category-filter.tsx
│   │   └── gallery-skeleton.tsx
│   ├── reviews/
│   │   ├── ReviewsWidget.tsx
│   │   └── ReviewsDisplay.tsx
│   ├── forms/
│   │   └── contact-form.tsx
│   ├── seo/
│   │   ├── json-ld.tsx
│   │   └── breadcrumbs.tsx
│   ├── layout/
│   │   ├── container.tsx
│   │   ├── nav.tsx
│   │   ├── footer.tsx
│   │   └── mobile-nav.tsx
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       ├── input.tsx
│       ├── textarea.tsx
│       ├── select.tsx
│       ├── modal.tsx
│       ├── skeleton.tsx
│       ├── chat-widget.tsx
│       └── mobile-call-button.tsx
├── hooks/
│   ├── useBotProtection.ts      # Spam detection timing
│   ├── useInteractionTracking.ts # Mouse/keyboard tracking
│   └── useFingerprint.ts         # Browser fingerprinting
├── lib/
│   ├── constants.ts              # Business info constants
│   ├── supabase.ts               # Supabase client
│   ├── email.ts                  # Resend integration
│   └── utils.ts                  # Utility functions
└── styles/
    └── static-styles.css         # Custom CSS
```

### Key URLs

| Page | URL | Purpose |
|------|-----|---------|
| Homepage | `/` | Main landing page |
| About | `/about` | Company information |
| Contact | `/contact` | Contact form |
| Services Hub | `/services` | All services overview |
| Diagnostics | `/services/diagnostics` | Diagnostics service detail |
| Custom PCs | `/services/custom-computers` | Custom build service |
| Gallery | `/gallery` | Computer inventory |
| Blog | `/blog` | Blog listing |
| Blog Post | `/blog/[slug]` | Individual post |
| Reviews | `/reviews` | All Google reviews |
| Silver Plan | `/silver-plan` | Protection plans |
| Why Linux | `/why-linux` | Linux education |
| Customer Portal | `/portal` | Coming soon |

### Contact Information

- **Business Name:** Computer Store Kansas
- **Phone:** 785-267-3223
- **Email:** contact@computerstoreks.com
- **Address:** 2008 SW Gage Blvd, Topeka, KS 66604
- **Hours:**
  - Monday-Friday: 10:00 AM - 6:00 PM
  - Saturday: 10:00 AM - 2:00 PM
  - Sunday: Closed
- **Founded:** 2003
- **Owner:** Max Beyer

### Social Media

- **Facebook:** [Link in BUSINESS_INFO]
- **Google Business:** [Link for reviews]

---

**Document Version:** 1.0
**Last Updated:** 2026-01-12
**Author:** Documentation Specialist
**Project:** Computer Store KS Public Website
