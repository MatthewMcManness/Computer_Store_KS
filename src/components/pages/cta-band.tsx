/**
 * CTA BAND - The closing band on every public page. One component, two
 * layouts: 'stacked' (heading over the CTA row) and 'split' (heading
 * left, CTA row right).
 *
 * TONE: this band is LIGHT, on the tinted neutral surface, and the navy
 * footer follows it. Both used to be navy at the same value with no edge
 * between them, which merged the closing CTA into the footer and left a
 * 900px navy slab. The tonal step is what gives the closing CTA its
 * emphasis, so do not paint this band navy.
 *
 * WHEN TO EDIT: When changing how the closing call-to-action looks. The
 * phone number itself lives in src/lib/constants.ts.
 */

import { Section } from '@/components/ui/section';
import { PhoneLink } from '@/components/ui/phone-link';
import { CTALink } from '@/components/ui/cta-link';
import { cn } from '@/lib/cn';

interface CTABandProps {
  /** Section heading, rendered as the page's closing h2 */
  title: string;
  /** One supporting sentence under the heading */
  line?: string;
  /** Secondary link target; defaults to the contact form */
  secondaryHref?: string;
  /** Secondary link text; defaults to "Send us a message" */
  secondaryLabel?: string;
  /** 'stacked' (default) or 'split' for a heading-left, CTA-right band */
  layout?: 'stacked' | 'split';
  /** Optional id for the heading, when the page labels the section by it */
  headingId?: string;
  /** Extra content rendered under the CTA row, e.g. related-service links */
  children?: React.ReactNode;
}

/** Renders the closing CTA band: call button first, quiet link second. */
export function CTABand({
  title,
  line,
  secondaryHref = '/contact',
  secondaryLabel = 'Send us a message',
  layout = 'stacked',
  headingId,
  children,
}: CTABandProps) {
  const split = layout === 'split';

  return (
    <Section
      tone="surface"
      rhythm="standard"
      aria-labelledby={headingId}
      className="border-t border-line"
      containerClassName={
        split ? 'grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:gap-12' : undefined
      }
    >
      <div className={split ? undefined : 'max-w-3xl'}>
        <h2 id={headingId} className="max-w-[26ch] text-balance">
          {title}
        </h2>
        {line ? <p className="mt-4 max-w-measure text-lede text-body">{line}</p> : null}
      </div>
      <div className={cn('flex flex-wrap items-center gap-x-8 gap-y-4', !split && 'mt-8')}>
        <PhoneLink variant="button" label="Call" />
        {/^https?:/.test(secondaryHref) ? (
          <a
            href={secondaryHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center px-1 py-2 font-semibold text-brand-deep underline decoration-line-strong underline-offset-4 transition-colors duration-fast ease-brand hover:decoration-brand-deep"
          >
            {secondaryLabel}
          </a>
        ) : (
          <CTALink href={secondaryHref} variant="quiet">
            {secondaryLabel}
          </CTALink>
        )}
      </div>
      {children ? <div className={split ? 'md:col-span-2' : undefined}>{children}</div> : null}
    </Section>
  );
}
