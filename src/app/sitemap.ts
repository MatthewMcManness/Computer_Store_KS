/**
 * SITEMAP GENERATOR - Creates a sitemap.xml for search engines listing all
 * public pages. Generated dynamically by Next.js.
 *
 * WHEN TO EDIT: When adding or removing public pages that should appear in search results.
 */
import type { MetadataRoute } from 'next';

const BASE_URL = 'https://computerstoreks.com';

/**
 * Priorities mirror the revenue ranking in docs/profile/services.md: the
 * Silver plan is the revenue backbone, on-site service calls are second,
 * and the remaining service pages sit a step below. Keep this file and
 * that document in agreement; the nav, the footer, and the home page
 * band order already follow the same ranking.
 */

/** Service slugs whose sitemap priority is raised above the 0.7 default. */
const SERVICE_PRIORITY: Partial<Record<string, number>> = {
  'service-calls': 0.8,
};

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
    'printers',
    'recycling',
    'service-calls',
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
      priority: SERVICE_PRIORITY[service] ?? 0.7,
    })),
    { url: `${BASE_URL}/shop`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/silver-plan`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/why-linux`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
