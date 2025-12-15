import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { BUSINESS_INFO } from '@/lib/constants';

// Prevent static prerendering at build time
export const dynamic = 'force-dynamic';

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
        {/* OTTO Pixel - SearchAtlas Dynamic Optimization */}
        <Script
          id="sa-dynamic-optimization"
          data-uuid="219067f8-2667-4b49-b296-474653be0481"
          src="data:text/javascript;base64,dmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoInNjcmlwdCIpO3NjcmlwdC5zZXRBdHRyaWJ1dGUoIm5vd3Byb2NrZXQiLCAiIik7c2NyaXB0LnNldEF0dHJpYnV0ZSgibml0cm8tZXhjbHVkZSIsICIiKTtzY3JpcHQuc3JjID0gImh0dHBzOi8vZGFzaGJvYXJkLnNlYXJjaGF0bGFzLmNvbS9zY3JpcHRzL2R5bmFtaWNfb3B0aW1pemF0aW9uLmpzIjtzY3JpcHQuZGF0YXNldC51dWlkID0gIjIxOTA2N2Y4LTI2NjctNGI0OS1iMjk2LTQ3NDY1M2JlMDQ4MSI7c2NyaXB0LmlkID0gInNhLWR5bmFtaWMtb3B0aW1pemF0aW9uLWxvYWRlciI7ZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpOw=="
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
