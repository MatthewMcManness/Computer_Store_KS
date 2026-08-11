/**
 * ROOT LAYOUT - The outermost wrapper for every page on the site.
 * Sets the HTML lang, loads global CSS and the brand font, and defines
 * default SEO metadata.
 *
 * The Archivo font is loaded here as a CSS variable (--font-archivo) but
 * only APPLIED inside the public site shell (the .site wrapper in the
 * (public) layout), so the admin panel and slideshow keep their current
 * system font.
 *
 * WHEN TO EDIT: When changing the site-wide font, default page title,
 * meta description, or global CSS imports.
 */

import type { Metadata } from 'next';
import { Archivo } from 'next/font/google';
import './globals.css';
import { BUSINESS_INFO } from '@/lib/constants';
import { SITE_DESCRIPTION, OG_IMAGE, IS_PRODUCTION_HOST } from '@/components/seo/site-meta';

/** Archivo variable font: the single blocky sans family for the public site. */
const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-archivo',
});

export const metadata: Metadata = {
  title: {
    /* Every route sets its own title, so this only ever renders for a
       route that forgot to. It matches the home page positioning and the
       spelled-out "and" the rewritten page titles use. */
    default: `${BUSINESS_INFO.name} | Fast, Honest Computer Repair in Topeka, KS`,
    template: `%s | ${BUSINESS_INFO.name}`,
  },
  description: SITE_DESCRIPTION,
  /* NO meta keywords. The old site shipped a stuffed keywords list on
     every route. Google has ignored the tag since 2009, nothing on this
     site reads it, and a leftover in the head is the most visible kind
     of leftover there is. */
  authors: [{ name: BUSINESS_INFO.name }],
  creator: BUSINESS_INFO.name,
  publisher: BUSINESS_INFO.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://computerstoreks.com'),
  /* This block is the fallback for routes that declare NO openGraph of
     their own, which today is only /not-found. It is NOT inherited by
     the public pages: Next.js REPLACES metadata.openGraph wholesale
     when a child route declares one, so a page that sets a title here
     would silently lose type, locale and siteName. Every public route
     therefore builds its openGraph through pageMetadata() in
     src/components/seo/site-meta.ts, which folds the site-level fields
     back in. Do not "simplify" that helper away. */
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://computerstoreks.com',
    siteName: BUSINESS_INFO.name,
    title: `${BUSINESS_INFO.name} | Fast, Honest Computer Repair in Topeka, KS`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  /* Card type only, declared once and never overridden: with no title,
     description or image of its own, Next.js falls back to each page's
     openGraph values, so every route shares a card that actually
     describes that route. summary_large_image is the right type here
     because OG_IMAGE is a real 1200x630 photograph of the building. */
  twitter: {
    card: 'summary_large_image',
  },
  /* Preview deploys serve the same pages as the live site, so they ship
     noindex here as well as in robots.ts. robots.txt alone is only a
     request; the meta tag is what keeps a preview out of the index when
     a crawler reaches it by a link. */
  robots: IS_PRODUCTION_HOST
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      }
    : { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={archivo.variable}>
      <body>
        {children}
      </body>
    </html>
  );
}
