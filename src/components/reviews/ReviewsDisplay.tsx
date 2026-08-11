/**
 * REVIEWS DISPLAY - The /reviews page body: real cached Google reviews
 * rendered as an editorial quote column with hairline rules. Shows the
 * aggregate rating the integration returns, never an invented number.
 *
 * Server Component. The cache read lives in loadCachedReviews(), which
 * the reviews page calls so its hero lede can match the state of the
 * column below it: the page must never promise reviews that are not
 * there. This component brings its own Section wrapper and picks the
 * rhythm per state: standard for the quote column, compact for the
 * empty state so no dead band opens beneath it.
 *
 * The empty state is a designed composition, not a fallback row: the
 * Google listing lockup under a strong hairline, left-aligned like every
 * other band, with exactly one action, since the page's primary CTA
 * ("write a review") already sits a screen above in the hero. It is
 * exported because the homepage proof band renders the same component
 * for the same state.
 *
 * WHEN TO EDIT: When changing how reviews look on the reviews page.
 * Data comes from the google-business cache; do not add other sources.
 */

import { cache } from 'react';
import Link from 'next/link';
import { BUSINESS_INFO } from '@/lib/constants';
import { Section } from '@/components/ui/section';
import { Eyebrow } from '@/components/ui/eyebrow';
import { StarRating, formatReviewDate } from './star-rating';
import { cn } from '@/lib/cn';
import {
  isGoogleBusinessConfigured,
  refreshIfStale,
  selectReviews,
} from '@/lib/google-business';
import type { DisplayReview, ReviewsStats } from '@/types/google-business';

/** How many cached reviews the quote column shows at most. */
const DISPLAY_COUNT = 24;

const QUIET_LINK =
  'inline-flex min-h-[44px] items-center py-2 font-semibold text-brand-deep underline ' +
  'decoration-line-strong underline-offset-4 transition-colors duration-fast ease-brand ' +
  'hover:decoration-brand-deep';

/** Width/offset variations so the quote column reads editorial, never templated. */
const ROW_VARIANTS = ['max-w-[60ch]', 'max-w-[52ch] md:ml-14', 'max-w-[56ch] md:ml-7'] as const;

/** One review as a hairline-ruled quote row with the reviewer's name and real rating. */
function ReviewRow({ review, index }: { review: DisplayReview; index: number }) {
  return (
    <li className="border-t border-line py-9 first:border-t-0 first:pt-0">
      <figure className={cn('m-0', ROW_VARIANTS[index % ROW_VARIANTS.length])}>
        {review.text && (
          <blockquote className="m-0 text-lg leading-relaxed text-body">
            {review.text}
          </blockquote>
        )}
        <figcaption className={cn('flex flex-wrap items-baseline gap-x-4 gap-y-1', review.text && 'mt-4')}>
          <span className="font-bold text-ink">{review.authorName}</span>
          <StarRating rating={review.rating} />
          <span className="text-sm tabular-nums text-muted">{formatReviewDate(review.date)}</span>
        </figcaption>
        {review.reply && (
          <div className="mt-5 border-l border-line-strong pl-5">
            <p className="text-eyebrow uppercase text-muted">
              Reply from the shop
              <span className="ml-3 normal-case tracking-normal tabular-nums">{formatReviewDate(review.reply.date)}</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-body">{review.reply.text}</p>
          </div>
        )}
      </figure>
    </li>
  );
}

/**
 * The designed empty state, in two variants because the same block must
 * not be rendered verbatim on two pages.
 *
 * 'page' is what /reviews shows when nothing is cached: one measure,
 * eyebrow directly above the h2 so the label labels something, and one
 * action. No address block, because a reviews page restating the street
 * address is the visit band's job and the footer's, not this one's.
 *
 * 'home' is the homepage proof band: the same fact, composed as a band
 * with its actions on a hairline foot, and carrying the in-site route to
 * /reviews, which is otherwise reachable only from the footer.
 *
 * No star row and no count is drawn in either variant. The aggregate
 * only exists when the cache holds reviews, and this is the state where
 * it does not, so any number here would be invented.
 */
