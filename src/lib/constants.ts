/** The single authorized employee email for admin access */
export const AUTHORIZED_EMAIL = 'contact@computerstoreks.com';

/**
 * Core business information for Computer Store Kansas.
 *
 * Central source of truth for all business details including contact information,
 * location, operating hours, and ownership. Used throughout the site for
 * header/footer, contact pages, schema.org markup, and Google Business integration.
 * Marked as `const` to ensure immutability at compile time.
 *
 * @constant
 * @type {Readonly<BusinessInfo>}
 *
 * @property name - Full legal business name
 * @property shortName - Abbreviated brand name for headers
 * @property address - Complete street address (single line)
 * @property addressLine1 - Street address only (for structured data)
 * @property city - City name
 * @property state - Two-letter state code
 * @property zip - Five-digit ZIP code
 * @property phone - Phone number (digits and hyphens)
 * @property phoneFormatted - Human-readable phone format with parentheses
 * @property email - Primary contact email
 * @property website - Canonical website URL
 * @property founded - Year business was established
 * @property founder - Original founder name
 * @property owner - Current owner name
 * @property hours - Human-readable hours array for display
 * @property hoursDetailed - Structured hours for business logic (24-hour format)
 * @property socialMedia - Social media profile URLs
 * @property geo - Geographic coordinates for maps
 *
 * @example
 * // Display phone in footer
 * <a href={`tel:${BUSINESS_INFO.phone}`}>{BUSINESS_INFO.phoneFormatted}</a>
 *
 * // Schema.org LocalBusiness markup
 * <script type="application/ld+json">
 *   {JSON.stringify({
 *     "@type": "LocalBusiness",
 *     "name": BUSINESS_INFO.name,
 *     "address": {
 *       "streetAddress": BUSINESS_INFO.addressLine1,
 *       "addressLocality": BUSINESS_INFO.city
 *     }
 *   })}
 * </script>
 *
 * @see formatPhoneNumber in utils.ts
 * @see google-business.ts for Google Business Profile integration
 *
 * @functions_called None (constant declaration)
 * @called_by Header, Footer, ContactPage, AboutPage, SchemaMarkup, GoogleBusinessSync
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export const BUSINESS_INFO = {
  name: 'Computer Store Kansas',
  shortName: 'The Computer Store',
  address: '2008 SW Gage Blvd, Topeka, KS 66604',
  addressLine1: '2008 SW Gage Blvd',
  city: 'Topeka',
  state: 'KS',
  zip: '66604',
  phone: '785-267-3223',
  phoneFormatted: '(785) 267-3223',
  email: 'contact@computerstoreks.com',
  website: 'https://computerstoreks.com',
  founded: 2003,
  founder: 'Jim Driggers',
  owner: 'Max Beyer',
  hours: [
    'Mon-Fri: 10am-6pm',
    'Sat: 10am-2pm',
    'Sun: Closed',
  ],
  hoursDetailed: {
    monday: { open: '10:00', close: '18:00', closed: false },
    tuesday: { open: '10:00', close: '18:00', closed: false },
    wednesday: { open: '10:00', close: '18:00', closed: false },
    thursday: { open: '10:00', close: '18:00', closed: false },
    friday: { open: '10:00', close: '18:00', closed: false },
    saturday: { open: '10:00', close: '14:00', closed: false },
    sunday: { open: '', close: '', closed: true },
  },
  // Google Place ID — looked up via the official Place ID Finder.
  // Used to build the cross-device-reliable write-review URL below.
  googlePlaceId: 'ChIJ_3VvYaECv4cRiKpMrSEiMiQ',
  socialMedia: {
    facebook: 'https://facebook.com/computerstoreks',
    google: 'https://g.page/computerstoreks',
    // Direct link to the write-review form. Works reliably on mobile
    // and desktop; unlike `g.page/r/{cid}/review` which often lands
    // on the business listing instead of the review form on phones.
    googleReview:
      'https://search.google.com/local/writereview?placeid=ChIJ_3VvYaECv4cRiKpMrSEiMiQ',
  },
  geo: {
    latitude: 39.0312,
    longitude: -95.7068,
  },
} as const;

export type LocationKey = 'topeka';

/** Store locations with addresses, phone numbers, and business hours. */
export const LOCATIONS: Record<LocationKey, {
  name: string;
  address: string;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  phoneFormatted: string;
  hours: string[];
  geo: { latitude: number; longitude: number };
  mapsEmbed: string;
}> = {
  topeka: {
    name: 'Topeka',
    address: '2008 SW Gage Blvd, Topeka, KS 66604',
    addressLine1: '2008 SW Gage Blvd',
    city: 'Topeka',
    state: 'KS',
    zip: '66604',
    phone: '785-267-3223',
    phoneFormatted: '(785) 267-3223',
    hours: [
      'Monday – Friday: 10:00 am – 6:00 pm',
      'Saturday: 10:00 am – 2:00 pm',
      'Sunday: Closed',
    ],
    geo: { latitude: 39.0312, longitude: -95.7068 },
    mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3096.8876!2d-95.7028!3d39.0365!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87bf02d8d9a9ed57%3A0x8a8a8a8a8a8a8a8a!2s2008%20SW%20Gage%20Blvd%2C%20Topeka%2C%20KS%2066604!5e0!3m2!1sen!2sus!4v1701417600000',
  },
} as const;

