import type { Metadata } from 'next';
import './globals.css';
import { BUSINESS_INFO } from '@/lib/constants';

export const metadata: Metadata = {
  title: {
    default: `${BUSINESS_INFO.name} | Computer Sales & Repair in Topeka, KS`,
    template: `%s | ${BUSINESS_INFO.name}`,
  },
  description: `${BUSINESS_INFO.name} offers quality refurbished computers, expert repair services, and exceptional customer support in Topeka, Kansas. Serving the community since ${BUSINESS_INFO.founded}.`,
  keywords: [
    'computer store Topeka',
    'computer repair Topeka KS',
    'PC repair Topeka Kansas',
    'laptop repair Topeka',
    'refurbished computers Topeka',
    'custom PC builds Kansas',
    'computer virus removal Topeka',
    'Computer Store Kansas',
  ],
  authors: [{ name: BUSINESS_INFO.founder }],
  creator: BUSINESS_INFO.name,
  publisher: BUSINESS_INFO.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://computerstoreks.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://computerstoreks.com',
    siteName: BUSINESS_INFO.name,
    title: `${BUSINESS_INFO.name} | Computer Sales & Repair in Topeka, KS`,
    description: `Quality refurbished computers and expert repair services in Topeka, Kansas. Serving the community since ${BUSINESS_INFO.founded}.`,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BUSINESS_INFO.name} | Computer Sales & Repair`,
    description: `Quality refurbished computers and expert repair services in Topeka, Kansas.`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
