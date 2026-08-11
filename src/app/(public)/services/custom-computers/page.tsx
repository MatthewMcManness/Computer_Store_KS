/**
 * CUSTOM COMPUTERS SERVICE PAGE - The /services/custom-computers detail page:
 * how a custom build is planned, built, and burned in.
 *
 * WHEN TO EDIT: Page copy lives in src/components/services/service-content.ts
 * (the 'custom-computers' entry). Edit this file only to change SEO metadata.
 */
import type { Metadata } from 'next';
import { ServicePage } from '@/components/services/service-page';
import { SERVICES } from '@/components/services/service-content';
import { pageMetadata } from '@/components/seo/site-meta';

export const metadata: Metadata = pageMetadata({
  title: 'Custom-Built Computers in Topeka, KS',
  description:
    'Custom-built PCs in Topeka, KS. Gaming rigs, workstations, and office machines planned with you, built in the shop, and stress tested before pickup.',
  path: '/services/custom-computers',
  shareTitle: 'Custom-Built Computers',
  shareDescription:
    'Parts plus a flat build fee, quoted before anything is ordered. Free lifetime diagnostics on every build.',
});

export default function CustomComputersPage() {
  return <ServicePage service={SERVICES['custom-computers']} />;
}
