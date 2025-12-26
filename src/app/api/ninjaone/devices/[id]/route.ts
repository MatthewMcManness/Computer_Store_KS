import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  createNinjaOneClient,
  isNinjaOneConfigured,
  NinjaOneAPIError,
  getDeviceMappingByNinjaId,
} from '@/lib/ninjaone';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/ninjaone/devices/[id]
 *
 * Get detailed information for a specific NinjaOne device.
 *
 * Path Parameters:
 * - id: NinjaOne device ID
 *
 * Returns: NinjaOneDevice object with full details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Check employee authentication
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
    return NextResponse.json(
      { error: 'Unauthorized. Employee access required.' },
      { status: 401 }
    );
  }

  // Check if NinjaOne is configured
  if (!isNinjaOneConfigured()) {
    return NextResponse.json(
      {
        error: 'NinjaOne integration not configured',
        message: 'NINJAONE_API_URL, NINJAONE_CLIENT_ID, and NINJAONE_CLIENT_SECRET must be set',
      },
      { status: 503 }
    );
  }

  const { id } = await params;

  // Validate device ID
  const deviceId = parseInt(id, 10);
  if (isNaN(deviceId) || deviceId <= 0) {
    return NextResponse.json(
      { error: 'Invalid device ID. Must be a positive integer.' },
      { status: 400 }
    );
  }

  try {
    const client = createNinjaOneClient();

    // Fetch device details
    const device = await client.getDeviceById(deviceId);

    // Check if this device has a RepairShopr mapping
    const mapping = await getDeviceMappingByNinjaId(deviceId);

    return NextResponse.json({
      device,
      mapping: mapping
        ? {
            id: mapping.id,
            repairshoprAssetId: mapping.repairshoprAssetId,
            syncStatus: mapping.syncStatus,
            lastSyncAt: mapping.lastSyncAt.toISOString(),
          }
        : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof NinjaOneAPIError) {
      if (error.status === 404) {
        return NextResponse.json(
          { error: `Device with ID ${deviceId} not found` },
          { status: 404 }
        );
      }

      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: 'Too many requests to NinjaOne API. Please try again later.',
            retryAfter: error.retryAfter,
          },
          {
            status: 429,
            headers: error.retryAfter
              ? { 'Retry-After': String(error.retryAfter) }
              : undefined,
          }
        );
      }

      if (error.code === 'NETWORK_ERROR') {
        return NextResponse.json(
          {
            error: 'NinjaOne unavailable',
            message: 'Unable to connect to NinjaOne API.',
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status || 500 }
      );
    }

    console.error(`[NinjaOne API] Error fetching device ${deviceId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch device from NinjaOne' },
      { status: 500 }
    );
  }
}
