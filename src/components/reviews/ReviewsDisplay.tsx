/**
 * REVIEWS DISPLAY - Shows customer reviews on the /reviews page with
 * star ratings and review text.
 *
 * WHEN TO EDIT: When changing how reviews are displayed or adding new
 * review sources.
 */

'use client';

import { useEffect, useState } from 'react';
import { BUSINESS_INFO } from '@/lib/constants';
import type { DisplayReview } from '@/types/google-business';

interface ReviewsData {
  reviews: DisplayReview[];
  stats: {
    averageRating: number;
    totalCount: number;
  };
}

/**
 * Renders a star rating display using filled/empty star characters.
 *
 * @param rating - Integer rating from 1 to 5
 * @returns Star rating element with aria label for accessibility
 *
 * @called_by ReviewCard, ReviewsDisplay
 *
 * @version 1.0.0 - 2025-06-01T00:00:00Z - Initial implementation
 * @version 1.1.0 - 2026-03-20T00:00:00Z - Migrated from CSS Modules to Tailwind
 */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-2xl" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
        >
          ★
        </span>
      ))}
    </div>
  );
}

/**
 * Formats an ISO date string into a human-readable US English date.
 *
 * @param dateString - ISO 8601 date string
 * @returns Formatted date string (e.g., "January 15, 2024")
 *
 * @called_by ReviewCard
 *
 * @version 1.0.0 - 2025-06-01T00:00:00Z - Initial implementation
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Displays a single customer review card with author info, rating, text, and optional owner reply.
 *
 * @param review - The review data to display
 * @returns Review card element
 *
 * @functions_called StarRating, formatDate
 * @called_by ReviewsDisplay
 *
 * @version 1.0.0 - 2025-06-01T00:00:00Z - Initial implementation
 * @version 1.1.0 - 2026-03-20T00:00:00Z - Migrated from CSS Modules to Tailwind
 */
function ReviewCard({ review }: { review: DisplayReview }) {
  return (
    <div className="bg-white border border-bg-dark rounded-brand-md p-6 transition-shadow duration-normal hover:shadow-brand-md">
      <div className="flex justify-between items-start mb-4 flex-wrap gap-2 max-md:flex-col">
        <div className="flex items-center gap-3">
          {review.authorPhoto ? (
            <img
              src={review.authorPhoto}
              alt={review.authorName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold text-lg">
              {review.authorName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-semibold text-gray-900">{review.authorName}</div>
            <div className="text-sm text-gray-500">{formatDate(review.date)}</div>
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>
      {review.text && <p className="text-gray-700 leading-relaxed m-0">{review.text}</p>}
      {review.reply && (
        <div className="mt-4 p-4 bg-bg-light rounded-brand-sm border-l-[3px] border-l-primary-600">
          <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
            <strong className="text-gray-900 text-sm">Response from owner</strong>
            <span className="text-xs text-gray-500">{formatDate(review.reply.date)}</span>
          </div>
          <p className="m-0 text-[0.9rem] text-gray-700">{review.reply.text}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Renders a skeleton loading state for the reviews section with shimmer animation.
 *
 * @returns Skeleton placeholder elements mimicking the reviews layout
 *
 * @called_by ReviewsDisplay
 *
 * @version 1.0.0 - 2025-06-01T00:00:00Z - Initial implementation
 * @version 1.1.0 - 2026-03-20T00:00:00Z - Migrated from CSS Modules to Tailwind
 */
function ReviewsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col items-center gap-2 mb-8 pb-8 border-b border-bg-dark">
        <div className="w-[120px] h-[48px] rounded bg-gradient-to-r from-bg-dark via-bg-light to-bg-dark bg-[length:200%_100%] animate-bf-shimmer" />
        <div className="w-[150px] h-[24px] rounded bg-gradient-to-r from-bg-dark via-bg-light to-bg-dark bg-[length:200%_100%] animate-bf-shimmer" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white border border-bg-dark rounded-brand-md p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-bg-dark via-bg-light to-bg-dark bg-[length:200%_100%] animate-bf-shimmer" />
              <div>
                <div className="w-[100px] h-4 rounded bg-gradient-to-r from-bg-dark via-bg-light to-bg-dark bg-[length:200%_100%] animate-bf-shimmer" />
                <div className="w-20 h-3 rounded bg-gradient-to-r from-bg-dark via-bg-light to-bg-dark bg-[length:200%_100%] animate-bf-shimmer mt-1" />
              </div>
            </div>
            <div className="w-full h-[60px] rounded bg-gradient-to-r from-bg-dark via-bg-light to-bg-dark bg-[length:200%_100%] animate-bf-shimmer mt-4" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Fetches and displays live Google Business reviews with a loading skeleton.
 *
 * On mount, fetches reviews from the internal API. Shows a skeleton loader
 * while fetching, and renders live review data with aggregate stats when
 * available. If the API is ever unavailable it shows a neutral link to the
 * shop's Google listing rather than any fabricated review content.
 *
 * @returns Reviews display with stats header and review card grid
 *
 * @sideEffects
 * - Fetches from /api/google-business/reviews on mount
 *
 * @functions_called StarRating, ReviewCard, ReviewsSkeleton
 * @called_by ReviewsPage (src/app/(public)/reviews/page.tsx)
 *
 * @version 1.0.0 - 2025-06-01T00:00:00Z - Initial implementation
 * @version 1.1.0 - 2026-03-20T00:00:00Z - Migrated from CSS Modules to Tailwind
 * @version 2.0.0 - 2026-06-09T00:00:00Z - Removed hardcoded fallback reviews; live data only
 */
export function ReviewsDisplay() {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch('/api/google-business/reviews');
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  if (loading) {
    return <ReviewsSkeleton />;
  }

  if (!data || data.reviews.length === 0) {
    return (
      <div className="text-center p-12 text-gray-500">
        <p className="mb-4">See all our customer reviews on Google.</p>
        <a
          href={BUSINESS_INFO.socialMedia.google}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block py-3 px-6 border-2 border-primary-600 text-primary-600 rounded-brand-sm font-semibold no-underline transition-all duration-normal hover:bg-primary-600 hover:text-white"
        >
          Read our Google reviews
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-12 pb-8 border-b border-bg-dark">
        <div className="flex items-center justify-center gap-4 mb-2">
          <span className="text-5xl max-md:text-4xl font-bold text-gray-900">{data.stats.averageRating.toFixed(1)}</span>
          <StarRating rating={Math.round(data.stats.averageRating)} />
        </div>
        <p className="text-gray-500 m-0">
          Based on {data.stats.totalCount} Google {data.stats.totalCount === 1 ? 'review' : 'reviews'}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6">
        {data.reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </>
  );
}
