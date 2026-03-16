import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  createNinjaOneClient,
  isNinjaOneConfigured,
  NinjaOneAPIError,
} from '@/lib/ninjaone';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/ninjaone/devices/[id]/remote
 *
 * Initiates a remote access session for a NinjaOne device.
 * Returns a URL to launch the remote session (Splashtop/TeamViewer).
 *
 * @param request - The incoming request
 * @param context - Route context containing the device ID
 * @returns Remote session URL or error
 *
 * @sideEffects
 * - Opens NinjaOne dashboard for remote access
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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
      { error: 'NinjaOne integration not configured' },
      { status: 503 }
    );
  }

  const { id } = await params;
  const deviceId = parseInt(id, 10);

  if (isNaN(deviceId) || deviceId <= 0) {
    return NextResponse.json(
      { error: 'Invalid device ID. Must be a positive integer.' },
      { status: 400 }
    );
  }

  try {
    const client = createNinjaOneClient();

    // Fetch device to check availability
    const device = await client.getDeviceById(deviceId);

    // Check if device is online
    if (device.status !== 'online') {
      return NextResponse.json(
        { error: 'Device must be online to start remote session' },
        { status: 400 }
      );
    }

    // Check for available remote access options
    const splashtopStatus = device.splashtopStatus;
    const teamViewerStatus = device.teamViewerStatus;

    if (!splashtopStatus && !teamViewerStatus) {
      return NextResponse.json(
        { error: 'No remote access software available on this device' },
        { status: 400 }
      );
    }

    // Build NinjaOne dashboard URL for remote access
    // The NinjaOne dashboard provides the remote session launcher
    const ninjaOneUrl = process.env.NINJAONE_API_URL || 'https://app.ninjarmm.com';
    const baseUrl = ninjaOneUrl.replace(/\/ws\/.*$/, '').replace(/\/api$/, '');
    const dashboardUrl = `${baseUrl}/#/deviceDashboard/${deviceId}/overview`;

    // Determine which remote tool is available
    let remoteType = 'unknown';
    if (splashtopStatus) {
      remoteType = 'splashtop';
    } else if (teamViewerStatus) {
      remoteType = 'teamviewer';
    }

    return NextResponse.json({
      url: dashboardUrl,
      remoteType,
      deviceId,
      deviceName: device.displayName || device.systemName,
      message: 'Opening NinjaOne dashboard for remote access',
      instructions: [
        '1. Click the "Remote" button in the NinjaOne dashboard',
        '2. Select your preferred remote tool (Splashtop/TeamViewer)',
        '3. The remote session will launch automatically',
      ],
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
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status || 500 }
      );
    }

    console.error(`[NinjaOne API] Error starting remote session for device ${deviceId}:`, error);
    return NextResponse.json(
      { error: 'Failed to start remote session' },
      { status: 500 }
    );
  }
}
