/**
 * Unified Devices API Route
 *
 * Handles GET (list all devices) and POST (create device) requests.
 *
 * @module api/devices
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getDevices,
  createDevice,
  type DeviceFilters,
  type CreateDeviceInput,
  type DeviceProtectionTier,
  type DeviceStatus,
} from '@/lib/devices';
import { isSupabaseAdminConfigured } from '@/lib/supabase';

/**
 * GET /api/devices
 *
 * List all devices with optional filtering.
 *
 * Query Parameters:
 * - customer_id: Filter by customer ID
 * - protection_tier: Filter by tier ('eset', 'silver', 'silver-plus', 'all')
 * - status: Filter by status ('online', 'offline', 'unknown', 'all')
 * - device_type: Filter by device type
 * - search: Search by name, serial number, or OS
 * - has_ninjaone: Filter by NinjaOne link status ('true' or 'false')
 * - limit: Maximum number of results
 * - offset: Pagination offset
 *
 * @returns JSON response with devices array
 *
 * @functions_called getDevices
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export async function GET(request: NextRequest) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);

    // Build filters from query parameters
    const filters: DeviceFilters = {};

    const customerIdParam = searchParams.get('customer_id');
    if (customerIdParam) {
      filters.customer_id = parseInt(customerIdParam, 10);
    }

    const tierParam = searchParams.get('protection_tier');
    if (tierParam && tierParam !== 'all') {
      filters.protection_tier = tierParam as DeviceProtectionTier;
    }

    const statusParam = searchParams.get('status');
    if (statusParam && statusParam !== 'all') {
      filters.status = statusParam as DeviceStatus;
    }

    const deviceTypeParam = searchParams.get('device_type');
    if (deviceTypeParam) {
      filters.device_type = deviceTypeParam;
    }

    const searchParam = searchParams.get('search');
    if (searchParam) {
      filters.search = searchParam;
    }

    const hasNinjaoneParam = searchParams.get('has_ninjaone');
    if (hasNinjaoneParam) {
      filters.has_ninjaone = hasNinjaoneParam === 'true';
    }

    const limitParam = searchParams.get('limit');
    if (limitParam) {
      filters.limit = parseInt(limitParam, 10);
    }

    const offsetParam = searchParams.get('offset');
    if (offsetParam) {
      filters.offset = parseInt(offsetParam, 10);
    }

    const devices = await getDevices(filters);

    return NextResponse.json({ devices });
  } catch (error) {
    console.error('Error in GET /api/devices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/devices
 *
 * Create a new device.
 *
 * Request Body:
 * - name: (required) Device name
 * - device_type: Device type (Desktop, Laptop, etc.)
 * - serial_number: Serial number
 * - customer_id: Customer ID
 * - protection_tier: Protection plan tier
 * - os: Operating system
 * - manufacturer: Device manufacturer
 * - model: Device model
 * - notes: Additional notes
 *
 * @returns JSON response with created device
 *
 * @functions_called createDevice
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json(
        { error: 'Device name is required' },
        { status: 400 }
      );
    }

    // Validate protection_tier if provided
    const validTiers = ['eset', 'silver', 'silver-plus', null];
    if (body.protection_tier !== undefined && !validTiers.includes(body.protection_tier)) {
      return NextResponse.json(
        { error: 'Invalid protection tier' },
        { status: 400 }
      );
    }

    const input: CreateDeviceInput = {
      name: body.name.trim(),
      device_type: body.device_type || undefined,
      serial_number: body.serial_number || undefined,
      customer_id: body.customer_id ? parseInt(body.customer_id, 10) : undefined,
      protection_tier: body.protection_tier || undefined,
      os: body.os || undefined,
      manufacturer: body.manufacturer || undefined,
      model: body.model || undefined,
      processor: body.processor || undefined,
      ram_gb: body.ram_gb ? parseFloat(body.ram_gb) : undefined,
      notes: body.notes || undefined,
      properties: body.properties || undefined,
    };

    const device = await createDevice(input);

    if (!device) {
      return NextResponse.json(
        { error: 'Failed to create device' },
        { status: 500 }
      );
    }

    return NextResponse.json({ device }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/devices:', error);
    return NextResponse.json(
      { error: 'Failed to create device' },
      { status: 500 }
    );
  }
}
