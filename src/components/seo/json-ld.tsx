/**
 * JSON-LD STRUCTURED DATA - The ComputerStore schema for the whole site:
 * the store's name, address, hours, and the services it sells. Rendered
 * once from the public layout, so it appears on every public route.
 *
 * NO aggregateRating AND NO review, ever. The shop has real Google
 * reviews but no sanctioned rating figure to publish, and self-serving
 * rating markup is both a fabrication and a manual-action risk. The
 * reviews the site does show render as page content on /reviews.
 *
 * WHEN TO EDIT: When business info changes (hours, address) or when the
 * shop adds or drops a service line. The serviceType array below must
 * stay in agreement with docs/profile/services.md and src/app/sitemap.ts.
 */

import * as React from 'react';
import { BUSINESS_INFO } from '@/lib/constants';
import { SITE_DESCRIPTION } from './site-meta';

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
    description: SITE_DESCRIPTION,
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
    /* IN REVENUE ORDER, and it must stay that way. This list is what a
       search engine or an answer engine reads as "what this business
       does", and it shipped for years as the old site's order, which
       named neither the recurring plan nor on-site business IT. Those
       are lines #1 and #2 in docs/profile/services.md, they lead the
       home page, they lead /services, and the sitemap already ranks
       them. Keep this array, the sitemap priorities, and that document
       in agreement. Every entry maps to a real page on the site. */
    serviceType: [
      'Computer Protection Plan',
      'On-Site Computer and IT Support',
      'Custom Computer Building',
      'Laptop Repair and Sales',
      'Desktop Repair and Refurbished Computer Sales',
      'Computer Diagnostics',
      'Virus and Malware Removal',
      'Computer Hardware Upgrades',
      'Data Transfer and Recovery',
      'Operating System Installation',
      'Windows Optimization and Debloat',
      'Antivirus Installation and Scam Protection',
      'Printer Repair and Sales',
      'Electronics Recycling',
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

