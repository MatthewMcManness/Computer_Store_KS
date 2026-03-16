import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { deleteDeviceMapping } from '@/lib/ninjaone';

/**
 * DELETE /api/admin/device-mappings/[id]
 *
 * Deletes a device mapping, unlinking a NinjaOne device from a Supabase asset.
 *
 * @param request - The incoming request
 * @param context - Route context containing the mapping ID
 * @returns Success response or error
 *
 * @sideEffects
 * - Removes the record from device_mappings table
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Mapping ID is required' }, { status: 400 });
    }

    const success = await deleteDeviceMapping(id);

    if (!success) {
      return NextResponse.json({ error: 'Device mapping not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error deleting device mapping:', error);
    return NextResponse.json(
      { error: 'Failed to delete device mapping' },
      { status: 500 }
    );
  }
}
