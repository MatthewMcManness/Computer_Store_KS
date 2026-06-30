/**
 * SLIDE RESTORE API - Restores an archived slide back to the active slideshow.
 *
 * POST /api/slideshow/[id]/restore - Admin: un-archives a slide.
 *
 * WHEN TO EDIT: When changing the restore behavior.
 */

import { NextRequest, NextResponse } from 'next/server';
import { restoreSlide } from '@/lib/slideshow';
import { isDbConfigured } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
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
