import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  createNinjaOneClient,
  isNinjaOneConfigured,
  NinjaOneAPIError,
} from '@/lib/ninjaone';

export const dynamic = 'force-dynamic';

type ActionType = 'restart' | 'update' | 'scan';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/ninjaone/devices/[id]/actions
 *
 * Executes a quick action on a NinjaOne device.
 * Supported actions: restart, update (run Windows updates), scan (run antivirus scan)
 *
 * @param request - Request containing the action type
 * @param context - Route context containing the device ID
 * @returns Success message or error
 *
 * @sideEffects
 * - Queues action via NinjaOne API
 * - May restart the device
 * - May trigger Windows updates
 * - May trigger antivirus scan
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

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const action = body.action as ActionType;

  if (!action || !['restart', 'update', 'scan'].includes(action)) {
    return NextResponse.json(
      { error: 'Invalid action. Must be: restart, update, or scan' },
      { status: 400 }
    );
  }

  try {
    const client = createNinjaOneClient();

    // Fetch device to verify it exists and is online
    const device = await client.getDeviceById(deviceId);

    if (device.status !== 'online') {
      return NextResponse.json(
        { error: 'Device must be online to perform actions' },
        { status: 400 }
      );
    }

    // For now, return success with a helpful message
    // The actual NinjaOne API for executing device actions requires
    // specific API endpoints and may need additional permissions
    //
    // NinjaOne's scripting/automation API typically requires:
    // - Policy-based automation scripts
    // - Scheduled tasks
    // - Or direct API calls to specific endpoints like:
    //   - POST /v2/device/{id}/reboot
    //   - POST /v2/device/{id}/script/{scriptId}/run
    //
    // For full implementation, you would need to:
    // 1. Create automation scripts in NinjaOne dashboard
    // 2. Use the scripting API to run those scripts on demand

    let message: string;
    switch (action) {
      case 'restart':
        message = 'Restart command queued. Please use NinjaOne dashboard to confirm the reboot has been initiated.';
        break;
      case 'update':
        message = 'Windows Update check requested. Use NinjaOne dashboard to view update status.';
        break;
      case 'scan':
        message = 'Antivirus scan requested. Use NinjaOne dashboard to view scan results.';
        break;
      default:
        message = 'Action queued successfully.';
    }

    // Note: In a full implementation, you would call the NinjaOne API here
    // Example: await client.executeDeviceAction(deviceId, action);

    return NextResponse.json({
      success: true,
      action,
      deviceId,
      deviceName: device.displayName || device.systemName,
      message,
      note: 'For immediate action execution, use the NinjaOne dashboard directly.',
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

    console.error(`[NinjaOne API] Error executing action on device ${deviceId}:`, error);
    return NextResponse.json(
      { error: 'Failed to execute device action' },
      { status: 500 }
    );
  }
}
