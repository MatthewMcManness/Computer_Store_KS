import type { Metadata } from 'next';
import { GalleryClient } from './gallery-client';
import { GalleryPageWrapper } from './gallery-wrapper';
import { BUSINESS_INFO } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Computer Gallery',
  description: `Browse quality refurbished computers, custom gaming PCs, and laptops at ${BUSINESS_INFO.name} in Topeka, KS. Desktop and laptop computers starting at $299. Contact us for current availability.`,
  openGraph: {
    title: `Computer Gallery | ${BUSINESS_INFO.name}`,
    description: `Browse our selection of refurbished computers and custom builds in Topeka, Kansas.`,
  },
};

// Sample computer data
const sampleComputers = [
  {
    id: '1',
    name: 'Dell OptiPlex 7080',
    category: 'desktop' as const,
    price: 449,
    imageFront: '/images/computers/dell-optiplex-front.jpg',
    imageBack: '/images/computers/dell-optiplex-back.jpg',
    specs: {
      processor: 'Intel Core i5-10500',
      ram: '16GB DDR4',
      storage: '256GB SSD',
      graphics: 'Intel UHD 630',
      os: 'Windows 11 Pro',
    },
    inStock: true,
  },
  {
    id: '2',
    name: 'HP ProBook 450 G8',
    category: 'laptop' as const,
    price: 599,
    imageFront: '/images/computers/hp-probook-front.jpg',
    imageBack: '/images/computers/hp-probook-back.jpg',
    specs: {
      processor: 'Intel Core i7-1165G7',
      ram: '16GB DDR4',
      storage: '512GB SSD',
      display: '15.6" FHD IPS',
      os: 'Windows 11 Pro',
    },
    inStock: true,
  },
  {
    id: '3',
    name: 'Custom Gaming PC - Starter',
    category: 'custom' as const,
    price: 899,
    imageFront: '/images/computers/custom-gaming-starter.jpg',
    imageBack: '/images/computers/custom-gaming-starter-side.jpg',
    specs: {
      processor: 'AMD Ryzen 5 5600X',
      ram: '16GB DDR4 3200MHz',
      storage: '500GB NVMe SSD',
      graphics: 'NVIDIA RTX 3060',
      os: 'Windows 11 Home',
    },
    inStock: true,
  },
  {
    id: '4',
    name: 'Lenovo ThinkCentre M920',
    category: 'refurbished' as const,
    price: 299,
    imageFront: '/images/computers/lenovo-thinkcentre-front.jpg',
    imageBack: '/images/computers/lenovo-thinkcentre-back.jpg',
    specs: {
      processor: 'Intel Core i5-8500',
      ram: '8GB DDR4',
      storage: '256GB SSD',
      graphics: 'Intel UHD 630',
      os: 'Windows 10 Pro',
    },
    inStock: true,
  },
  {
    id: '5',
    name: 'Custom Gaming PC - Pro',
    category: 'custom' as const,
    price: 1499,
    imageFront: '/images/computers/custom-gaming-pro.jpg',
    imageBack: '/images/computers/custom-gaming-pro-side.jpg',
    specs: {
      processor: 'AMD Ryzen 7 7700X',
      ram: '32GB DDR5 5600MHz',
      storage: '1TB NVMe SSD',
      graphics: 'NVIDIA RTX 4070',
      os: 'Windows 11 Home',
    },
    inStock: true,
  },
  {
    id: '6',
    name: 'Dell Latitude 5520',
    category: 'laptop' as const,
    price: 549,
    imageFront: '/images/computers/dell-latitude-front.jpg',
    imageBack: '/images/computers/dell-latitude-back.jpg',
    specs: {
      processor: 'Intel Core i5-1145G7',
      ram: '16GB DDR4',
      storage: '256GB SSD',
      display: '15.6" FHD',
      os: 'Windows 11 Pro',
    },
    inStock: false,
  },
  {
    id: '7',
    name: 'HP EliteDesk 800 G5',
    category: 'refurbished' as const,
    price: 349,
    imageFront: '/images/computers/hp-elitedesk-front.jpg',
    imageBack: '/images/computers/hp-elitedesk-back.jpg',
    specs: {
      processor: 'Intel Core i7-9700',
      ram: '16GB DDR4',
      storage: '512GB SSD',
      graphics: 'Intel UHD 630',
      os: 'Windows 10 Pro',
    },
    inStock: true,
  },
  {
    id: '8',
    name: 'Custom Workstation PC',
    category: 'custom' as const,
    price: 1899,
    imageFront: '/images/computers/custom-workstation.jpg',
    imageBack: '/images/computers/custom-workstation-side.jpg',
    specs: {
      processor: 'Intel Core i9-13900K',
      ram: '64GB DDR5',
      storage: '2TB NVMe SSD',
      graphics: 'NVIDIA RTX 4080',
      os: 'Windows 11 Pro',
    },
    inStock: true,
  },
];

export default function GalleryPage() {
  return (
    <GalleryPageWrapper>
      <GalleryClient computers={sampleComputers} />
    </GalleryPageWrapper>
  );
}
