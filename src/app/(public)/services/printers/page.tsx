/**
 * PRINTERS SERVICE PAGE - The /services/printers detail page:
 * printer repair for any brand and Brother printer sales.
 *
 * WHEN TO EDIT: Page copy lives in src/components/services/service-content.ts
 * (the 'printers' entry). Edit this file only to change SEO metadata.
 */
import type { Metadata } from 'next';
import { ServicePage } from '@/components/services/service-page';
import { SERVICES } from '@/components/services/service-content';
import { pageMetadata } from '@/components/seo/site-meta';

export const metadata: Metadata = pageMetadata({
  title: 'Printer Sales and Repair in Topeka, KS',
  description:
    'Printer repair for any brand and new Brother printer sales in Topeka, KS. In-home setup available with any new Brother printer. The $50 diagnostic applies toward your repair.',
  path: '/services/printers',
  shareTitle: 'Printer Sales and Repair',
  shareDescription:
    'Any brand of printer repaired on our bench in Topeka, and new Brother printers on the counter when a repair stops making sense.',
});

export default function PrintersPage() {
  return <ServicePage service={SERVICES['printers']} />;
}
