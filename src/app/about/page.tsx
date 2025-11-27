import type { Metadata } from 'next';
import { BUSINESS_INFO } from '@/lib/constants';
import { AboutPageClient } from './about-client';

export const metadata: Metadata = {
  title: 'About Us',
  description: `Learn about ${BUSINESS_INFO.name}, founded by ${BUSINESS_INFO.founder} in ${BUSINESS_INFO.founded}. Over 20 years of trusted computer repair and sales service in Topeka, Kansas. Discover our mission, values, and commitment to customer satisfaction.`,
  openGraph: {
    title: `About Us | ${BUSINESS_INFO.name}`,
    description: `Founded by ${BUSINESS_INFO.founder} in ${BUSINESS_INFO.founded}. Over 20 years of trusted computer repair and sales service in Topeka, Kansas.`,
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
