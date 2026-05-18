/**
 * GBP REVIEWS - Calls the Google Business Profile API to enumerate the
 * shop's account → location → reviews and normalize them into the
 * DisplayReview shape the cache and UI consume.
 *
 * WHEN TO EDIT: When Google changes the v4 reviews endpoint shape,
 * when supporting multiple locations, or when adding more fields to
 * DisplayReview.
 *
 * SERVER-ONLY: Calls Google with a Bearer access token derived from
 * the stored refresh token. Never import from a Client Component.
 */

import type { DisplayReview, ReviewsStats } from '@/types/google-business';
import {
  GBP_ACCOUNTS_API_BASE,
  GBP_BUSINESS_INFO_API_BASE,
  GBP_REVIEWS_API_BASE,
} from './config';
import type {
  GbpAccountsListResponse,
  GbpLocationsListResponse,
  GbpReview,
  GbpReviewsListResponse,
} from './types-internal';

/** Maps the Google starRating enum to the integer rating the UI expects. */
const STAR_RATING_TO_INT: Record<GbpReview['starRating'], number> = {
  STAR_RATING_UNSPECIFIED: 0,
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

async function googleGet<T>(url: string, accessToken: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google API request failed (${response.status}) ${url}: ${text}`);
  }
  return (await response.json()) as T;
}

/** List every account the OAuth user manages (paginated). */
async function listAccounts(accessToken: string): Promise<string[]> {
  const accountNames: string[] = [];
  let pageToken: string | undefined;
  do {
    const url = new URL(`${GBP_ACCOUNTS_API_BASE}/accounts`);
    url.searchParams.set('pageSize', '50');
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const res = await googleGet<GbpAccountsListResponse>(url.toString(), accessToken);
    for (const account of res.accounts ?? []) {
      accountNames.push(account.name);
    }
    pageToken = res.nextPageToken;
  } while (pageToken);
  return accountNames;
}

/** List every location under an account (paginated). */
async function listLocations(accountName: string, accessToken: string): Promise<string[]> {
  const locationNames: string[] = [];
  let pageToken: string | undefined;
  do {
    const url = new URL(`${GBP_BUSINESS_INFO_API_BASE}/${accountName}/locations`);
    // readMask is required by Business Information v1; we only need
    // the resource name to build the reviews URL afterwards.
    url.searchParams.set('readMask', 'name');
    url.searchParams.set('pageSize', '100');
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const res = await googleGet<GbpLocationsListResponse>(url.toString(), accessToken);
    for (const location of res.locations ?? []) {
      // Reviews v4 expects the legacy `locations/{id}` form, not
      // `locations/{name}`. Business Information returns the same id
      // in the trailing path segment, so this works as-is.
      locationNames.push(location.name);
    }
    pageToken = res.nextPageToken;
  } while (pageToken);
  return locationNames;
}

/** Page through every review for a given account + location. */
async function listReviewsForLocation(
  accountName: string,
  locationName: string,
  accessToken: string,
): Promise<{ reviews: GbpReview[]; averageRating: number; totalCount: number }> {
  const all: GbpReview[] = [];
  let averageRating = 0;
  let totalCount = 0;
  let pageToken: string | undefined;
  do {
    const url = new URL(
      `${GBP_REVIEWS_API_BASE}/${accountName}/${locationName}/reviews`,
    );
    url.searchParams.set('pageSize', '50');
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const res = await googleGet<GbpReviewsListResponse>(url.toString(), accessToken);
    if (res.averageRating !== undefined) averageRating = res.averageRating;
    if (res.totalReviewCount !== undefined) totalCount = res.totalReviewCount;
    for (const review of res.reviews ?? []) {
      all.push(review);
    }
    pageToken = res.nextPageToken;
  } while (pageToken);
  return { reviews: all, averageRating, totalCount };
}

/** Convert a Google review wire object to the UI-facing DisplayReview. */
export function normalizeReview(review: GbpReview): DisplayReview {
  const id = review.reviewId ?? review.name ?? `${review.createTime}-${review.starRating}`;
  const rating = STAR_RATING_TO_INT[review.starRating] ?? 0;
  const reply = review.reviewReply
    ? { text: review.reviewReply.comment, date: review.reviewReply.updateTime }
    : undefined;
  return {
    id,
    authorName: review.reviewer?.displayName ?? 'Anonymous',
    authorPhoto: review.reviewer?.profilePhotoUrl,
    rating,
    text: review.comment,
    date: review.createTime,
    reply,
  };
}

/**
 * Fetch every review for every location the OAuth user manages, then
 * collapse them into a single normalized list with aggregate stats.
 *
 * For Computer Store KS we expect exactly one account and one location,
 * but the code does not assume that — it walks the full tree so the
 * same module is reusable on multi-location clients.
 */
export async function fetchAllReviewsFromGoogle(
  accessToken: string,
): Promise<{ reviews: DisplayReview[]; stats: ReviewsStats }> {
  const accountNames = await listAccounts(accessToken);
  if (accountNames.length === 0) {
    return {
      reviews: [],
      stats: { averageRating: 0, totalCount: 0 },
    };
  }

  const normalized: DisplayReview[] = [];
  let totalCount = 0;
  let weightedSum = 0;

  for (const accountName of accountNames) {
    const locationNames = await listLocations(accountName, accessToken);
    for (const locationName of locationNames) {
      const { reviews, averageRating, totalCount: locationCount } =
        await listReviewsForLocation(accountName, locationName, accessToken);
      for (const review of reviews) {
        normalized.push(normalizeReview(review));
      }
      totalCount += locationCount;
      weightedSum += averageRating * locationCount;
    }
  }

  const averageRating = totalCount > 0 ? weightedSum / totalCount : 0;
  return {
    reviews: normalized,
    stats: { averageRating, totalCount },
  };
}
