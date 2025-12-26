import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  createNinjaOneClient,
  isNinjaOneConfigured,
  NinjaOneAPIError,
} from '@/lib/ninjaone';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ninjaone/devices
 *
 * List all NinjaOne devices. Supports optional filtering.
 *
 * Query Parameters:
 * - status: Filter by 'online' | 'offline'
 * - deviceClass: Filter by device class (e.g., 'WINDOWS_WORKSTATION')
 * - search: Search by device name or system name
 * - organizationId: Filter by NinjaOne organization ID
 *
 * Returns: Array of NinjaOneDevice objects
 */
export async function GET(request: NextRequest) {
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

  try {
    const client = createNinjaOneClient();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const status = searchParams.get('status') as 'online' | 'offline' | null;
    const deviceClass = searchParams.get('deviceClass');
    const search = searchParams.get('search');
    const organizationId = searchParams.get('organizationId');

    // Fetch devices (with optional filtering)
    let devices;

    if (status || deviceClass || search || organizationId) {
      devices = await client.searchDevices({
        name: search || undefined,
        status: status || undefined,
        deviceClass: deviceClass as ReturnType<typeof client.searchDevices> extends Promise<infer R>
          ? R extends Array<infer D>
            ? D extends { deviceClass?: infer C }
              ? C
              : never
            : never
          : never,
        organizationId: organizationId ? parseInt(organizationId, 10) : undefined,
      });
    } else {
      devices = await client.getDevices();
    }

    // Return device list with cache info
    return NextResponse.json({
      devices,
      count: devices.length,
      cached: false, // Cache is handled internally by the client
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof NinjaOneAPIError) {
      // Handle specific NinjaOne errors
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

      if (error.code === 'AUTH_ERROR') {
        return NextResponse.json(
          {
            error: 'Authentication failed',
            message: 'Failed to authenticate with NinjaOne API. Check credentials.',
          },
          { status: 401 }
        );
      }

      if (error.code === 'NETWORK_ERROR') {
        return NextResponse.json(
          {
            error: 'NinjaOne unavailable',
            message: 'Unable to connect to NinjaOne API. The service may be temporarily unavailable.',
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status || 500 }
      );
    }

    console.error('[NinjaOne API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devices from NinjaOne' },
      { status: 500 }
    );
  }
}
