/**
 * Photo Gallery API - Single Photo Operations
 *
 * GET /api/photo-gallery/[id] - Get single photo
 * PUT /api/photo-gallery/[id] - Update photo (admin only)
 * DELETE /api/photo-gallery/[id] - Delete photo (admin only)
 *
 * @version 1.0.0 - 2026-01-19T00:00:00Z - Initial implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated, getUserRoles } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { hasPermission } from '@/lib/role-helpers';
import type { PhotoGalleryItem, UpdatePhotoInput } from '@/types/photo-gallery';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/photo-gallery/[id] - Get single photo
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('photo_gallery')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Photo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data as PhotoGalleryItem,
    });
  } catch (error) {
    console.error('Error fetching photo:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/photo-gallery/[id] - Update photo
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permission
    const roles = await getUserRoles();
    if (!hasPermission(roles, 'manage_photo_gallery')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body: UpdatePhotoInput = await request.json();

    // Build update object (only include provided fields)
    // Maps API fields (title, description) to DB columns (caption, alt_text)
    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.caption = body.title;
    if (body.description !== undefined) updateData.alt_text = body.description;
    if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl;
    if (body.thumbnailUrl !== undefined) updateData.thumbnail_url = body.thumbnailUrl;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.sortOrder !== undefined) updateData.sort_order = body.sortOrder;
    if (body.isActive !== undefined) updateData.is_active = body.isActive;

    const { data, error } = await supabaseAdmin
      .from('photo_gallery')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating photo:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update photo' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Photo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data as PhotoGalleryItem,
    });
  } catch (error) {
    console.error('Error updating photo:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/photo-gallery/[id] - Delete photo
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permission
    const roles = await getUserRoles();
    if (!hasPermission(roles, 'manage_photo_gallery')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Get the photo first to get the image URLs for cleanup
    const { data: photo } = await supabaseAdmin
      .from('photo_gallery')
      .select('image_url, thumbnail_url')
      .eq('id', id)
      .single();

    // Delete from database
    const { error } = await supabaseAdmin
      .from('photo_gallery')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting photo:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete photo' },
        { status: 500 }
      );
    }

    // Optionally delete images from storage
    // (Not implemented here to avoid accidental data loss)

    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
