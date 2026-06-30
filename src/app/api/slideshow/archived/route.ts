/**
 * ARCHIVED SLIDES API - List and permanently delete archived slides.
 *
 * GET    /api/slideshow/archived - Admin: list all archived slides.
 * DELETE /api/slideshow/archived - Admin: permanently delete an archived slide.
 *
 * WHEN TO EDIT: When changing the archive list or permanent delete behavior.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getArchivedSlides, hardDeleteSlide } from '@/lib/slideshow';
import { isDbConfigured } from '@/lib/db';

export async function GET() {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }

    const slides = await getArchivedSlides();
    return NextResponse.json({ success: true, data: slides });
  } catch (error) {
    console.error('Error loading archived slides:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load archived slides' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Missing slide ID' },
        { status: 400 }
      );
    }

    const success = await hardDeleteSlide(body.id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete slide' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Slide permanently deleted' });
  } catch (error) {
    console.error('Error deleting slide:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete slide' },
      { status: 500 }
    );
  }
}
