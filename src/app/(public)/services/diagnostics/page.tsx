/**
 * DIAGNOSTICS SERVICE PAGE - The /services/diagnostics detail page:
 * what a diagnostic covers, how it goes, and the flat $50 fee.
 *
 * WHEN TO EDIT: Page copy lives in src/components/services/service-content.ts
 * (the 'diagnostics' entry). Edit this file only to change SEO metadata.
 */
import type { Metadata } from 'next';
import { ServicePage } from '@/components/services/service-page';
import { SERVICES } from '@/components/services/service-content';
import { pageMetadata } from '@/components/seo/site-meta';

export const metadata: Metadata = pageMetadata({
  title: 'Computer Diagnostics in Topeka, KS',
  description:
    'A flat $50 computer diagnostic in Topeka, KS that applies toward your repair. We find the real problem, hardware or software, and give you a straight answer, usually same day.',
  path: '/services/diagnostics',
  shareTitle: 'Computer Diagnostics',
  shareDescription:
    'A flat $50 diagnostic that applies toward your repair, run on our own bench in Topeka. Most results are ready the same day.',
});

export default function DiagnosticsPage() {
  return <ServicePage service={SERVICES['diagnostics']} />;
}
