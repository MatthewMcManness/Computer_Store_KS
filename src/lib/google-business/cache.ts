/**
 * GBP CACHE - Reads and writes the single-row `reviews_cache` table
 * in Supabase. Orchestrates the lazy-refresh flow: if the cached row
 * is older than CACHE_TTL_MS, mint a fresh access token, re-pull from
 * Google, and write the new row. Returns whatever the cache currently
 * holds otherwise.
 *
 * WHEN TO EDIT: When the cache TTL changes, when the cache schema
 * changes, or when the refresh-on-failure policy changes.
 *
 * SERVER-ONLY: Uses the Supabase service-role client.
 */

import { supabaseAdmin } from '@/lib/supabase';
import type {
  DisplayReview,
  ReviewsCacheRow,
  ReviewsStats,
} from '@/types/google-business';
import { CACHE_TTL_MS } from './config';
import { getStoredRefreshToken, refreshAccessToken } from './oauth';
import { fetchAllReviewsFromGoogle } from './reviews';

/** Result returned from `refreshIfStale`. */
export interface CacheReadResult {
  reviews: DisplayReview[];
  stats: ReviewsStats;
  /** True if the data came from a fresh Google fetch this call. */
  refreshed: boolean;
  /** True if a refresh attempt failed but stale cache was returned. */
  stale: boolean;
}

/** Read the single cache row. Returns null if the row does not exist. */
async function readCacheRow(): Promise<ReviewsCacheRow | null> {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }
  const { data, error } = await supabaseAdmin
    .from('reviews_cache')
    .select('id, reviews_raw, stats, fetched_at')
    .eq('id', 1)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to read reviews_cache: ${error.message}`);
  }
  return (data as ReviewsCacheRow | null) ?? null;
}

/** Overwrite the cache row with fresh data. */
async function writeCacheRow(
  reviews: DisplayReview[],
  stats: ReviewsStats,
): Promise<string> {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }
  const fetchedAt = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from('reviews_cache')
    .upsert(
      {
        id: 1,
        reviews_raw: reviews,
        stats,
        fetched_at: fetchedAt,
      },
      { onConflict: 'id' },
    );
  if (error) {
    throw new Error(`Failed to write reviews_cache: ${error.message}`);
  }
  return fetchedAt;
}

function isStale(fetchedAt: string): boolean {
  const age = Date.now() - new Date(fetchedAt).getTime();
  return Number.isNaN(age) || age >= CACHE_TTL_MS;
}

/**
 * Force a refresh from Google regardless of cache age. Throws if no
 * refresh token is stored or the upstream call fails. Used by the
 * OAuth callback (to populate the cache for the first time) and by
 * the manual refresh API route.
 */
export async function forceRefresh(): Promise<CacheReadResult> {
  const grant = await getStoredRefreshToken();
  if (!grant) {
    throw new Error('No Google OAuth grant on file — run the connect flow first');
  }
  const token = await refreshAccessToken(grant.refresh_token);
  const { reviews, stats } = await fetchAllReviewsFromGoogle(token.access_token);
  const fetchedAt = await writeCacheRow(reviews, stats);
  return {
    reviews,
    stats: { ...stats, fetchedAt },
    refreshed: true,
    stale: false,
  };
}

/**
 * Main read path: return cached reviews if fresh; otherwise refresh
 * from Google. If the refresh fails but we have stale data already in
 * the cache, return the stale data with `stale: true` so the caller
 * can decide whether to surface that.
 */
export async function refreshIfStale(): Promise<CacheReadResult> {
  const row = await readCacheRow();
  const hasUsableCache = !!row && row.reviews_raw.length > 0;

  // Fresh enough — return as-is.
  if (row && !isStale(row.fetched_at) && hasUsableCache) {
    return {
      reviews: row.reviews_raw,
      stats: { ...row.stats, fetchedAt: row.fetched_at },
      refreshed: false,
      stale: false,
    };
  }

  // Need a refresh. Try, and fall back to stale data if it fails.
  try {
    return await forceRefresh();
  } catch (error) {
    if (hasUsableCache && row) {
      console.error('[google-business] refresh failed, serving stale cache:', error);
      return {
        reviews: row.reviews_raw,
        stats: { ...row.stats, fetchedAt: row.fetched_at },
        refreshed: false,
        stale: true,
      };
    }
    throw error;
  }
}
