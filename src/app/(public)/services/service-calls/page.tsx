/**
 * SERVICE CALLS PAGE - The /services/service-calls detail page: on-site
 * work at a customer's office or home, including full IT resets for
 * businesses.
 *
 * This is revenue priority #2 in docs/profile/services.md ("Most
 * important financially"), so it gets a real indexable page rather than
 * living only as paragraphs on the hub and /silver-plan. No fixed price
 * appears here: on-site work is variable labor, which the pricing policy
 * keeps off the site.
 *
 * WHEN TO EDIT: Page copy lives in src/components/services/service-content.ts
 * (the 'service-calls' entry). Edit this file only to change SEO metadata.
 */
import type { Metadata } from 'next';
import { ServicePage } from '@/components/services/service-page';
import { SERVICES } from '@/components/services/service-content';
import { BUSINESS_INFO } from '@/lib/constants';
import { pageMetadata } from '@/components/seo/site-meta';

export const metadata: Metadata = pageMetadata({
  title: 'Business IT Support and Service Calls in Topeka, KS',
  description:
    `On-site computer and IT support in ${BUSINESS_INFO.city}, ${BUSINESS_INFO.state}. Service calls at your office, house calls, and full IT resets with new machines set up. Call ${BUSINESS_INFO.phoneFormatted} for a quote before we schedule.`,
  path: '/services/service-calls',
  shareTitle: 'Service Calls and Business IT Support',
  shareDescription:
    'On-site work at your office or home, including full IT resets for businesses.',
});

export default function ServiceCallsPage() {
  return <ServicePage service={SERVICES['service-calls']} />;
}
