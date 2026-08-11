/**
 * ANTIVIRUS SERVICE PAGE - The /services/antivirus detail page:
 * how ESET antivirus and scam protection get set up and managed.
 *
 * WHEN TO EDIT: Page copy lives in src/components/services/service-content.ts
 * (the 'antivirus' entry). Edit this file only to change SEO metadata.
 */
import type { Metadata } from 'next';
import { ServicePage } from '@/components/services/service-page';
import { SERVICES } from '@/components/services/service-content';
import { pageMetadata } from '@/components/seo/site-meta';

export const metadata: Metadata = pageMetadata({
  title: 'Antivirus and Scam Protection in Topeka, KS',
  description:
    'Antivirus and scam protection in Topeka, KS. We install and configure ESET, add scam protection, and handle renewals and support so you never have to.',
  path: '/services/antivirus',
  shareTitle: 'Antivirus and Scam Protection',
  shareDescription:
    'ESET antivirus and scam protection, installed and managed by the shop.',
});

export default function AntivirusPage() {
  return <ServicePage service={SERVICES['antivirus']} />;
}
