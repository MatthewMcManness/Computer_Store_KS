/**
 * CTA LINK - The site's link-styled-as-button. Three variants:
 * 'primary' (brand blue fill), 'inverse' (light fill for navy bands),
 * and 'quiet' (plain text link with arrow). All meet the 44px touch
 * target and focus-ring laws.
 *
 * The click-to-call CTA has its own component (PhoneLink); use this
 * for internal links like "See the Silver plan".
 *
 * WHEN TO EDIT: When changing button styling site-wide.
 */

import Link from 'next/link';
import { cn } from '@/lib/cn';

type CTAVariant = 'primary' | 'inverse' | 'quiet';

interface CTALinkProps {
  href: string;
  variant?: CTAVariant;
  className?: string;
  children: React.ReactNode;
}

const BASE =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg font-bold no-underline ' +
  'transition-colors duration-normal ease-brand';

const VARIANTS: Record<CTAVariant, string> = {
  primary: 'bg-brand px-6 py-3 text-page hover:bg-brand-deep',
  inverse: 'bg-page px-6 py-3 text-brand-deep hover:bg-tint',
  quiet: 'px-1 py-2 font-semibold text-brand-deep underline decoration-line-strong underline-offset-4 hover:decoration-brand-deep',
};

/** Renders an internal or external link styled as a brand CTA. */
export function CTALink({ href, variant = 'primary', className, children }: CTALinkProps) {
  const external = /^https?:/.test(href);
  const classes = cn(BASE, VARIANTS[variant], className);

  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
