/**
 * PUBLIC LAYOUT - Wraps all customer-facing pages in the site shell:
 * skip link, sticky header, main landmark, footer, mobile call button,
 * SEO schema, and Google Analytics.
 *
 * The `.site` wrapper class scopes the redesign's font and base
 * typography to the public site only, so the admin panel and slideshow
 * keep their current look.
 *
 * WHEN TO EDIT: When adding or removing site-wide elements that appear
 * on every public page (not admin pages).
 */

import { Header } from '@/components/static/Header';
import { Footer } from '@/components/static/Footer';
import { MobileCallButton } from '@/components/ui/mobile-call-button';
import { LocalBusinessSchema } from '@/components/seo/json-ld';
import Script from 'next/script';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="site flex min-h-screen flex-col font-sans">
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
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      {/* tabindex="-1" so the skip link actually MOVES focus here.
          Without it Chromium only sets the sequential focus navigation
          starting point, which WebKit has historically not honored, and
          this site's mobile traffic skews iOS Safari. The
          `.site :focus-visible` rule paints on keyboard focus only, so
          this adds no outline for mouse users. */}
      <main id="main" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <Footer />
      <MobileCallButton />
      <LocalBusinessSchema />
    </div>
  );
}
