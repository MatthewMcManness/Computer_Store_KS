/**
 * ESET Protect Cloud API Client
 *
 * TypeScript client for the ESET Protect Cloud Device Management API.
 * Handles OAuth2 password grant authentication, device fetching,
 * and mapping to the unified devices system.
 *
 * API Region: US (us.device-management.eset.systems)
 * Auth: OAuth2 password grant (username/password → JWT, 60-min expiry)
 *
 * Features:
 * - Fully typed API responses
 * - In-memory caching with TTL
 * - Rate limiting with exponential backoff (10 req/sec limit)
 * - Graceful degradation when API is unavailable
 *
 * @module lib/eset
 * @version 1.0.0 - 2026-02-03T22:58:18Z - Initial implementation
 */

// =============================================================================
// Types & Interfaces
// =============================================================================

/**
 * ESET API configuration.
 */
export interface EsetConfig {
  apiUrl: string;
  authUrl: string;
  username: string;
  password: string;
}

/**
 * ESET active product on a device.
 */
export interface EsetProduct {
  productName: string;
  productVersion?: string;
  subscriptionValidTo?: string;
  subscriptionStatus?: string;
}

/**
 * ESET device hardware information.
 */
export interface EsetHardware {
  totalPhysicalMemoryBytes?: number;
  totalPhysicalMemoryGb?: number;
  processorArchitecture?: string;
}

/**
 * ESET device group.
 */
export interface EsetDeviceGroup {
  uuid: string;
  name: string;
  parentGroupUuid?: string;
  description?: string;
}

/**
 * Normalized ESET device.
 */
export interface EsetDevice {
  uuid: string;
  displayName: string;
  functionalityStatus: 'OK' | 'ATTENTION_RECOMMENDED' | 'ATTENTION_REQUIRED' | 'UNKNOWN';
  lastSyncTime: string | null;
  enrollmentStatus: string | null;
  deviceType: string | null;
  operatingSystem: string | null;
  osVersion?: string | null;
  activeProducts: EsetProduct[];
  primaryLocalIpAddress: string | null;
  publicIpAddress: string | null;
  parentGroupUuid: string | null;
  parentGroupName?: string | null;
  hardware?: EsetHardware;
  macAddresses?: string[];
  fqdn?: string | null;
  connectorVersion?: string | null;
}

/**
 * Raw device from ESET API response.
 */
interface EsetRawDevice {
  deviceUuid?: string;
  uuid?: string;
  displayName?: string;
  functionalityStatus?: string;
  lastSyncTime?: string;
  enrollmentStatus?: string;
  deviceType?: string;
  operatingSystem?: string;
  osVersion?: string;
  activeProducts?: Array<{
    productName?: string;
    productVersion?: string;
    subscriptionValidTo?: string;
    subscriptionStatus?: string;
  }>;
  primaryLocalIpAddress?: string;
  publicIpAddress?: string;
  parentGroupUuid?: string;
  hardware?: {
    totalPhysicalMemoryBytes?: number;
    processorArchitecture?: string;
  };
  macAddresses?: string[];
  fqdn?: string;
  connectorVersion?: string;
}

/**
 * Raw device group from ESET API response.
 */
interface EsetRawDeviceGroup {
  uuid?: string;
  name?: string;
  parentGroupUuid?: string;
  description?: string;
}

/**
 * OAuth token response from ESET.
 */
interface EsetTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

/**
 * Custom error class for ESET API errors.
 *
 * @version 1.0.0 - 2026-02-03T22:58:18Z - Initial implementation
 */
export class EsetAPIError extends Error {
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
    this.name = 'EsetAPIError';
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
 * In-memory cache with TTL support.
 */
class EsetAPICache {
  private cache = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  getStale<T>(key: string): { data: T; isStale: boolean } | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    return {
      data: entry.data,
      isStale: Date.now() > entry.expiresAt,
    };
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
      fetchedAt: Date.now(),
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

// =============================================================================
// Constants
// =============================================================================

/** Cache TTL for device lists (5 minutes) */
const CACHE_TTL_LIST_MS = 5 * 60 * 1000;

/** Cache TTL for individual device details (1 minute) */
const CACHE_TTL_DETAIL_MS = 1 * 60 * 1000;

/** Cache TTL for device groups (10 minutes) */
const CACHE_TTL_GROUPS_MS = 10 * 60 * 1000;

/** Maximum retry attempts for rate-limited requests */
const MAX_RETRY_ATTEMPTS = 3;

/** Base delay for exponential backoff (milliseconds) */
const BASE_RETRY_DELAY_MS = 1000;

/** Token expiration buffer (refresh 5 minutes before expiry) */
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000;

// =============================================================================
// ESET Client
// =============================================================================

/**
 * ESET Protect Cloud API Client.
 *
 * Provides typed access to the ESET Device Management API with caching
 * and rate limiting.
 *
 * @version 1.0.0 - 2026-02-03T22:58:18Z - Initial implementation
 */
export class EsetClient {
  private readonly apiUrl: string;
  private readonly authUrl: string;
  private readonly username: string;
  private readonly password: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private readonly cache = new EsetAPICache();
  private isApiAvailable = true;
  private lastApiCheck = 0;

