/**
 * STAR RATING - The one star row the site draws, plus the one date
 * formatter the review surfaces use. Both were duplicated verbatim in
 * ReviewsDisplay and ReviewsWidget; the accessible name is constructed
 * here so a change to the star semantics can only be made once.
 *
 * Stars render in brand blue. The brief reserves gold for the price
 * stamp, so a review star is never gold.
 *
 * WHEN TO EDIT: When the star treatment, its accessible name, or the
 * review date format changes.
 */

import { cn } from '@/lib/cn';

interface StarRatingProps {
  /** Whole-star rating, 1 to 5, straight from the Google payload */
  rating: number;
  /** Extra classes, used to set the star size per surface */
  className?: string;
}

/** Renders a five-star row with the real rating filled in brand blue. */
export function StarRating({ rating, className }: StarRatingProps) {
  return (
    <span
      className={cn('inline-flex gap-0.5 text-base leading-none', className)}
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          aria-hidden="true"
          className={star <= rating ? 'text-brand' : 'text-line-strong'}
        >
          ★
        </span>
      ))}
    </span>
  );
}

/**
 * Formats an ISO date string as a plain US date.
 *
 * @param dateString - ISO date from the reviews cache
 * @param style - 'long' gives "January 15, 2026", 'short' gives "Jan 15, 2026"
 */
export function formatReviewDate(dateString: string, style: 'long' | 'short' = 'long'): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    day: 'numeric',
  });
}
