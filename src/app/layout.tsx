import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { BUSINESS_INFO } from '@/lib/constants';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { LocalBusinessSchema } from '@/components/seo/json-ld';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: `${BUSINESS_INFO.name} | Computer Sales & Repair in Topeka, KS`,
    template: `%s | ${BUSINESS_INFO.name}`,
  },
  description: `${BUSINESS_INFO.name} offers quality refurbished computers, expert repair services, and exceptional customer support in Topeka, Kansas. Serving the community since ${BUSINESS_INFO.founded}.`,
  keywords: [
    // Primary location keywords
    'computer store Topeka',
    'computer repair Topeka KS',
    'PC repair Topeka Kansas',
    'laptop repair Topeka',
    // Service keywords
    'refurbished computers Topeka',
    'custom PC builds Kansas',
    'computer virus removal Topeka',
    'data recovery Topeka KS',
    'Linux installation Topeka',
    'Windows to Linux migration',
    // Competitive keywords (non-gaming focused)
    'business computer repair',
    'office PC setup Topeka',
    'computer upgrade service',
    'SSD upgrade Topeka',
    'RAM upgrade Kansas',
    'computer maintenance plan',
    'affordable computer repair',
    'same day computer repair Topeka',
    // Brand terms
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
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <LocalBusinessSchema />
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
