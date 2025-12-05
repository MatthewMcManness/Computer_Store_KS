# Features

Computer Store KS provides a complete web presence for a computer repair shop with public website, admin management, and marketing tools.

## Public Website

### Home Page
- Hero section with business branding
- Featured computers showcase
- Services overview
- Call-to-action sections
- Contact information
- Business hours

### About Page
- Company history and mission
- Team information
- Store location with map
- Business values

### Services Page
- Computer repair services
- Upgrade services
- Custom builds
- Data recovery
- Virus removal
- Hardware diagnostics
- Service pricing tiers

### Gallery Page
- Browse available computers for sale
- Filter by type (Desktop, Laptop, All-in-One)
- Filter by category (Gaming, Business, Home, Workstation)
- Search functionality
- Detailed computer listings with specs
- Image galleries for each computer

### Silver Plan Page
- Extended warranty program details
- Coverage information
- Pricing
- Sign-up process

### Contact Page
- Contact form with validation
- Email notifications via Resend
- Store address and map
- Phone and email information
- Business hours

### Blog
- Full-featured blog system
- Category and tag organization
- Search functionality
- Markdown content support
- Featured images
- Post archives by date
- SEO-optimized URLs

### Reviews Page
- Customer testimonials
- Google Business integration (planned)
- Social proof display

## Admin Dashboard

### Authentication
- Secure password-based login
- Session-based authentication
- Protected admin routes
- Logout functionality

### Gallery Management
- Add new computer listings
- Edit existing listings
- Delete listings
- Upload images
- Set featured status
- Manage availability
- Preview listings

### Computer Listing Fields
- Name/model
- Type (Desktop, Laptop, All-in-One)
- Category (Gaming, Business, Home, Workstation)
- Price
- Description
- Specifications:
  - Processor
  - RAM
  - Storage
  - Graphics
  - Display
  - Operating System
- Condition
- Warranty information
- Multiple images

### Publishing
- Save drafts locally
- Publish to GitHub for live site
- Version control of gallery data

### Blog Management
- Create new blog posts
- Edit existing posts
- Delete posts
- Upload featured images
- Manage categories and tags
- Draft vs. published status
- Rich text with markdown support

## Flyer Generator

### Create Printable Flyers
- Generate PDF flyers for computers
- Include computer details and specs
- Add pricing information
- Include store branding

### Flyer Types
- Standard product flyers
- Black Friday promotional flyers
- Custom layouts

### Print Options
- Print-optimized formatting
- Multiple sizes supported
- Professional appearance

## Technical Features

### SEO
- Server-side rendering for SEO
- Meta tags optimization
- Structured data
- Sitemap generation
- Mobile-friendly design

### Performance
- Next.js App Router for optimal performance
- Image optimization
- Code splitting
- Lazy loading

### Responsive Design
- Mobile-first approach
- Tablet optimization
- Desktop layouts
- Touch-friendly interactions

### Accessibility
- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Screen reader support

## Integrations

### GitHub
- Gallery images stored in GitHub repository
- Version-controlled gallery data
- Automatic sync between admin and public site

### Resend (Email)
- Contact form notifications
- Professional email templates
- Reliable delivery

### Supabase (Blog Database)
- PostgreSQL database for blog posts
- Categories and tags management
- Image storage for blog media
- Full-text search support

### Google Maps (Optional)
- Store location map
- Directions integration

### Google Analytics (Optional)
- Visitor tracking
- Traffic analysis
- Conversion tracking

## Security Features

### Authentication
- HTTP-only session cookies
- Secure password storage
- Protected admin routes
- Middleware protection

### Input Validation
- Zod schema validation
- Sanitized user input
- Type-safe API handlers

### Infrastructure
- HTTPS enforcement
- CSRF protection
- Security headers
