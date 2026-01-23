import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import {
  updateStockQuantity,
  isSupabaseAdminConfigured,
} from '@/lib/supabase';

/**
 * Adjusts stock quantity for a computer by a delta value.
 *
 * Increases or decreases stock by the specified amount. Stock cannot
 * go below 0.
 *
 * @param request - Next.js request with JSON body containing delta
 * @param params - Route params containing computer ID
 * @returns NextResponse with updated computer data
 *
 * @throws {401} When not authenticated
 * @throws {400} When delta is missing or invalid
 * @throws {404} When computer not found
 *
 * @sideEffects
 * - Updates stock_quantity in database
 *
 * @example
 * // Decrease stock by 1
 * PATCH /api/in-store/[id]/stock
 * Body: { "delta": -1 }
 *
 * // Increase stock by 5
 * PATCH /api/in-store/[id]/stock
 * Body: { "delta": 5 }
 *
 * @functions_called isAuthenticated, updateStockQuantity
 * @called_by GalleryTable stock +/- buttons
 *
 * @version 1.0.0 - 2026-01-15T00:00:00Z - Initial implementation
 */
export async function PATCH(
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

    const body = await request.json();
    const { delta } = body;

    if (typeof delta !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Delta must be a number' },
        { status: 400 }
      );
    }

    const updatedComputer = await updateStockQuantity(id, delta);

    if (!updatedComputer) {
      return NextResponse.json(
        { success: false, error: 'Computer not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedComputer,
      message: `Stock ${delta > 0 ? 'increased' : 'decreased'} successfully`,
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update stock' },
      { status: 500 }
    );
  }
}
