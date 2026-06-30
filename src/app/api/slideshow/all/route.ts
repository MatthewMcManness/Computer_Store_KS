/**
 * ADMIN SLIDESHOW LIST API - Returns all non-archived slides (active and
 * inactive) for the admin slideshow manager.
 *
 * GET /api/slideshow/all - Admin only: returns every non-archived slide.
 *
 * This is the admin counterpart to the public GET /api/slideshow (which
 * returns active-only). It is gated by the Cloudflare Access admin policy
 * at the edge (non-public /api path).
 *
 * WHEN TO EDIT: When changing what the admin slide list returns.
 */

import { NextResponse } from 'next/server';
import { getAllSlides } from '@/lib/slideshow';
import { isDbConfigured } from '@/lib/db';

// Always run per-request so the admin list reflects live data, not a
// build-time snapshot.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }

    const slides = await getAllSlides();
    return NextResponse.json({ success: true, data: slides });
  } catch (error) {
    console.error('Error loading admin slides:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load slides' },
      { status: 500 }
    );
  }
}
