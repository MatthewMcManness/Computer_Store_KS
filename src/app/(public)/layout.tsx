import '../static-styles.css';
import { Header } from '@/components/static/Header';
import { Footer } from '@/components/static/Footer';
import Script from 'next/script';

// Force dynamic rendering for all public pages (avoid prerendering issues with client hooks)
export const dynamic = 'force-dynamic';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-EQ3ML3VTCZ"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-EQ3ML3VTCZ');
        `}
      </Script>
      <Header />
      {children}
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Computer Store Kansas',
            description: 'Professional computer repair, diagnostics, virus removal, and protection plans serving Topeka, Kansas since 2003.',
            url: 'https://computerstoreks.com',
            telephone: '785-267-3223',
            email: 'contact@computerstoreks.com',
            address: {
              '@type': 'PostalAddress',
              streetAddress: '2008 SW Gage Blvd',
              addressLocality: 'Topeka',
              addressRegion: 'KS',
              postalCode: '66604',
              addressCountry: 'US',
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: 39.0473,
              longitude: -95.689,
            },
            openingHours: ['Mo-Fr 10:00-18:00', 'Sa 10:00-14:00'],
            foundingDate: '2003',
            founder: {
              '@type': 'Person',
              name: 'Jim Driggers',
            },
            areaServed: {
              '@type': 'City',
              name: 'Topeka',
              addressRegion: 'KS',
              addressCountry: 'US',
            },
            serviceType: [
              'Computer Repair',
              'Virus Removal',
              'Hardware Repair',
              'Computer Diagnostics',
              'Protection Plans',
              'Computer Sales',
            ],
            priceRange: '$',
            paymentAccepted: ['Cash', 'Credit Card'],
            image: 'https://computerstoreks.com/assets/title.png',
            logo: 'https://computerstoreks.com/assets/logo.png',
          }),
        }}
      />
    </>
  );
}
