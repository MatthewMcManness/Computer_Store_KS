/**
 * REVIEWS WIDGET - Compact review summary shown on other pages (like
 * the homepage) to highlight customer ratings.
 *
 * WHEN TO EDIT: When changing the review summary design or which pages
 * show it.
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { BUSINESS_INFO } from '@/lib/constants';
import type { DisplayReview } from '@/types/google-business';

/**
 * Renders a row of star icons representing a rating out of 5.
 *
 * @param rating - The numeric rating value (1-5) to display as filled stars
 * @returns A flex row of star characters colored gold (filled) or gray (empty)
 *
 * @param isCardStar - When true, renders with smaller text and centered justify for use inside review cards
 *
 * @called_by ReviewsWidget
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 * @version 1.1.0 - 2026-03-20T00:00:00Z - Converted from CSS Modules to Tailwind
 */
function StarRating({ rating, isCardStar = false }: { rating: number; isCardStar?: boolean }) {
  return (
    <div
      className={`flex gap-0.5 text-xl ${isCardStar ? 'text-lg justify-center' : ''}`}
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? 'text-amber-400' : 'text-gray-300'}
        >
          ★
        </span>
      ))}
    </div>
  );
}

/**
 * Renders the Google "G" logo as an inline SVG.
 *
 * @returns SVG element with four-color Google logo
 *
 * @called_by ReviewsWidget
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 * @version 1.1.0 - 2026-03-20T00:00:00Z - Converted from CSS Modules to Tailwind
 */