  constructor(config: EsetConfig) {
    this.apiUrl = config.apiUrl.replace(/\/$/, '');
    this.authUrl = config.authUrl.replace(/\/$/, '');
    this.username = config.username;
    this.password = config.password;
  }

  // ===========================================================================
  // Authentication
  // ===========================================================================

  /**
   * Get a valid access token, refreshing if necessary.
   *
   * Uses OAuth2 password grant to authenticate with ESET.
   * Tokens are cached and refreshed 5 minutes before expiry.
   *
   * @returns Valid access token string
   * @throws {EsetAPIError} When authentication fails
   *
   * @version 1.0.0 - 2026-02-03T22:58:18Z - Initial implementation
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt - TOKEN_EXPIRY_BUFFER_MS) {
      return this.accessToken;
    }

    const tokenUrl = `${this.authUrl}/oauth/token`;

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: this.username,
        password: this.password,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new EsetAPIError(
        `Failed to authenticate with ESET: ${errorText || response.statusText}`,
        response.status,
        'AUTH_ERROR'
      );
    }

    const data: EsetTokenResponse = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + data.expires_in * 1000;

    return this.accessToken;
  }

  // ===========================================================================
  // Core Request Methods
  // ===========================================================================

  /**
   * Make an authenticated API request with retry logic.
   *
   * Handles rate limiting (429) with exponential backoff and
   * marks API as unavailable on 5xx errors for graceful degradation.
   *
   * @param endpoint - API endpoint path (e.g., '/v1/devices')
   * @param options - Fetch request options
   * @param attempt - Current retry attempt number
   * @returns Parsed JSON response
   * @throws {EsetAPIError} On API errors after retries exhausted
   *
   * @version 1.0.0 - 2026-02-03T22:58:18Z - Initial implementation
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<T> {
    const token = await this.getAccessToken();
    const url = `${this.apiUrl}${endpoint}`;

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
            `[ESET] Rate limited. Retrying in ${delay}ms (attempt ${attempt}/${MAX_RETRY_ATTEMPTS})`
          );

          await this.sleep(delay);
          return this.request<T>(endpoint, options, attempt + 1);
        }

        throw new EsetAPIError(
          'Rate limit exceeded. Please try again later.',
          429,
          'RATE_LIMIT_EXCEEDED',
          retryAfter
        );
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');

        if (response.status >= 500) {
          this.isApiAvailable = false;
          this.lastApiCheck = Date.now();
        }

        throw new EsetAPIError(
          errorText || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          'API_ERROR'
        );
      }

      this.isApiAvailable = true;
      this.lastApiCheck = Date.now();

      const text = await response.text();
      if (!text) {
        return {} as T;
      }

      return JSON.parse(text) as T;
    } catch (error) {
      if (error instanceof EsetAPIError) {
        throw error;
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        this.isApiAvailable = false;
        this.lastApiCheck = Date.now();
        throw new EsetAPIError(
          'Network error: Unable to connect to ESET API',
          0,
          'NETWORK_ERROR'
        );
      }

      throw new EsetAPIError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        0,
        'UNKNOWN_ERROR'
      );
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if API is available (for graceful degradation).
   *
   * @returns True if API is believed to be available
   *
   * @version 1.0.0 - 2026-02-03T22:58:18Z - Initial implementation
   */
  public isAvailable(): boolean {
    if (!this.isApiAvailable && Date.now() - this.lastApiCheck > 5 * 60 * 1000) {
      this.isApiAvailable = true;
    }
    return this.isApiAvailable;
  }

  // ===========================================================================
  // Device Normalization
  // ===========================================================================

