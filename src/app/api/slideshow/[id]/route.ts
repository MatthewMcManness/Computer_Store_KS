/**
 * SINGLE SLIDE API - Update or archive a specific slide.
 *
 * PUT    /api/slideshow/[id] - Admin: update slide title/content/image.
 * DELETE /api/slideshow/[id] - Admin: soft-delete (archive) a slide.
 *
 * WHEN TO EDIT: When changing how individual slides are updated or removed.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/supabase-auth';
import { updateSlide, archiveSlide } from '@/lib/slideshow';
import { isSupabaseAdminConfigured } from '@/lib/supabase';

export async function PUT(
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
    const body = await request.json();

    const slide = await updateSlide(id, {
      title: body.title,
      content: body.content,
      image_url: body.image_url,
      sort_order: body.sort_order,
      is_active: body.is_active,
    });

    if (!slide) {
      return NextResponse.json(
        { success: false, error: 'Failed to update slide' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: slide });
  } catch (error) {
    console.error('Error updating slide:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update slide' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const success = await archiveSlide(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to archive slide' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Slide archived' });
  } catch (error) {
    console.error('Error archiving slide:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to archive slide' },
      { status: 500 }
    );
  }
}
