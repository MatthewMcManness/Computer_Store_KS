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
 * @see SITE_CONFIG for derived site metadata
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
  socialMedia: {
    facebook: 'https://facebook.com/computerstoreks',
    google: 'https://g.page/computerstoreks',
  },
  geo: {
    latitude: 39.0312,
    longitude: -95.7068,
  },
} as const;

export type LocationKey = 'topeka';

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

/**
 * Site-wide configuration for metadata, SEO, and social sharing.
 *
 * Derived from BUSINESS_INFO, this configuration object provides standardized
 * site metadata used for HTML meta tags, OpenGraph, Twitter Cards, and
 * search engine optimization. The description is the default used when pages
 * don't provide their own.
 *
 * @constant
 * @type {Readonly<SiteConfig>}
 *
 * @property name - Site name for meta tags (from BUSINESS_INFO.name)
 * @property description - Default meta description for SEO (160 chars)
 * @property url - Canonical base URL (from BUSINESS_INFO.website)
 * @property ogImage - Path to default OpenGraph image for social sharing
 * @property links - Social media profile URLs for sharing buttons
 *
 * @example
 * // In metadata generation
 * export const metadata = {
 *   title: SITE_CONFIG.name,
 *   description: SITE_CONFIG.description,
 *   openGraph: {
 *     images: [SITE_CONFIG.ogImage]
 *   }
 * }
 *
 * @see BUSINESS_INFO for source data
 * @see generateMetadata in layout.tsx
 * @see OpenGraph component
 *
 * @functions_called None (constant declaration)
 * @called_by RootLayout, generateMetadata, SEO components, ShareButtons
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export const SITE_CONFIG = {
  name: BUSINESS_INFO.name,
  description: `${BUSINESS_INFO.name} offers quality refurbished computers, expert repair services, and exceptional customer support in Topeka, Kansas.`,
  url: BUSINESS_INFO.website,
  ogImage: '/og-image.jpg',
  links: {
    facebook: BUSINESS_INFO.socialMedia.facebook,
    google: BUSINESS_INFO.socialMedia.google,
  },
} as const;

/**
 * Main navigation menu structure for site header.
 *
 * Defines the primary navigation links displayed in the site header.
 * Maintained as a constant array to ensure consistent navigation across
 * the site and easy updates. Order determines display order in the nav bar.
 *
 * @constant
 * @type {ReadonlyArray<{label: string, href: string}>}
 *
 * @property label - Display text for the navigation link
 * @property href - Relative URL path for the link destination
 *
 * @example
 * // In Header component
 * <nav>
 *   {NAV_ITEMS.map(item => (
 *     <Link key={item.href} href={item.href}>
 *       {item.label}
 *     </Link>
 *   ))}
 * </nav>
 *
 * @see Header component
 * @see MobileMenu component
 *
 * @functions_called None (constant declaration)
 * @called_by Header, MobileMenu, Breadcrumbs
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Computers', href: '/computers' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

/**
 * Service offerings catalog for Computer Store Kansas.
 *
 * Defines the core service categories offered by the business. Each service
 * has a unique ID for routing, a display name, and a brief description.
 * Used for generating service pages, service cards on the homepage, and
 * navigation to detailed service pages.
 *
 * @constant
 * @type {ReadonlyArray<{id: string, name: string, description: string}>}
 *
 * @property id - Unique identifier and URL slug for the service
 * @property name - Display name of the service offering
 * @property description - Brief one-line description of what the service provides
 *
 * @example
 * // Generate service cards
 * {SERVICES.map(service => (
 *   <ServiceCard key={service.id}>
 *     <h3>{service.name}</h3>
 *     <p>{service.description}</p>
 *     <Link href={`/services/${service.id}`}>Learn More</Link>
 *   </ServiceCard>
 * ))}
 *
 * // Find service by ID
 * const service = SERVICES.find(s => s.id === 'repair')
 *
 * @see ServicesPage for full service listings
 * @see Individual service detail pages in /services/[id]
 * @see ServiceCard component
 *
 * @functions_called None (constant declaration)
 * @called_by ServicesPage, HomePage, ServiceCard, generateStaticParams
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export const SERVICES = [
  {
    id: 'repair',
    name: 'Computer Repair',
    description: 'Professional repair services for desktops and laptops',
  },
  {
    id: 'virus-removal',
    name: 'Virus Removal',
    description: 'Complete malware and virus removal services',
  },
  {
    id: 'data-recovery',
    name: 'Data Recovery',
    description: 'Recover lost or deleted files from damaged drives',
  },
  {
    id: 'upgrades',
    name: 'Hardware Upgrades',
    description: 'RAM, SSD, and other hardware upgrade services',
  },
  {
    id: 'networking',
    name: 'Networking',
    description: 'Home and small business network setup and support',
  },
] as const;
