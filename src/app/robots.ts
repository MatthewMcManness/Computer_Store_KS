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
        /* /01 to /05 are the standalone redesign concept mockups. They
           return 200 on the live domain and carry off-brand colors and
           type, so they must never be indexed alongside the real site.

           NO TRAILING SLASH on those five. Disallow is a prefix match,
           so '/01/' matched only paths beginning '/01/' and the mockups
           themselves serve at '/01' ('/01/' 308-redirects to it). The
           slashed form blocked nothing; the pages' own noindex was
           doing all the work. Without the slash the prefix covers both
           forms. */
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/.env',
          '/01',
          '/02',
          '/03',
          '/04',
          '/05',
        ],
      },
    ],
    sitemap: 'https://computerstoreks.com/sitemap.xml',
  };
}
