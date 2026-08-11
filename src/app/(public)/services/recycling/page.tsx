/**
 * RECYCLING SERVICE PAGE - The /services/recycling detail page:
 * how free electronics recycling and data destruction work.
 *
 * WHEN TO EDIT: Page copy lives in src/components/services/service-content.ts
 * (the 'recycling' entry). Edit this file only to change SEO metadata.
 */
import type { Metadata } from 'next';
import { ServicePage } from '@/components/services/service-page';
import { SERVICES } from '@/components/services/service-content';
import { pageMetadata } from '@/components/seo/site-meta';

export const metadata: Metadata = pageMetadata({
  title: 'Free Electronics Recycling in Topeka, KS',
  description:
    'Free electronics recycling in Topeka, KS. Drop off computers, TVs, consoles, and more during business hours. Data destruction guaranteed, no appointment needed.',
  path: '/services/recycling',
  shareTitle: 'Free Electronics Recycling',
  shareDescription:
    'Drop off old electronics free. Guaranteed data destruction and responsible disposal.',
});

export default function RecyclingPage() {
  return <ServicePage service={SERVICES['recycling']} />;
}
