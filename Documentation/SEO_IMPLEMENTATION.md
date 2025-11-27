# SEO Implementation Guide

This document describes the SEO implementation in Computer Store KS Version 3.0, including Schema.org markup, meta tags, sitemap configuration, and performance optimization.

## Table of Contents

- [Overview](#overview)
- [Schema.org Markup](#schemaorg-markup)
- [Meta Tags Structure](#meta-tags-structure)
- [Sitemap Configuration](#sitemap-configuration)
- [Robots.txt](#robotstxt)
- [Image Optimization](#image-optimization)
- [Performance Targets](#performance-targets)
- [Google Business Profile](#google-business-profile)

## Overview

The SEO implementation focuses on local search optimization for Computer Store Kansas, helping customers find the business when searching for computer repair and sales services in Topeka, Kansas.

### SEO Goals

- Rank for local search terms (computer repair Topeka, buy computer Kansas)
- Display rich results in Google (business hours, reviews, contact info)
- Fast page load times for better user experience
- Mobile-friendly design for all devices

### Key Files

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Meta tags, Open Graph, Twitter cards |
| `src/components/seo/json-ld.tsx` | Schema.org structured data |
| `src/lib/constants.ts` | Business information |
| `public/sitemap.xml` | XML sitemap |
| `public/robots.txt` | Crawler instructions |

## Schema.org Markup

### Local Business Schema

The site implements Schema.org LocalBusiness markup to provide search engines with detailed business information.

**Component:** `src/components/seo/json-ld.tsx`

```typescript
const schema = {
  '@context': 'https://schema.org',
  '@type': 'ComputerStore',
  '@id': 'https://computerstoreks.com',
  name: 'Computer Store Kansas',
  alternateName: 'The Computer Store',
  description: 'Quality refurbished computers and expert repair services in Topeka, Kansas.',
  url: 'https://computerstoreks.com',
  telephone: '785-267-3223',
  email: 'contact@computerstoreks.com',
  foundingDate: '2003',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '2008 SW Gage Blvd',
    addressLocality: 'Topeka',
    addressRegion: 'KS',
    postalCode: '66604',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 39.0312,
    longitude: -95.7068,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '10:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '10:00',
      closes: '14:00',
    },
  ],
  sameAs: [
    'https://facebook.com/computerstoreks',
    'https://g.page/computerstoreks',
  ],
  priceRange: '$$',
  serviceType: [
    'Computer Repair',
    'Laptop Repair',
    'Virus Removal',
    'Data Recovery',
    'Hardware Upgrades',
    'Computer Sales',
  ],
};
```

### Product Schema

For individual computer listings in the gallery:

```typescript
<ProductSchema
  name="HP ProDesk 400 G3"
  description="Refurbished desktop computer with Intel Core i5, 16GB RAM, 256GB SSD"
  image="https://computerstoreks.com/assets/gallery/desktop-1.jpg"
  price={299}
  availability="InStock"
  sku="HP-PD400-001"
/>
```

### FAQ Schema

For frequently asked questions pages:

```typescript
<FAQSchema
  questions={[
    {
      question: 'Do you offer warranty on refurbished computers?',
      answer: 'Yes, all our refurbished computers come with a 90-day warranty.',
    },
    {
      question: 'How long does a typical repair take?',
      answer: 'Most repairs are completed within 24-48 hours.',
    },
  ]}
/>
```

### Implementing Schema Components

Add to page components:

```typescript
import { LocalBusinessSchema, ProductSchema } from '@/components/seo';

export default function HomePage() {
  return (
    <>
      <LocalBusinessSchema />
      {/* Page content */}
    </>
  );
}
```

## Meta Tags Structure

### Default Meta Tags

Defined in `src/app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: {
    default: 'Computer Store Kansas | Computer Sales & Repair in Topeka, KS',
    template: '%s | Computer Store Kansas',
  },
  description: 'Computer Store Kansas offers quality refurbished computers, expert repair services, and exceptional customer support in Topeka, Kansas. Serving the community since 2003.',
  keywords: [
    'computer store',
    'Topeka',
    'Kansas',
    'computer repair',
    'refurbished computers',
    'PC sales',
    'laptop repair',
    'computer services',
  ],
  authors: [{ name: 'Jim Driggers' }],
  creator: 'Computer Store Kansas',
  publisher: 'Computer Store Kansas',
  metadataBase: new URL('https://computerstoreks.com'),
};
```

### Open Graph Tags

For social media sharing:

```typescript
openGraph: {
  type: 'website',
  locale: 'en_US',
  url: 'https://computerstoreks.com',
  siteName: 'Computer Store Kansas',
  title: 'Computer Store Kansas | Computer Sales & Repair in Topeka, KS',
  description: 'Quality refurbished computers and expert repair services in Topeka, Kansas.',
  images: [
    {
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Computer Store Kansas',
    },
  ],
},
```

### Twitter Cards

```typescript
twitter: {
  card: 'summary_large_image',
  title: 'Computer Store Kansas | Computer Sales & Repair',
  description: 'Quality refurbished computers and expert repair services in Topeka, Kansas.',
  images: ['/og-image.jpg'],
},
```

### Page-Specific Meta Tags

Override for specific pages:

```typescript
// src/app/services/page.tsx
export const metadata: Metadata = {
  title: 'Computer Repair Services',
  description: 'Professional computer repair services including virus removal, data recovery, and hardware upgrades in Topeka, KS.',
};
```

### Robots Meta Tag

```typescript
robots: {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
},
```

## Sitemap Configuration

### XML Sitemap

Create `public/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://computerstoreks.com/</loc>
    <lastmod>2025-11-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://computerstoreks.com/computers</loc>
    <lastmod>2025-11-19</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://computerstoreks.com/services</loc>
    <lastmod>2025-11-19</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://computerstoreks.com/about</loc>
    <lastmod>2025-11-19</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://computerstoreks.com/contact</loc>
    <lastmod>2025-11-19</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### Dynamic Sitemap Generation

For dynamic content, create a sitemap route:

```typescript
// src/app/sitemap.ts
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://computerstoreks.com';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/computers`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}
```

### Submitting to Search Engines

1. **Google Search Console:**
   - Go to https://search.google.com/search-console
   - Add property for computerstoreks.com
   - Submit sitemap: `https://computerstoreks.com/sitemap.xml`

2. **Bing Webmaster Tools:**
   - Go to https://www.bing.com/webmasters
   - Add site
   - Submit sitemap

## Robots.txt

Create `public/robots.txt`:

```txt
# Computer Store Kansas - robots.txt
User-agent: *
Allow: /

# Sitemap
Sitemap: https://computerstoreks.com/sitemap.xml

# Block admin pages
Disallow: /admin-login.html
Disallow: /admin-gallery.html
Disallow: /api/

# Block development/test files
Disallow: /*.json$
Disallow: /MODAL_DEBUG.html
```

### Robots.txt via Next.js

```typescript
// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin-login.html', '/admin-gallery.html', '/api/'],
    },
    sitemap: 'https://computerstoreks.com/sitemap.xml',
  };
}
```

## Image Optimization

### Next.js Image Component

Use the `next/image` component for automatic optimization:

```typescript
import Image from 'next/image';

<Image
  src="/assets/gallery/desktop-1.jpg"
  alt="HP ProDesk Desktop Computer"
  width={1200}
  height={900}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL={blurDataUrl}
/>
```

### Image Attributes for SEO

Always include:

- **alt**: Descriptive text for screen readers and SEO
- **title**: Tooltip text (optional)
- **width/height**: Prevents layout shift
- **loading**: "lazy" for below-fold images

### Gallery Image Optimization

Images uploaded through the gallery manager are automatically:

1. Resized to 1200x900 pixels
2. Converted to progressive JPEG
3. Compressed to 85% quality
4. Named with descriptive filenames

### Image Alt Text Best Practices

**Good:**
```html
<Image alt="HP ProDesk 400 G3 refurbished desktop computer with Intel Core i5" />
```

**Bad:**
```html
<Image alt="computer" />
<Image alt="IMG_0123.jpg" />
<Image alt="" />
```

### WebP Format (Future Enhancement)

Configure Next.js for WebP:

```javascript
// next.config.mjs
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};
```

## Performance Targets

### Core Web Vitals

Target metrics for good SEO ranking:

| Metric | Target | Description |
|--------|--------|-------------|
| **LCP** | < 2.5s | Largest Contentful Paint |
| **FID** | < 100ms | First Input Delay |
| **CLS** | < 0.1 | Cumulative Layout Shift |
| **FCP** | < 1.8s | First Contentful Paint |
| **TTFB** | < 600ms | Time to First Byte |

### Optimization Techniques

#### 1. Image Optimization
- Use Next.js Image component
- Serve responsive images
- Implement lazy loading
- Use modern formats (WebP/AVIF)

#### 2. JavaScript Optimization
- Tree-shake unused code
- Dynamic imports for non-critical components
- Minimize third-party scripts

```typescript
// Dynamic import for modal
const Modal = dynamic(() => import('@/components/ui/modal'), {
  loading: () => <div>Loading...</div>,
});
```

#### 3. CSS Optimization
- Use Tailwind's purge to remove unused CSS
- Avoid expensive CSS selectors
- Minimize layout shifts

#### 4. Font Optimization
Next.js automatically optimizes fonts:

```typescript
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});
```

#### 5. Caching
Configure proper cache headers in Nginx:

```nginx
location /_next/static {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
```

### Testing Performance

1. **Google PageSpeed Insights:**
   https://pagespeed.web.dev/

2. **Lighthouse (Chrome DevTools):**
   - Open DevTools (F12)
   - Go to Lighthouse tab
   - Run audit

3. **WebPageTest:**
   https://www.webpagetest.org/

## Google Business Profile

### Setting Up Google Business Profile

1. Go to https://business.google.com
2. Sign in with Google account
3. Add or claim your business
4. Verify ownership (postcard, phone, or email)

### Optimization Recommendations

#### Business Information
- **Name:** Computer Store Kansas
- **Category:** Computer Store (primary), Computer Repair Service (secondary)
- **Address:** 2008 SW Gage Blvd, Topeka, KS 66604
- **Phone:** (785) 267-3223
- **Website:** https://computerstoreks.com
- **Hours:** Mon-Fri 10am-6pm, Sat 10am-2pm

#### Business Description
```
Computer Store Kansas offers quality refurbished computers and expert repair services in Topeka, KS. Since 2003, we've provided affordable desktop and laptop computers, virus removal, data recovery, and hardware upgrades. Visit our showroom to find the perfect computer for your needs.
```

#### Attributes to Enable
- Wheelchair accessible entrance
- In-store shopping
- On-site services
- Same-day service

#### Photos to Add
- Storefront (exterior)
- Interior shots
- Team photos
- Product photos (computers)
- Service photos (repairs in progress)

#### Posts
Create regular posts about:
- New inventory
- Sales and promotions
- Tech tips
- Service announcements

### Managing Reviews

#### Encouraging Reviews
- Ask satisfied customers to leave reviews
- Add review link to email signatures
- Include on receipts

#### Review Response Template

**Positive Review:**
```
Thank you for your kind words, [Name]! We're thrilled that you're happy with your [computer/repair service]. It's customers like you that make our work rewarding. We look forward to serving you again!
```

**Negative Review:**
```
We're sorry to hear about your experience, [Name]. Customer satisfaction is our top priority. Please contact us at (785) 267-3223 so we can make this right.
```

### Google Business Profile Link

Add the Google Business link to your website footer and Schema.org markup:

```typescript
sameAs: [
  'https://facebook.com/computerstoreks',
  'https://g.page/computerstoreks',
],
```

### Q&A Section

Pre-populate with common questions:

1. **Q:** Do you offer warranty on refurbished computers?
   **A:** Yes, all refurbished computers include a 90-day warranty.

2. **Q:** Can I bring in my computer without an appointment?
   **A:** Yes, walk-ins are welcome during business hours.

3. **Q:** Do you buy used computers?
   **A:** Yes, we purchase quality used computers. Bring yours in for an evaluation.

## Related Documentation

- [README.md](./README.md) - Project overview
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Local development
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment

---

For more information on SEO best practices, refer to:
- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org)
- [Next.js SEO Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
