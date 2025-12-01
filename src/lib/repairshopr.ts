/**
 * RepairShopr API Client
 *
 * TypeScript client for the RepairShopr API that handles authentication
 * and provides typed methods for API interactions.
 *
 * API Documentation: https://feedback.repairshopr.com/knowledgebase/articles/60580-api-introduction-and-requirements
 */

// =============================================================================
// Types & Interfaces
// =============================================================================

export interface RepairShoprConfig {
  subdomain: string;
  baseUrl?: string; // Optional override for testing
}

/**
 * User information from the RepairShopr API
 */
export interface RepairShoprUser {
  id: number;
  email: string;
  full_name: string;
  phone?: string | null;
  mobile?: string | null;
  created_at?: string;
  updated_at?: string;
  pdf_url?: string | null;
  address?: string | null;
  address_2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  business_name?: string | null;
  role?: string | null;
  admin?: boolean;
}

/**
 * Raw response from RepairShopr API (both /sign_in and /me endpoints)
 * The API returns user info in a flat structure, not nested under 'user'
 */
interface RepairShoprRawUserResponse {
  user_token: string;
  user_email: string;
  user_name: string;
  user_id: number;
  admin: boolean;
  can_use_app: boolean;
  two_factor_required: boolean;
  subdomain: string;
  default_location: string | null;
  enable_multi_locations: boolean;
  locations_allowed: string[];
  permissions: Record<string, Record<string, boolean>>;
  account_id: number;
}

/**
 * Normalized response from signIn method
 */
export interface SignInResponse {
  /** API token for subsequent requests (mapped from user_token) */
  api_key: string;
  /** User information */
  user: RepairShoprUser;
  /** Whether the user is an admin */
  admin: boolean;
  /** Whether two-factor authentication is required */
  two_factor_required: boolean;
  /** The subdomain for this account */
  subdomain: string;
  /** User permissions */
  permissions: Record<string, Record<string, boolean>>;
}

/**
 * Normalized response from getMe method
 */
export interface MeResponse {
  /** User information */
  user: RepairShoprUser;
  /** Whether the user is an admin */
  admin: boolean;
  /** The subdomain for this account */
  subdomain: string;
  /** User permissions */
  permissions: Record<string, Record<string, boolean>>;
}

export interface RepairShoprError {
  error: string;
  status: number;
}

export class RepairShoprAPIError extends Error {
  public readonly status: number;
  public readonly code: string;

  constructor(message: string, status: number, code: string = 'API_ERROR') {
    super(message);
    this.name = 'RepairShoprAPIError';
    this.status = status;
    this.code = code;
  }
}

// =============================================================================
// Rate Limit Tracking
// =============================================================================

interface RateLimitState {
  requestCount: number;
  windowStart: number;
}

const RATE_LIMIT_MAX = 180; // 180 requests per minute
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute in milliseconds

// =============================================================================
// RepairShopr Client
// =============================================================================

export class RepairShoprClient {
  private readonly baseUrl: string;
  private readonly subdomain: string;
  private rateLimitState: RateLimitState = {
    requestCount: 0,
    windowStart: Date.now(),
  };

  /**
   * Create a new RepairShopr API client
   *
   * @param config - Configuration object with subdomain and optional base URL override
   */
  constructor(config: RepairShoprConfig) {
    this.subdomain = config.subdomain;
    this.baseUrl =
      config.baseUrl || `https://${config.subdomain}.repairshopr.com/api/v1`;
  }

  /**
   * Check and update rate limit state
   * Returns true if request can proceed, false if rate limited
   */
  private checkRateLimit(): boolean {
    const now = Date.now();

    // Reset window if expired
    if (now - this.rateLimitState.windowStart >= RATE_LIMIT_WINDOW_MS) {
      this.rateLimitState = {
        requestCount: 0,
        windowStart: now,
      };
    }

    // Check if we're at the limit
    if (this.rateLimitState.requestCount >= RATE_LIMIT_MAX) {
      return false;
    }

    // Increment counter
    this.rateLimitState.requestCount++;
    return true;
  }

  /**
   * Get time until rate limit window resets (in milliseconds)
   */
  public getRateLimitResetTime(): number {
    const elapsed = Date.now() - this.rateLimitState.windowStart;
    return Math.max(0, RATE_LIMIT_WINDOW_MS - elapsed);
  }

  /**
   * Get current rate limit status
   */
  public getRateLimitStatus(): {
    remaining: number;
    limit: number;
    resetMs: number;
  } {
    return {
      remaining: Math.max(
        0,
        RATE_LIMIT_MAX - this.rateLimitState.requestCount
      ),
      limit: RATE_LIMIT_MAX,
      resetMs: this.getRateLimitResetTime(),
    };
  }

