/**
 * DATA SERVICES SERVICE PAGE - The /services/data-services detail page:
 * how data transfer, drive cloning, and recovery work.
 *
 * WHEN TO EDIT: Page copy lives in src/components/services/service-content.ts
 * (the 'data-services' entry). Edit this file only to change SEO metadata.
 */
import type { Metadata } from 'next';
import { ServicePage } from '@/components/services/service-page';
import { SERVICES } from '@/components/services/service-content';
import { pageMetadata } from '@/components/seo/site-meta';

export const metadata: Metadata = pageMetadata({
  title: 'Data Transfer and Drive Cloning in Topeka, KS',
  description:
    'Data transfer, drive cloning, and data recovery in Topeka, KS. Files restored where they belong, and if a recovery gets nothing back, you pay nothing for it.',
  path: '/services/data-services',
  shareTitle: 'Data Transfer and Drive Cloning',
  shareDescription:
    'Transfers, clones, and recovery from failing drives, all inside the shop.',
});

export default function DataServicesPage() {
  return <ServicePage service={SERVICES['data-services']} />;
}