function GoogleLogo() {
  return (
    <svg className="mt-auto" viewBox="0 0 24 24" width="24" height="24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

/**
 * Formats a date string into MM/DD/YYYY format.
 *
 * @param dateString - ISO 8601 date string to format
 * @returns Formatted date string in en-US locale (MM/DD/YYYY)
 *
 * @called_by ReviewsWidget
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

interface ReviewsWidgetProps {
  maxReviews?: number;
}

/**
 * Displays a paginated carousel of Google review cards on the homepage.
 *
 * Fetches reviews from the Google Business API and falls back to
 * static reviews if the API is unavailable. Shows 3 cards on desktop,
 * 2 on tablet, and 1 on mobile with navigation arrows for pagination.
 *
 * @param maxReviews - Maximum number of reviews to display (default: 6)
 * @returns The reviews widget section with header, review cards, and navigation
 *
 * @sideEffects
 * - Fetches reviews from /api/google-business/reviews on mount
 * - Updates component state with fetched review data
 *
 * @functions_called StarRating, GoogleLogo, formatDate
 * @called_by HomePage
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 * @version 1.1.0 - 2026-03-20T00:00:00Z - Converted from CSS Modules to Tailwind
 */
export function ReviewsWidget({ maxReviews = 6 }: ReviewsWidgetProps) {
  const [reviews, setReviews] = useState<DisplayReview[]>([]);
  const [stats, setStats] = useState({ averageRating: 0, totalCount: 0 });
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const reviewsPerPage = 3;

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch('/api/google-business/reviews');
        const result = await response.json();

        if (result.success && result.data?.reviews?.length > 0) {
          const goodReviews = result.data.reviews
            .filter((r: DisplayReview) => r.rating >= 4)
            .slice(0, maxReviews);

          if (goodReviews.length > 0) {
            setReviews(goodReviews);
            setStats({
              averageRating: result.data.stats.averageRating,
              totalCount: result.data.stats.totalCount,
            });
          }
        }
      } catch {
        // API unavailable; the widget hides itself rather than show fake reviews
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [maxReviews]);

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const visibleReviews = reviews.slice(
    currentPage * reviewsPerPage,
    (currentPage + 1) * reviewsPerPage
  );

  const goToNext = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const goToPrev = useCallback(() => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  /**
   * Returns responsive visibility classes for review cards based on their index.
   *
   * Card 0 is always visible. Card 1 is hidden on mobile, visible on md+.
   * Card 2 is hidden on mobile/tablet, visible on lg+.
   *
   * @param index - Zero-based index of the card in the visible reviews array
   * @returns Tailwind class string controlling responsive visibility
   */
  function getCardVisibilityClass(index: number): string {
    if (index === 0) return 'flex';
    if (index === 1) return 'hidden md:flex';
    return 'hidden lg:flex';
  }

  // Once loaded, if there are no reviews to show (e.g. the API is briefly
  // unavailable) hide the whole section rather than render an empty shell
  // or any fabricated content.
  if (!loading && reviews.length === 0) return null;

  return (
    <div className="w-[90%] max-w-[1200px] mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 flex-wrap gap-4 max-md:flex-col max-md:items-start">
          <div className="flex flex-col gap-2">
            <h2 className="text-[1.75rem] max-md:text-2xl font-bold text-gray-900 m-0">Our Google Reviews</h2>
            <div className="flex items-center gap-3">
              {loading ? (
                <span className="w-48 h-6 rounded bg-gray-200 animate-pulse" />
              ) : (
                <>
                  <StarRating rating={Math.round(stats.averageRating)} />
                  <span className="text-gray-700 text-base">
                    {stats.averageRating.toFixed(1)} rating of {stats.totalCount} reviews
                  </span>
                </>
              )}
            </div>
          </div>
          <a
            href={BUSINESS_INFO.socialMedia.googleReview}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block py-3 px-6 bg-primary-600 text-white border-none rounded-brand-sm font-semibold text-base no-underline cursor-pointer transition-colors duration-normal hover:bg-primary-800"
          >
            Write a review
          </a>
        </div>

        {/* Reviews Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${getCardVisibilityClass(i)} bg-white rounded-brand-md py-8 px-6 flex-col items-center shadow-brand-md animate-pulse`}
              >
                <div className="w-16 h-16 rounded-full bg-gray-200 mb-4" />
                <div className="w-24 h-4 rounded bg-gray-200 mb-2" />
                <div className="w-16 h-3 rounded bg-gray-200 mb-4" />
                <div className="w-full h-20 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : (
        <div className="relative flex items-center gap-4">
          {totalPages > 1 && (
            <button
              className="absolute top-1/2 -translate-y-1/2 -left-5 w-10 h-10 border-none rounded-full bg-white shadow-md cursor-pointer hidden md:flex items-center justify-center z-10 transition-all duration-normal hover:bg-bg-light hover:shadow-lg"
              onClick={goToPrev}
              aria-label="Previous reviews"
            >
              <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
            {visibleReviews.map((review, index) => (
              <div
                key={review.id}
                className={`${getCardVisibilityClass(index)} bg-white rounded-brand-md py-8 px-6 max-sm:py-6 max-sm:px-4 text-center shadow-brand-md flex-col items-center transition-shadow duration-normal hover:shadow-brand-lg`}
              >
                <div className="w-16 h-16 rounded-full overflow-hidden mb-4 bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center">
                  {review.authorPhoto ? (
                    <img className="w-full h-full object-cover" src={review.authorPhoto} alt={review.authorName} />
                  ) : (
                    <span className="text-white text-2xl font-semibold">{review.authorName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <h4 className="text-base font-semibold text-gray-900 m-0 mb-1">{review.authorName}</h4>
                <span className="text-sm text-gray-500 mb-3">{formatDate(review.date)}</span>
                <div className="mb-4">
                  <StarRating rating={review.rating} isCardStar />
                </div>
                <p className="text-[0.95rem] text-gray-700 leading-relaxed m-0 mb-4 grow">
                  {review.text && review.text.length > 150
                    ? `${review.text.substring(0, 150)}...`
                    : review.text}
                  {review.text && review.text.length > 150 && (
                    <Link href="/reviews" className="text-primary-600 no-underline font-medium ml-1 hover:underline">See more</Link>
                  )}
                </p>
                <GoogleLogo />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <button
              className="absolute top-1/2 -translate-y-1/2 -right-5 w-10 h-10 border-none rounded-full bg-white shadow-md cursor-pointer hidden md:flex items-center justify-center z-10 transition-all duration-normal hover:bg-bg-light hover:shadow-lg"
              onClick={goToNext}
              aria-label="Next reviews"
            >
              <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          )}
        </div>
        )}

        {/* View All Link */}
        <div className="text-center mt-8">
          <Link
            href="/reviews"
            className="inline-block py-3 px-6 border-2 border-primary-600 text-primary-600 bg-transparent rounded-brand-sm font-semibold no-underline transition-all duration-normal hover:bg-primary-600 hover:text-white"
          >
            View All Reviews
          </Link>
        </div>
    </div>
  );
}
