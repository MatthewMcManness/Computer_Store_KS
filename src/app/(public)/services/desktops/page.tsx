/**
 * DESKTOPS SERVICE PAGE - The /services/desktops detail page:
 * how desktops get refurbished, plus in-house desktop repair.
 *
 * WHEN TO EDIT: Page copy lives in src/components/services/service-content.ts
 * (the 'desktops' entry). Edit this file only to change SEO metadata.
 */
import type { Metadata } from 'next';
import { ServicePage } from '@/components/services/service-page';
import { SERVICES } from '@/components/services/service-content';
import { pageMetadata } from '@/components/seo/site-meta';

export const metadata: Metadata = pageMetadata({
  title: 'Refurbished Desktop Computers in Topeka, KS',
  description:
    'Refurbished desktop computers in Topeka, KS, inspected, stress tested, and rebuilt where needed, with a 3-month parts warranty. Desktop repair happens on the same bench.',
  path: '/services/desktops',
  shareTitle: 'Refurbished Desktops',
  shareDescription:
    'Stress-tested refurbished desktops and in-house desktop repair.',
});

export default function DesktopsPage() {
  return <ServicePage service={SERVICES['desktops']} />;
}
