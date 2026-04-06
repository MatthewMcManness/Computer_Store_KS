/**
 * SITEMAP GENERATOR - Creates a sitemap.xml for search engines listing all
 * public pages. Generated dynamically by Next.js.
 *
 * WHEN TO EDIT: When adding or removing public pages that should appear in search results.
 */
import type { MetadataRoute } from 'next';

const BASE_URL = 'https://computerstoreks.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const services = [
    'antivirus',
    'custom-computers',
    'data-services',
    'debloat',
    'desktops',
    'diagnostics',
    'laptops',
    'os-installation',
    'recycling',
    'upgrades',
    'virus-removal',
  ];

  return [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/computers`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'monthly', priority: 0.9 },
{ url: `${BASE_URL}/reviews`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/services`, changeFrequency: 'monthly', priority: 0.9 },
    ...services.map((service) => ({
      url: `${BASE_URL}/services/${service}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${BASE_URL}/silver-plan`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/why-linux`, changeFrequency: 'monthly', priority: 0.6 },
  ];
}
