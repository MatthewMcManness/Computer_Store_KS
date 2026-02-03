/**
 * Device ESET Link API Route
 *
 * Handles POST (link to ESET) and DELETE (unlink from ESET) requests.
 *
 * @module api/devices/[id]/link-eset
 * @version 1.0.0 - 2026-02-03T22:58:18Z - Initial implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getDeviceById,
  linkDeviceToEset,
  unlinkDeviceFromEset,
  getDeviceByEsetId,
} from '@/lib/devices';
import { isSupabaseAdminConfigured } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/devices/[id]/link-eset
 *
 * Link a device to an ESET managed device.
 *
 * Request Body:
 * - eset_device_id: (required) The ESET device UUID to link
 *
 * @param request - The incoming Next.js request
 * @param params - Route parameters containing device ID
 * @returns JSON response with updated device
 *
 * @functions_called getDeviceById, linkDeviceToEset, getDeviceByEsetId
 *
 * @version 1.0.0 - 2026-02-03T22:58:18Z - Initial implementation
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
    if (!body.eset_device_id || typeof body.eset_device_id !== 'string') {
      return NextResponse.json(
        { error: 'ESET device UUID is required and must be a string' },
        { status: 400 }
      );
    }

    const esetDeviceUuid = body.eset_device_id;

    // Check if ESET device is already linked to another device
    const linkedDevice = await getDeviceByEsetId(esetDeviceUuid);
    if (linkedDevice && linkedDevice.id !== deviceId) {
      return NextResponse.json(
        {
          error: 'This ESET device is already linked to another device',
          linked_device_id: linkedDevice.id,
          linked_device_name: linkedDevice.name,
        },
        { status: 409 }
      );
    }

    // Link the device
    const device = await linkDeviceToEset(deviceId, esetDeviceUuid);

    if (!device) {
      return NextResponse.json(
        { error: 'Failed to link device to ESET' },
        { status: 500 }
      );
    }

    return NextResponse.json({ device });
  } catch (error) {
    console.error('Error in POST /api/devices/[id]/link-eset:', error);
    return NextResponse.json(
      { error: 'Failed to link device to ESET' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/devices/[id]/link-eset
 *
 * Unlink a device from ESET.
 *
 * @param request - The incoming Next.js request
 * @param params - Route parameters containing device ID
 * @returns JSON response with updated device
 *
 * @functions_called getDeviceById, unlinkDeviceFromEset
 *
 * @version 1.0.0 - 2026-02-03T22:58:18Z - Initial implementation
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
    if (!existingDevice.eset_device_id) {
      return NextResponse.json(
        { error: 'Device is not linked to ESET' },
        { status: 400 }
      );
    }

    // Unlink the device
    const device = await unlinkDeviceFromEset(deviceId);

    if (!device) {
      return NextResponse.json(
        { error: 'Failed to unlink device from ESET' },
        { status: 500 }
      );
    }

    return NextResponse.json({ device });
  } catch (error) {
    console.error('Error in DELETE /api/devices/[id]/link-eset:', error);
    return NextResponse.json(
      { error: 'Failed to unlink device from ESET' },
      { status: 500 }
    );
  }
}
