/**
 * SITE FOOTER - The navy band at the bottom of every public page.
 * Full sitemap nav, real hours/address/phone from constants.ts,
 * partner links, and the copyright line.
 *
 * WHEN TO EDIT: When adding pages to the sitemap or changing partner
 * or legal links. Store hours, phone, address, and the business name
 * live in src/lib/constants.ts; the copyright line renders from
 * BUSINESS_INFO.name so the footer never disagrees with itself.
 */

import Link from 'next/link';
import { Phone } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';
import { PlaqueRule } from '@/components/ui/plaque-rule';

const SITEMAP = [
  { href: '/', label: 'Home' },
  { href: '/silver-plan', label: 'Silver Plan' },
  { href: '/services', label: 'Services' },
  { href: '/computers', label: 'Computers' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/shop', label: 'Online Catalog' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/why-linux', label: 'Why Linux' },
] as const;

const LEGAL = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Use' },
] as const;

const PARTNERS = [
  { href: 'https://topekaphonerepair.com', label: 'Phone Repair' },
  { href: 'https://resilientwebsolutions.com', label: 'Website Help' },
] as const;

const TEL_HREF = `tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`;

/** Renders the site footer: visit info, sitemap, partners, copyright. */
export function Footer() {
  return (
    <footer className="bg-brand-navy pb-28 text-tint md:pb-0">
      {/* The machined edge that seats the navy footer under the light
          closing CTA band. Without it the two backgrounds meet with no
          transition and the closing CTA reads as another footer column.
          This is the ONE sanctioned use of the plaque hairline; section
          transitions are the circuit divider. */}
      <PlaqueRule variant="edge" width="full" />
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 md:py-20">
        {/* Two columns, not three. A third column holding only the two
            partner links left roughly a quarter of the footer as empty
            navy on every page. The nav now runs its nine pages across
            two sub-columns and the partners sit beneath them, so the
            right side fills to the same depth as the visit block. */}
        <div className="grid gap-12 md:grid-cols-[1.4fr_1.6fr] md:gap-16">
          {/* Visit the shop */}
          <div>
            <p className="text-eyebrow uppercase text-tint/60">Visit the shop</p>
            <p className="mt-3 text-title-sm text-page">{BUSINESS_INFO.name}</p>
            <address className="mt-4 not-italic leading-relaxed text-tint/90">
              {BUSINESS_INFO.addressLine1}
              <br />
              {BUSINESS_INFO.city}, {BUSINESS_INFO.state} {BUSINESS_INFO.zip}
            </address>
            <a
              href={TEL_HREF}
              aria-label={`Call ${BUSINESS_INFO.name} at ${BUSINESS_INFO.phoneFormatted}`}
              className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-brand px-5 py-2.5 font-bold tabular-nums text-page no-underline transition-colors duration-fast ease-brand hover:bg-brand-deep"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {BUSINESS_INFO.phoneFormatted}
            </a>
            <ul className="mt-5 space-y-1 tabular-nums text-tint/80">
              {BUSINESS_INFO.hours.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          {/* Sitemap over two sub-columns, partners beneath */}
          <div>
            <nav aria-label="Footer">
              <p className="text-eyebrow uppercase text-tint/60">Pages</p>
              <ul className="mt-3 grid gap-x-10 sm:grid-cols-2">
                {SITEMAP.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="inline-flex min-h-[44px] min-w-[44px] items-center py-2 text-tint/90 no-underline transition-colors duration-fast ease-brand hover:text-page hover:underline hover:underline-offset-4"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <p className="mt-8 text-eyebrow uppercase text-tint/60">Partners</p>
            <ul className="mt-3 flex flex-wrap gap-x-10">
              {PARTNERS.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center py-2 text-tint/90 no-underline transition-colors duration-fast ease-brand hover:text-page hover:underline hover:underline-offset-4"
                  >
                    {label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-x-8 gap-y-2 border-t border-page/15 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="flex min-h-[44px] items-center text-sm text-tint/80">
            &copy; {new Date().getFullYear()} {BUSINESS_INFO.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6">
            {LEGAL.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center text-sm text-tint/70 no-underline transition-colors duration-fast ease-brand hover:text-page hover:underline hover:underline-offset-4"
                >
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/admin"
                className="inline-flex min-h-[44px] min-w-[44px] items-center text-sm text-tint/60 no-underline transition-colors duration-fast ease-brand hover:text-page hover:underline hover:underline-offset-4"
              >
                Employee Login
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
