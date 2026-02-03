/**
 * NinjaOne RMM API Client
 *
 * TypeScript client for the NinjaOne API that handles authentication,
 * device fetching, and mapping to RepairShopr assets.
 *
 * API Documentation: https://app.ninjarmm.com/apidocs/
 *
 * Features:
 * - Fully typed API responses
 * - In-memory caching with TTL
 * - Rate limiting with exponential backoff
 * - Graceful degradation when API is unavailable
 * - Device mapping to RepairShopr assets
 */

import { supabaseAdmin, isSupabaseAdminConfigured } from './supabase';

// =============================================================================
// Types & Interfaces
// =============================================================================

/**
 * NinjaOne API configuration
 */
export interface NinjaOneConfig {
  apiUrl: string;
  clientId: string;
  clientSecret: string;
  accessToken?: string;
}

/**
 * Hardware information for a NinjaOne device
 */
export interface NinjaOneHardware {
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  processorName?: string;
  processorCores?: number;
  ramGb?: number;
  diskDrives?: Array<{
    name?: string;
    sizeGb?: number;
    freeGb?: number;
    type?: 'SSD' | 'HDD' | 'NVMe' | 'Unknown';
  }>;
  biosVersion?: string;
  biosDate?: string;
}

/**
 * Operating system information
 */
export interface NinjaOneOS {
  name: string;
  version?: string;
  build?: string;
  architecture?: '32-bit' | '64-bit';
  lastBootTime?: string;
}

/**
 * Network adapter information
 */
export interface NinjaOneNetworkAdapter {
  name: string;
  macAddress?: string;
  ipAddresses?: string[];
  type?: 'Ethernet' | 'WiFi' | 'Virtual' | 'Unknown';
}

/**
 * NinjaOne device (normalized from API response)
 */
export interface NinjaOneDevice {
  /** NinjaOne device ID */
  id: number;
  /** Display name of the device */
  name: string;
  /** System hostname */
  systemName?: string;
  /** Operating system info */
  os: string;
  /** Full OS details */
  osDetails?: NinjaOneOS;
  /** Device status */
  status: 'online' | 'offline' | 'unknown';
  /** Last seen timestamp */
  lastSeen: Date;
  /** Last contact timestamp (from API) */
  lastContact?: Date;
  /** Hardware specifications */
  hardware: NinjaOneHardware;
  /** Network adapters */
  networkAdapters?: NinjaOneNetworkAdapter[];
  /** Device type/class */
  deviceClass?: 'WINDOWS_WORKSTATION' | 'WINDOWS_SERVER' | 'MAC' | 'LINUX' | 'CLOUD_MONITOR' | 'VMWARE_HOST' | 'UNKNOWN';
  /** Organization ID in NinjaOne */
  organizationId?: number;
  /** Organization name */
  organizationName?: string;
  /** Location ID */
  locationId?: number;
  /** Location name */
  locationName?: string;
  /** Policy ID */
  policyId?: number;
  /** Policy name */
  policyName?: string;
  /** Device notes */
  notes?: string;
  /** Custom fields from NinjaOne */
  customFields?: Record<string, unknown>;
  /** Tags assigned to device */
  tags?: string[];
  /** Creation timestamp */
  createdAt?: Date;
  /** Last update timestamp */
  updatedAt?: Date;
}

/**
 * Raw device response from NinjaOne API
 */
interface NinjaOneRawDevice {
  id: number;
  parentDeviceId?: number;
  organizationId?: number;
  locationId?: number;
  nodeClass?: string;
  nodeRoleId?: number;
  rolePolicyId?: number;
  policyId?: number;
  approvalStatus?: string;
  offline?: boolean;
  displayName?: string;
  systemName?: string;
  dnsName?: string;
  lastContact?: string;
  lastUpdate?: string;
  created?: string;
  splashtopStatus?: string;
  teamViewerStatus?: string;
  notes?: string;
  system?: {
    name?: string;
    manufacturer?: string;
    model?: string;
    biosSerialNumber?: string;
    serialNumber?: string;
    domain?: string;
    chassisType?: string;
  };
  os?: {
    name?: string;
    version?: string;
    manufacturer?: string;
    architecture?: string;
    buildNumber?: string;
    lastBootTime?: string;
  };
  processor?: {
    name?: string;
    cores?: number;
    logicalProcessors?: number;
    architecture?: string;
  };
  memory?: {
    capacity?: number;
  };
  volumes?: Array<{
    name?: string;
    label?: string;
    driveType?: string;
    capacity?: number;
    freeSpace?: number;
    serialNumber?: string;
  }>;
  networkInterfaces?: Array<{
    name?: string;
    macAddress?: string;
    speed?: number;
    ipv4Addresses?: string[];
    ipv6Addresses?: string[];
    type?: string;
  }>;
  tags?: string[];
  fields?: Record<string, unknown>;
}

