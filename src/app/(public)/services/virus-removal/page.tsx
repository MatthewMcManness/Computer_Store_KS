/**
 * VIRUS REMOVAL SERVICE PAGE - The /services/virus-removal detail page:
 * how virus, malware, and scam-software cleanup works.
 *
 * WHEN TO EDIT: Page copy lives in src/components/services/service-content.ts
 * (the 'virus-removal' entry). Edit this file only to change SEO metadata.
 */
import type { Metadata } from 'next';
import { ServicePage } from '@/components/services/service-page';
import { SERVICES } from '@/components/services/service-content';
import { pageMetadata } from '@/components/seo/site-meta';

export const metadata: Metadata = pageMetadata({
  title: 'Virus and Malware Removal in Topeka, KS',
  description:
    'Virus, spyware, and scam-software removal done in our Topeka shop. The $50 diagnostic applies toward the work, and the machine is verified clean before it goes home.',
  path: '/services/virus-removal',
  shareTitle: 'Virus and Malware Removal',
  shareDescription:
    'Viruses, spyware, and scam software removed in our Topeka shop and verified clean before the machine goes home. The $50 diagnostic applies toward the work.',
});

export default function VirusRemovalPage() {
  return <ServicePage service={SERVICES['virus-removal']} />;
}
