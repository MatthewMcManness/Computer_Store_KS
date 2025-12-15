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

/**
 * Customer information from the RepairShopr API
 */
export interface RepairShoprCustomer {
  id: number;
  firstname: string;
  lastname: string;
  fullname: string;
  business_name?: string | null;
  email: string;
  phone?: string | null;
  mobile?: string | null;
  address?: string | null;
  address_2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Asset (device) information from the RepairShopr API
 */
export interface RepairShoprAsset {
  id: number;
  name: string;
  asset_type_name?: string | null;
  customer_id: number;
  properties?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

/**
 * Ticket comment from the RepairShopr API
 */
export interface RepairShoprTicketComment {
  id: number;
  created_at: string;
  updated_at: string;
  ticket_id: number;
  subject?: string;
  body: string;
  tech?: string;
  hidden: boolean;
  user_id?: number;
}

/**
 * Ticket timer entry from the RepairShopr API
 */
export interface RepairShoprTimerEntry {
  id: number;
  ticket_id: number;
  user_id?: number;
  start_time?: string;
  end_time?: string;
  recorded?: boolean;
  created_at: string;
  updated_at: string;
  billable?: boolean;
  notes?: string;
  active_duration?: number;
}

/**
 * Ticket information from the RepairShopr API
 */
export interface RepairShoprTicket {
  id: number;
  number: string;
  subject: string;
  customer_id: number;
  customer_business_then_name?: string;
  status?: string;
  problem_type?: string;
  created_at?: string;
  updated_at?: string;
  due_date?: string;
  resolved_at?: string;
  ticket_type_id?: number;
  user_id?: number;
  properties?: Record<string, unknown>;
  tag_list?: string[];
  priority?: string;
}

/**
 * Detailed ticket with all related data
 */
export interface RepairShoprTicketDetail extends RepairShoprTicket {
  comments?: RepairShoprTicketComment[];
  timers?: RepairShoprTimerEntry[];
  customer?: RepairShoprCustomer;
  assets?: RepairShoprAsset[];
}

/**
 * Business/Company information from the RepairShopr API
 */
export interface RepairShoprBusiness {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

// =============================================================================
// Input Types for Create/Update Operations
// =============================================================================

/**
 * Input for creating a new customer
 */
export interface CreateCustomerInput {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  mobile?: string;
  address?: string;
  address_2?: string;
  city?: string;
  state?: string;
  zip?: string;
  business_name?: string;
  notes?: string;
  get_sms?: boolean;
  opt_out?: boolean;
  no_email?: boolean;
}

/**
 * Input for updating an existing customer
 */
export interface UpdateCustomerInput {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  address_2?: string;
  city?: string;
  state?: string;
  zip?: string;
  business_name?: string;
  notes?: string;
  get_sms?: boolean;
  opt_out?: boolean;
  no_email?: boolean;
}

/**
 * Input for creating a new asset/device
 */
export interface CreateAssetInput {
  name: string;
  customer_id: number;
  asset_serial?: string;
  asset_type_id?: number;
  asset_type_name?: string;
  properties?: Record<string, unknown>;
}

/**
 * Input for creating a new ticket
 */
export interface CreateTicketInput {
  customer_id: number;
  subject: string;
  problem_type?: string;
  status?: string;
  asset_id?: number;
  due_date?: string;
  start_at?: string;
  end_at?: string;
  location_id?: number;
  user_id?: number;
  comment_subject?: string;
  comment_body?: string;
}

/**
 * Input for updating an existing ticket
 */
export interface UpdateTicketInput {
  subject?: string;
  problem_type?: string;
  status?: string;
  due_date?: string;
  user_id?: number;
  priority?: string;
}

/**
 * Input for adding a comment to a ticket
 */
export interface AddTicketCommentInput {
  subject?: string;
  body: string;
  tech?: string;
  hidden?: boolean;
  do_not_email?: boolean;
  /** SMS message body - if provided, sends SMS to customer */
  sms_body?: string;
}

/**
 * Input for creating a new business/company
 */
export interface CreateBusinessInput {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
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

  // =============================================================================
  // Customer Operations
  // =============================================================================

