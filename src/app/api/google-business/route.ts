import { NextResponse } from 'next/server';
import {
  fetchAllGoogleBusinessData,
  isGoogleBusinessConfigured,
  getGoogleBusinessConfig,
} from '@/lib/google-business';

// GET /api/google-business - Get all Google Business Profile data
export async function GET() {
  try {
    // Check if configured
    if (!isGoogleBusinessConfigured()) {
      const config = getGoogleBusinessConfig();
      return NextResponse.json({
        success: false,
        error: 'Google Business Profile not configured',
        config: {
          // Only show which fields are missing, not values
          missingFields: [
            !config.hasClientId && 'GOOGLE_BUSINESS_CLIENT_ID',
            !config.hasClientSecret && 'GOOGLE_BUSINESS_CLIENT_SECRET',
            !config.hasRefreshToken && 'GOOGLE_BUSINESS_REFRESH_TOKEN',
            !config.hasAccountId && 'GOOGLE_BUSINESS_ACCOUNT_ID',
            !config.hasLocationId && 'GOOGLE_BUSINESS_LOCATION_ID',
          ].filter(Boolean),
        },
      }, { status: 503 });
    }

    const data = await fetchAllGoogleBusinessData();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching Google Business data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Google Business data',
      },
      { status: 500 }
    );
  }
}
