/**
 * SITE META - The one machine-readable description of the shop, the one
 * share-card image, and the single helper every public route calls to
 * build its metadata. Both the root metadata (src/app/layout.tsx) and
 * the LocalBusiness JSON-LD read from here, so search engines and AI
 * answer engines are never handed two different descriptions of the
 * business, and neither is handed the old generic marketing copy.
 *
 * Every fact in the description is a fact the site already states.
 *
 * WHEN TO EDIT: When the address, the diagnostic policy, or the share
 * card changes. Business facts come from src/lib/constants.ts.
 */

import type { Metadata } from 'next';
import { BUSINESS_INFO } from '@/lib/constants';

/** The public production origin. Canonicals and the sitemap always use it. */
export const PRODUCTION_URL = 'https://computerstoreks.com';

/**
 * Where this build is actually served from. Set per deploy target via
 * NEXT_PUBLIC_SITE_URL, which the staging preview points at its own
 * hostname.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_URL;

/**
 * False on every preview deploy. Guards indexing: a preview serves the
 * same pages as the live site, so it must refuse crawlers rather than
 * compete with computerstoreks.com as duplicate content.
 */
export const IS_PRODUCTION_HOST = SITE_URL === PRODUCTION_URL;

/** The site-wide description: same string in the meta tag and the JSON-LD. */
export const SITE_DESCRIPTION =
  `${BUSINESS_INFO.name} repairs, builds, and sells computers at ` +
  `${BUSINESS_INFO.addressLine1} in ${BUSINESS_INFO.city}, ${BUSINESS_INFO.state}. ` +
  `Every repair happens in the shop, and the $50 diagnostic applies toward your repair.`;

/** The share card: a real photograph of the building, cropped to 1200x630. */
export const OG_IMAGE = {
  url: '/assets/og-card.jpg',
  width: 1200,
  height: 630,
  alt: `The ${BUSINESS_INFO.name} building on ${BUSINESS_INFO.addressLine1} in ${BUSINESS_INFO.city}`,
} as const;

/**
 * Composes an og:title in the one sanctioned form: the page's own line,
 * a comma, the business name. Every route calls this, so no share card
 * can drift back to the old hyphen form or ship unattributed.
 *
 * TWO RULES, both enforced here because both shipped as bugs once:
 *   1. The page line must not contain the brand name. /why-linux passed
 *      ogTitle() to the Next.js `title` field, the root template added
 *      its own suffix, and the tab read the brand twice.
 *   2. The page line must not end in a comma-separated fragment (", KS"
 *      and the like). The attribution comma then reads as one more item
 *      in a list instead of the boundary before the shop's name.
 * Both throw rather than warn: metadata is evaluated when the route is
 * built, so a bad call fails on the machine that wrote it.
 *
 * @param page - The page's own share-card line, with no brand name in it
 */
export function ogTitle(page: string): string {
  if (page.toLowerCase().includes(BUSINESS_INFO.name.toLowerCase())) {
    throw new Error(
      `ogTitle() received a page line that already names the business: "${page}". ` +
        'Pass the page line only; the brand name is appended here.'
    );
  }
  if (/,\s*[^,]{1,4}$/.test(page)) {
    throw new Error(
      `ogTitle() received a page line ending in a short comma fragment: "${page}". ` +
        'Rewrite it so the trailing comma belongs to this function.'
    );
  }
  return `${page}, ${BUSINESS_INFO.name}`;
}

/**
 * The Open Graph fields that belong to the SITE rather than to any one
 * page: the card type, the locale, and the brand attribution line that
 * Facebook, LinkedIn and Slack print under an unfurl.
 *
 * These live here and not only in the root layout because Next.js does
 * NOT deep-merge metadata.openGraph. A child route that declares an
 * openGraph object REPLACES the parent's wholesale, which is exactly
 * how all 24 public routes once shipped without og:type, og:locale or
 * og:site_name while the 404 page (the one route with no openGraph of
 * its own) carried all three.
 */
const BASE_OG = {
  type: 'website' as const,
  locale: 'en_US',
  siteName: BUSINESS_INFO.name,
  images: [{ ...OG_IMAGE }],
};

/** What one public route has to say about itself. */
export interface PageMetaInput {
  /**
   * Browser tab and search-result title, WITHOUT the brand name: the
   * root layout's title template appends it.
   */
  title: string;
  /** Meta description. Must describe what the page actually shows. */
  description: string;
  /** Site-root-relative path, '/' for the home page. Becomes the canonical. */
  path: string;
  /**
   * The share-card line, without the brand name. ogTitle() appends the
   * shop's name to it and throws if the line already carries it.
   */
  shareTitle: string;
  /**
   * A shorter share-card description where the meta description runs
   * long for a card. Falls back to `description`.
   */
  shareDescription?: string;
}

/**
 * Builds the complete Metadata object for one public route.
 *
 * Every public page calls this instead of hand-writing an openGraph
 * block, which is the whole point: a route cannot declare openGraph
 * without the site-level fields, because it never declares openGraph
 * at all. It also guarantees the canonical and the share-card image,
 * both of which are easy to forget one page at a time.
 *
 * The Twitter card is NOT set here. The root layout declares
 * `card: 'summary_large_image'` once and nothing overrides it, so it
 * inherits everywhere, and it is the correct type: OG_IMAGE is a real
 * 1200x630 photograph of the building, not an icon.
 *
 * @param input - The page's own title, description, path, and share line
 */
export function pageMetadata(input: PageMetaInput): Metadata {
  const { title, description, path, shareTitle, shareDescription } = input;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      ...BASE_OG,
      title: ogTitle(shareTitle),
      description: shareDescription ?? description,
      url: path === '/' ? BUSINESS_INFO.website : `${BUSINESS_INFO.website}${path}`,
    },
  };
}
