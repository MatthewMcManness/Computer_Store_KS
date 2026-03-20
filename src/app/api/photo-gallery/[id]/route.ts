/**
 * Photo Gallery API - Single Photo Operations
 *
 * GET /api/photo-gallery/[id] - Get single photo
 * PUT /api/photo-gallery/[id] - Update photo (admin only)
 * DELETE /api/photo-gallery/[id] - Delete photo (admin only)
 *
 * @version 1.0.0 - 2026-01-19T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-03-20T17:52:44Z - Extract inline queries to data access module
 * @version 3.0.0 - 2026-03-20T00:00:00Z - Simplified auth: single-employee model, no RBAC
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/supabase-auth';
import { getPhotoById, updatePhoto, deletePhoto } from '@/lib/photo-gallery';
import type { PhotoGalleryItem, UpdatePhotoInput } from '@/types/photo-gallery';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/photo-gallery/[id] - Get single photo
 *
 * @param request - The incoming Next.js request
 * @param params - Route params containing the photo ID
 *
 * @returns JSON response with { success, data } containing a single PhotoGalleryItem
 *
 * @functions_called getPhotoById
 * @called_by PhotoGalleryDetailPage
 *
 * @version 1.0.0 - 2026-01-19T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-03-20T17:52:44Z - Delegate to data access module
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ success: false, error: 'Invalid photo ID format' }, { status: 400 });
    }

    const result = await getPhotoById(id);

    if (result.error) {
      const status = result.error.code === 'not_found' ? 404 : 500;
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data as PhotoGalleryItem,
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
 *
 * Requires authentication.
 *
 * @param request - Request with partial photo data in body
 * @param params - Route params containing the photo ID
 *
 * @returns JSON response with { success, data } containing the updated PhotoGalleryItem
 *
 * @functions_called isAuthenticated, updatePhoto
 * @called_by AdminPhotoGalleryPage
 *
 * @version 1.0.0 - 2026-01-19T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-03-20T17:52:44Z - Delegate to data access module
 * @version 3.0.0 - 2026-03-20T00:00:00Z - Simplified auth check (no role permissions)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ success: false, error: 'Invalid photo ID format' }, { status: 400 });
    }

    // Check authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: UpdatePhotoInput = await request.json();

    const result = await updatePhoto(id, body);

    if (result.error) {
      const status = result.error.code === 'not_found' ? 404 : 500;
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data as PhotoGalleryItem,
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
 *
 * Requires authentication.
 *
 * @param request - The incoming Next.js request
 * @param params - Route params containing the photo ID
 *
 * @returns JSON response with { success, message } on successful deletion
 *
 * @sideEffects
 * - Permanently deletes the photo record from the database
 *
 * @functions_called isAuthenticated, deletePhoto
 * @called_by AdminPhotoGalleryPage
 *
 * @version 1.0.0 - 2026-01-19T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-03-20T17:52:44Z - Delegate to data access module
 * @version 3.0.0 - 2026-03-20T00:00:00Z - Simplified auth check (no role permissions)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ success: false, error: 'Invalid photo ID format' }, { status: 400 });
    }

    // Check authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await deletePhoto(id);

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error.message },
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
