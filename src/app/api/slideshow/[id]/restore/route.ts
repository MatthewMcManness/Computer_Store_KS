/**
 * SLIDE RESTORE API - Restores an archived slide back to the active slideshow.
 *
 * POST /api/slideshow/[id]/restore - Admin: un-archives a slide.
 *
 * WHEN TO EDIT: When changing the restore behavior.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/supabase-auth';
import { restoreSlide } from '@/lib/slideshow';
import { isSupabaseAdminConfigured } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const slide = await restoreSlide(id);

    if (!slide) {
      return NextResponse.json(
        { success: false, error: 'Failed to restore slide' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: slide });
  } catch (error) {
    console.error('Error restoring slide:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to restore slide' },
      { status: 500 }
    );
  }
}
