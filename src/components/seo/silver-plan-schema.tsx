/**
 * SILVER PLAN STRUCTURED DATA - schema.org Service markup for
 * /silver-plan, the shop's revenue backbone.
 *
 * WHY THIS FILE EXISTS: every one of the 13 service detail pages emitted
 * Service JSON-LD while the single most important commercial page on the
 * site emitted only the generic ComputerStore blob from the layout. The
 * recurring plan was the least machine-legible page the shop had, which
 * works directly against the AI-citation goal in the onboarding brief.
 *
 * NO PRICE, deliberately. The plan is priced per device per month and the
 * number is not public yet (shape brief, open question 3), so the schema
 * carries no offers, no priceRange, and no PriceSpecification. It also
 * carries no aggregateRating and no review: the shop has no sanctioned
 * rating data, and inventing one is exactly the markup Google penalises.
 *
 * Every string here restates something the page itself says.
 *
 * WHEN TO EDIT: When plan coverage changes, or when Max confirms a public
 * recurring price. Coverage copy lives in
 * src/components/silver/coverage-list.tsx; keep the two in agreement.
 */

import { BUSINESS_INFO } from '@/lib/constants';

/**
 * The coverage lines, in the same words the page prints them. These feed
 * the Offer catalog so an answer engine can quote what the plan includes
 * without needing the price it does not have.
 */
const COVERAGE = [
  'Antivirus software included',
  'Remote support, four hours a month',
  'Performance monitoring and alerts',
  'Free in-store diagnostics',
  'Email support with a 24 to 48 hour response',
  'A system health check every quarter',
  '50% off virus removal',
  '50% off house calls',
  '50% off account recovery',
  '15% off labor',
  'Priority scheduling',
] as const;

/** Renders the Service JSON-LD for the Silver plan page. */
export function SilverPlanSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'The Silver plan',
    serviceType: 'Computer Protection Plan',
    description:
      'A monthly computer protection plan for Topeka homes and businesses: antivirus, remote support hours, monitoring, free in-store diagnostics, repair discounts, and priority scheduling. Priced per device, per month.',
    url: `${BUSINESS_INFO.website}/silver-plan`,
    areaServed: {
      '@type': 'City',
      name: BUSINESS_INFO.city,
      containedInPlace: { '@type': 'State', name: 'Kansas' },
    },
    /* Points at the same @id the ComputerStore schema in json-ld.tsx
       declares, so the plan and the shop are one entity to a crawler
       rather than two businesses with the same address. */
    provider: {
      '@type': 'ComputerStore',
      '@id': BUSINESS_INFO.website,
      name: BUSINESS_INFO.name,
      telephone: BUSINESS_INFO.phone,
      url: BUSINESS_INFO.website,
      address: {
        '@type': 'PostalAddress',
        streetAddress: BUSINESS_INFO.addressLine1,
        addressLocality: BUSINESS_INFO.city,
        addressRegion: BUSINESS_INFO.state,
        postalCode: BUSINESS_INFO.zip,
        addressCountry: 'US',
      },
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'What the Silver plan covers',
      itemListElement: COVERAGE.map((item) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: item },
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
