/**
 * LAPTOPS SERVICE PAGE - The /services/laptops detail page:
 * how laptop repair works, plus new and refurbished laptop sales.
 *
 * WHEN TO EDIT: Page copy lives in src/components/services/service-content.ts
 * (the 'laptops' entry). Edit this file only to change SEO metadata.
 */
import type { Metadata } from 'next';
import { ServicePage } from '@/components/services/service-page';
import { SERVICES } from '@/components/services/service-content';
import { pageMetadata } from '@/components/seo/site-meta';

export const metadata: Metadata = pageMetadata({
  title: 'Laptop Repair and Laptop Sales in Topeka, KS',
  description:
    'Laptop repair in Topeka, KS, done in our own shop: screens, batteries, keyboards, and drives. Plus new Asus and Lenovo laptops and tested refurbished machines.',
  path: '/services/laptops',
  shareTitle: 'Laptop Repair and Sales',
  shareDescription:
    'Laptop repairs done in-house, plus new Asus and Lenovo laptops and refurbs that carry a 3-month parts warranty.',
});

export default function LaptopsPage() {
  return <ServicePage service={SERVICES['laptops']} />;
}
