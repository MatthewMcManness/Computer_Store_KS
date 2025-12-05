import { NextResponse } from 'next/server';
import {
  fetchReviews,
  getCachedReviewsStats,
  isGoogleBusinessConfigured,
} from '@/lib/google-business';

// GET /api/google-business/reviews - Get Google Business reviews
export async function GET() {
  try {
    if (!isGoogleBusinessConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'Google Business Profile not configured',
      }, { status: 503 });
    }

    const reviews = await fetchReviews();
    const stats = getCachedReviewsStats();

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        stats: {
          averageRating: stats?.averageRating || 0,
          totalCount: stats?.totalCount || reviews.length,
          fetchedAt: stats?.fetchedAt,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch reviews',
      },
      { status: 500 }
    );
  }
}