  /**
   * Make an authenticated API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Check rate limit
    if (!this.checkRateLimit()) {
      const resetMs = this.getRateLimitResetTime();
      throw new RepairShoprAPIError(
        `Rate limit exceeded. Try again in ${Math.ceil(resetMs / 1000)} seconds.`,
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...options.headers,
        },
      });

      // Handle non-OK responses
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorCode = 'HTTP_ERROR';
        let rawErrorBody: unknown = null;

        try {
          rawErrorBody = await response.json();
          const errorBody = rawErrorBody as Record<string, unknown>;
          if (errorBody.error) {
            errorMessage = String(errorBody.error);
          }
          if (errorBody.message) {
            errorMessage = String(errorBody.message);
          }
        } catch {
          // Unable to parse error body, use default message
        }

        // Log detailed error for debugging
        console.log(`[RepairShopr API] Request failed:`, {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          errorMessage,
          rawErrorBody,
        });

        // Map common status codes to specific error codes
        switch (response.status) {
          case 401:
            errorCode = 'UNAUTHORIZED';
            break;
          case 403:
            errorCode = 'FORBIDDEN';
            break;
          case 404:
            errorCode = 'NOT_FOUND';
            break;
          case 422:
            errorCode = 'VALIDATION_ERROR';
            break;
          case 429:
            errorCode = 'RATE_LIMIT_EXCEEDED';
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorCode = 'SERVER_ERROR';
            break;
        }

        throw new RepairShoprAPIError(errorMessage, response.status, errorCode);
      }

      // Parse and return JSON response
      const data = await response.json();
      return data as T;
    } catch (error) {
      // Re-throw RepairShoprAPIError as-is
      if (error instanceof RepairShoprAPIError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new RepairShoprAPIError(
          'Network error: Unable to connect to RepairShopr API',
          0,
          'NETWORK_ERROR'
        );
      }

      // Handle other errors
      throw new RepairShoprAPIError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        0,
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Normalize raw API response to our standard user format
   */
  private normalizeUserResponse(raw: RepairShoprRawUserResponse): {
    user: RepairShoprUser;
    admin: boolean;
    subdomain: string;
    permissions: Record<string, Record<string, boolean>>;
  } {
    return {
      user: {
        id: raw.user_id,
        email: raw.user_email,
        full_name: raw.user_name,
        admin: raw.admin,
      },
      admin: raw.admin,
      subdomain: raw.subdomain,
      permissions: raw.permissions,
    };
  }

  /**
   * Sign in with email and password to obtain an API token
   *
   * @param email - User's email address
   * @param password - User's password
   * @returns SignInResponse with api_key (user_token) and user details
   *
   * @example
   * ```typescript
   * const client = new RepairShoprClient({ subdomain: 'myshop' });
   * const { api_key, user } = await client.signIn('user@example.com', 'password');
   * ```
   */
  async signIn(email: string, password: string): Promise<SignInResponse> {
    if (!email || !email.trim()) {
      throw new RepairShoprAPIError(
        'Email is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    if (!password) {
      throw new RepairShoprAPIError(
        'Password is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    const rawResponse = await this.request<RepairShoprRawUserResponse>('/sign_in', {
      method: 'POST',
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    });

    // Normalize the response to our standard format
    const normalized = this.normalizeUserResponse(rawResponse);
    return {
      api_key: rawResponse.user_token,
      ...normalized,
      two_factor_required: rawResponse.two_factor_required,
    };
  }

  /**
   * Get the current authenticated user's information
   *
   * @param apiToken - API token obtained from signIn (user_token)
   * @returns MeResponse with user details
   *
   * @example
   * ```typescript
   * const client = new RepairShoprClient({ subdomain: 'myshop' });
   * const { user } = await client.getMe('api_token_here');
   * ```
   */
  async getMe(apiToken: string): Promise<MeResponse> {
    if (!apiToken || !apiToken.trim()) {
      throw new RepairShoprAPIError(
        'API token is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    const rawResponse = await this.request<RepairShoprRawUserResponse>(
      `/me?api_key=${encodeURIComponent(apiToken.trim())}`
    );

    // Normalize the response to our standard format
    return this.normalizeUserResponse(rawResponse);
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a RepairShopr client using environment variables
 *
 * Reads REPAIRSHOPR_SUBDOMAIN from environment variables.
 * Optionally accepts a baseUrl override for testing.
 *
 * @param baseUrl - Optional base URL override for testing
 * @returns Configured RepairShoprClient instance
 *
 * @example
 * ```typescript
 * // Uses REPAIRSHOPR_SUBDOMAIN from environment
 * const client = createRepairShoprClient();
 * const { api_key, user } = await client.signIn('user@example.com', 'password');
 * ```
 */
export function createRepairShoprClient(baseUrl?: string): RepairShoprClient {
  const subdomain = process.env.REPAIRSHOPR_SUBDOMAIN;

  if (!subdomain) {
    throw new Error(
      'REPAIRSHOPR_SUBDOMAIN environment variable is required. ' +
        'Please set it in your .env file.'
    );
  }

  return new RepairShoprClient({
    subdomain,
    baseUrl,
  });
}

// =============================================================================
// Default Export
// =============================================================================

export default RepairShoprClient;
