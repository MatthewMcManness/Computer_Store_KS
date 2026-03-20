import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { restoreComputer } from '@/lib/gallery';
import { isSupabaseAdminConfigured } from '@/lib/supabase';

/**
 * Restores an archived (soft-deleted) computer to active status.
 *
 * Sets is_active to true and clears the archived_at timestamp,
 * making the computer visible in the public gallery again.
 *
 * @param request - Next.js request (no body required)
 * @param params - Route params containing computer ID
 * @returns NextResponse with restored computer data
 *
 * @throws {401} When not authenticated
 * @throws {400} When computer ID is invalid
 * @throws {404} When computer not found
 *
 * @sideEffects
 * - Updates is_active to true in database
 * - Clears archived_at timestamp
 *
 * @example
 * POST /api/in-store/[id]/restore
 *
 * @functions_called isAuthenticated, restoreComputer
 * @called_by ArchivedGalleryTable restore button
 *
 * @version 1.0.0 - 2026-01-15T00:00:00Z - Initial implementation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid computer ID format' },
        { status: 400 }
      );
    }

    const restoredComputer = await restoreComputer(id);

    if (!restoredComputer) {
      return NextResponse.json(
        { success: false, error: 'Computer not found or restore failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: restoredComputer,
      message: 'Computer restored successfully',
    });
  } catch (error) {
    console.error('Error restoring computer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to restore computer' },
      { status: 500 }
    );
  }
}
