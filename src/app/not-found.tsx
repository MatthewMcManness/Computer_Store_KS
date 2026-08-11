/**
 * NOT FOUND PAGE - The branded 404. Renders inside the root layout
 * (outside the public shell), so it assembles its own `.site` shell:
 * skip link, the real Header and Footer, and the mobile call button,
 * keeping global navigation and click-to-call on dead links. Plain and
 * useful: one sentence, links back to home, services, and contact, and
 * the phone number. The plaque rule is the only decoration.
 *
 * WHEN TO EDIT: When changing the 404 copy or where it points people.
 */

import type { Metadata } from 'next';
import { Header } from '@/components/static/Header';
import { Footer } from '@/components/static/Footer';
import { MobileCallButton } from '@/components/ui/mobile-call-button';
import { Eyebrow } from '@/components/ui/eyebrow';
import { PlaqueRule } from '@/components/ui/plaque-rule';
import { CTALink } from '@/components/ui/cta-link';
import { PhoneLink } from '@/components/ui/phone-link';
import { BUSINESS_INFO } from '@/lib/constants';

export const metadata: Metadata = {
  // The root layout template appends the site name; a bare title here
  // avoids "… | Computer Store Kansas | Computer Store Kansas".
  title: 'Page not found',
};

export default function NotFound() {
  return (
    <div className="site flex min-h-screen flex-col bg-page font-sans">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      {/* tabindex="-1" for the same reason as the public shell: the skip
          link has to move focus, not just hint at it. */}
      <main id="main" tabIndex={-1} className="flex flex-1 items-center">
        <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
          <Eyebrow>{BUSINESS_INFO.name}</Eyebrow>
          <h1 className="mt-4">That page is not here</h1>
          <p className="mt-5 max-w-measure text-lg">
            The link may be old, or the address was mistyped. Everything the shop offers
            is one click or one call away.
          </p>
          <PlaqueRule width="full" className="my-10" />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <CTALink href="/" variant="primary">
              Back to the homepage
            </CTALink>
            <CTALink href="/services" variant="quiet">
              What we fix
            </CTALink>
            <CTALink href="/contact" variant="quiet">
              Contact the shop
            </CTALink>
          </div>
          <div className="mt-10">
            <PhoneLink variant="inline" />
          </div>
        </div>
      </main>
      <Footer />
      <MobileCallButton />
    </div>
  );
}
