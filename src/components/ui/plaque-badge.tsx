/**
 * PLAQUE BADGE - Signature moment 1: the real csk-logo.svg on the silver
 * plaque. The printed nameplate of the brand.
 *
 * FLAT ON PURPOSE. The plate used to carry a drop shadow, an inset
 * bevel pair, a milled groove ring and a carved drop-shadow filter on
 * the mark itself. At 62px on a near-white header that stack of lighting
 * cues read as a chrome button, which is the first thing a design
 * director flags. The ground, the hairline edge and the corner radius
 * are the whole treatment now (.silver-plaque in globals.css). The mark
 * is untouched: never redraw or substitute csk-logo.svg.
 *
 * Used in the site header, at nameplate scale, and nowhere else. The
 * plaque treatment's only other sanctioned use is the Silver plan name
 * treatment (src/components/silver/plan-hero.tsx), which carves the word
 * SILVER rather than repeating this logo. A `hero` size used to live
 * here for that job and had no callers; the gradient does not survive
 * being scaled up, so the size is gone rather than left as a trap.
 *
 * PADDING IS THE LOGO'S BUDGET. The mark is a two-line lockup and the
 * second line, STORE KS, sets at roughly an eighth of the mark's height.
 * The badge used to spend 34 of its 114px on padding, which left the
 * logo 80px wide and STORE KS about 5px tall: unreadable at 1x. The
 * padding is now the minimum the asset tolerates (it carries an embedded
 * low-resolution raster whose outline rings slightly, so the mark still
 * clears the inner hairline rather than butting a noisy edge against a
 * metal gradient) and the rest of the allowance goes to the mark. Swap
 * the asset for a clean vector when Max provides one; do not redraw it.
 *
 * WHEN TO EDIT: When adjusting the plaque sizing. The gradient itself
 * lives in globals.css (.silver-plaque) and is locked.
 */

import Image from 'next/image';
import { BUSINESS_INFO } from '@/lib/constants';
import { cn } from '@/lib/cn';

interface PlaqueBadgeProps {
  /** Set true when the badge sits inside a link that already has a label */
  decorative?: boolean;
  className?: string;
}

/** Renders the real store logo on the silver plaque. */
export function PlaqueBadge({ decorative = false, className }: PlaqueBadgeProps) {
  return (
    <span
      className={cn(
        'silver-plaque inline-flex items-center justify-center rounded-[10px] px-2.5 py-2',
        className
      )}
    >
      <Image
        src="/assets/csk-logo.svg"
        alt={decorative ? '' : BUSINESS_INFO.name}
        width={504}
        height={227}
        priority
        className="h-11 w-auto"
      />
    </span>
  );
}