/**
 * Organization from NinjaOne API
 */
export interface NinjaOneOrganization {
  id: number;
  name: string;
  description?: string;
  nodeApprovalMode?: string;
  locations?: Array<{
    id: number;
    name: string;
    address?: string;
  }>;
}

/**
 * Device mapping record (links NinjaOne to Supabase rs_assets)
 */
export interface DeviceMapping {
  id: string;
  /** References rs_assets.id (Supabase internal ID) */
  assetId: number;
  ninjaoneDeviceId: number;
  deviceName?: string;
  serialNumber?: string;
  ownerUserId?: string;
  lastSyncAt: Date;
  syncStatus: 'synced' | 'pending' | 'error' | 'stale';
  syncError?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * OAuth token response from NinjaOne
 */
interface NinjaOneTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

/**
 * API error response
 */
export interface NinjaOneErrorResponse {
  error?: string;
  error_description?: string;
  resultCode?: string;
  errorMessage?: string;
}

/**
 * Custom error class for NinjaOne API errors
 */
export class NinjaOneAPIError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly retryAfter?: number;

  constructor(
    message: string,
    status: number,
    code: string = 'API_ERROR',
    retryAfter?: number
  ) {
    super(message);
    this.name = 'NinjaOneAPIError';
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

// =============================================================================
// Cache Implementation
// =============================================================================

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  fetchedAt: number;
}

/**
 * In-memory cache with TTL support
 */
class APICache {
  private cache = new Map<string, CacheEntry<unknown>>();

  /**
   * Get cached data if valid
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Get cached data even if expired (for fallback)
   */
  getStale<T>(key: string): { data: T; isStale: boolean } | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    return {
      data: entry.data,
      isStale: Date.now() > entry.expiresAt,
    };
  }

  /**
   * Set cached data with TTL in milliseconds
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
      fetchedAt: Date.now(),
    });
  }

  /**
   * Invalidate a specific cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all cache entries matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats for monitoring
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// =============================================================================
// Constants
// =============================================================================

/** Cache TTL for device lists (5 minutes) */
const CACHE_TTL_LIST_MS = 5 * 60 * 1000;

/** Cache TTL for individual device details (1 minute) */
const CACHE_TTL_DETAIL_MS = 1 * 60 * 1000;

/** Cache TTL for organizations (10 minutes) */
const CACHE_TTL_ORG_MS = 10 * 60 * 1000;

/** Maximum retry attempts for rate-limited requests */
const MAX_RETRY_ATTEMPTS = 3;

/** Base delay for exponential backoff (milliseconds) */
const BASE_RETRY_DELAY_MS = 1000;

/** Token expiration buffer (refresh 5 minutes before expiry) */
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000;

// =============================================================================
// NinjaOne Client
// =============================================================================

/**
 * NinjaOne RMM API Client
 *
 * Provides typed access to NinjaOne API with caching and rate limiting.
 */
export class NinjaOneClient {
  private readonly apiUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private readonly cache = new APICache();
  private isApiAvailable = true;
  private lastApiCheck = 0;

  constructor(config: NinjaOneConfig) {
    // Normalize API URL: strip trailing slash and any /api/v2 path suffix,
    // since endpoints already include /v2/ prefix
    this.apiUrl = config.apiUrl.replace(/\/$/, '').replace(/\/api\/v2$/, '').replace(/\/v2$/, '');
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.accessToken = config.accessToken || null;
  }

  // ===========================================================================
  // Authentication
  // ===========================================================================

