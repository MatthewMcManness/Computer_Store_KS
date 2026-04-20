/**
 * ARCHIVED SLIDES API - List and permanently delete archived slides.
 *
 * GET    /api/slideshow/archived - Admin: list all archived slides.
 * DELETE /api/slideshow/archived - Admin: permanently delete an archived slide.
 *
 * WHEN TO EDIT: When changing the archive list or permanent delete behavior.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/supabase-auth';
import { getArchivedSlides, hardDeleteSlide } from '@/lib/slideshow';
import { isSupabaseAdminConfigured } from '@/lib/supabase';

export async function GET() {
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
