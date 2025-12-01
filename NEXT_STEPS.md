# Next Steps - Computer Store KS Migration

**Last Updated:** December 1, 2025

## Summary of What Was Done

Successfully migrated the static HTML site to Next.js while preserving the exact visual appearance:

### Completed
1. **Created Next.js route group `(public)`** for all customer-facing pages
2. **Migrated all pages:**
   - Home (`/`) - Hero, Stats, Services, Testimonials carousel, CTA
   - About (`/about`)
   - Services (`/services`)
   - Gallery (`/gallery`) - Now loads from `src/data/gallery.json` with all 8 computers
   - Contact (`/contact`) - Form submits to `/api/contact`, Google Maps embed
   - Silver Plan (`/silver-plan`)
   - Black Friday (`/black-friday`)
3. **Created static components:**
   - `Header.tsx` - Navigation with active states, mobile hamburger menu
   - `Footer.tsx` - Contact info, admin login link, RWS credit
   - `TestimonialsCarousel.tsx` - Auto-rotating customer reviews
4. **Copied `static-styles.css`** - Preserves original site styling
5. **Fixed admin layout** - Removed conflicting `<html>/<body>` tags
6. **Added assets to `public/assets/`:**
   - `title.png` - Main logo (512x236)
   - `logo.png` - Circular logo
   - `logo_outlined.png`
   - `rws-logo.svg` - Resilient Web Solutions footer logo
   - `silver_plan.png`
   - `CSK1.png`, `CSK2.png`, `CSK3.png` - Store photos
   - `IMG_0569.png`, `IMG_0573.png`
7. **Contact form API** - Fully functional at `/api/contact`

---

## URGENT: Fix Logos Not Loading on Live Deploy

### The Problem
Logos work locally but show 404 on Render deployment.

### Likely Causes
1. **Git LFS not configured on Render** - Large PNG files may not be pulled correctly
2. **Build command not copying public assets** - The `cp -r public .next/standalone/public` may be failing
3. **Case sensitivity** - Linux servers are case-sensitive for file paths

### Steps to Debug/Fix

#### Option 1: Check Render build logs
1. Go to Render dashboard
2. Check the latest deploy logs
3. Look for errors related to:
   - File copy operations
   - Missing files
   - Asset warnings

#### Option 2: Verify files exist in standalone output
Add this to `render.yaml` build command to debug:
```yaml
buildCommand: npm install && npm run build && ls -la public/assets/ && cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public && ls -la .next/standalone/public/assets/
```

#### Option 3: Check file sizes (Git LFS issue)
The PNG files are large (some 15-40MB). If Git LFS is not set up:
```bash
# Check if files are actual images or LFS pointers
file public/assets/title.png
# Should show "PNG image data", not "ASCII text"
```

If they're LFS pointers on Render:
1. Add `.lfsconfig` to repo or
2. Compress images to reasonable sizes (< 1MB each) or
3. Use external image hosting (e.g., Cloudinary)

#### Option 4: Test with a simple static file
1. Create a small test file: `echo "test" > public/test.txt`
2. Deploy and check if `https://yoursite.com/test.txt` works
3. This confirms if static files work at all

---

## Remaining Tasks

### High Priority
1. **Fix logo loading on production** (see above)
2. **Disable the static site deploy on Render** - Only the Next.js service is needed now

### Medium Priority
3. **Add Google Reviews API integration** - This was the reason for the Next.js migration
   - Need Google Business Profile API credentials
   - Will replace the hardcoded testimonials carousel

### Low Priority
4. **Gallery images** - Currently using placeholder paths (`/assets/gallery/desktop-1.jpg` etc.)
   - These images don't exist yet
   - Either upload real images or use the GitHub-based gallery system

---

## Quick Commands

```bash
# Development
bun run dev

# Build (must set NODE_ENV)
NODE_ENV=production bun run build

# Test production locally
NODE_ENV=production bun run start

# Check asset accessibility
curl -I http://localhost:3000/assets/title.png
```

---

## File Structure Reference

```
src/
├── app/
│   ├── (public)/           # Customer pages
│   │   ├── layout.tsx      # Header + Footer
│   │   ├── page.tsx        # Home
│   │   ├── about/
│   │   ├── services/
│   │   ├── gallery/
│   │   ├── contact/
│   │   ├── silver-plan/
│   │   └── black-friday/
│   ├── admin/              # Admin dashboard
│   ├── api/                # API routes
│   ├── static-styles.css   # Public page styling
│   └── layout.tsx          # Root layout
├── components/
│   ├── static/             # Header, Footer, Carousel
│   ├── admin/
│   └── gallery/
├── data/
│   └── gallery.json        # Computer inventory
└── lib/                    # Utilities
public/
└── assets/                 # Static files (logos, images)
```