  /**
   * Normalize raw ESET API device to typed EsetDevice interface.
   *
   * @param raw - Raw device response from ESET API
   * @returns Normalized EsetDevice
   *
   * @version 1.0.0 - 2026-02-03T22:58:18Z - Initial implementation
   */
  private normalizeDevice(raw: EsetRawDevice): EsetDevice {
    const memBytes = raw.hardware?.totalPhysicalMemoryBytes;

    return {
      uuid: raw.deviceUuid || raw.uuid || '',
      displayName: raw.displayName || 'Unknown Device',
      functionalityStatus: (raw.functionalityStatus as EsetDevice['functionalityStatus']) || 'UNKNOWN',
      lastSyncTime: raw.lastSyncTime || null,
      enrollmentStatus: raw.enrollmentStatus || null,
      deviceType: raw.deviceType || null,
      operatingSystem: raw.operatingSystem || null,
      osVersion: raw.osVersion || null,
      activeProducts: (raw.activeProducts || []).map((p) => ({
        productName: p.productName || 'Unknown',
        productVersion: p.productVersion,
        subscriptionValidTo: p.subscriptionValidTo,
        subscriptionStatus: p.subscriptionStatus,
      })),
      primaryLocalIpAddress: raw.primaryLocalIpAddress || null,
      publicIpAddress: raw.publicIpAddress || null,
      parentGroupUuid: raw.parentGroupUuid || null,
      hardware: memBytes
        ? {
            totalPhysicalMemoryBytes: memBytes,
            totalPhysicalMemoryGb: Math.round(memBytes / (1024 * 1024 * 1024)),
            processorArchitecture: raw.hardware?.processorArchitecture,
          }
        : undefined,
      macAddresses: raw.macAddresses,
      fqdn: raw.fqdn || null,
      connectorVersion: raw.connectorVersion || null,
    };
  }

  // ===========================================================================
  // Public API Methods
  // ===========================================================================

  /**
   * Get all ESET devices.
   *
   * Fetches paginated device list from ESET API and returns all results.
   * Results are cached for 5 minutes.
   *
   * @param options - Optional pagination/filter parameters
   * @returns Array of normalized ESET devices
   *
   * @example
   * ```typescript
   * const devices = await client.getDevices();
   * console.log(`Found ${devices.length} ESET devices`);
   * ```
   *
   * @functions_called request, normalizeDevice
   * @called_by GET /api/eset/devices
   *
   * @version 1.0.0 - 2026-02-03T22:58:18Z - Initial implementation
   */
  async getDevices(options?: { pageSize?: number }): Promise<EsetDevice[]> {
    const cacheKey = 'eset:devices:all';

    const cached = this.cache.get<EsetDevice[]>(cacheKey);
    if (cached) {
      console.log('[ESET] Returning cached device list');
      return cached;
    }

    try {
      const allDevices: EsetDevice[] = [];
      let pageToken: string | undefined;
      const pageSize = options?.pageSize || 100;

      // Paginate through all devices
      do {
        const params = new URLSearchParams({ pageSize: String(pageSize) });
        if (pageToken) {
          params.set('pageToken', pageToken);
        }

        const response = await this.request<{
          devices?: EsetRawDevice[];
          nextPageToken?: string;
        }>(`/v1/devices?${params}`);

        if (response.devices) {
          allDevices.push(...response.devices.map((d) => this.normalizeDevice(d)));
        }

        pageToken = response.nextPageToken;
      } while (pageToken);

      this.cache.set(cacheKey, allDevices, CACHE_TTL_LIST_MS);
      return allDevices;
    } catch (error) {
      const stale = this.cache.getStale<EsetDevice[]>(cacheKey);
      if (stale) {
        console.log('[ESET] API error, returning stale cached data');
        return stale.data;
      }
      throw error;
    }
  }

  /**
   * Get a single ESET device by UUID.
   *
   * @param uuid - ESET device UUID
   * @returns Normalized ESET device details
   *
   * @example
   * ```typescript
   * const device = await client.getDeviceById('abc-123-def');
   * console.log(`Device: ${device.displayName}`);
   * ```
   *
   * @functions_called request, normalizeDevice
   * @called_by GET /api/eset/devices/[id]
   *
   * @version 1.0.0 - 2026-02-03T22:58:18Z - Initial implementation
   */
  async getDeviceById(uuid: string): Promise<EsetDevice> {
    const cacheKey = `eset:device:${uuid}`;

    const cached = this.cache.get<EsetDevice>(cacheKey);
    if (cached) {
      console.log(`[ESET] Returning cached device ${uuid}`);
      return cached;
    }

    try {
      const raw = await this.request<EsetRawDevice>(`/v1/devices/${uuid}`);
      const device = this.normalizeDevice(raw);

      this.cache.set(cacheKey, device, CACHE_TTL_DETAIL_MS);
      return device;
    } catch (error) {
      const stale = this.cache.getStale<EsetDevice>(cacheKey);
      if (stale) {
        console.log(`[ESET] API error, returning stale cached device ${uuid}`);
        return stale.data;
      }
      throw error;
    }
  }

