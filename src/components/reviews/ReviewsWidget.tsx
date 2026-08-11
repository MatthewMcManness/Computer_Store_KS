/**
 * REVIEWS WIDGET - The homepage proof band: real cached Google reviews
 * rendered as quiet hairline-ruled quote rows of varied width, with the
 * aggregate rating, a write-a-review link, and a link to the full
 * /reviews page.
 *
 * Server Component: it reads the reviews cache directly through
 * src/lib/google-business (no HTTP hop, no hydration fetch), so the
 * band arrives painted in the server HTML and never shifts layout.
 *
 * When nothing is cached it renders the SAME designed empty state
 * /reviews uses (ReviewsEmptyState), rather than disappearing. The
 * OAuth refresh token really does lapse, and when it does the shop's
 * strongest credibility asset must not silently vanish from the page
 * most visitors see, leaving a footer link as the only route to it.
 *
 * WHEN TO EDIT: When changing how the homepage shows reviews. Data
 * comes from the google-business cache; do not add other sources.
 */

import Link from 'next/link';
import { BUSINESS_INFO } from '@/lib/constants';
import { Section } from '@/components/ui';
import { ReviewsEmptyState } from './ReviewsDisplay';
import { StarRating, formatReviewDate } from './star-rating';
import { cn } from '@/lib/cn';
import {
  isGoogleBusinessConfigured,
  refreshIfStale,
  selectReviews,
} from '@/lib/google-business';
import type { DisplayReview, ReviewsStats } from '@/types/google-business';

/** Length cap for homepage quotes; the full text lives on /reviews. */
const QUOTE_LIMIT = 220;

/** Width/offset variations so the quote rows read editorial, never templated. */
const ROW_VARIANTS = ['max-w-[58ch]', 'max-w-[48ch] md:ml-16', 'max-w-[54ch] md:ml-8'] as const;

const QUIET_LINK =
  'inline-flex min-h-[44px] items-center py-2 font-semibold text-brand-deep underline ' +
  'decoration-line-strong underline-offset-4 transition-colors duration-fast ease-brand ' +
  'hover:decoration-brand-deep';

interface ReviewsWidgetProps {
  maxReviews?: number;
}

/** Reads the cached reviews server-side; null means render nothing at all. */
async function loadReviews(
  count: number,
): Promise<{ reviews: DisplayReview[]; stats: ReviewsStats } | null> {
  if (!isGoogleBusinessConfigured()) return null;
  try {
    const result = await refreshIfStale();
    const reviews = selectReviews(result.reviews, { count });
    if (reviews.length === 0) return null;
    return { reviews, stats: result.stats };
  } catch {
    // Cache unavailable (e.g. local dev without the DB): fall through to
    // the shared empty state, never a fabricated shell.
    return null;
  }
}

/**
 * Renders the homepage proof band from the server-side reviews cache,
 * falling back to the shared Google-listing empty state when there is
 * nothing cached. Never invents review content or a rating.
 *
 * @param maxReviews - Maximum number of reviews to display (default: 6)
 */
export async function ReviewsWidget({ maxReviews = 6 }: ReviewsWidgetProps) {
  const data = await loadReviews(maxReviews);
  if (!data) return <ReviewsEmptyState headingId="home-google-listing" variant="home" />;
  const { reviews, stats } = data;

  return (
    <Section tone="page" rhythm="standard">
      {/* Header: heading, live aggregate, write-a-review link */}
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <p className="text-eyebrow uppercase text-brand-deep">Google reviews</p>
          <h2 className="mt-3">What customers tell Google</h2>
          <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm tabular-nums text-muted">
            <StarRating rating={Math.round(stats.averageRating)} />
            <span>
              {stats.averageRating.toFixed(1)} from {stats.totalCount} reviews
            </span>
          </p>
        </div>
        <a
          href={BUSINESS_INFO.socialMedia.googleReview}
          target="_blank"
          rel="noopener noreferrer"
          className={QUIET_LINK}
        >
          Write a review
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>

      {/* Quote rows of varied width */}
      <ul className="m-0 mt-10 list-none p-0">
        {reviews.map((review, index) => {
          const truncated = review.text && review.text.length > QUOTE_LIMIT;
          return (
            <li key={review.id} className="border-t border-line py-8">
              <figure className={cn('m-0', ROW_VARIANTS[index % ROW_VARIANTS.length])}>
                {review.text && (
                  <blockquote className="m-0 text-lg leading-relaxed text-body">
                    {truncated ? `${review.text.substring(0, QUOTE_LIMIT)}...` : review.text}
                    {truncated && (
                      <Link
                        href="/reviews"
                        className="ml-2 font-semibold text-brand-deep underline decoration-line-strong underline-offset-4 hover:decoration-brand-deep"
                      >
                        Read the rest
                      </Link>
                    )}
                  </blockquote>
                )}
                <figcaption
                  className={cn('flex flex-wrap items-baseline gap-x-4 gap-y-1', review.text && 'mt-3')}
                >
                  <span className="font-bold text-ink">{review.authorName}</span>
                  <StarRating rating={review.rating} className="text-sm" />
                  <span className="text-sm tabular-nums text-muted">{formatReviewDate(review.date, 'short')}</span>
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>

      {/* Both ends of the closing hairline carry a link, so the rule
          never runs half a container into nothing. */}
      <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-2 border-t border-line pt-6">
        <Link href="/reviews" className={QUIET_LINK}>
          Read all reviews
        </Link>
        <a
          href={BUSINESS_INFO.socialMedia.google}
          target="_blank"
          rel="noopener noreferrer"
          className={QUIET_LINK}
        >
          Read them on Google
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </Section>
  );
}
