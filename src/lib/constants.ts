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

export const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Computers', href: '/computers' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

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
