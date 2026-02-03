/**
 * Unified Devices Library
 *
 * Provides CRUD operations for the unified devices system that merges
 * assets and devices into a single concept. Supabase is the sole data store,
 * with NinjaOne integration for managed devices (silver/silver-plus tiers).
 *
 * @module lib/devices
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */

import { supabaseAdmin } from './supabase';

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Protection plan tier for a device.
 * - null: Unmanaged (no monitoring)
 * - 'eset': ESET Protect monitoring
 * - 'silver': NinjaOne RMM monitoring
 * - 'silver-plus': NinjaOne RMM + priority support
 */
export type DeviceProtectionTier = 'eset' | 'silver' | 'silver-plus' | null;

/**
 * Device status indicating online/offline state.
 */
export type DeviceStatus = 'online' | 'offline' | 'unknown';

/**
 * ESET protection status for devices with ESET tier.
 */
export type EsetDeviceStatus = 'protected' | 'expired' | 'unprotected' | null;

/**
 * Unified device record from the devices table.
 */
export interface Device {
  id: number;
  name: string;
  device_type: string | null;
  serial_number: string | null;
  customer_id: number | null;
  protection_tier: DeviceProtectionTier;
  ninjaone_device_id: number | null;
  ninjaone_org_id: number | null;
  eset_device_id: string | null;
  eset_status: EsetDeviceStatus;
  eset_last_scan: string | null;
  os: string | null;
  manufacturer: string | null;
  model: string | null;
  processor: string | null;
  ram_gb: number | null;
  status: DeviceStatus;
  last_seen: string | null;
  notes: string | null;
  properties: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * Input for creating a new device.
 */
export interface CreateDeviceInput {
  name: string;
  device_type?: string;
  serial_number?: string;
  customer_id?: number;
  protection_tier?: DeviceProtectionTier;
  ninjaone_device_id?: number;
  ninjaone_org_id?: number;
  eset_device_id?: string;
  eset_status?: EsetDeviceStatus;
  os?: string;
  manufacturer?: string;
  model?: string;
  processor?: string;
  ram_gb?: number;
  status?: DeviceStatus;
  notes?: string;
  properties?: Record<string, unknown>;
}

/**
 * Input for updating an existing device.
 */
export interface UpdateDeviceInput {
  name?: string;
  device_type?: string;
  serial_number?: string;
  customer_id?: number | null;
  protection_tier?: DeviceProtectionTier;
  ninjaone_device_id?: number | null;
  ninjaone_org_id?: number | null;
  eset_device_id?: string | null;
  eset_status?: EsetDeviceStatus;
  eset_last_scan?: string | null;
  os?: string;
  manufacturer?: string;
  model?: string;
  processor?: string;
  ram_gb?: number;
  status?: DeviceStatus;
  last_seen?: string | null;
  notes?: string;
  properties?: Record<string, unknown>;
}

/**
 * Filters for querying devices.
 */
export interface DeviceFilters {
  customer_id?: number;
  protection_tier?: DeviceProtectionTier | 'all';
  status?: DeviceStatus | 'all';
  device_type?: string;
  search?: string;
  has_ninjaone?: boolean;
  limit?: number;
  offset?: number;
}

// =============================================================================
// Core CRUD Functions
// =============================================================================

/**
 * Get all devices with optional filtering.
 *
 * @param filters - Optional filters to apply to the query
 * @returns Array of devices matching the filters
 *
 * @example
 * // Get all devices
 * const devices = await getDevices();
 *
 * // Get Silver tier devices for a customer
 * const devices = await getDevices({ customer_id: 123, protection_tier: 'silver' });
 *
 * @functions_called supabaseAdmin
 * @called_by GET /api/devices
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export async function getDevices(filters?: DeviceFilters): Promise<Device[]> {
  if (!supabaseAdmin) return [];

  let query = supabaseAdmin
    .from('devices')
    .select('*')
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters?.customer_id) {
    query = query.eq('customer_id', filters.customer_id);
  }

  if (filters?.protection_tier && filters.protection_tier !== 'all') {
    query = query.eq('protection_tier', filters.protection_tier);
  }

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters?.device_type) {
    query = query.eq('device_type', filters.device_type);
  }

  if (filters?.has_ninjaone !== undefined) {
    if (filters.has_ninjaone) {
      query = query.not('ninjaone_device_id', 'is', null);
    } else {
      query = query.is('ninjaone_device_id', null);
    }
  }

  if (filters?.search) {
    const searchTerm = `%${filters.search}%`;
    query = query.or(`name.ilike.${searchTerm},serial_number.ilike.${searchTerm},os.ilike.${searchTerm}`);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching devices:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a single device by ID.
 *
 * @param id - The device ID
 * @returns The device or null if not found
 *
 * @functions_called supabaseAdmin
 * @called_by GET /api/devices/[id]
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export async function getDeviceById(id: number): Promise<Device | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('devices')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error fetching device by ID:', error);
    }
    return null;
  }

  return data;
}

/**
 * Get a device by its NinjaOne device ID.
 *
 * @param ninjaoneDeviceId - The NinjaOne device ID
 * @returns The device or null if not found
 *
 * @functions_called supabaseAdmin
 * @called_by NinjaOne sync operations
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export async function getDeviceByNinjaOneId(ninjaoneDeviceId: number): Promise<Device | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('devices')
    .select('*')
    .eq('ninjaone_device_id', ninjaoneDeviceId)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error fetching device by NinjaOne ID:', error);
    }
    return null;
  }

  return data;
}

/**
 * Create a new device.
 *
 * @param input - The device data to create
 * @returns The created device or null on error
 *
 * @sideEffects
 * - Inserts a row into the devices table
 *
 * @functions_called supabaseAdmin
 * @called_by POST /api/devices
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export async function createDevice(input: CreateDeviceInput): Promise<Device | null> {
  if (!supabaseAdmin) return null;

  const now = new Date().toISOString();

  const insertData = {
    name: input.name,
    device_type: input.device_type || null,
    serial_number: input.serial_number || null,
    customer_id: input.customer_id || null,
    protection_tier: input.protection_tier || null,
    ninjaone_device_id: input.ninjaone_device_id || null,
    ninjaone_org_id: input.ninjaone_org_id || null,
    eset_device_id: input.eset_device_id || null,
    eset_status: input.eset_status || null,
    os: input.os || null,
    manufacturer: input.manufacturer || null,
    model: input.model || null,
    processor: input.processor || null,
    ram_gb: input.ram_gb || null,
    status: input.status || 'unknown',
    notes: input.notes || null,
    properties: input.properties || {},
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabaseAdmin
    .from('devices')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error creating device:', error);
    return null;
  }

  return data;
}

/**
 * Update an existing device.
 *
 * @param id - The device ID to update
 * @param input - The fields to update
 * @returns The updated device or null on error
 *
 * @sideEffects
 * - Updates a row in the devices table
 *
 * @functions_called supabaseAdmin
 * @called_by PATCH /api/devices/[id]
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export async function updateDevice(id: number, input: UpdateDeviceInput): Promise<Device | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('devices')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating device:', error);
    return null;
  }

  return data;
}

/**
 * Delete a device.
 *
 * @param id - The device ID to delete
 * @returns True if deleted, false on error
 *
 * @sideEffects
 * - Deletes a row from the devices table
 *
 * @functions_called supabaseAdmin
 * @called_by DELETE /api/devices/[id]
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export async function deleteDevice(id: number): Promise<boolean> {
  if (!supabaseAdmin) return false;

  const { error } = await supabaseAdmin
    .from('devices')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting device:', error);
    return false;
  }

  return true;
}

// =============================================================================
// Customer-Specific Functions
// =============================================================================

/**
 * Get all devices for a specific customer.
 *
 * @param customerId - The customer's ID (repairshopr_id from rs_customers)
 * @returns Array of devices belonging to the customer
 *
 * @functions_called getDevices
 * @called_by Customer page, device lists
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export async function getDevicesByCustomerId(customerId: number): Promise<Device[]> {
  return getDevices({ customer_id: customerId });
}

/**
 * Get a customer's protection summary based on their devices.
 *
 * @param customerId - The customer's ID
 * @returns Summary of protection tiers across devices
 *
 * @functions_called getDevicesByCustomerId
 * @called_by Customer page
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export async function getCustomerProtectionSummaryFromDevices(customerId: number): Promise<{
  total_devices: number;
  unmanaged_count: number;
  eset_count: number;
  silver_count: number;
  silver_plus_count: number;
  highest_tier: DeviceProtectionTier;
}> {
  const devices = await getDevicesByCustomerId(customerId);

  const summary = {
    total_devices: devices.length,
    unmanaged_count: devices.filter(d => !d.protection_tier).length,
    eset_count: devices.filter(d => d.protection_tier === 'eset').length,
    silver_count: devices.filter(d => d.protection_tier === 'silver').length,
    silver_plus_count: devices.filter(d => d.protection_tier === 'silver-plus').length,
    highest_tier: null as DeviceProtectionTier,
  };

  // Determine highest tier
  if (summary.silver_plus_count > 0) {
    summary.highest_tier = 'silver-plus';
  } else if (summary.silver_count > 0) {
    summary.highest_tier = 'silver';
  } else if (summary.eset_count > 0) {
    summary.highest_tier = 'eset';
  }

  return summary;
}

// =============================================================================
// NinjaOne Integration Functions
// =============================================================================

/**
 * Link a device to a NinjaOne managed device.
 *
 * @param deviceId - The local device ID
 * @param ninjaoneDeviceId - The NinjaOne device ID
 * @param ninjaoneOrgId - Optional NinjaOne organization ID
 * @returns The updated device or null on error
 *
 * @sideEffects
 * - Updates the device's ninjaone_device_id and ninjaone_org_id fields
 *
 * @functions_called updateDevice
 * @called_by POST /api/devices/[id]/link-ninjaone
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export async function linkDeviceToNinjaOne(
  deviceId: number,
  ninjaoneDeviceId: number,
  ninjaoneOrgId?: number
): Promise<Device | null> {
  // Check if NinjaOne device is already linked to another device
  const existingDevice = await getDeviceByNinjaOneId(ninjaoneDeviceId);
  if (existingDevice && existingDevice.id !== deviceId) {
    console.error('NinjaOne device is already linked to another device');
    return null;
  }

  return updateDevice(deviceId, {
    ninjaone_device_id: ninjaoneDeviceId,
    ninjaone_org_id: ninjaoneOrgId,
  });
}

/**
 * Unlink a device from NinjaOne.
 *
 * @param deviceId - The local device ID
 * @returns The updated device or null on error
 *
 * @sideEffects
 * - Clears the device's ninjaone_device_id and ninjaone_org_id fields
 *
 * @functions_called updateDevice
 * @called_by DELETE /api/devices/[id]/link-ninjaone
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export async function unlinkDeviceFromNinjaOne(deviceId: number): Promise<Device | null> {
  return updateDevice(deviceId, {
    ninjaone_device_id: null,
    ninjaone_org_id: null,
  });
}

/**
 * Update a device's status and last_seen from NinjaOne data.
 *
 * @param deviceId - The local device ID
 * @param status - The device's online/offline status
 * @param lastSeen - When the device was last seen
 * @returns The updated device or null on error
 *
 * @sideEffects
 * - Updates the device's status and last_seen fields
 *
 * @functions_called updateDevice
 * @called_by NinjaOne sync operations
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export async function updateDeviceStatusFromNinjaOne(
  deviceId: number,
  status: DeviceStatus,
  lastSeen: string | Date
): Promise<Device | null> {
  return updateDevice(deviceId, {
    status,
    last_seen: lastSeen instanceof Date ? lastSeen.toISOString() : lastSeen,
  });
}

/**
 * Sync hardware specs from NinjaOne to a device.
 *
 * @param deviceId - The local device ID
 * @param specs - Hardware specifications from NinjaOne
 * @returns The updated device or null on error
 *
 * @sideEffects
 * - Updates the device's hardware-related fields
 *
 * @functions_called updateDevice
 * @called_by NinjaOne sync operations
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export async function syncDeviceHardwareFromNinjaOne(
  deviceId: number,
  specs: {
    os?: string;
    processor?: string;
    ram_gb?: number;
    manufacturer?: string;
    model?: string;
    serial_number?: string;
  }
): Promise<Device | null> {
  return updateDevice(deviceId, specs);
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Check if a device has NinjaOne management capabilities.
 * A device is managed if it has silver or silver-plus tier AND has a linked NinjaOne device.
 *
 * @param device - The device to check
 * @returns True if the device is NinjaOne managed
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export function isNinjaOneManaged(device: Device): boolean {
  const hasManagedTier = device.protection_tier === 'silver' || device.protection_tier === 'silver-plus';
  const hasNinjaOneLink = !!device.ninjaone_device_id;
  return hasManagedTier && hasNinjaOneLink;
}

/**
 * Check if a device should show NinjaOne panels (tier is silver/silver-plus).
 *
 * @param device - The device to check
 * @returns True if NinjaOne panels should be shown
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export function shouldShowNinjaOnePanels(device: Device): boolean {
  return device.protection_tier === 'silver' || device.protection_tier === 'silver-plus';
}

/**
 * Get devices that need NinjaOne linking (silver/silver-plus tier but no link).
 *
 * @returns Array of devices needing NinjaOne linking
 *
 * @functions_called getDevices
 * @called_by Admin dashboard
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export async function getDevicesNeedingNinjaOneLink(): Promise<Device[]> {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('devices')
    .select('*')
    .in('protection_tier', ['silver', 'silver-plus'])
    .is('ninjaone_device_id', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching devices needing NinjaOne link:', error);
    return [];
  }

  return data || [];
}

/**
 * Search devices by name, serial number, or OS.
 *
 * @param query - Search query string
 * @param limit - Maximum number of results (default: 50)
 * @returns Array of matching devices
 *
 * @functions_called getDevices
 * @called_by Search functionality
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export async function searchDevices(query: string, limit: number = 50): Promise<Device[]> {
  return getDevices({ search: query, limit });
}

/**
 * Get device counts by protection tier.
 *
 * @returns Object with counts per tier
 *
 * @functions_called supabaseAdmin
 * @called_by Admin dashboard
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export async function getDeviceCountsByTier(): Promise<{
  unmanaged: number;
  eset: number;
  silver: number;
  silver_plus: number;
  total: number;
}> {
  if (!supabaseAdmin) {
    return { unmanaged: 0, eset: 0, silver: 0, silver_plus: 0, total: 0 };
  }

  const { data, error } = await supabaseAdmin
    .from('devices')
    .select('protection_tier');

  if (error) {
    console.error('Error fetching device counts:', error);
    return { unmanaged: 0, eset: 0, silver: 0, silver_plus: 0, total: 0 };
  }

  const counts = {
    unmanaged: 0,
    eset: 0,
    silver: 0,
    silver_plus: 0,
    total: data?.length || 0,
  };

  for (const device of data || []) {
    switch (device.protection_tier) {
      case 'eset':
        counts.eset++;
        break;
      case 'silver':
        counts.silver++;
        break;
      case 'silver-plus':
        counts.silver_plus++;
        break;
      default:
        counts.unmanaged++;
    }
  }

  return counts;
}