  /**
   * Get all ESET device groups.
   *
   * @returns Array of device groups
   *
   * @functions_called request
   * @called_by EsetStatusPanel (for group name resolution)
   *
   * @version 1.0.0 - 2026-02-03T22:58:18Z - Initial implementation
   */
  async getDeviceGroups(): Promise<EsetDeviceGroup[]> {
    const cacheKey = 'eset:groups:all';

    const cached = this.cache.get<EsetDeviceGroup[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.request<{
      deviceGroups?: EsetRawDeviceGroup[];
    }>('/v1/device_groups');

    const groups: EsetDeviceGroup[] = (response.deviceGroups || []).map((g) => ({
      uuid: g.uuid || '',
      name: g.name || 'Unknown Group',
      parentGroupUuid: g.parentGroupUuid,
      description: g.description,
    }));

    this.cache.set(cacheKey, groups, CACHE_TTL_GROUPS_MS);
    return groups;
  }

  /**
   * Search ESET devices by display name.
   *
   * ESET API's displayNames param is exact match only, so we fetch all
   * devices and filter client-side for fuzzy matching.
   *
   * @param query - Search query to match against device names
   * @returns Array of matching devices
   *
   * @functions_called getDevices
   * @called_by GET /api/eset/devices (with search param)
   *
   * @version 1.0.0 - 2026-02-03T22:58:18Z - Initial implementation
   */
  async searchDevices(query: string): Promise<EsetDevice[]> {
    const allDevices = await this.getDevices();
    const queryLower = query.toLowerCase();

    return allDevices.filter((device) => {
      const nameMatch = device.displayName.toLowerCase().includes(queryLower);
      const osMatch = device.operatingSystem?.toLowerCase().includes(queryLower);
      const ipMatch = device.primaryLocalIpAddress?.includes(query) ||
        device.publicIpAddress?.includes(query);
      const fqdnMatch = device.fqdn?.toLowerCase().includes(queryLower);

      return nameMatch || osMatch || ipMatch || fqdnMatch;
    });
  }

  /**
   * Clear all cached data.
   *
   * @version 1.0.0 - 2026-02-03T22:58:18Z - Initial implementation
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Invalidate cache for a specific device.
   *
   * @param uuid - ESET device UUID
   *
   * @version 1.0.0 - 2026-02-03T22:58:18Z - Initial implementation
   */
  invalidateDevice(uuid: string): void {
    this.cache.invalidate(`eset:device:${uuid}`);
    this.cache.invalidate('eset:devices:all');
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create an ESET client using environment variables.
 *
 * Reads ESET_API_URL, ESET_AUTH_URL, ESET_USERNAME, and ESET_PASSWORD
 * from environment variables.
 *
 * @returns Configured EsetClient instance
 *
 * @example
 * ```typescript
 * const client = createEsetClient();
 * const devices = await client.getDevices();
 * ```
 *
 * @version 1.0.0 - 2026-02-03T22:58:18Z - Initial implementation
 */
export function createEsetClient(): EsetClient {
  const apiUrl = process.env.ESET_API_URL;
  const authUrl = process.env.ESET_AUTH_URL;
  const username = process.env.ESET_USERNAME;
  const password = process.env.ESET_PASSWORD;

  if (!apiUrl) {
    throw new Error(
      'ESET_API_URL environment variable is required. ' +
        'Please set it in your .env file.'
    );
  }

  if (!authUrl) {
    throw new Error(
      'ESET_AUTH_URL environment variable is required. ' +
        'Please set it in your .env file.'
    );
  }

  if (!username) {
    throw new Error(
      'ESET_USERNAME environment variable is required. ' +
        'Please set it in your .env file.'
    );
  }

  if (!password) {
    throw new Error(
      'ESET_PASSWORD environment variable is required. ' +
        'Please set it in your .env file.'
    );
  }

  return new EsetClient({
    apiUrl,
    authUrl,
    username,
    password,
  });
}

/**
 * Check if ESET integration is configured.
 *
 * @returns True if all required ESET environment variables are set
 *
 * @version 1.0.0 - 2026-02-03T22:58:18Z - Initial implementation
 */
export function isEsetConfigured(): boolean {
  return !!(
    process.env.ESET_API_URL &&
    process.env.ESET_AUTH_URL &&
    process.env.ESET_USERNAME &&
    process.env.ESET_PASSWORD
  );
}

export default EsetClient;
