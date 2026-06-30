/**
 * GOOGLE REVIEWS REFRESH - Admin-only endpoint that forces a re-pull
 * of reviews from Google and overwrites the cached row, regardless of
 * cache age. Useful right after the OAuth connect flow, after the GBP
 * API allowlist clears, and for manual operator intervention if the
 * lazy refresh path is misbehaving.
 *
 * WHEN TO EDIT: When changing the refresh policy or the response shape.
 */

import { NextResponse } from 'next/server';
import { forceRefresh, isGoogleBusinessConfigured } from '@/lib/google-business';

export const dynamic = 'force-dynamic';

/** POST /api/google-business/refresh — force-refresh the cache. */
export async function POST() {
  if (!isGoogleBusinessConfigured()) {
    return NextResponse.json(
      { success: false, error: 'not_configured' },
      { status: 503 },
    );
  }

  try {
    const result = await forceRefresh();
    return NextResponse.json({
      success: true,
      data: {
        reviewCount: result.reviews.length,
        stats: result.stats,
      },
    });
  } catch (error) {
    console.error('[refresh] forceRefresh failed:', error);
    const message = error instanceof Error ? error.message : 'unknown';
    return NextResponse.json(
      { success: false, error: message },
      { status: 502 },
    );
  }
}
