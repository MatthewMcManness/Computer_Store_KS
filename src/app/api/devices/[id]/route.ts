/**
 * Unified Device Detail API Route
 *
 * Handles GET (get device), PATCH (update device), and DELETE (delete device) requests.
 *
 * @module api/devices/[id]
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getDeviceById,
  updateDevice,
  deleteDevice,
  type UpdateDeviceInput,
} from '@/lib/devices';
import { isSupabaseAdminConfigured } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/devices/[id]
 *
 * Get a single device by ID.
 *
 * @returns JSON response with device
 *
 * @functions_called getDeviceById
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const device = await getDeviceById(deviceId);

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ device });
  } catch (error) {
    console.error('Error in GET /api/devices/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch device' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/devices/[id]
 *
 * Update an existing device.
 *
 * Request Body (all fields optional):
 * - name: Device name
 * - device_type: Device type
 * - serial_number: Serial number
 * - customer_id: Customer ID (null to unassign)
 * - protection_tier: Protection plan tier (null to remove)
 * - os: Operating system
 * - manufacturer: Device manufacturer
 * - model: Device model
 * - processor: CPU info
 * - ram_gb: RAM in GB
 * - status: Device status
 * - notes: Additional notes
 *
 * @returns JSON response with updated device
 *
 * @functions_called getDeviceById, updateDevice
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    // Validate protection_tier if provided
    const validTiers = ['eset', 'silver', 'silver-plus', null];
    if (body.protection_tier !== undefined && !validTiers.includes(body.protection_tier)) {
      return NextResponse.json(
        { error: 'Invalid protection tier' },
        { status: 400 }
      );
    }

    // Validate status if provided
    const validStatuses = ['online', 'offline', 'unknown'];
    if (body.status !== undefined && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Build update input (only include fields that are provided)
    const input: UpdateDeviceInput = {};

    if (body.name !== undefined) input.name = body.name;
    if (body.device_type !== undefined) input.device_type = body.device_type;
    if (body.serial_number !== undefined) input.serial_number = body.serial_number;
    if (body.customer_id !== undefined) input.customer_id = body.customer_id;
    if (body.protection_tier !== undefined) input.protection_tier = body.protection_tier;
    if (body.os !== undefined) input.os = body.os;
    if (body.manufacturer !== undefined) input.manufacturer = body.manufacturer;
    if (body.model !== undefined) input.model = body.model;
    if (body.processor !== undefined) input.processor = body.processor;
    if (body.ram_gb !== undefined) input.ram_gb = body.ram_gb ? parseFloat(body.ram_gb) : null;
    if (body.status !== undefined) input.status = body.status;
    if (body.last_seen !== undefined) input.last_seen = body.last_seen;
    if (body.notes !== undefined) input.notes = body.notes;
    if (body.properties !== undefined) input.properties = body.properties;
    if (body.eset_device_id !== undefined) input.eset_device_id = body.eset_device_id;
    if (body.eset_status !== undefined) input.eset_status = body.eset_status;
    if (body.eset_last_scan !== undefined) input.eset_last_scan = body.eset_last_scan;

    const device = await updateDevice(deviceId, input);

    if (!device) {
      return NextResponse.json(
        { error: 'Failed to update device' },
        { status: 500 }
      );
    }

    return NextResponse.json({ device });
  } catch (error) {
    console.error('Error in PATCH /api/devices/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to update device' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/devices/[id]
 *
 * Delete a device.
 *
 * @returns JSON response with success status
 *
 * @functions_called getDeviceById, deleteDevice
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

    const success = await deleteDevice(deviceId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete device' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/devices/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete device' },
      { status: 500 }
    );
  }
}