export function ReviewsEmptyState({
  headingId = 'google-listing-heading',
  variant = 'page',
}: {
  /** Heading id for the band's aria-labelledby, unique per page */
  headingId?: string;
  /** Which surface is rendering this state */
  variant?: 'page' | 'home';
}) {
  const listingLink = (
    <a
      href={BUSINESS_INFO.socialMedia.google}
      target="_blank"
      rel="noopener noreferrer"
      className={QUIET_LINK}
    >
      Read our Google reviews
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );

  if (variant === 'home') {
    return (
      <Section tone="page" rhythm="standard" aria-labelledby={headingId}>
        <Eyebrow>Google reviews</Eyebrow>
        <h2 id={headingId} className="mt-4 max-w-[20ch]">
          What customers tell Google
        </h2>
        <p className="mt-6 max-w-measure text-lede text-body">
          Our reviews live on our Google listing, written by the people we
          did the work for. Read them there, in their own words.
        </p>
        {/* The hairline foot spans the container, so something has to
            live at BOTH ends of it. With all three links packed left,
            the right half of a 1088px rule underlined nothing. The ask
            sits right; the two ways to read sit left. */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-10 gap-y-2 border-t border-line pt-4">
          <div className="flex flex-wrap items-center gap-x-10 gap-y-2">
            {listingLink}
            <Link href="/reviews" className={QUIET_LINK}>
              Our reviews page
            </Link>
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
      </Section>
    );
  }

  return (
    <Section tone="page" rhythm="compact">
      <div className="max-w-[46rem]">
        <Eyebrow>Where they live</Eyebrow>
        <h2 id={headingId} className="mt-4 max-w-[20ch]">
          Read them at the source
        </h2>
        <p className="mt-6 max-w-measure text-lede text-body">
          Every review of the shop sits on our Google listing, in the
          reviewers&apos; own words. Nothing is reprinted here, so open the
          listing and read the lot.
        </p>
        <div className="mt-6">{listingLink}</div>
      </div>
    </Section>
  );
}

/**
 * Reads the cached reviews server-side; null means there is nothing
 * cached and the page should say so. The reviews page calls this too,
 * so its hero lede can match the state of the column below it.
 *
 * Wrapped in React cache() because /reviews now reads it twice per
 * request, once in generateMetadata and once in the page body, and the
 * description and the column must not disagree about state.
 */
export const loadCachedReviews = cache(async function loadCachedReviews(): Promise<{
  reviews: DisplayReview[];
  stats: ReviewsStats;
} | null> {
  if (!isGoogleBusinessConfigured()) return null;
  try {
    const result = await refreshIfStale();
    const reviews = selectReviews(result.reviews, { count: DISPLAY_COUNT });
    if (reviews.length === 0) return null;
    return { reviews, stats: result.stats };
  } catch {
    // Cache unavailable (e.g. local dev without the DB): show the
    // designed Google-listing panel instead of a broken column.
    return null;
  }
})

/**
 * Renders the editorial quote column from the server-side reviews cache,
 * or the designed Google-listing empty state when nothing is cached.
 * No review content is ever invented.
 */
export async function ReviewsDisplay({
  data,
}: {
  /** Pre-loaded cache result, so the page and this column agree on state */
  data: { reviews: DisplayReview[]; stats: ReviewsStats } | null;
}) {
  if (!data) {
    return <ReviewsEmptyState headingId="reviews-listing-heading" />;
  }

  return (
    <Section tone="page" rhythm="standard">
      {/* Aggregate header: only the numbers the integration returns */}
      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 border-b border-line pb-8">
        <span className="text-stamp tabular-nums text-ink">{data.stats.averageRating.toFixed(1)}</span>
        <div>
          <StarRating rating={Math.round(data.stats.averageRating)} className="text-xl" />
          <p className="mt-1 text-sm tabular-nums text-muted">
            From {data.stats.totalCount} Google {data.stats.totalCount === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      </div>

      <ul className="m-0 mt-2 list-none p-0">
        {data.reviews.map((review, index) => (
          <ReviewRow key={review.id} review={review} index={index} />
        ))}
      </ul>
    </Section>
  );
}
