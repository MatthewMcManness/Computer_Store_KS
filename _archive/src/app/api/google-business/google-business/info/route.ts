import { NextResponse } from 'next/server';
import { fetchBusinessInfo, isGoogleBusinessConfigured } from '@/lib/google-business';

// GET /api/google-business/info - Get business information
export async function GET() {
  try {
    if (!isGoogleBusinessConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'Google Business Profile not configured',
      }, { status: 503 });
    }

    const info = await fetchBusinessInfo();

    return NextResponse.json({
      success: true,
      data: info,
    });
  } catch (error) {
    console.error('Error fetching business info:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch business info',
      },
      { status: 500 }
    );
  }
}
