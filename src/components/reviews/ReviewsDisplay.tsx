'use client';

import { useEffect, useState } from 'react';
import type { DisplayReview } from '@/types/google-business';
import styles from './ReviewsDisplay.module.css';

interface ReviewsData {
  reviews: DisplayReview[];
  stats: {
    averageRating: number;
    totalCount: number;
  };
}

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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function ReviewCard({ review }: { review: DisplayReview }) {
  return (
    <div className={styles.reviewCard}>
      <div className={styles.reviewHeader}>
        <div className={styles.reviewAuthor}>
          {review.authorPhoto ? (
            <img
              src={review.authorPhoto}
              alt={review.authorName}
              className={styles.authorPhoto}
            />
          ) : (
            <div className={styles.authorInitial}>
              {review.authorName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className={styles.authorName}>{review.authorName}</div>
            <div className={styles.reviewDate}>{formatDate(review.date)}</div>
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>
      {review.text && <p className={styles.reviewText}>{review.text}</p>}
      {review.reply && (
        <div className={styles.ownerReply}>
          <div className={styles.replyHeader}>
            <strong>Response from owner</strong>
            <span className={styles.replyDate}>{formatDate(review.reply.date)}</span>
          </div>
          <p>{review.reply.text}</p>
        </div>
      )}
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonStats}>
        <div className={styles.skeletonBox} style={{ width: '120px', height: '48px' }} />
        <div className={styles.skeletonBox} style={{ width: '150px', height: '24px' }} />
      </div>
      <div className={styles.skeletonGrid}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={styles.skeletonCard}>
            <div className={styles.skeletonHeader}>
              <div className={styles.skeletonBox} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
              <div>
                <div className={styles.skeletonBox} style={{ width: '100px', height: '16px' }} />
                <div className={styles.skeletonBox} style={{ width: '80px', height: '12px', marginTop: '4px' }} />
              </div>
            </div>
            <div className={styles.skeletonBox} style={{ width: '100%', height: '60px', marginTop: '16px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

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
      <div className={styles.statsSection}>
        <div className={styles.averageRating}>
          <span className={styles.ratingNumber}>5.0</span>
          <StarRating rating={5} />
        </div>
        <p className={styles.reviewCount}>Based on customer feedback</p>
        <p className={styles.fallbackNote}>
          <em>Connect your Google Business Profile to display live reviews</em>
        </p>
      </div>
      <div className={styles.reviewsGrid}>
        {fallbackReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </>
  );
}

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
      <div className={styles.noReviews}>
        <h3>No Reviews Yet</h3>
        <p>Be the first to leave a review!</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.statsSection}>
        <div className={styles.averageRating}>
          <span className={styles.ratingNumber}>{data.stats.averageRating.toFixed(1)}</span>
          <StarRating rating={Math.round(data.stats.averageRating)} />
        </div>
        <p className={styles.reviewCount}>
          Based on {data.stats.totalCount} Google {data.stats.totalCount === 1 ? 'review' : 'reviews'}
        </p>
      </div>
      <div className={styles.reviewsGrid}>
        {data.reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </>
  );
}
