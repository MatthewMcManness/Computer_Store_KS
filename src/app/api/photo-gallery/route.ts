/**
 * Photo Gallery API - List and Create
 *
 * GET /api/photo-gallery - List all active photos (public)
 * POST /api/photo-gallery - Create a new photo (admin only)
 *
 * @version 1.0.0 - 2026-01-19T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-03-20T17:52:44Z - Extract inline queries to data access module
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated, getUserRoles } from '@/lib/auth';
import { hasPermission } from '@/lib/role-helpers';
import { getPhotos, createPhoto } from '@/lib/photo-gallery';
import type { PhotoGalleryItem } from '@/types/photo-gallery';
import type { CreatePhotoInput } from '@/types/photo-gallery';

export const dynamic = 'force-dynamic';

/**
 * GET /api/photo-gallery - List photos
 *
 * Query params:
 * - admin=true: Include inactive photos (requires authentication)
 * - category: Filter by category
 *
 * @param request - The incoming Next.js request with optional query parameters
 *
 * @returns JSON response with { success, data } containing array of PhotoGalleryItem
 *
 * @functions_called isAuthenticated, getUserRoles, hasPermission, getPhotos
 * @called_by PhotoGalleryPage, AdminPhotoGalleryPage
 *
 * @version 1.0.0 - 2026-01-19T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-03-20T17:52:44Z - Delegate to data access module
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';
    const category = searchParams.get('category');

    // Admin mode requires authentication and permission
    if (isAdmin) {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const roles = await getUserRoles();
      if (!hasPermission(roles, 'view_photo_gallery')) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        );
      }
    }

    const result = await getPhotos({
      activeOnly: !isAdmin,
      category: category ?? undefined,
    });

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data as PhotoGalleryItem[],
    });
  } catch (error) {
    console.error('Error in photo gallery GET:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/photo-gallery - Create a new photo
 *
 * Requires authentication and manage_photo_gallery permission.
 *
 * @param request - Request with photo data in body
 *
 * @returns JSON response with { success, data } containing the created PhotoGalleryItem
 *
 * @functions_called isAuthenticated, getUserRoles, hasPermission, createPhoto
 * @called_by AdminPhotoGalleryPage
 *
 * @version 1.0.0 - 2026-01-19T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-03-20T17:52:44Z - Delegate to data access module
 */
export async function POST(request: NextRequest) {
  try {
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

    const body: CreatePhotoInput = await request.json();

    // Validate required fields
    if (!body.title || !body.imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Title and image URL are required' },
        { status: 400 }
      );
    }

    const result = await createPhoto(body);

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data as PhotoGalleryItem,
    });
  } catch (error) {
    console.error('Error in photo gallery POST:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
