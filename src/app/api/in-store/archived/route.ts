import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import {
  getArchivedComputers,
  hardDeleteComputer,
  isSupabaseAdminConfigured,
} from '@/lib/supabase';

/**
 * Gets all archived (soft-deleted) computers.
 *
 * Returns computers where is_active = false, ordered by archived_at date.
 * Requires authentication.
 *
 * @param request - Next.js request
 * @returns NextResponse with array of archived computers
 *
 * @throws {401} When not authenticated
 *
 * @functions_called isAuthenticated, getArchivedComputers
 * @called_by ArchivedGalleryPage
 *
 * @version 1.0.0 - 2026-01-15T00:00:00Z - Initial implementation
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
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

    const computers = await getArchivedComputers();

    return NextResponse.json({
      success: true,
      data: computers,
    });
  } catch (error) {
    console.error('Error fetching archived computers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch archived computers' },
      { status: 500 }
    );
  }
}

/**
 * Permanently deletes an archived computer.
 *
 * This is a destructive operation that cannot be undone.
 * Requires the computer ID in the request body.
 *
 * @param request - Next.js request with JSON body containing id
 * @returns NextResponse with success message
 *
 * @throws {401} When not authenticated
 * @throws {400} When computer ID is missing or invalid
 * @throws {404} When computer not found
 *
 * @sideEffects
 * - Permanently removes computer from database
 *
 * @example
 * DELETE /api/in-store/archived
 * Body: { "id": "uuid-here" }
 *
 * @functions_called isAuthenticated, hardDeleteComputer
 * @called_by ArchivedGalleryTable permanent delete button
 *
 * @version 1.0.0 - 2026-01-15T00:00:00Z - Initial implementation
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
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
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Computer ID is required' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid computer ID format' },
        { status: 400 }
      );
    }

    const success = await hardDeleteComputer(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Computer not found or delete failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Computer permanently deleted',
    });
  } catch (error) {
    console.error('Error permanently deleting computer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to permanently delete computer' },
      { status: 500 }
    );
  }
}
