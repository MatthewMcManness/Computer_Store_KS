import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createDeviceMapping } from '@/lib/ninjaone';

/**
 * POST /api/admin/device-mappings
 *
 * Creates a new device mapping linking a NinjaOne device to a Supabase asset.
 *
 * @param request - Request containing ninjaoneDeviceId and assetId
 * @returns Created mapping or error response
 *
 * @sideEffects
 * - Creates a new record in device_mappings table
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { ninjaoneDeviceId, assetId } = body;

    if (!ninjaoneDeviceId || !assetId) {
      return NextResponse.json(
        { error: 'ninjaoneDeviceId and assetId are required' },
        { status: 400 }
      );
    }

    const mapping = await createDeviceMapping(ninjaoneDeviceId, assetId);

    return NextResponse.json({ mapping });
  } catch (error) {
    console.error('[API] Error creating device mapping:', error);

    // Check for unique constraint violation
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('unique') || errorMessage.includes('duplicate')) {
      return NextResponse.json(
        { error: 'This device or asset is already mapped' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: errorMessage || 'Failed to create device mapping' },
      { status: 500 }
    );
  }
}
