/**
 * GOOGLE REVIEWS TYPES - Public types shared between server (lib +
 * API routes) and client (review components). Server-internal shapes
 * (Google Business Profile API response wire format) live in
 * src/lib/google-business/types-internal.ts to avoid leaking into the
 * client bundle.
 *
 * WHEN TO EDIT: When the rendered review card needs a new field, or
 * when the API response envelope changes.
 */

/**
 * Simplified review data for frontend display.
 *
 * This is the shape every component renders. It is the normalized
 * output of the GBP API → normalize → cache → API → component path.
 */
export interface DisplayReview {
  id: string;
  authorName: string;
  authorPhoto?: string;
  rating: number;
  text?: string;
  date: string;
  reply?: {
    text: string;
    date: string;
  };
}

/** Aggregate stats about the business's reviews on Google. */
export interface ReviewsStats {
  averageRating: number;
  totalCount: number;
  fetchedAt?: string;
}

/** Shape of the row stored in the Supabase `reviews_cache` table. */
export interface ReviewsCacheRow {
  id: 1;
  reviews_raw: DisplayReview[];
  stats: ReviewsStats;
  fetched_at: string;
}
