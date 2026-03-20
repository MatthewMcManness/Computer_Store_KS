import { Header } from '@/components/static/Header';
import { Footer } from '@/components/static/Footer';
import { MobileCallButton } from '@/components/ui/mobile-call-button';
import { ChatWidget } from '@/components/ui/chat-widget';
import { LocalBusinessSchema } from '@/components/seo/json-ld';
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
      <MobileCallButton />
      <ChatWidget />
      <LocalBusinessSchema />
    </>
  );
}
