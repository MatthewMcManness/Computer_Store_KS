# Changelog

All notable changes to Computer Store KS are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [3.0.0] - 2025-11-19

Complete redesign and migration to Next.js 14.

### Added

#### Framework and Architecture
- Migrated to **Next.js 14** with App Router
- Added **TypeScript** for type safety throughout codebase
- Implemented **Tailwind CSS 3** for utility-first styling
- Created comprehensive component library with variants
- Added Server-Side Rendering (SSR) for improved performance
- Implemented automatic code splitting and lazy loading

#### Component Library
- **UI Components:**
  - Button with multiple variants (primary, secondary, outline, ghost, destructive, link)
  - Card with header, title, description, and content sections
  - Input with label, error handling, and helper text
  - Textarea for multi-line input
  - Select dropdown component
  - Badge for status indicators
  - Skeleton loading placeholders
  - Modal dialog component

- **Layout Components:**
  - Container for centered, max-width content
  - Header with navigation
  - Footer with contact information
  - Mobile navigation drawer
  - Responsive navigation

- **Gallery Components:**
  - FlipCard with animated hover effect
  - GalleryGrid with responsive layout
  - CategoryFilter for desktop/laptop filtering
  - GallerySkeleton loading state

- **SEO Components:**
  - LocalBusinessSchema for Google rich results
  - ProductSchema for computer listings
  - FAQSchema for FAQ pages
  - Breadcrumbs for navigation structure

#### SEO Optimization
- Implemented Schema.org structured data (ComputerStore type)
- Added comprehensive meta tags (title, description, keywords)
- Configured Open Graph tags for social sharing
- Added Twitter Card support
- Created XML sitemap
- Configured robots.txt
- Optimized images with next/image
- Implemented geo coordinates for local SEO

#### Contact Form
- Created React contact form component
- Added client-side validation with real-time feedback
- Integrated Resend for email delivery
- Multiple service type options
- Phone number formatting
- Success and error states
- Mobile-responsive design

#### Docker Deployment
- Created multi-stage Dockerfile for optimized builds
- Configured docker-compose.yml with networking
- Added health checks for containers
- Configured volume mounting for gallery images
- Set up environment variable management
- Added logging configuration

#### Developer Experience
- Added ESLint configuration
- Configured TypeScript strict mode
- Set up path aliases (@/components, @/lib, etc.)
- Created utility functions (cn, formatCurrency, etc.)
- Added constants file for business information
- Comprehensive documentation

### Changed

- **Architecture:** Moved from vanilla JavaScript to React/Next.js
- **Styling:** Replaced custom CSS with Tailwind CSS utilities
- **Package Manager:** Recommended Bun over npm for faster installs
- **Image Handling:** Automatic optimization via next/image
- **Routing:** App Router instead of static HTML pages

### Preserved

- **Gallery Manager:** Kept v2 Express.js API for gallery management
- **Admin Panel:** Preserved admin-login.html and admin-gallery.html
- **GitHub Integration:** Maintained Octokit for auto-deployment
- **Image Upload:** Kept Sharp for image optimization

### Technical Details

#### Dependencies Added
- next: 14
- react: 18
- react-dom: 18
- typescript: ^5.9.3
- tailwindcss: 3
- @octokit/rest: ^22.0.1
- class-variance-authority: ^0.7.1
- clsx: ^2.1.1
- lucide-react: ^0.554.0
- sharp: ^0.34.5
- tailwind-merge: ^3.4.0
- zod: ^4.1.12

#### Configuration Files
- `next.config.mjs` - Next.js configuration with standalone output
- `tailwind.config.js` - Tailwind CSS with custom colors
- `tsconfig.json` - TypeScript configuration
- `postcss.config.js` - PostCSS for Tailwind

### Migration Notes

When upgrading from v2 to v3:

1. Install new dependencies: `bun install`
2. Set up environment variables in `.env.local`
3. The gallery API continues to work unchanged
4. Static HTML pages have been replaced with Next.js pages
5. Update any custom CSS to use Tailwind utilities

---

## [2.x] - Previous Version

Vanilla JavaScript implementation with Express.js backend.

### Features
- Static HTML pages
- Custom CSS styling
- JavaScript gallery management
- Express.js API for gallery operations
- GitHub integration for deployments
- Admin panel for inventory management

### Technical Stack
- HTML5 / CSS3 / JavaScript (ES6+)
- Express.js
- Node.js
- Sharp for image processing
- Octokit for GitHub API

---

## [1.x] - Original Site

Initial website implementation.

### Features
- Basic HTML pages
- Simple CSS styling
- Contact information display
- Static gallery

---

## Upgrade Path

### From v2.x to v3.0

1. **Backup existing data:**
   ```bash
   cp -r assets/gallery gallery-backup
   cp index.html index-backup.html
   ```

2. **Pull v3.0 code:**
   ```bash
   git fetch origin
   git checkout version-3.0
   ```

3. **Install dependencies:**
   ```bash
   bun install
   cd api && bun install
   ```

4. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

5. **Test locally:**
   ```bash
   bun run dev
   ```

6. **Deploy:**
   ```bash
   docker compose up -d --build
   ```

### From v1.x to v3.0

Full migration required. Contact development team for assistance.

---

## Roadmap

### Planned for v3.1

- [ ] Customer reviews section
- [ ] Inventory management integration with RepairShopr
- [ ] Online appointment scheduling
- [ ] Live chat support
- [ ] Newsletter signup

### Planned for v3.2

- [ ] E-commerce functionality
- [ ] Shopping cart
- [ ] Payment processing
- [ ] Order tracking

### Future Considerations

- Progressive Web App (PWA) support
- Multi-language support
- Dark mode theme
- Advanced analytics dashboard

---

## Contributing

See [DEVELOPMENT.md](./DEVELOPMENT.md) for contribution guidelines.

## Support

For questions or issues:
- Review relevant documentation
- Check GitHub issues
- Contact development team

---

**Note:** This changelog documents major version changes. For detailed commit history, see the GitHub repository.
