/**
 * GBP BARREL - Single import surface for the Google Business Profile
 * integration. API routes and (future) Server Components import from
 * `@/lib/google-business`; the internals live in this folder.
 *
 * WHEN TO EDIT: When adding new public exports from a module in this
 * folder.
 *
 * SERVER-ONLY: All re-exports here are server-side.
 */

export { isGoogleBusinessConfigured } from './config';
export {
  buildAuthUrl,
  exchangeCodeForTokens,
  getStoredRefreshToken,
  refreshAccessToken,
  storeRefreshToken,
} from './oauth';
export { fetchAllReviewsFromGoogle, normalizeReview } from './reviews';
export { forceRefresh, refreshIfStale } from './cache';
export type { CacheReadResult } from './cache';
export { selectReviews } from './selection';
export type { SelectionOptions } from './selection';
