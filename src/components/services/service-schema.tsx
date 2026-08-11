/**
 * SERVICE STRUCTURED DATA - Emits schema.org Service and FAQPage JSON-LD
 * for a service detail page so search engines and AI assistants can read
 * what the service is, who provides it, and the page's real FAQs.
 *
 * The $50 diagnostic renders as an Offer only on the diagnostics page,
 * where the price actually belongs to the service itself.
 *
 * WHEN TO EDIT: When changing what structured data the service pages
 * expose. Page copy itself lives in service-content.ts.
 */

import { BUSINESS_INFO } from '@/lib/constants';
import type { ServiceContent } from './service-content';

interface ServiceStructuredDataProps {
  service: ServiceContent;
}

/** Renders the Service and FAQPage JSON-LD script tags for one service page. */
export function ServiceStructuredData({ service }: ServiceStructuredDataProps) {
  const url = `${BUSINESS_INFO.website}/services/${service.slug}`;

  const serviceSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    serviceType: service.schemaServiceType,
    description: service.answer[0],
    url,
    areaServed: {
      '@type': 'City',
      name: BUSINESS_INFO.city,
      containedInPlace: { '@type': 'State', name: 'Kansas' },
    },
    provider: {
      '@type': 'ComputerStore',
      '@id': BUSINESS_INFO.website,
      name: BUSINESS_INFO.name,
      telephone: BUSINESS_INFO.phone,
      url: BUSINESS_INFO.website,
      address: {
        '@type': 'PostalAddress',
        streetAddress: BUSINESS_INFO.addressLine1,
        addressLocality: BUSINESS_INFO.city,
        addressRegion: BUSINESS_INFO.state,
        postalCode: BUSINESS_INFO.zip,
        addressCountry: 'US',
      },
    },
  };

  // The fixed diagnostic price is a real Offer only where it IS the service.
  if (service.slug === 'diagnostics') {
    serviceSchema.offers = {
      '@type': 'Offer',
      price: '50',
      priceCurrency: 'USD',
      description: 'Flat-fee computer diagnostic. The fee applies toward the repair.',
    };
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: service.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
