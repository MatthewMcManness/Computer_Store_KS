/**
 * SLIDE REORDER API - Updates the display order of all slides.
 *
 * POST /api/slideshow/reorder - Admin: accepts an array of slide IDs
 * in the desired order and updates sort_order for each.
 *
 * WHEN TO EDIT: When changing how slide ordering works.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/supabase-auth';
import { reorderSlides } from '@/lib/slideshow';
import { isSupabaseAdminConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Database admin not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();

    if (!Array.isArray(body.orderedIds) || body.orderedIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'orderedIds must be a non-empty array of slide IDs' },
        { status: 400 }
      );
    }

    const success = await reorderSlides(body.orderedIds);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to reorder slides' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Slides reordered' });
  } catch (error) {
    console.error('Error reordering slides:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reorder slides' },
      { status: 500 }
    );
  }
}
