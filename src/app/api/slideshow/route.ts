/**
 * SLIDESHOW API - List active slides and create new slides.
 *
 * GET /api/slideshow  - Public: returns ONLY active, non-archived slides in
 *                       order. This is the unattended in-store TV display set,
 *                       so it must never return inactive/admin-only slides.
 *                       Admin (all non-archived) lives at GET /api/slideshow/all.
 *
 * Slide creation is POST /api/slideshow/create (a gated subpath) so this bare
 * path can stay public for the TV without exposing writes; Cloudflare Access
 * cannot distinguish GET from POST on the same path.
 *
 * WHEN TO EDIT: When changing how slides are listed.
 */

import { NextResponse } from 'next/server';
import { getActiveSlides } from '@/lib/slideshow';
import { isDbConfigured } from '@/lib/db';

// Always run per-request so the in-store TV display gets live slides.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Public read path: active, non-archived slides only.
    const slides = await getActiveSlides();
    return NextResponse.json({ success: true, data: slides });
  } catch (error) {
    console.error('Error loading slides:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load slides' },
      { status: 500 }
    );
  }
}
