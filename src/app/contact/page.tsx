import type { Metadata } from 'next';
import { BUSINESS_INFO } from '@/lib/constants';
import { ContactPageClient } from './contact-client';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: `Contact ${BUSINESS_INFO.name} for computer repair, sales, and service in Topeka, KS. Visit us at ${BUSINESS_INFO.address} or call ${BUSINESS_INFO.phoneFormatted}. Open ${BUSINESS_INFO.hours[0]}.`,
  openGraph: {
    title: `Contact Us | ${BUSINESS_INFO.name}`,
    description: `Get in touch with ${BUSINESS_INFO.name} for computer repair and sales. Located at ${BUSINESS_INFO.address} in Topeka, Kansas.`,
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
