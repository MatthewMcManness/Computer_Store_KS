/**
 * PRICE STAMP - Signature moment 3: the fixed-price marker. Big tabular
 * numeral, superscript dollar sign, a gold notched-tag corner (the ONLY
 * gold on the element), and a small caps caption.
 *
 * Rules from the brief: it marks fixed, honest prices ONLY. Never place
 * it next to a variable or estimated price. At most two gold occurrences
 * per viewport.
 *
 * TWO SANCTIONED TREATMENTS, and no others. A signature that changes
 * scale, container, and placement every time it appears stops reading as
 * a signature:
 *   1. FEATURE - size 'lg', layout 'row', inside a raised white panel
 *      (rounded-brand-md bg-page px-5 py-4 shadow-raised). Used by the
 *      homepage hero and the service pages' "What it costs" band.
 *   2. COMPACT - size 'sm', layout 'stack', bare, left-aligned under the
 *      row it prices. Used by index rows: the homepage repair index and
 *      the /services list.
 * Do not invent a third.
 *
 * THE NOTCH. It is a cut in the tag, so it has to be part of an edge.
 * Anchoring it to the numeral's line box put a triangle in mid-air above
 * and to the right of the "0", touching nothing, and it read as a stray
 * yellow artifact. It now sits on the top-right corner of the numeral
 * block's own tag ground: the ground is clipped away on that corner and
 * the gold fills the cut, so the two edges are continuous and the gold
 * is geometry. Every dimension is in `em` off the numeral, so the cut
 * scales with cap height at both sizes with no second set of numbers.
 *
 * WHEN TO EDIT: When changing how fixed prices are displayed site-wide.
 */

import { cn } from '@/lib/cn';

interface PriceStampProps {
  /** Whole-dollar amount, e.g. 50 */
  amount: number;
  /** Caption under the numeral, e.g. "diagnostic, applies toward your repair" */
  caption: string;
  /** 'lg' for the hero/detail stamp, 'sm' for service index rows */
  size?: 'lg' | 'sm';
  /** 'stack' puts the caption under the numeral; 'row' sets them on one optical axis */
  layout?: 'stack' | 'row';
  className?: string;
}

/** Renders the gold-notched fixed-price stamp with a tabular numeral. */
export function PriceStamp({
  amount,
  caption,
  size = 'lg',
  layout = 'stack',
  className,
}: PriceStampProps) {
  const large = size === 'lg';
  const row = layout === 'row';
  return (
    <div
      className={cn(
        'inline-flex min-w-0',
        row ? 'flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5' : 'flex-col',
        !row && (large ? 'gap-2' : 'gap-1'),
        className
      )}
    >
      {/* The tag. The ground layer's top-right corner is cut away and the
          gold wedge fills the cut exactly, so the two edges read as one
          continuous edge. They are SIBLING layers, not parent and child:
          a clip-path clips its descendants too, so a wedge nested inside
          the clipped ground is clipped straight back out of existence.
          The type step lives on this box rather than on the digits, so
          every `em` below scales off the numeral at both sizes.

          TWO SIZES, TWO NOTCHES. A single 0.26em cut is right on the
          feature stamp and wrong on the compact one: at 6px on a 53px
          tile it read as a stray yellow speck floating above the zero
          rather than as a corner taken out of a tag. The compact notch
          is nearly double, so the cut lands as a corner taken out of a
          tag at both sizes.

          THE GROUND SHRINK-WRAPS AT BOTH SIZES. The compact ground used
          to run `w-full`, which meant the caption's width: measured on
          the homepage repair index it spanned 249px while the numeral
          inside it occupied 29px, so the "tag" was a near-empty grey
          slab with a small number parked at its left end. A tag is the
          size of what it prices. */}
      <span
        style={{ '--notch': large ? '0.26em' : '0.46em' } as React.CSSProperties}
        className={cn(
          'relative inline-flex w-fit shrink-0 items-start',
          large ? 'px-3 pb-1.5 pt-2 text-stamp' : 'px-2.5 pb-1.5 pt-2 text-title-sm tracking-normal'
        )}
      >
        {/* The hairline is what makes the ground a TAG. `surface` sits
            barely a point off `wash`, so on the homepage repair index
            the ground was invisible and the notch read as a stray gold
            speck beside the numeral with no edge to be cut out of. The
            border is on the clipped layer, so the notch cuts through it
            and the gold wedge finishes that edge. */}
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-brand-sm border border-line bg-surface [clip-path:polygon(0_0,calc(100%-var(--notch))_0,100%_var(--notch),100%_100%,0_100%)]"
        />
        <span
          aria-hidden="true"
          className="absolute right-0 top-0 h-[var(--notch)] w-[var(--notch)] bg-accent [clip-path:polygon(0_0,100%_0,100%_100%)]"
        />
        {/* `relative` on the type: the ground and the wedge are
            positioned siblings, so unpositioned text would paint under
            them. */}
        <span
          className={cn(
            'relative font-extrabold text-ink',
            large ? 'mt-2 text-lg leading-none' : 'mt-1 text-sm leading-none'
          )}
          aria-hidden="true"
        >
          $
        </span>
        <span className="sr-only">{amount} dollars,</span>
        <span className="relative tabular-nums text-ink" aria-hidden="true">
          {amount}
        </span>
      </span>
      {/* The caption's cap is set just past its own wrap width, not a
          round number well beyond it. A flex item takes its max-width
          whenever its max-content width exceeds it, so every pixel of
          headroom here becomes empty panel: at 15rem the two caps lines
          measured 175px and 178px inside a 240px box and the feature
          panel inherited all 62px of that slack. */}
      <span
        className={cn(
          'text-eyebrow uppercase text-muted',
          row && 'min-w-0 max-w-[12.5rem] sm:border-l sm:border-line-strong sm:pl-5'
        )}
      >
        {caption}
      </span>
    </div>
  );
}
