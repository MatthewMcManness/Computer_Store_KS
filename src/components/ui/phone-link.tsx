/**
 * PHONE LINK - The primary CTA everywhere on the public site: a
 * click-to-call tel: link showing the real store number from
 * BUSINESS_INFO. Three variants:
 *   'button'  - brand blue call button (default)
 *   'inverse' - light call button for navy bands
 *   'inline'  - plain text link inside a sentence
 *   'display' - the giant number for the contact page
 * Numerals are always tabular.
 *
 * WHEN TO EDIT: When changing call-CTA styling. The number itself
 * lives in src/lib/constants.ts, never here.
 */

import { Phone } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';
import { cn } from '@/lib/cn';

type PhoneVariant = 'button' | 'inverse' | 'inline' | 'display';

interface PhoneLinkProps {
  variant?: PhoneVariant;
  /** Optional text before the number on button variants, e.g. "Call" */
  label?: string;
  className?: string;
}

const TEL_HREF = `tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`;
const ARIA = `Call ${BUSINESS_INFO.name} at ${BUSINESS_INFO.phoneFormatted}`;

/** Renders a click-to-call tel: link with the store's real phone number. */
export function PhoneLink({ variant = 'button', label, className }: PhoneLinkProps) {
  if (variant === 'inline') {
    return (
      <a
        href={TEL_HREF}
        aria-label={ARIA}
        className={cn(
          'font-semibold tabular-nums text-brand-deep underline decoration-line-strong underline-offset-4 hover:decoration-brand-deep',
          className
        )}
      >
        {BUSINESS_INFO.phoneFormatted}
      </a>
    );
  }

  if (variant === 'display') {
    return (
      <a
        href={TEL_HREF}
        aria-label={ARIA}
        /* min-h + padding, not leading alone: the display type sets with
           leading-none, which collapses the hit box to the glyph height
           and puts this standalone CTA under the 44px touch-target law. */
        className={cn(
          'inline-flex min-h-[44px] items-center py-1 text-stamp tabular-nums text-ink no-underline transition-colors duration-normal ease-brand hover:text-brand-deep',
          className
        )}
      >
        {BUSINESS_INFO.phoneFormatted}
      </a>
    );
  }

  const inverse = variant === 'inverse';
  return (
    <a
      href={TEL_HREF}
      aria-label={ARIA}
      className={cn(
        'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-6 py-3 font-bold tabular-nums no-underline transition-colors duration-normal ease-brand',
        inverse ? 'bg-page text-brand-deep hover:bg-tint' : 'bg-brand text-page hover:bg-brand-deep',
        className
      )}
    >
      <Phone className="h-4 w-4" aria-hidden="true" />
      {label ? <span>{label}</span> : null}
      <span>{BUSINESS_INFO.phoneFormatted}</span>
    </a>
  );
}
