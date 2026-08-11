/**
 * GLOBAL ERROR PAGE - The last-resort screen, shown when the root layout
 * itself fails. It replaces the root layout, so it renders its own
 * <html> and <body> and it cannot count on globals.css or the Archivo
 * font having loaded: everything here is inline, which is the one place
 * on this site where that is correct.
 *
 * The values below are the redesign tokens written out by hand (the
 * OKLCH sources live in src/app/globals.css :root, mirrored as Tailwind
 * names in tailwind.config.js). Keep them in step with those files; do
 * not introduce a color that is not one of them.
 *
 * WHEN TO EDIT: Rarely. Change it when the brand palette changes, or
 * when the copy should point somewhere else.
 */
'use client';

import { useEffect } from 'react';
import { BUSINESS_INFO } from '@/lib/constants';

/* Hand-written mirrors of the brand tokens. Inline because this screen
   renders with no stylesheet guaranteed. */
const TOKENS = {
  page: '#fbfcfe',
  ink: '#12162b',
  body: '#3a4059',
  muted: '#626a86',
  brand: '#0863fd',
  brandDeep: '#0546c4',
  line: '#dbdfec',
};

const FONT = 'Archivo, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const TEL_HREF = `tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: FONT,
          background: TOKENS.page,
          color: TOKENS.body,
          lineHeight: 1.65,
        }}
      >
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            padding: '4rem 1.25rem',
          }}
        >
          <div style={{ width: '100%', maxWidth: '44rem', margin: '0 auto' }}>
            <p
              style={{
                margin: 0,
                fontSize: '0.8rem',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: TOKENS.brandDeep,
              }}
            >
              {BUSINESS_INFO.name}
            </p>
            <h1
              style={{
                margin: '1rem 0 0',
                fontSize: 'clamp(2rem, 1.4rem + 2.6vw, 2.75rem)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                color: TOKENS.ink,
              }}
            >
              The site is having a problem
            </h1>
            <p style={{ margin: '1.25rem 0 0', fontSize: '1.125rem', maxWidth: '48ch' }}>
              Try loading it again. If it still will not come up, call the shop at{' '}
              {BUSINESS_INFO.phoneFormatted} and we will take care of you over the phone.
            </p>
            <div
              style={{
                height: '1px',
                background: TOKENS.line,
                margin: '2.5rem 0',
              }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={reset}
                style={{
                  minHeight: '44px',
                  padding: '0.75rem 1.5rem',
                  background: TOKENS.brand,
                  color: TOKENS.page,
                  border: 'none',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Try again
              </button>
              <a
                href={TEL_HREF}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  minHeight: '44px',
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  color: TOKENS.brandDeep,
                }}
              >
                Call {BUSINESS_INFO.phoneFormatted}
              </a>
              <a
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  minHeight: '44px',
                  fontWeight: 600,
                  color: TOKENS.brandDeep,
                }}
              >
                Back to the homepage
              </a>
            </div>
            <p style={{ margin: '2.5rem 0 0', fontSize: '0.9rem', color: TOKENS.muted }}>
              {BUSINESS_INFO.addressLine1}, {BUSINESS_INFO.city}, {BUSINESS_INFO.state}
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
