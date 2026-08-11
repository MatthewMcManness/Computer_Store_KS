/**
 * HOMEPAGE - The main landing page at computerstoreks.com. Server
 * Component. Band order follows the moneymaker hierarchy: hero, the
 * Silver plan and business IT first, the in-house repair index with the
 * $50 diagnostic stamp, real Google reviews, certifications, then the
 * visit band.
 *
 * WHEN TO EDIT: When changing homepage content or band order. Each band
 * lives in src/components/home/.
 */

import type { Metadata } from 'next';
import { ReviewsWidget } from '@/components/reviews/ReviewsWidget';
import { BUSINESS_INFO } from '@/lib/constants';
import { HeroBand } from '@/components/home/hero-band';
import { BusinessBand } from '@/components/home/business-band';
import { RepairBand } from '@/components/home/repair-band';
import { CredibilityStrip } from '@/components/home/credibility-strip';
import { VisitBand } from '@/components/home/visit-band';
import { pageMetadata } from '@/components/seo/site-meta';

export const metadata: Metadata = pageMetadata({
  title: 'Fast, Honest Computer Repair in Topeka, KS',
  description: `Computer repair, custom builds, and business IT support at ${BUSINESS_INFO.addressLine1} in Topeka. Every repair happens in our shop, and the $50 diagnostic applies toward your repair. Call ${BUSINESS_INFO.phoneFormatted}.`,
  path: '/',
  /* No trailing ", KS" here: the share line is joined to the shop's
     name with a comma, and a line that already ends in one turned the
     brand into a fourth item in a list on the card. The state is
     carried by the page title and by og:locale, which pageMetadata()
     now actually emits. */
  shareTitle: 'Fast and Honest Computer Repair in Topeka',
  shareDescription: `Every repair happens in our shop at ${BUSINESS_INFO.addressLine1}. The $50 diagnostic applies toward your repair. Call ${BUSINESS_INFO.phoneFormatted}.`,
});

/* Re-render on an hourly cadence so the server-read reviews cache stays
   fresh without making the busiest page fully dynamic per request. */
export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <HeroBand />
      {/* The page's one circuit rule lives INSIDE BusinessBand, as its
          closing mark. Between the two sections it straddled a
          background edge and read as a stray second border. */}
      <BusinessBand />
      <RepairBand />

      {/* Proof band: real cached Google reviews only, rendered on the
          server from the reviews cache. When the cache is empty the
          widget renders the same designed Google-listing band /reviews
          uses, rather than vanishing: the OAuth refresh token does lapse,
          and the shop's strongest credibility asset must not silently
          disappear from the page most visitors see. */}
      <ReviewsWidget />

      <CredibilityStrip />
      <VisitBand />
    </>
  );
}