  /**
   * Search for customers by query string
   *
   * @param apiToken - API token for authentication
   * @param query - Search query string
   * @returns Array of matching customers
   *
   * @example
   * ```typescript
   * const customers = await client.searchCustomers(apiToken, 'john smith');
   * ```
   */
  async searchCustomers(
    apiToken: string,
    query: string
  ): Promise<RepairShoprCustomer[]> {
    if (!apiToken || !apiToken.trim()) {
      throw new RepairShoprAPIError(
        'API token is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    if (!query || !query.trim()) {
      throw new RepairShoprAPIError(
        'Search query is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    const response = await this.request<{ customers: RepairShoprCustomer[] }>(
      `/customers?api_key=${encodeURIComponent(apiToken.trim())}&query=${encodeURIComponent(query.trim())}`
    );

    return response.customers || [];
  }

  /**
   * Get a customer by ID
   *
   * @param apiToken - API token for authentication
   * @param id - Customer ID
   * @returns Customer details
   *
   * @example
   * ```typescript
   * const customer = await client.getCustomer(apiToken, 12345);
   * ```
   */
  async getCustomer(
    apiToken: string,
    id: number
  ): Promise<RepairShoprCustomer> {
    if (!apiToken || !apiToken.trim()) {
      throw new RepairShoprAPIError(
        'API token is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    if (!id || id <= 0) {
      throw new RepairShoprAPIError(
        'Valid customer ID is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    const response = await this.request<{ customer: RepairShoprCustomer }>(
      `/customers/${id}?api_key=${encodeURIComponent(apiToken.trim())}`
    );

    return response.customer;
  }

  /**
   * Create a new customer
   *
   * @param apiToken - API token for authentication
   * @param data - Customer data
   * @returns Created customer details
   *
   * @example
   * ```typescript
   * const customer = await client.createCustomer(apiToken, {
   *   firstname: 'John',
   *   lastname: 'Doe',
   *   email: 'john@example.com',
   *   phone: '555-1234'
   * });
   * ```
   */
  async createCustomer(
    apiToken: string,
    data: CreateCustomerInput
  ): Promise<RepairShoprCustomer> {
    if (!apiToken || !apiToken.trim()) {
      throw new RepairShoprAPIError(
        'API token is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    if (!data.firstname || !data.lastname || !data.email) {
      throw new RepairShoprAPIError(
        'First name, last name, and email are required',
        400,
        'VALIDATION_ERROR'
      );
    }

    const response = await this.request<{ customer: RepairShoprCustomer }>(
      `/customers?api_key=${encodeURIComponent(apiToken.trim())}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    return response.customer;
  }

  /**
   * Update an existing customer
   *
   * @param apiToken - API token for authentication
   * @param id - Customer ID
   * @param data - Fields to update
   * @returns Updated customer details
   *
   * @example
   * ```typescript
   * const customer = await client.updateCustomer(apiToken, 12345, {
   *   phone: '555-5678',
   *   mobile: '555-9999'
   * });
   * ```
   */
  async updateCustomer(
    apiToken: string,
    id: number,
    data: UpdateCustomerInput
  ): Promise<RepairShoprCustomer> {
    if (!apiToken || !apiToken.trim()) {
      throw new RepairShoprAPIError(
        'API token is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    if (!id || id <= 0) {
      throw new RepairShoprAPIError(
        'Valid customer ID is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    const response = await this.request<{ customer: RepairShoprCustomer }>(
      `/customers/${id}?api_key=${encodeURIComponent(apiToken.trim())}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );

    return response.customer;
  }

  // =============================================================================
  // Asset/Device Operations
  // =============================================================================

  /**
   * Get all assets for a customer
   *
   * @param apiToken - API token for authentication
   * @param customerId - Customer ID
   * @returns Array of customer's assets
   *
   * @example
   * ```typescript
   * const assets = await client.getCustomerAssets(apiToken, 12345);
   * ```
   */
  async getCustomerAssets(
    apiToken: string,
    customerId: number
  ): Promise<RepairShoprAsset[]> {
    if (!apiToken || !apiToken.trim()) {
      throw new RepairShoprAPIError(
        'API token is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    if (!customerId || customerId <= 0) {
      throw new RepairShoprAPIError(
        'Valid customer ID is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    const response = await this.request<{ assets: RepairShoprAsset[] }>(
      `/customer_assets?api_key=${encodeURIComponent(apiToken.trim())}&customer_id=${customerId}`
    );

    return response.assets || [];
  }

  /**
   * Create a new asset/device
   *
   * @param apiToken - API token for authentication
   * @param data - Asset data
   * @returns Created asset details
   *
   * @example
   * ```typescript
   * const asset = await client.createAsset(apiToken, {
   *   name: 'Dell Laptop',
   *   customer_id: 12345,
   *   asset_serial: 'ABC123'
   * });
   * ```
   */
  async createAsset(
    apiToken: string,
    data: CreateAssetInput
  ): Promise<RepairShoprAsset> {
    if (!apiToken || !apiToken.trim()) {
      throw new RepairShoprAPIError(
        'API token is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    if (!data.name || !data.customer_id) {
      throw new RepairShoprAPIError(
        'Asset name and customer ID are required',
        400,
        'VALIDATION_ERROR'
      );
    }

    // Debug: log the data being sent
    console.log('[RepairShopr] Creating asset with data:', JSON.stringify(data, null, 2));

    const response = await this.request<{ asset: RepairShoprAsset }>(
      `/customer_assets?api_key=${encodeURIComponent(apiToken.trim())}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    console.log('[RepairShopr] Raw API response:', JSON.stringify(response, null, 2));
    console.log('[RepairShopr] Asset created successfully:', response.asset?.id);

    if (!response.asset) {
      console.error('[RepairShopr] No asset in response. Full response:', response);
    }

    return response.asset;
  }

  // =============================================================================
  // Ticket Operations
  // =============================================================================

  /**
   * Search for tickets with various filters
   *
   * @param apiToken - API token for authentication
   * @param options - Search options (query, customer_id, status, etc.)
   * @returns Array of matching tickets
   *
   * @example
   * ```typescript
   * const tickets = await client.searchTickets(apiToken, { query: 'laptop repair' });
   * ```
   */
  async searchTickets(
    apiToken: string,
    options: {
      query?: string;
      customer_id?: number;
      status?: string;
      user_id?: number;
      page?: number;
    } = {}
  ): Promise<RepairShoprTicket[]> {
    if (!apiToken || !apiToken.trim()) {
      throw new RepairShoprAPIError(
        'API token is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    const params = new URLSearchParams();
    params.append('api_key', apiToken.trim());

    if (options.query) params.append('query', options.query);
    if (options.customer_id) params.append('customer_id', options.customer_id.toString());
    if (options.status) params.append('status', options.status);
    if (options.user_id) params.append('user_id', options.user_id.toString());
    if (options.page) params.append('page', options.page.toString());

    const response = await this.request<{ tickets: RepairShoprTicket[] }>(
      `/tickets?${params.toString()}`
    );

    return response.tickets || [];
  }

  /**
   * Get a ticket by ID with full details including comments
   *
   * @param apiToken - API token for authentication
   * @param id - Ticket ID
   * @returns Detailed ticket with comments, timers, etc.
   *
   * @example
   * ```typescript
   * const ticket = await client.getTicket(apiToken, 67890);
   * ```
   */
  async getTicket(apiToken: string, id: number): Promise<RepairShoprTicketDetail> {
    if (!apiToken || !apiToken.trim()) {
      throw new RepairShoprAPIError(
        'API token is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    if (!id || id <= 0) {
      throw new RepairShoprAPIError(
        'Valid ticket ID is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    const response = await this.request<{ ticket: RepairShoprTicketDetail }>(
      `/tickets/${id}?api_key=${encodeURIComponent(apiToken.trim())}`
    );

    return response.ticket;
  }

  /**
   * Update an existing ticket
   *
   * @param apiToken - API token for authentication
   * @param id - Ticket ID
   * @param data - Fields to update
   * @returns Updated ticket details
   *
   * @example
   * ```typescript
   * const ticket = await client.updateTicket(apiToken, 67890, {
   *   status: 'In Progress',
   *   priority: 'High'
   * });
   * ```
   */
  async updateTicket(
    apiToken: string,
    id: number,
    data: UpdateTicketInput
  ): Promise<RepairShoprTicketDetail> {
    if (!apiToken || !apiToken.trim()) {
      throw new RepairShoprAPIError(
        'API token is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    if (!id || id <= 0) {
      throw new RepairShoprAPIError(
        'Valid ticket ID is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    const response = await this.request<{ ticket: RepairShoprTicketDetail }>(
      `/tickets/${id}?api_key=${encodeURIComponent(apiToken.trim())}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );

    return response.ticket;
  }

  /**
   * Add a comment to a ticket
   *
   * @param apiToken - API token for authentication
   * @param ticketId - Ticket ID
   * @param data - Comment data
   * @returns Created comment
   *
   * @example
   * ```typescript
   * const comment = await client.addTicketComment(apiToken, 67890, {
   *   body: 'Replaced the hard drive',
   *   hidden: true // private note
   * });
   * ```
   */
  async addTicketComment(
    apiToken: string,
    ticketId: number,
    data: AddTicketCommentInput
  ): Promise<RepairShoprTicketComment> {
    if (!apiToken || !apiToken.trim()) {
      throw new RepairShoprAPIError(
        'API token is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    if (!ticketId || ticketId <= 0) {
      throw new RepairShoprAPIError(
        'Valid ticket ID is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    if (!data.body || !data.body.trim()) {
      throw new RepairShoprAPIError(
        'Comment body is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    // RepairShopr requires a subject - use a default if not provided
    const commentData = {
      ...data,
      subject: data.subject || (data.hidden ? 'Private Note' : 'Comment'),
    };

    const response = await this.request<{ comment: RepairShoprTicketComment }>(
      `/tickets/${ticketId}/comment?api_key=${encodeURIComponent(apiToken.trim())}`,
      {
        method: 'POST',
        body: JSON.stringify(commentData),
      }
    );

    return response.comment;
  }

  /**
   * Create a new ticket
   *
   * @param apiToken - API token for authentication
   * @param data - Ticket data
   * @returns Created ticket details
   *
   * @example
   * ```typescript
   * const ticket = await client.createTicket(apiToken, {
   *   customer_id: 12345,
   *   subject: 'Computer won\'t boot',
   *   problem_type: 'Hardware',
   *   status: 'New'
   * });
   * ```
   */
  async createTicket(
    apiToken: string,
    data: CreateTicketInput
  ): Promise<RepairShoprTicket> {
    if (!apiToken || !apiToken.trim()) {
      throw new RepairShoprAPIError(
        'API token is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    if (!data.customer_id || !data.subject) {
      throw new RepairShoprAPIError(
        'Customer ID and subject are required',
        400,
        'VALIDATION_ERROR'
      );
    }

    const response = await this.request<{ ticket: RepairShoprTicket }>(
      `/tickets?api_key=${encodeURIComponent(apiToken.trim())}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    return response.ticket;
  }

  // =============================================================================
  // Business/Company Operations
  // =============================================================================

  /**
   * Search for businesses by name
   *
   * @param apiToken - API token for authentication
   * @param query - Business name search query
   * @returns Array of matching businesses
   *
   * @example
   * ```typescript
   * const businesses = await client.searchBusinesses(apiToken, 'Acme Corp');
   * ```
   */
  async searchBusinesses(
    apiToken: string,
    query: string
  ): Promise<RepairShoprBusiness[]> {
    if (!apiToken || !apiToken.trim()) {
      throw new RepairShoprAPIError(
        'API token is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    if (!query || !query.trim()) {
      throw new RepairShoprAPIError(
        'Search query is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    // Search contacts with business_name filter
    const response = await this.request<{ contacts: RepairShoprBusiness[] }>(
      `/contacts?api_key=${encodeURIComponent(apiToken.trim())}&business_name=${encodeURIComponent(query.trim())}`
    );

    return response.contacts || [];
  }

  /**
   * Create a new business/company
   *
   * @param apiToken - API token for authentication
   * @param data - Business data
   * @returns Created business details
   *
   * @example
   * ```typescript
   * const business = await client.createBusiness(apiToken, {
   *   name: 'Acme Corporation',
   *   phone: '555-9999',
   *   city: 'Topeka'
   * });
   * ```
   */
  async createBusiness(
    apiToken: string,
    data: CreateBusinessInput
  ): Promise<RepairShoprBusiness> {
    if (!apiToken || !apiToken.trim()) {
      throw new RepairShoprAPIError(
        'API token is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    if (!data.name) {
      throw new RepairShoprAPIError(
        'Business name is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    const response = await this.request<{ contact: RepairShoprBusiness }>(
      `/contacts?api_key=${encodeURIComponent(apiToken.trim())}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    return response.contact;
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
