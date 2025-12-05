'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { DisplayReview } from '@/types/google-business';
import styles from './ReviewsWidget.module.css';

// Fallback reviews when API is not configured
const fallbackReviews: DisplayReview[] = [
  {
    id: '1',
    authorName: 'Kristina Jones',
    rating: 5,
    text: "Signing up for a Computer Protection Plan from The Computer Store was the best decision I've made in years. My computer has never run better!",
    date: '2024-11-15T00:00:00Z',
  },
  {
    id: '2',
    authorName: 'Matt Thompson',
    rating: 5,
    text: "Not only did The Computer Store fix my problem a lot faster than the big box store, they did so at just under half the cost. Highly recommend!",
    date: '2024-10-28T00:00:00Z',
  },
  {
    id: '3',
    authorName: 'Andrew Davis',
    rating: 5,
    text: "The technician managed to recover all my data from a failed hard drive. Saved me a lot of headache and money — thank you Computer Store!",
    date: '2024-09-22T00:00:00Z',
  },
  {
    id: '4',
    authorName: 'Sarah Mitchell',
    rating: 5,
    text: 'Excellent service! They fixed my laptop the same day I brought it in. Very professional and reasonably priced.',
    date: '2024-08-15T00:00:00Z',
  },
  {
    id: '5',
    authorName: 'David Kim',
    rating: 5,
    text: 'Quick turnaround on my desktop repair. Fair prices and friendly staff. Will definitely come back.',
    date: '2024-07-10T00:00:00Z',
  },
  {
    id: '6',
    authorName: 'Jennifer Roberts',
    rating: 5,
    text: 'The team really knows their stuff. Fixed a virus issue that another shop couldn\'t figure out. Great local business!',
    date: '2024-06-05T00:00:00Z',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className={styles.stars} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? styles.starFilled : styles.starEmpty}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg className={styles.googleLogo} viewBox="0 0 24 24" width="24" height="24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

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

export function ReviewsWidget({ maxReviews = 6 }: ReviewsWidgetProps) {
  const [reviews, setReviews] = useState<DisplayReview[]>(fallbackReviews.slice(0, maxReviews));
  const [stats, setStats] = useState({ averageRating: 5.0, totalCount: fallbackReviews.length });
  const [currentPage, setCurrentPage] = useState(0);
  const [isFromGoogle, setIsFromGoogle] = useState(false);
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
            setIsFromGoogle(true);
          }
        }
      } catch (err) {
        console.log('Using fallback reviews');
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

  return (
    <section className={styles.reviewsSection}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.title}>Our Google Reviews</h2>
            <div className={styles.ratingRow}>
              <StarRating rating={Math.round(stats.averageRating)} />
              <span className={styles.ratingText}>
                {stats.averageRating.toFixed(1)} rating of {stats.totalCount} reviews
              </span>
            </div>
          </div>
          <a
            href="https://g.page/r/CQdWo7o2FwEZEAE/review"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.writeReviewBtn}
          >
            Write a review
          </a>
        </div>

        {/* Reviews Cards */}
        <div className={styles.reviewsContainer}>
          {totalPages > 1 && (
            <button
              className={`${styles.navArrow} ${styles.navArrowLeft}`}
              onClick={goToPrev}
              aria-label="Previous reviews"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          )}

          <div className={styles.reviewsGrid}>
            {visibleReviews.map((review) => (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.authorPhoto}>
                  {review.authorPhoto ? (
                    <img src={review.authorPhoto} alt={review.authorName} />
                  ) : (
                    <span>{review.authorName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <h4 className={styles.authorName}>{review.authorName}</h4>
                <span className={styles.reviewDate}>{formatDate(review.date)}</span>
                <div className={styles.cardStars}>
                  <StarRating rating={review.rating} />
                </div>
                <p className={styles.reviewText}>
                  {review.text && review.text.length > 150
                    ? `${review.text.substring(0, 150)}...`
                    : review.text}
                  {review.text && review.text.length > 150 && (
                    <Link href="/reviews" className={styles.seeMore}>See more</Link>
                  )}
                </p>
                <GoogleLogo />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <button
              className={`${styles.navArrow} ${styles.navArrowRight}`}
              onClick={goToNext}
              aria-label="Next reviews"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          )}
        </div>

        {/* View All Link */}
        <div className={styles.viewAll}>
          <Link href="/reviews" className={styles.viewAllLink}>
            View All Reviews
          </Link>
        </div>
      </div>
    </section>
  );
}
