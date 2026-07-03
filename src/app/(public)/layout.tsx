/**
 * PUBLIC LAYOUT - Wraps all customer-facing pages with the Header,
 * Footer, mobile call button, chat widget, and SEO schema markup.
 *
 * WHEN TO EDIT: When adding or removing site-wide elements that
 * appear on every public page (not admin pages).
 */

import { Header } from '@/components/static/Header';
import { Footer } from '@/components/static/Footer';
import { MobileCallButton } from '@/components/ui/mobile-call-button';
import { ChatWidget } from '@/components/ui/chat-widget';
import { LocalBusinessSchema } from '@/components/seo/json-ld';
import Script from 'next/script';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-KYW0GKH15W"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-KYW0GKH15W');
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
