/**
 * Photo Gallery API - List and Create
 *
 * GET /api/photo-gallery - List all active photos (public)
 * POST /api/photo-gallery - Create a new photo (admin only)
 *
 * @version 1.0.0 - 2026-01-19T00:00:00Z - Initial implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated, getUserRoles } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { hasPermission } from '@/lib/role-helpers';
import type { PhotoGalleryItem, CreatePhotoInput } from '@/types/photo-gallery';

export const dynamic = 'force-dynamic';

/**
 * GET /api/photo-gallery - List photos
 *
 * Query params:
 * - admin=true: Include inactive photos (requires authentication)
 * - category: Filter by category
 *
 * @returns List of photos
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';
    const category = searchParams.get('category');

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Build query
    let query = supabaseAdmin
      .from('photo_gallery')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

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
      // Admin sees all photos
    } else {
      // Public only sees active photos
      query = query.eq('is_active', true);
    }

    // Filter by category if specified
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching photos:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch photos' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data as PhotoGalleryItem[],
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
 * @returns Created photo
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

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
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

    // Insert photo (using DB column names: caption, alt_text)
    const { data, error } = await supabaseAdmin
      .from('photo_gallery')
      .insert({
        caption: body.title,
        alt_text: body.description || null,
        image_url: body.imageUrl,
        thumbnail_url: body.thumbnailUrl || null,
        category: body.category || 'general',
        sort_order: body.sortOrder || 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating photo:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create photo' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data as PhotoGalleryItem,
    });
  } catch (error) {
    console.error('Error in photo gallery POST:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
