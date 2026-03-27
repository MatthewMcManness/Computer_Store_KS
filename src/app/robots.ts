/**
 * ROBOTS.TXT GENERATOR - Tells search engines which pages to index.
 * Generated dynamically by Next.js.
 *
 * WHEN TO EDIT: When you want to block search engines from certain pages.
 */
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/_next/', '/.env'],
      },
    ],
    sitemap: 'https://computerstoreks.com/sitemap.xml',
  };
}
