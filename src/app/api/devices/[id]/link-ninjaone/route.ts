/**
 * Device NinjaOne Link API Route
 *
 * Handles POST (link to NinjaOne) and DELETE (unlink from NinjaOne) requests.
 *
 * @module api/devices/[id]/link-ninjaone
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getDeviceById,
  linkDeviceToNinjaOne,
  unlinkDeviceFromNinjaOne,
  getDeviceByNinjaOneId,
} from '@/lib/devices';
import { isSupabaseAdminConfigured } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/devices/[id]/link-ninjaone
 *
 * Link a device to a NinjaOne managed device.
 *
 * Request Body:
 * - ninjaone_device_id: (required) The NinjaOne device ID to link
 * - ninjaone_org_id: (optional) The NinjaOne organization ID
 *
 * @returns JSON response with updated device
 *
 * @functions_called getDeviceById, linkDeviceToNinjaOne, getDeviceByNinjaOneId
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const { id } = await params;
    const deviceId = parseInt(id, 10);

    if (isNaN(deviceId)) {
      return NextResponse.json(
        { error: 'Invalid device ID' },
        { status: 400 }
      );
    }

    // Check if device exists
    const existingDevice = await getDeviceById(deviceId);
    if (!existingDevice) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.ninjaone_device_id || typeof body.ninjaone_device_id !== 'number') {
      return NextResponse.json(
        { error: 'NinjaOne device ID is required and must be a number' },
        { status: 400 }
      );
    }

    const ninjaoneDeviceId = body.ninjaone_device_id;
    const ninjaoneOrgId = body.ninjaone_org_id ? parseInt(body.ninjaone_org_id, 10) : undefined;

    // Check if NinjaOne device is already linked to another device
    const linkedDevice = await getDeviceByNinjaOneId(ninjaoneDeviceId);
    if (linkedDevice && linkedDevice.id !== deviceId) {
      return NextResponse.json(
        {
          error: 'This NinjaOne device is already linked to another device',
          linked_device_id: linkedDevice.id,
          linked_device_name: linkedDevice.name,
        },
        { status: 409 }
      );
    }

    // Link the device
    const device = await linkDeviceToNinjaOne(deviceId, ninjaoneDeviceId, ninjaoneOrgId);

    if (!device) {
      return NextResponse.json(
        { error: 'Failed to link device to NinjaOne' },
        { status: 500 }
      );
    }

    return NextResponse.json({ device });
  } catch (error) {
    console.error('Error in POST /api/devices/[id]/link-ninjaone:', error);
    return NextResponse.json(
      { error: 'Failed to link device to NinjaOne' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/devices/[id]/link-ninjaone
 *
 * Unlink a device from NinjaOne.
 *
 * @returns JSON response with updated device
 *
 * @functions_called getDeviceById, unlinkDeviceFromNinjaOne
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const { id } = await params;
    const deviceId = parseInt(id, 10);

    if (isNaN(deviceId)) {
      return NextResponse.json(
        { error: 'Invalid device ID' },
        { status: 400 }
      );
    }

    // Check if device exists
    const existingDevice = await getDeviceById(deviceId);
    if (!existingDevice) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    // Check if device is actually linked
    if (!existingDevice.ninjaone_device_id) {
      return NextResponse.json(
        { error: 'Device is not linked to NinjaOne' },
        { status: 400 }
      );
    }

    // Unlink the device
    const device = await unlinkDeviceFromNinjaOne(deviceId);

    if (!device) {
      return NextResponse.json(
        { error: 'Failed to unlink device from NinjaOne' },
        { status: 500 }
      );
    }

    return NextResponse.json({ device });
  } catch (error) {
    console.error('Error in DELETE /api/devices/[id]/link-ninjaone:', error);
    return NextResponse.json(
      { error: 'Failed to unlink device from NinjaOne' },
      { status: 500 }
    );
  }
}
