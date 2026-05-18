/**
 * GOOGLE REVIEWS API - Public endpoint that returns 5-star reviews +
 * aggregate stats for the homepage widget and the /reviews page.
 *
 * Reads from the Supabase `reviews_cache` row. If the cache is older
 * than 24 hours, the call lazily refreshes from Google before
 * responding — the first visitor of the day pays a ~1–3s latency hit
 * so the rest of the day is instant.
 *
 * WHEN TO EDIT: When the response envelope changes, when adding new
 * query params (e.g., `?count=`), or when the failure semantics change.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  isGoogleBusinessConfigured,
  refreshIfStale,
  selectReviews,
} from '@/lib/google-business';

export const dynamic = 'force-dynamic';

const DEFAULT_COUNT = 24;
const MAX_COUNT = 50;

/** GET /api/google-business/reviews?count=24 — returns selected reviews + stats. */
export async function GET(request: NextRequest) {
  if (!isGoogleBusinessConfigured()) {
    return NextResponse.json(
      { success: false, error: 'not_configured' },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const requestedCount = Number.parseInt(searchParams.get('count') ?? '', 10);
  const count = Number.isFinite(requestedCount)
    ? Math.max(1, Math.min(MAX_COUNT, requestedCount))
    : DEFAULT_COUNT;

  try {
    const result = await refreshIfStale();
    const reviews = selectReviews(result.reviews, { count });

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        stats: result.stats,
        stale: result.stale,
      },
    });
  } catch (error) {
    console.error('[reviews] cache/refresh failed:', error);
    return NextResponse.json(
      { success: false, error: 'upstream' },
      { status: 502 },
    );
  }
}
