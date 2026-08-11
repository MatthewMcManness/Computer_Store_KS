/**
 * OS INSTALLATION SERVICE PAGE - The /services/os-installation detail page:
 * how a fresh Windows or Zorin OS Linux install works.
 *
 * WHEN TO EDIT: Page copy lives in src/components/services/service-content.ts
 * (the 'os-installation' entry). Edit this file only to change SEO metadata.
 */
import type { Metadata } from 'next';
import { ServicePage } from '@/components/services/service-page';
import { SERVICES } from '@/components/services/service-content';
import { pageMetadata } from '@/components/seo/site-meta';

export const metadata: Metadata = pageMetadata({
  title: 'Windows and Linux Installation in Topeka, KS',
  description:
    'Fresh Windows and Linux installs done in our Topeka shop, with the Windows license included, dual-boot setups, and Zorin OS for older hardware. The $50 diagnostic applies toward the work.',
  path: '/services/os-installation',
  shareTitle: 'OS Installation Services',
  shareDescription:
    'A clean system put down in our Topeka shop: Windows with the license included, or Zorin OS Linux for a machine Windows 11 left behind.',
});

export default function OsInstallationPage() {
  return <ServicePage service={SERVICES['os-installation']} />;
}
