/**
 * HARDWARE UPGRADES SERVICE PAGE - The /services/upgrades detail page:
 * how SSD, RAM, and graphics upgrades work.
 *
 * WHEN TO EDIT: Page copy lives in src/components/services/service-content.ts
 * (the 'upgrades' entry). Edit this file only to change SEO metadata.
 */
import type { Metadata } from 'next';
import { ServicePage } from '@/components/services/service-page';
import { SERVICES } from '@/components/services/service-content';
import { pageMetadata } from '@/components/seo/site-meta';

export const metadata: Metadata = pageMetadata({
  title: 'Computer Hardware Upgrades in Topeka, KS',
  description:
    'Computer hardware upgrades in Topeka, KS: SSD, memory, and graphics, fitted to the machine you already own and quoted before we open anything. Blowout cleanings, repastes, and cooler installs run at a flat rate.',
  path: '/services/upgrades',
  shareTitle: 'Hardware Upgrades',
  shareDescription:
    'SSD, memory, and graphics upgrades fitted to the machine you already own, quoted before we open anything and installed in our Topeka shop.',
});

export default function UpgradesPage() {
  return <ServicePage service={SERVICES['upgrades']} />;
}
