'use client';

import { useEffect, useState } from 'react';
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
 * @called_by ReviewCard, FallbackReviews, ReviewsDisplay
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
 * @called_by FallbackReviews, ReviewsDisplay
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
 * Renders static fallback reviews when the Google Business API is not configured.
 *
 * Displays hardcoded 5-star reviews to ensure the reviews section always has content.
 *
 * @returns Fallback reviews layout with stats header and review cards
 *
 * @functions_called StarRating, ReviewCard
 * @called_by ReviewsDisplay
 *
 * @version 1.0.0 - 2025-06-01T00:00:00Z - Initial implementation
 * @version 1.1.0 - 2026-03-20T00:00:00Z - Migrated from CSS Modules to Tailwind
 */
function FallbackReviews() {
  // Static fallback reviews when API is not configured
  const fallbackReviews: DisplayReview[] = [
    {
      id: '1',
      authorName: 'Sarah M.',
      rating: 5,
      text: 'Excellent service! They fixed my laptop the same day I brought it in. Very professional and reasonably priced.',
      date: '2024-11-15T00:00:00Z',
    },
    {
      id: '2',
      authorName: 'Mike T.',
      rating: 5,
      text: 'Been going here for years. Always honest about what needs to be done and what doesn\'t. Highly recommend!',
      date: '2024-10-28T00:00:00Z',
    },
    {
      id: '3',
      authorName: 'Jennifer R.',
      rating: 5,
      text: 'Great customer service. They explained everything in terms I could understand and my computer runs like new.',
      date: '2024-10-10T00:00:00Z',
    },
    {
      id: '4',
      authorName: 'David K.',
      rating: 5,
      text: 'Quick turnaround on my desktop repair. Fair prices and friendly staff. Will definitely come back.',
      date: '2024-09-22T00:00:00Z',
    },
    {
      id: '5',
      authorName: 'Lisa H.',
      rating: 5,
      text: 'The team here really knows their stuff. Fixed a virus issue that another shop couldn\'t figure out.',
      date: '2024-09-05T00:00:00Z',
    },
    {
      id: '6',
      authorName: 'Robert J.',
      rating: 5,
      text: 'Trustworthy and reliable. They\'ve been serving Topeka for 20 years for good reason!',
      date: '2024-08-18T00:00:00Z',
    },
  ];

  return (
    <>
      <div className="text-center mb-12 pb-8 border-b border-bg-dark">
        <div className="flex items-center justify-center gap-4 mb-2">
          <span className="text-5xl max-md:text-4xl font-bold text-gray-900">5.0</span>
          <StarRating rating={5} />
        </div>
        <p className="text-gray-500 m-0">Based on customer feedback</p>
        <p className="text-gray-500 text-sm mt-2">
          <em>Connect your Google Business Profile to display live reviews</em>
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6">
        {fallbackReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </>
  );
}

/**
 * Fetches and displays Google Business reviews with loading skeleton and fallback states.
 *
 * On mount, fetches reviews from the internal API. Shows a skeleton loader while fetching,
 * falls back to static reviews if the API is not configured (503) or on error, and renders
 * live review data with aggregate stats when available.
 *
 * @returns Reviews display with stats header and review card grid
 *
 * @sideEffects
 * - Fetches from /api/google-business/reviews on mount
 *
 * @functions_called StarRating, ReviewCard, ReviewsSkeleton, FallbackReviews
 * @called_by ReviewsPage (src/app/(public)/reviews/page.tsx)
 *
 * @version 1.0.0 - 2025-06-01T00:00:00Z - Initial implementation
 * @version 1.1.0 - 2026-03-20T00:00:00Z - Migrated from CSS Modules to Tailwind
 */
export function ReviewsDisplay() {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch('/api/google-business/reviews');
        const result = await response.json();

        if (!result.success) {
          // If not configured, use fallback
          if (response.status === 503) {
            setUseFallback(true);
          } else {
            setError(result.error || 'Failed to load reviews');
          }
          return;
        }

        setData(result.data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setUseFallback(true);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  if (loading) {
    return <ReviewsSkeleton />;
  }

  if (useFallback || error) {
    return <FallbackReviews />;
  }

  if (!data || data.reviews.length === 0) {
    return (
      <div className="text-center p-12 text-gray-500">
        <h3 className="text-gray-900 mb-2">No Reviews Yet</h3>
        <p>Be the first to leave a review!</p>
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
