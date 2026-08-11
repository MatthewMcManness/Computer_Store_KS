/**
 * WINDOWS DEBLOAT SERVICE PAGE - The /services/debloat detail page:
 * what a Windows debloat removes and when it helps.
 *
 * WHEN TO EDIT: Page copy lives in src/components/services/service-content.ts
 * (the 'debloat' entry). Edit this file only to change SEO metadata.
 */
import type { Metadata } from 'next';
import { ServicePage } from '@/components/services/service-page';
import { SERVICES } from '@/components/services/service-content';
import { pageMetadata } from '@/components/seo/site-meta';

export const metadata: Metadata = pageMetadata({
  title: 'Windows Debloat Service in Topeka, KS',
  description:
    'Windows debloat service in Topeka, KS. We remove bloatware and startup clutter so Windows 11 runs the way it should. Free on every computer purchased from us.',
  path: '/services/debloat',
  shareTitle: 'Windows Debloat',
  shareDescription:
    'We strip the preloaded junk so Windows 11 runs the way it should, and it is free on every computer you buy from us.',
});

export default function DebloatPage() {
  return <ServicePage service={SERVICES['debloat']} />;
}
