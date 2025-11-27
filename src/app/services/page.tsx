import type { Metadata } from 'next';
import { BUSINESS_INFO } from '@/lib/constants';
import { ServicesPageClient } from './services-client';

export const metadata: Metadata = {
  title: 'Services',
  description: `Professional computer repair services in Topeka, KS. Computer repair, virus removal, custom PC builds, data recovery, hardware upgrades, Linux migration, and our Silver Plan maintenance program. Call ${BUSINESS_INFO.phoneFormatted} for a free estimate.`,
  keywords: [
    'computer repair Topeka',
    'virus removal Topeka KS',
    'custom PC builds Kansas',
    'data recovery Topeka',
    'Linux migration services',
    'Windows to Linux',
    'computer maintenance plan',
    'hardware upgrades Topeka',
  ],
  openGraph: {
    title: `Computer Services | ${BUSINESS_INFO.name}`,
    description: `Professional computer repair, virus removal, custom builds, data recovery, and Linux migration services in Topeka, Kansas.`,
  },
};

export default function ServicesPage() {
  return <ServicesPageClient />;
}
