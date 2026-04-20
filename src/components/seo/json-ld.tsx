/**
 * JSON-LD STRUCTURED DATA - Generates LocalBusiness schema markup so
 * search engines understand the store's name, address, hours, and
 * services.
 *
 * WHEN TO EDIT: When business info changes (hours, services, address)
 * or when adding new schema types (e.g., Product, FAQ).
 */

import * as React from 'react';
import { BUSINESS_INFO } from '@/lib/constants';

interface LocalBusinessSchemaProps {
  additionalData?: Record<string, unknown>;
}

export function LocalBusinessSchema({ additionalData }: LocalBusinessSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ComputerStore',
    '@id': BUSINESS_INFO.website,
    name: BUSINESS_INFO.name,
    alternateName: BUSINESS_INFO.shortName,
    description: `${BUSINESS_INFO.name} offers quality refurbished computers, expert repair services, and exceptional customer support in Topeka, Kansas.`,
    url: BUSINESS_INFO.website,
    telephone: BUSINESS_INFO.phone,
    email: BUSINESS_INFO.email,
    foundingDate: BUSINESS_INFO.founded.toString(),
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS_INFO.addressLine1,
      addressLocality: BUSINESS_INFO.city,
      addressRegion: BUSINESS_INFO.state,
      postalCode: BUSINESS_INFO.zip,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS_INFO.geo.latitude,
      longitude: BUSINESS_INFO.geo.longitude,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '10:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '14:00',
      },
    ],
    sameAs: [
      BUSINESS_INFO.socialMedia.facebook,
      BUSINESS_INFO.socialMedia.google,
    ],
    priceRange: '$$',
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: BUSINESS_INFO.geo.latitude,
        longitude: BUSINESS_INFO.geo.longitude,
      },
      geoRadius: '50000',
    },
    serviceType: [
      'Computer Repair',
      'Laptop Repair',
      'Virus Removal',
      'Data Recovery',
      'Hardware Upgrades',
      'Computer Sales',
    ],
    ...additionalData,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