  /**
   * Get a valid access token, refreshing if necessary
   */
  private async getAccessToken(): Promise<string> {
    // Check if current token is still valid
    if (this.accessToken && Date.now() < this.tokenExpiresAt - TOKEN_EXPIRY_BUFFER_MS) {
      return this.accessToken;
    }

    // Request new token - use base URL (strip any /api/v2 path) since token
    // endpoint is always at the domain root: https://app.ninjarmm.com/ws/oauth/token
    const baseUrl = new URL(this.apiUrl).origin;
    const tokenUrl = `${baseUrl}/ws/oauth/token`;

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: 'monitoring management',
      }),
    });

    if (!response.ok) {
      const error = await this.parseErrorResponse(response);
      throw new NinjaOneAPIError(
        error.message || 'Failed to authenticate with NinjaOne',
        response.status,
        'AUTH_ERROR'
      );
    }

    const data: NinjaOneTokenResponse = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + data.expires_in * 1000;

    return this.accessToken;
  }

  // ===========================================================================
  // Core Request Methods
  // ===========================================================================

  /**
   * Parse error response from NinjaOne API
   */
  private async parseErrorResponse(
    response: Response
  ): Promise<{ message: string; code?: string }> {
    try {
      const data: NinjaOneErrorResponse = await response.json();
      return {
        message:
          data.error_description ||
          data.errorMessage ||
          data.error ||
          `HTTP ${response.status}`,
        code: data.resultCode || data.error,
      };
    } catch {
      return {
        message: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  }

  /**
   * Make an authenticated API request with retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<T> {
    const token = await this.getAccessToken();
    const url = `${this.apiUrl}${endpoint}`;
    console.log(`[NinjaOne] Request URL: ${url} (apiUrl: ${this.apiUrl})`);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Handle rate limiting with exponential backoff
      if (response.status === 429) {
        const retryAfter = parseInt(
          response.headers.get('Retry-After') || '60',
          10
        );

        if (attempt < MAX_RETRY_ATTEMPTS) {
          const delay = Math.min(
            retryAfter * 1000,
            BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1)
          );

          console.log(
            `[NinjaOne] Rate limited. Retrying in ${delay}ms (attempt ${attempt}/${MAX_RETRY_ATTEMPTS})`
          );

          await this.sleep(delay);
          return this.request<T>(endpoint, options, attempt + 1);
        }

        throw new NinjaOneAPIError(
          'Rate limit exceeded. Please try again later.',
          429,
          'RATE_LIMIT_EXCEEDED',
          retryAfter
        );
      }

      // Handle other errors
      if (!response.ok) {
        const error = await this.parseErrorResponse(response);

        // Check for 5xx errors and mark API as potentially unavailable
        if (response.status >= 500) {
          this.isApiAvailable = false;
          this.lastApiCheck = Date.now();
        }

        throw new NinjaOneAPIError(
          error.message,
          response.status,
          error.code || 'API_ERROR'
        );
      }

      // Mark API as available on successful request
      this.isApiAvailable = true;
      this.lastApiCheck = Date.now();

      // Handle empty responses
      const text = await response.text();
      if (!text) {
        return {} as T;
      }

      return JSON.parse(text) as T;
    } catch (error) {
      // Re-throw NinjaOneAPIError
      if (error instanceof NinjaOneAPIError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        this.isApiAvailable = false;
        this.lastApiCheck = Date.now();
        throw new NinjaOneAPIError(
          'Network error: Unable to connect to NinjaOne API',
          0,
          'NETWORK_ERROR'
        );
      }

      throw new NinjaOneAPIError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        0,
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if API is available (for graceful degradation)
   */
  public isAvailable(): boolean {
    // Re-check API availability every 5 minutes
    if (!this.isApiAvailable && Date.now() - this.lastApiCheck > 5 * 60 * 1000) {
      this.isApiAvailable = true; // Optimistically reset
    }
    return this.isApiAvailable;
  }

  // ===========================================================================
  // Device Normalization
  // ===========================================================================

  /**
   * Normalize raw API device to our typed interface
   */
  private normalizeDevice(raw: NinjaOneRawDevice): NinjaOneDevice {
    // Determine device status
    let status: NinjaOneDevice['status'] = 'unknown';
    if (raw.offline === false) {
      status = 'online';
    } else if (raw.offline === true) {
      status = 'offline';
    }

    // Parse disk drives
    const diskDrives = (raw.volumes || []).map((vol) => {
      let driveType: 'SSD' | 'HDD' | 'NVMe' | 'Unknown' = 'Unknown';
      if (vol.driveType) {
        const type = vol.driveType.toLowerCase();
        if (type.includes('ssd')) driveType = 'SSD';
        else if (type.includes('hdd')) driveType = 'HDD';
        else if (type.includes('nvme')) driveType = 'NVMe';
      }

      return {
        name: vol.label || vol.name,
        sizeGb: vol.capacity ? Math.round(vol.capacity / (1024 * 1024 * 1024)) : undefined,
        freeGb: vol.freeSpace ? Math.round(vol.freeSpace / (1024 * 1024 * 1024)) : undefined,
        type: driveType,
      };
    });

    // Parse network adapters
    const networkAdapters: NinjaOneNetworkAdapter[] = (raw.networkInterfaces || []).map((iface) => {
      let adapterType: NinjaOneNetworkAdapter['type'] = 'Unknown';
      const ifaceName = (iface.name || '').toLowerCase();
      if (ifaceName.includes('ethernet') || ifaceName.includes('lan')) {
        adapterType = 'Ethernet';
      } else if (ifaceName.includes('wi-fi') || ifaceName.includes('wireless') || ifaceName.includes('wifi')) {
        adapterType = 'WiFi';
      } else if (ifaceName.includes('virtual') || ifaceName.includes('vmware') || ifaceName.includes('hyper-v')) {
        adapterType = 'Virtual';
      }

      return {
        name: iface.name || 'Unknown',
        macAddress: iface.macAddress,
        ipAddresses: [...(iface.ipv4Addresses || []), ...(iface.ipv6Addresses || [])],
        type: adapterType,
      };
    });

    // Map device class
    let deviceClass: NinjaOneDevice['deviceClass'] = 'UNKNOWN';
    if (raw.nodeClass) {
      const classMap: Record<string, NinjaOneDevice['deviceClass']> = {
        WINDOWS_WORKSTATION: 'WINDOWS_WORKSTATION',
        WINDOWS_SERVER: 'WINDOWS_SERVER',
        MAC: 'MAC',
        LINUX: 'LINUX',
        CLOUD_MONITOR: 'CLOUD_MONITOR',
        VMWARE_HOST: 'VMWARE_HOST',
      };
      deviceClass = classMap[raw.nodeClass] || 'UNKNOWN';
    }

    return {
      id: raw.id,
      name: raw.displayName || raw.systemName || `Device ${raw.id}`,
      systemName: raw.systemName,
      os: raw.os?.name || 'Unknown',
      osDetails: raw.os
        ? {
            name: raw.os.name || 'Unknown',
            version: raw.os.version,
            build: raw.os.buildNumber,
            architecture: raw.os.architecture as NinjaOneOS['architecture'],
            lastBootTime: raw.os.lastBootTime,
          }
        : undefined,
      status,
      lastSeen: raw.lastContact ? new Date(raw.lastContact) : new Date(),
      lastContact: raw.lastContact ? new Date(raw.lastContact) : undefined,
      hardware: {
        manufacturer: raw.system?.manufacturer,
        model: raw.system?.model,
        serialNumber: raw.system?.serialNumber || raw.system?.biosSerialNumber,
        processorName: raw.processor?.name,
        processorCores: raw.processor?.cores,
        ramGb: raw.memory?.capacity
          ? Math.round(raw.memory.capacity / (1024 * 1024 * 1024))
          : undefined,
        diskDrives,
      },
      networkAdapters,
      deviceClass,
      organizationId: raw.organizationId,
      locationId: raw.locationId,
      policyId: raw.policyId,
      notes: raw.notes,
      customFields: raw.fields,
      tags: raw.tags,
      createdAt: raw.created ? new Date(raw.created) : undefined,
      updatedAt: raw.lastUpdate ? new Date(raw.lastUpdate) : undefined,
    };
  }

  // ===========================================================================
  // Public API Methods
  // ===========================================================================

  /**
   * Get all devices
   *
   * @returns Array of all devices
   *
   * @example
   * ```typescript
   * const devices = await client.getDevices();
   * console.log(`Found ${devices.length} devices`);
   * ```
   */
  async getDevices(): Promise<NinjaOneDevice[]> {
    const cacheKey = 'devices:all';

    // Check cache first
    const cached = this.cache.get<NinjaOneDevice[]>(cacheKey);
    if (cached) {
      console.log('[NinjaOne] Returning cached device list');
      return cached;
    }

    // Try to fetch fresh data
    try {
      const rawDevices = await this.request<NinjaOneRawDevice[]>('/v2/devices');
      const devices = rawDevices.map((d) => this.normalizeDevice(d));

      // Cache the results
      this.cache.set(cacheKey, devices, CACHE_TTL_LIST_MS);

      return devices;
    } catch (error) {
      // On error, try to return stale cached data
      const stale = this.cache.getStale<NinjaOneDevice[]>(cacheKey);
      if (stale) {
        console.log('[NinjaOne] API error, returning stale cached data');
        return stale.data;
      }
      throw error;
    }
  }

  /**
   * Get a single device by ID
   *
   * @param id - NinjaOne device ID
   * @returns Device details
   *
   * @example
   * ```typescript
   * const device = await client.getDeviceById(12345);
   * console.log(`Device: ${device.name}, Status: ${device.status}`);
   * ```
   */
  async getDeviceById(id: number): Promise<NinjaOneDevice> {
    const cacheKey = `device:${id}`;

    // Check cache first
    const cached = this.cache.get<NinjaOneDevice>(cacheKey);
    if (cached) {
      console.log(`[NinjaOne] Returning cached device ${id}`);
      return cached;
    }

    // Fetch fresh data
    try {
      const rawDevice = await this.request<NinjaOneRawDevice>(`/v2/device/${id}`);
      const device = this.normalizeDevice(rawDevice);

      // Cache the result
      this.cache.set(cacheKey, device, CACHE_TTL_DETAIL_MS);

      return device;
    } catch (error) {
      // On error, try to return stale cached data
      const stale = this.cache.getStale<NinjaOneDevice>(cacheKey);
      if (stale) {
        console.log(`[NinjaOne] API error, returning stale cached device ${id}`);
        return stale.data;
      }
      throw error;
    }
  }

  /**
   * Get devices by organization name (customer match)
   *
   * @param searchTerm - Customer email or name to search for
   * @returns Array of matching devices
   *
   * @example
   * ```typescript
   * const devices = await client.getDevicesByCustomer('john@example.com');
   * ```
   */
  async getDevicesByCustomer(searchTerm: string): Promise<NinjaOneDevice[]> {
    const cacheKey = `devices:customer:${searchTerm.toLowerCase()}`;

    // Check cache first
    const cached = this.cache.get<NinjaOneDevice[]>(cacheKey);
    if (cached) {
      console.log(`[NinjaOne] Returning cached devices for customer: ${searchTerm}`);
      return cached;
    }

    try {
      // Get all organizations to find matching customer
      const orgs = await this.getOrganizations();
      const searchLower = searchTerm.toLowerCase();

      // Find organizations that match the search term
      const matchingOrgs = orgs.filter(
        (org) =>
          org.name.toLowerCase().includes(searchLower) ||
          org.description?.toLowerCase().includes(searchLower)
      );

      if (matchingOrgs.length === 0) {
        console.log(`[NinjaOne] No organizations found matching: ${searchTerm}`);
        return [];
      }

      // Get all devices and filter by matching organization IDs
      const allDevices = await this.getDevices();
      const orgIds = new Set(matchingOrgs.map((o) => o.id));
      const devices = allDevices.filter((d) => d.organizationId && orgIds.has(d.organizationId));

      // Cache the results
      this.cache.set(cacheKey, devices, CACHE_TTL_LIST_MS);

      return devices;
    } catch (error) {
      // On error, try to return stale cached data
      const stale = this.cache.getStale<NinjaOneDevice[]>(cacheKey);
      if (stale) {
        console.log(`[NinjaOne] API error, returning stale cached customer devices`);
        return stale.data;
      }
      throw error;
    }
  }

  /**
   * Get all organizations
   *
   * @returns Array of organizations
   */
  async getOrganizations(): Promise<NinjaOneOrganization[]> {
    const cacheKey = 'organizations:all';

    // Check cache first
    const cached = this.cache.get<NinjaOneOrganization[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const orgs = await this.request<NinjaOneOrganization[]>('/v2/organizations');

    // Cache the results
    this.cache.set(cacheKey, orgs, CACHE_TTL_ORG_MS);

    return orgs;
  }

  /**
   * Search devices by various criteria
   *
   * @param options - Search options
   * @returns Array of matching devices
   */
  async searchDevices(options: {
    name?: string;
    serialNumber?: string;
    status?: 'online' | 'offline';
    deviceClass?: NinjaOneDevice['deviceClass'];
    organizationId?: number;
  }): Promise<NinjaOneDevice[]> {
    const allDevices = await this.getDevices();

    return allDevices.filter((device) => {
      if (options.name) {
        const nameLower = options.name.toLowerCase();
        const matchesName =
          device.name.toLowerCase().includes(nameLower) ||
          device.systemName?.toLowerCase().includes(nameLower);
        if (!matchesName) return false;
      }

      if (options.serialNumber) {
        if (device.hardware.serialNumber !== options.serialNumber) return false;
      }

      if (options.status && device.status !== options.status) return false;

      if (options.deviceClass && device.deviceClass !== options.deviceClass) return false;

      if (options.organizationId && device.organizationId !== options.organizationId) return false;

      return true;
    });
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): { size: number; keys: string[] } {
    return this.cache.getStats();
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Invalidate cache for a specific device
   */
  invalidateDevice(deviceId: number): void {
    this.cache.invalidate(`device:${deviceId}`);
    this.cache.invalidate('devices:all');
  }
}

// =============================================================================
// Device Mapping Functions (Supabase Integration)
// =============================================================================

/**
 * Get device mapping by Supabase asset ID (rs_assets.id)
 */
export async function getDeviceMappingByAssetId(
  assetId: number
): Promise<DeviceMapping | null> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
    console.warn('[NinjaOne] Supabase not configured, device mappings unavailable');
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from('device_mappings')
    .select('*')
    .eq('asset_id', assetId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[NinjaOne] Error fetching device mapping:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    assetId: data.asset_id,
    ninjaoneDeviceId: data.ninjaone_device_id,
    deviceName: data.device_name,
    serialNumber: data.serial_number,
    ownerUserId: data.owner_user_id,
    lastSyncAt: new Date(data.last_sync_at),
    syncStatus: data.sync_status,
    syncError: data.sync_error,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Get device mapping by NinjaOne device ID
 */
export async function getDeviceMappingByNinjaId(
  ninjaoneDeviceId: number
): Promise<DeviceMapping | null> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
    console.warn('[NinjaOne] Supabase not configured, device mappings unavailable');
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from('device_mappings')
    .select('*')
    .eq('ninjaone_device_id', ninjaoneDeviceId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[NinjaOne] Error fetching device mapping:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    assetId: data.asset_id,
    ninjaoneDeviceId: data.ninjaone_device_id,
    deviceName: data.device_name,
    serialNumber: data.serial_number,
    ownerUserId: data.owner_user_id,
    lastSyncAt: new Date(data.last_sync_at),
    syncStatus: data.sync_status,
    syncError: data.sync_error,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Create or update a device mapping
 *
 * @param ninjaoneDeviceId - NinjaOne device ID
 * @param assetId - Supabase rs_assets.id (internal ID)
 * @param options - Additional mapping options
 */
export async function mapDeviceToAsset(
  ninjaoneDeviceId: number,
  assetId: number,
  options?: {
    deviceName?: string;
    serialNumber?: string;
    ownerUserId?: string;
  }
): Promise<DeviceMapping | null> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
    console.warn('[NinjaOne] Supabase not configured, cannot create device mapping');
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from('device_mappings')
    .upsert(
      {
        ninjaone_device_id: ninjaoneDeviceId,
        asset_id: assetId,
        device_name: options?.deviceName,
        serial_number: options?.serialNumber,
        owner_user_id: options?.ownerUserId,
        sync_status: 'synced',
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'asset_id',
      }
    )
    .select()
    .single();

  if (error) {
    console.error('[NinjaOne] Error creating device mapping:', error);
    return null;
  }

  return {
    id: data.id,
    assetId: data.asset_id,
    ninjaoneDeviceId: data.ninjaone_device_id,
    deviceName: data.device_name,
    serialNumber: data.serial_number,
    ownerUserId: data.owner_user_id,
    lastSyncAt: new Date(data.last_sync_at),
    syncStatus: data.sync_status,
    syncError: data.sync_error,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Get all device mappings for a user
 */
export async function getDeviceMappingsByOwner(
  ownerUserId: string
): Promise<DeviceMapping[]> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
    console.warn('[NinjaOne] Supabase not configured, device mappings unavailable');
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from('device_mappings')
    .select('*')
    .eq('owner_user_id', ownerUserId);

  if (error) {
    console.error('[NinjaOne] Error fetching device mappings:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    assetId: row.asset_id,
    ninjaoneDeviceId: row.ninjaone_device_id,
    deviceName: row.device_name,
    serialNumber: row.serial_number,
    ownerUserId: row.owner_user_id,
    lastSyncAt: new Date(row.last_sync_at),
    syncStatus: row.sync_status,
    syncError: row.sync_error,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }));
}

/**
 * Update device mapping sync status
 */
export async function updateDeviceMappingSyncStatus(
  mappingId: string,
  status: DeviceMapping['syncStatus'],
  error?: string
): Promise<boolean> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
    console.warn('[NinjaOne] Supabase not configured, cannot update mapping');
    return false;
  }

  const { error: updateError } = await supabaseAdmin
    .from('device_mappings')
    .update({
      sync_status: status,
      sync_error: error || null,
      last_sync_at: status === 'synced' ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', mappingId);

  if (updateError) {
    console.error('[NinjaOne] Error updating mapping sync status:', updateError);
    return false;
  }

  return true;
}

/**
 * Create a device mapping (alias for mapDeviceToAsset)
 *
 * @param ninjaoneDeviceId - NinjaOne device ID
 * @param assetId - Supabase rs_assets.id (internal ID)
 * @returns Created mapping or null on failure
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export async function createDeviceMapping(
  ninjaoneDeviceId: number,
  assetId: number
): Promise<DeviceMapping | null> {
  return mapDeviceToAsset(ninjaoneDeviceId, assetId);
}

/**
 * Delete a device mapping
 */
export async function deleteDeviceMapping(mappingId: string): Promise<boolean> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
    console.warn('[NinjaOne] Supabase not configured, cannot delete mapping');
    return false;
  }

  const { error } = await supabaseAdmin
    .from('device_mappings')
    .delete()
    .eq('id', mappingId);

  if (error) {
    console.error('[NinjaOne] Error deleting device mapping:', error);
    return false;
  }

  return true;
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a NinjaOne client using environment variables
 *
 * Reads NINJAONE_API_URL, NINJAONE_CLIENT_ID, and NINJAONE_CLIENT_SECRET
 * from environment variables.
 *
 * @returns Configured NinjaOneClient instance
 *
 * @example
 * ```typescript
 * const client = createNinjaOneClient();
 * const devices = await client.getDevices();
 * ```
 */
export function createNinjaOneClient(): NinjaOneClient {
  const apiUrl = process.env.NINJAONE_API_URL;
  const clientId = process.env.NINJAONE_CLIENT_ID;
  const clientSecret = process.env.NINJAONE_CLIENT_SECRET;

  if (!apiUrl) {
    throw new Error(
      'NINJAONE_API_URL environment variable is required. ' +
        'Please set it in your .env file.'
    );
  }

  if (!clientId) {
    throw new Error(
      'NINJAONE_CLIENT_ID environment variable is required. ' +
        'Please set it in your .env file.'
    );
  }

  if (!clientSecret) {
    throw new Error(
      'NINJAONE_CLIENT_SECRET environment variable is required. ' +
        'Please set it in your .env file.'
    );
  }

  return new NinjaOneClient({
    apiUrl,
    clientId,
    clientSecret,
  });
}

/**
 * Check if NinjaOne is configured
 */
export function isNinjaOneConfigured(): boolean {
  return !!(
    process.env.NINJAONE_API_URL &&
    process.env.NINJAONE_CLIENT_ID &&
    process.env.NINJAONE_CLIENT_SECRET
  );
}

// =============================================================================
// Default Export
// =============================================================================

export default NinjaOneClient;
