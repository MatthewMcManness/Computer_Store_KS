/**
 * ERROR PAGE - The route error boundary. It renders in place of the
 * public shell, so like not-found.tsx it assembles its own `.site`
 * wrapper: skip link, the real Header and Footer, and the mobile call
 * button, which keeps navigation and click-to-call working on a page
 * that is otherwise a dead end.
 *
 * Styling is the redesign token system, not the framework default it
 * shipped with (a red 4rem "Error" and two #0366d6 pills). The retry
 * button is a real control, so it is a <button> styled like the site's
 * primary CTA rather than a link that looks like one.
 *
 * WHEN TO EDIT: When changing the error copy or where it points people.
 * The phone number lives in src/lib/constants.ts.
 */
'use client';

import { useEffect } from 'react';
import { Header } from '@/components/static/Header';
import { Footer } from '@/components/static/Footer';
import { MobileCallButton } from '@/components/ui/mobile-call-button';
import { Eyebrow } from '@/components/ui/eyebrow';
import { PlaqueRule } from '@/components/ui/plaque-rule';
import { CTALink } from '@/components/ui/cta-link';
import { PhoneLink } from '@/components/ui/phone-link';
import { BUSINESS_INFO } from '@/lib/constants';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

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
          <h1 className="mt-4">This page did not load</h1>
          <p className="mt-5 max-w-measure text-lg">
            Something went wrong on our end. Try it again, and if it still will not load,
            call the shop and we will help you from there.
          </p>
          <PlaqueRule width="full" className="my-10" />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 font-bold text-page transition-colors duration-normal ease-brand hover:bg-brand-deep"
            >
              Try again
            </button>
            <CTALink href="/" variant="quiet">
              Back to the homepage
            </CTALink>
            <CTALink href="/services" variant="quiet">
              What we fix
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
