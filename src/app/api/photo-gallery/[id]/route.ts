/**
 * Photo Gallery API - Single Photo Operations
 *
 * GET /api/photo-gallery/[id] - Get single photo
 * PUT /api/photo-gallery/[id] - Update photo (admin only)
 * DELETE /api/photo-gallery/[id] - Delete photo (admin only)
 *
 * @version 1.0.0 - 2026-01-19T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-03-20T17:52:44Z - Extract inline queries to data access module
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated, getUserRoles } from '@/lib/auth';
import { hasPermission } from '@/lib/role-helpers';
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
 * Requires authentication and manage_photo_gallery permission.
 *
 * @param request - Request with partial photo data in body
 * @param params - Route params containing the photo ID
 *
 * @returns JSON response with { success, data } containing the updated PhotoGalleryItem
 *
 * @functions_called isAuthenticated, getUserRoles, hasPermission, updatePhoto
 * @called_by AdminPhotoGalleryPage
 *
 * @version 1.0.0 - 2026-01-19T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-03-20T17:52:44Z - Delegate to data access module
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
 * Requires authentication and manage_photo_gallery permission.
 *
 * @param request - The incoming Next.js request
 * @param params - Route params containing the photo ID
 *
 * @returns JSON response with { success, message } on successful deletion
 *
 * @sideEffects
 * - Permanently deletes the photo record from the database
 *
 * @functions_called isAuthenticated, getUserRoles, hasPermission, deletePhoto
 * @called_by AdminPhotoGalleryPage
 *
 * @version 1.0.0 - 2026-01-19T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-03-20T17:52:44Z - Delegate to data access module
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
