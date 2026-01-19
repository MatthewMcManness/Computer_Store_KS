/**
 * Cytracom Phone System API Client
 *
 * TypeScript client for the Cytracom Public API that handles authentication,
 * call history (CDR), click-to-call functionality, and real-time call events.
 *
 * API Documentation: https://help.cytracom.com/hc/en-us/sections/360003366471-Cytracom-s-Public-API
 *
 * Features:
 * - Fully typed API responses
 * - In-memory caching with TTL for call history
 * - Call Control API for click-to-call
 * - Insights API for call detail records (CDR)
 * - Server-Sent Events (SSE) for real-time call notifications
 * - Supabase logging for click-to-call with employee tracking
 * - Voicemail recording playback support (when available from API)
 *
 * @functions_called fetch, createServiceClient
 * @called_by CytracomAPIRoutes, ReceptionDashboard, CustomerDetailPage
 *
 * @version 1.0.0 - 2026-01-19T21:00:00Z - Initial implementation
 * @version 1.1.0 - 2026-01-19T22:00:00Z - Added Supabase call logging and voicemail support
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// =============================================================================
// Types & Interfaces
// =============================================================================

/**
 * Cytracom API configuration
 */
export interface CytracomConfig {
  apiUrl: string;
  apiToken: string;
}

/**
 * Cytracom extension (phone line)
 */
export interface CytracomExtension {
  /** Extension number (e.g., "106") */
  extension: string;
  /** Display name (e.g., "Manager") */
  name: string;
  /** Extension type */
  type?: 'user' | 'queue' | 'ring_group' | 'voicemail';
  /** Current status */
  status?: 'available' | 'busy' | 'dnd' | 'offline';
  /** Associated email */
  email?: string;
}

/**
 * Call direction type
 */
export type CallDirection = 'inbound' | 'outbound' | 'internal';

/**
 * Call disposition/status
 */
export type CallDisposition = 'answered' | 'no_answer' | 'busy' | 'failed' | 'voicemail';

/**
 * Call Detail Record (CDR) from Insights API
 */
export interface CytracomCDR {
  /** Unique call ID */
  callId: string;
  /** Call direction */
  direction: CallDirection;
  /** Caller number */
  callerNumber: string;
  /** Caller name (if available) */
  callerName?: string;
  /** Called number */
  calledNumber: string;
  /** Called name (if available) */
  calledName?: string;
  /** Extension that handled the call */
  extension?: string;
  /** Call start time */
  startTime: Date;
  /** Call answer time (if answered) */
  answerTime?: Date;
  /** Call end time */
  endTime: Date;
  /** Call duration in seconds */
  durationSeconds: number;
  /** Ring duration in seconds */
  ringDurationSeconds?: number;
  /** Call disposition */
  disposition: CallDisposition;
  /** Was the call recorded */
  recorded?: boolean;
  /** Recording URL (if recorded and available) */
  recordingUrl?: string;
  /** Queue the call came through (if any) */
  queue?: string;
}

/**
 * Parameters for fetching call history
 */
export interface CallHistoryParams {
  /** Phone number to filter by (caller or called) */
  phoneNumber?: string;
  /** Extension to filter by */
  extension?: string;
  /** Start date for the query */
  startDate?: Date;
  /** End date for the query */
  endDate?: Date;
  /** Call direction filter */
  direction?: CallDirection;
  /** Maximum number of records */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Parameters for initiating a call (click-to-call)
 */
export interface OriginateCallParams {
  /** Extension to call from (rings this extension first) */
  fromExtension: string;
  /** Phone number to call */
  toNumber: string;
  /** Caller ID to display (optional) */
  callerId?: string;
  /** Timeout in seconds before giving up */
  timeout?: number;
}

/**
 * Result of an originate call request
 */
export interface OriginateCallResult {
  success: boolean;
  callId?: string;
  error?: string;
}

/**
 * Real-time call event from SSE stream
 */
export interface CytracomCallEvent {
  /** Event type */
  type: 'ringing' | 'answered' | 'hangup' | 'voicemail' | 'transfer';
  /** Call ID */
  callId: string;
  /** Extension involved */
  extension?: string;
  /** Caller information */
  caller?: {
    number: string;
    name?: string;
  };
  /** Called information */
  called?: {
    number: string;
    name?: string;
  };
  /** Event timestamp */
  timestamp: Date;
  /** Additional event data */
  data?: Record<string, unknown>;
}

/**
 * Raw CDR response from Cytracom API
 */
interface CytracomRawCDR {
  id?: string;
  uuid?: string;
  direction?: string;
  src?: string;
  src_name?: string;
  dst?: string;
  dst_name?: string;
  extension?: string;
  start?: string;
  answer?: string;
  end?: string;
  duration?: number;
  billsec?: number;
  ring_duration?: number;
  disposition?: string;
  recorded?: boolean;
  recording_url?: string;
  queue?: string;
}

/**
 * Raw extension response from Cytracom API
 */
interface CytracomRawExtension {
  extension?: string;
  name?: string;
  type?: string;
  email?: string;
  status?: string;
}

/**
 * Call log status values
 */
export type CallLogStatus = 'initiated' | 'connected' | 'failed' | 'no_answer' | 'busy';

/**
 * Call log entry for Supabase
 */
export interface CallLogEntry {
  /** Employee user profile ID who initiated the call */
  employeeId: string;
  /** Extension used to make the call */
  extension: string;
  /** Normalized destination phone number */
  destinationNumber: string;
  /** Original phone number format for display */
  destinationDisplay?: string;
  /** Cytracom call ID */
  cytracomCallId?: string;
  /** Call status */
  status: CallLogStatus;
  /** Error message if failed */
  errorMessage?: string;
  /** RepairShopr customer ID if applicable */
  repairshoprCustomerId?: number;
  /** Customer name for quick reference */
  customerName?: string;
  /** Context (e.g., ticket number, reason) */
  context?: string;
}

/**
 * Parameters for initiating a call with logging
 */
export interface OriginateCallWithLoggingParams extends OriginateCallParams {
  /** Employee user profile ID for logging */
  employeeId: string;
  /** RepairShopr customer ID if calling a customer */
  repairshoprCustomerId?: number;
  /** Customer name for log reference */
  customerName?: string;
  /** Context for the call (e.g., "Ticket #1234") */
  context?: string;
}

/**
 * Voicemail record with optional audio URL
 */
export interface CytracomVoicemail {
  /** Unique ID */
  id: string;
  /** Extension that received the voicemail */
  extension: string;
  /** Caller phone number */
  callerNumber: string;
  /** Caller name if available */
  callerName?: string;
  /** Voicemail timestamp */
  timestamp: Date;
  /** Duration in seconds */
  durationSeconds: number;
  /** Transcription text if available */
  transcription?: string;
  /** Audio recording URL if available */
  audioUrl?: string;
  /** Whether voicemail has been listened to */
  isNew: boolean;
}

// =============================================================================
// Configuration & Validation
// =============================================================================

/**
 * Get Cytracom configuration from environment variables
 *
 * @returns CytracomConfig object or null if not configured
 */
export function getCytracomConfig(): CytracomConfig | null {
  const apiToken = process.env.CYTRACOM_API_TOKEN;
  const apiUrl = process.env.CYTRACOM_API_URL || 'https://api.cytracom.net/v1.0';

  if (!apiToken) {
    return null;
  }

  return {
    apiUrl,
    apiToken,
  };
}

/**
 * Check if Cytracom is configured
 *
 * @returns true if API token is set
 */
export function isCytracomConfigured(): boolean {
  return !!process.env.CYTRACOM_API_TOKEN;
}

/**
 * Get configured extensions from environment variable
 *
 * @returns Array of CytracomExtension objects
 */
export function getConfiguredExtensions(): CytracomExtension[] {
  const extensionsEnv = process.env.CYTRACOM_EXTENSIONS || '';

  if (!extensionsEnv) {
    return [];
  }

  return extensionsEnv.split(',').map(ext => {
    const [extension, name] = ext.trim().split(':');
    return {
      extension: extension?.trim() || '',
      name: name?.trim() || `Extension ${extension}`,
    };
  }).filter(ext => ext.extension);
}

// =============================================================================
// Cache Implementation
// =============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

/**
 * Get cached data if not expired
 */
function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Set cache with TTL
 */
function setCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs,
  });
}

/**
 * Clear all cache or specific key
 */
export function clearCytracomCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

// =============================================================================
// Supabase Client for Call Logging
// =============================================================================

let supabaseServiceClient: SupabaseClient | null = null;

/**
 * Get Supabase service client for server-side operations
 *
 * Uses service role key for backend call logging
 *
 * @returns Supabase client or null if not configured
 */
function getSupabaseServiceClient(): SupabaseClient | null {
  if (supabaseServiceClient) return supabaseServiceClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.warn('Supabase not configured for call logging');
    return null;
  }

  supabaseServiceClient = createClient(url, serviceKey);
  return supabaseServiceClient;
}

/**
 * Log a click-to-call action to Supabase
 *
 * Records which employee initiated the call, the destination,
 * and the outcome for tracking and reporting.
 *
 * @param entry - Call log entry details
 * @returns Success status and log ID if successful
 *
 * @sideEffects
 * - Creates a record in the call_logs table
 *
 * @example
 * const result = await logCallToSupabase({
 *   employeeId: 'uuid-here',
 *   extension: '106',
 *   destinationNumber: '7855551234',
 *   destinationDisplay: '(785) 555-1234',
 *   status: 'initiated',
 *   customerName: 'John Doe',
 *   context: 'Ticket #1234'
 * });
 *
 * @functions_called getSupabaseServiceClient
 * @called_by originateCallWithLogging, CytracomAPIRoute
 *
 * @version 1.0.0 - 2026-01-19T22:00:00Z - Initial implementation
 */
export async function logCallToSupabase(
  entry: CallLogEntry
): Promise<{ success: boolean; logId?: string; error?: string }> {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    console.warn('Cannot log call: Supabase not configured');
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('call_logs')
      .insert({
        employee_id: entry.employeeId,
        extension: entry.extension,
        destination_number: entry.destinationNumber,
        destination_display: entry.destinationDisplay,
        cytracom_call_id: entry.cytracomCallId,
        status: entry.status,
        error_message: entry.errorMessage,
        repairshopr_customer_id: entry.repairshoprCustomerId,
        customer_name: entry.customerName,
        context: entry.context,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to log call to Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true, logId: data?.id };
  } catch (error) {
    console.error('Error logging call to Supabase:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update call log status in Supabase
 *
 * Used to update the status after call completion (e.g., connected, no_answer)
 *
 * @param logId - The call log ID to update
 * @param status - New status value
 * @param cytracomCallId - Optional Cytracom call ID to add
 * @returns Success status
 *
 * @functions_called getSupabaseServiceClient
 * @called_by CytracomWebhookHandler, CallStatusPoller
 *
 * @version 1.0.0 - 2026-01-19T22:00:00Z - Initial implementation
 */
export async function updateCallLogStatus(
  logId: string,
  status: CallLogStatus,
  cytracomCallId?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const updateData: Record<string, unknown> = { status };
    if (cytracomCallId) {
      updateData.cytracom_call_id = cytracomCallId;
    }

    const { error } = await supabase
      .from('call_logs')
      .update(updateData)
      .eq('id', logId);

    if (error) {
      console.error('Failed to update call log:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating call log:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =============================================================================
// API Client Functions
// =============================================================================

/**
 * Make an authenticated request to the Cytracom API
 *
 * @param endpoint - API endpoint (e.g., "/insights/cdr")
 * @param options - Fetch options
 * @returns Response data
 * @throws Error if request fails or not configured
 */
async function cytracomFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const config = getCytracomConfig();

  if (!config) {
    throw new Error('Cytracom API is not configured. Set CYTRACOM_API_TOKEN environment variable.');
  }

  const url = `${config.apiUrl}${endpoint}`;
  const headers: HeadersInit = {
    'Authorization': `Bearer ${config.apiToken}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Cytracom API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

// =============================================================================
// Data API Functions
// =============================================================================

/**
 * Fetch list of extensions from Cytracom
 *
 * @returns Array of extensions
 *
 * @example
 * const extensions = await fetchExtensions();
 * console.log(extensions);
 * // [{ extension: '106', name: 'Manager', type: 'user' }, ...]
 */
export async function fetchExtensions(): Promise<CytracomExtension[]> {
  const cacheKey = 'extensions';
  const cached = getCached<CytracomExtension[]>(cacheKey);
  if (cached) return cached;

  try {
    const data = await cytracomFetch<CytracomRawExtension[]>('/data/extensions');

    const extensions: CytracomExtension[] = (data || []).map(ext => ({
      extension: ext.extension || '',
      name: ext.name || `Extension ${ext.extension}`,
      type: (ext.type as CytracomExtension['type']) || 'user',
      email: ext.email,
      status: (ext.status as CytracomExtension['status']) || 'available',
    }));

    // Cache for 5 minutes
    setCache(cacheKey, extensions, 5 * 60 * 1000);

    return extensions;
  } catch (error) {
    console.error('Failed to fetch Cytracom extensions:', error);
    // Fall back to configured extensions
    return getConfiguredExtensions();
  }
}

// =============================================================================
// Insights API Functions (Call History / CDR)
// =============================================================================

/**
 * Normalize phone number for comparison
 * Strips all non-digit characters and handles various formats
 *
 * @param phone - Phone number in any format
 * @returns Normalized phone number (digits only, 10 or 11 digits)
 */
export function normalizePhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  // Remove leading 1 for US numbers if present
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.slice(1);
  }
  return digits;
}

/**
 * Fetch call history (CDR) from Cytracom Insights API
 *
 * @param params - Query parameters for filtering
 * @returns Array of call detail records
 *
 * @example
 * // Get all calls for a phone number
 * const calls = await fetchCallHistory({ phoneNumber: '785-555-1234' });
 *
 * // Get calls for last 7 days
 * const lastWeek = new Date();
 * lastWeek.setDate(lastWeek.getDate() - 7);
 * const calls = await fetchCallHistory({ startDate: lastWeek });
 */
export async function fetchCallHistory(params: CallHistoryParams = {}): Promise<CytracomCDR[]> {
  const {
    phoneNumber,
    extension,
    startDate,
    endDate,
    direction,
    limit = 100,
    offset = 0,
  } = params;

  // Build query parameters
  const queryParams = new URLSearchParams();

  if (startDate) {
    queryParams.set('start', startDate.toISOString());
  } else {
    // Default to last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    queryParams.set('start', thirtyDaysAgo.toISOString());
  }

  if (endDate) {
    queryParams.set('end', endDate.toISOString());
  }

  if (extension) {
    queryParams.set('extension', extension);
  }

  if (direction) {
    queryParams.set('direction', direction);
  }

  queryParams.set('limit', limit.toString());
  queryParams.set('offset', offset.toString());

  // Create cache key
  const cacheKey = `cdr:${queryParams.toString()}:${phoneNumber || ''}`;
  const cached = getCached<CytracomCDR[]>(cacheKey);
  if (cached) return cached;

  try {
    const data = await cytracomFetch<CytracomRawCDR[]>(`/insights/cdr?${queryParams}`);

    let cdrs: CytracomCDR[] = (data || []).map(raw => ({
      callId: raw.id || raw.uuid || '',
      direction: normalizeDirection(raw.direction),
      callerNumber: raw.src || '',
      callerName: raw.src_name,
      calledNumber: raw.dst || '',
      calledName: raw.dst_name,
      extension: raw.extension,
      startTime: new Date(raw.start || Date.now()),
      answerTime: raw.answer ? new Date(raw.answer) : undefined,
      endTime: new Date(raw.end || Date.now()),
      durationSeconds: raw.billsec || raw.duration || 0,
      ringDurationSeconds: raw.ring_duration,
      disposition: normalizeDisposition(raw.disposition),
      recorded: raw.recorded,
      recordingUrl: raw.recording_url,
      queue: raw.queue,
    }));

    // Filter by phone number if specified (match either caller or called)
    if (phoneNumber) {
      const normalizedSearch = normalizePhoneNumber(phoneNumber);
      cdrs = cdrs.filter(cdr => {
        const callerNorm = normalizePhoneNumber(cdr.callerNumber);
        const calledNorm = normalizePhoneNumber(cdr.calledNumber);
        return callerNorm.includes(normalizedSearch) ||
               calledNorm.includes(normalizedSearch) ||
               normalizedSearch.includes(callerNorm) ||
               normalizedSearch.includes(calledNorm);
      });
    }

    // Sort by start time descending (most recent first)
    cdrs.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

    // Cache for 2 minutes
    setCache(cacheKey, cdrs, 2 * 60 * 1000);

    return cdrs;
  } catch (error) {
    console.error('Failed to fetch Cytracom call history:', error);
    throw error;
  }
}

/**
 * Normalize direction string from API response
 */
function normalizeDirection(direction?: string): CallDirection {
  const d = direction?.toLowerCase();
  if (d === 'inbound' || d === 'in') return 'inbound';
  if (d === 'outbound' || d === 'out') return 'outbound';
  if (d === 'internal' || d === 'local') return 'internal';
  return 'inbound'; // default
}

/**
 * Normalize disposition string from API response
 */
function normalizeDisposition(disposition?: string): CallDisposition {
  const d = disposition?.toLowerCase();
  if (d === 'answered' || d === 'answer') return 'answered';
  if (d === 'no answer' || d === 'no_answer' || d === 'noanswer') return 'no_answer';
  if (d === 'busy') return 'busy';
  if (d === 'failed' || d === 'congestion') return 'failed';
  if (d === 'voicemail' || d === 'vm') return 'voicemail';
  return 'no_answer'; // default
}

/**
 * Get call history for a specific customer by phone number
 *
 * @param phoneNumber - Customer's phone number
 * @param limit - Maximum records to return
 * @returns Array of CDR records
 */
export async function getCustomerCallHistory(
  phoneNumber: string,
  limit: number = 50
): Promise<CytracomCDR[]> {
  return fetchCallHistory({ phoneNumber, limit });
}

/**
 * Get missed calls (unanswered inbound calls)
 *
 * @param startDate - Start of date range
 * @param endDate - End of date range (defaults to now)
 * @returns Array of missed call CDR records
 */
export async function getMissedCalls(
  startDate?: Date,
  endDate?: Date
): Promise<CytracomCDR[]> {
  const calls = await fetchCallHistory({
    startDate,
    endDate,
    direction: 'inbound',
    limit: 200,
  });

  return calls.filter(call =>
    call.disposition === 'no_answer' ||
    call.disposition === 'voicemail'
  );
}

// =============================================================================
// Call Control API Functions (Click-to-Call)
// =============================================================================

/**
 * Initiate a call from an extension to a phone number (click-to-call)
 *
 * This uses the Call Control API to:
 * 1. Ring the specified extension first
 * 2. When answered, dial out to the destination number
 *
 * @param params - Call parameters
 * @returns Result with call ID or error
 *
 * @example
 * const result = await originateCall({
 *   fromExtension: '106',
 *   toNumber: '785-555-1234',
 *   callerId: '785-555-0000'
 * });
 * if (result.success) {
 *   console.log('Call initiated:', result.callId);
 * }
 */
export async function originateCall(params: OriginateCallParams): Promise<OriginateCallResult> {
  const { fromExtension, toNumber, callerId, timeout = 30 } = params;

  if (!fromExtension || !toNumber) {
    return { success: false, error: 'Extension and destination number are required' };
  }

  // Normalize the phone number (remove formatting)
  const normalizedNumber = normalizePhoneNumber(toNumber);
  if (normalizedNumber.length < 10) {
    return { success: false, error: 'Invalid phone number' };
  }

  try {
    const response = await cytracomFetch<{ call_id?: string; id?: string; error?: string }>(
      '/action/chan/originate',
      {
        method: 'POST',
        body: JSON.stringify({
          extension: fromExtension,
          destination: normalizedNumber,
          caller_id: callerId,
          timeout,
        }),
      }
    );

    const callId = response.call_id || response.id;
    if (callId) {
      return { success: true, callId };
    }

    return { success: false, error: response.error || 'Unknown error' };
  } catch (error) {
    console.error('Failed to originate call:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initiate call',
    };
  }
}

/**
 * Initiate a call with employee logging to Supabase
 *
 * This function combines click-to-call functionality with call logging,
 * recording which employee made the call for tracking and reporting.
 *
 * @param params - Call parameters including employee info for logging
 * @returns Result with call ID, log ID, or error
 *
 * @sideEffects
 * - Initiates outbound call via Cytracom API
 * - Creates record in call_logs Supabase table
 *
 * @example
 * const result = await originateCallWithLogging({
 *   fromExtension: '106',
 *   toNumber: '785-555-1234',
 *   employeeId: 'user-uuid-here',
 *   customerName: 'John Doe',
 *   repairshoprCustomerId: 12345,
 *   context: 'Ticket #1234 - Callback request'
 * });
 *
 * if (result.success) {
 *   console.log(`Call initiated: ${result.callId}, logged as: ${result.logId}`);
 * }
 *
 * @functions_called originateCall, logCallToSupabase, normalizePhoneNumber, formatPhoneNumber
 * @called_by ClickToCallAPI, ReceptionDashboard, CustomerDetailPage
 *
 * @version 1.0.0 - 2026-01-19T22:00:00Z - Initial implementation
 */
export async function originateCallWithLogging(
  params: OriginateCallWithLoggingParams
): Promise<OriginateCallResult & { logId?: string }> {
  const {
    fromExtension,
    toNumber,
    callerId,
    timeout,
    employeeId,
    repairshoprCustomerId,
    customerName,
    context,
  } = params;

  // Normalize for storage, keep original for display
  const normalizedNumber = normalizePhoneNumber(toNumber);
  const displayNumber = formatPhoneNumber(toNumber);

  // First, log the call attempt
  const logResult = await logCallToSupabase({
    employeeId,
    extension: fromExtension,
    destinationNumber: normalizedNumber,
    destinationDisplay: displayNumber,
    status: 'initiated',
    repairshoprCustomerId,
    customerName,
    context,
  });

  // Then, initiate the call
  const callResult = await originateCall({
    fromExtension,
    toNumber,
    callerId,
    timeout,
  });

  // Update the log with the result
  if (logResult.logId) {
    if (callResult.success && callResult.callId) {
      // Update with call ID - status will be updated via webhook or polling
      await updateCallLogStatus(logResult.logId, 'initiated', callResult.callId);
    } else {
      // Mark as failed
      await logCallToSupabase({
        employeeId,
        extension: fromExtension,
        destinationNumber: normalizedNumber,
        destinationDisplay: displayNumber,
        status: 'failed',
        errorMessage: callResult.error,
        repairshoprCustomerId,
        customerName,
        context,
      });
    }
  }

  return {
    ...callResult,
    logId: logResult.logId,
  };
}

/**
 * Transfer an active call to another extension or number
 *
 * @param callId - Active call ID
 * @param destination - Extension or phone number to transfer to
 * @returns Success status
 */
export async function transferCall(
  callId: string,
  destination: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await cytracomFetch('/action/chan/transfer', {
      method: 'POST',
      body: JSON.stringify({
        call_id: callId,
        destination,
      }),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to transfer call:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to transfer call',
    };
  }
}

/**
 * Park an active call
 *
 * @param callId - Active call ID
 * @returns Parking slot number or error
 */
export async function parkCall(
  callId: string
): Promise<{ success: boolean; slot?: string; error?: string }> {
  try {
    const response = await cytracomFetch<{ slot?: string; parking_slot?: string }>(
      '/action/chan/park',
      {
        method: 'POST',
        body: JSON.stringify({ call_id: callId }),
      }
    );

    return { success: true, slot: response.slot || response.parking_slot };
  } catch (error) {
    console.error('Failed to park call:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to park call',
    };
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Format duration in seconds to human readable string
 *
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "2m 30s" or "1h 15m")
 */
export function formatCallDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${hours}h`;
}

/**
 * Format phone number for display
 *
 * @param phone - Phone number
 * @returns Formatted phone number (e.g., "(785) 555-1234")
 */
export function formatPhoneNumber(phone: string): string {
  const digits = normalizePhoneNumber(phone);

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  // Return original if we can't format
  return phone;
}

/**
 * Get a display-friendly call direction label
 *
 * @param direction - Call direction
 * @returns Display label
 */
export function getDirectionLabel(direction: CallDirection): string {
  switch (direction) {
    case 'inbound':
      return 'Incoming';
    case 'outbound':
      return 'Outgoing';
    case 'internal':
      return 'Internal';
    default:
      return 'Unknown';
  }
}

/**
 * Get a display-friendly disposition label
 *
 * @param disposition - Call disposition
 * @returns Display label
 */
export function getDispositionLabel(disposition: CallDisposition): string {
  switch (disposition) {
    case 'answered':
      return 'Answered';
    case 'no_answer':
      return 'No Answer';
    case 'busy':
      return 'Busy';
    case 'failed':
      return 'Failed';
    case 'voicemail':
      return 'Voicemail';
    default:
      return 'Unknown';
  }
}

/**
 * Get color class for call disposition
 *
 * @param disposition - Call disposition
 * @returns Tailwind color class
 */
export function getDispositionColor(disposition: CallDisposition): string {
  switch (disposition) {
    case 'answered':
      return 'text-green-600 dark:text-green-400';
    case 'no_answer':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'busy':
      return 'text-orange-600 dark:text-orange-400';
    case 'failed':
      return 'text-red-600 dark:text-red-400';
    case 'voicemail':
      return 'text-purple-600 dark:text-purple-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

// =============================================================================
// Voicemail & Recording Functions
// =============================================================================

/**
 * Get voicemails from call history
 *
 * Filters call history for calls that went to voicemail and may have recordings.
 * Note: Recording URLs are only available if Cytracom provides them in the CDR.
 *
 * @param startDate - Start of date range (defaults to 7 days ago)
 * @param endDate - End of date range (defaults to now)
 * @returns Array of voicemail records with optional audio URLs
 *
 * @example
 * const voicemails = await getVoicemails();
 * voicemails.forEach(vm => {
 *   console.log(`From: ${vm.callerNumber}`);
 *   if (vm.audioUrl) {
 *     console.log(`Recording available: ${vm.audioUrl}`);
 *   }
 * });
 *
 * @functions_called fetchCallHistory
 * @called_by VoicemailDashboard, ReceptionDashboard
 *
 * @version 1.0.0 - 2026-01-19T22:00:00Z - Initial implementation
 */
export async function getVoicemails(
  startDate?: Date,
  endDate?: Date
): Promise<CytracomVoicemail[]> {
  // Default to last 7 days
  const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const end = endDate || new Date();

  const calls = await fetchCallHistory({
    startDate: start,
    endDate: end,
    direction: 'inbound',
    limit: 200,
  });

  // Filter for voicemail dispositions
  const voicemailCalls = calls.filter(call => call.disposition === 'voicemail');

  // Map to voicemail format
  return voicemailCalls.map(call => ({
    id: call.callId,
    extension: call.extension || '',
    callerNumber: call.callerNumber,
    callerName: call.callerName,
    timestamp: call.startTime,
    durationSeconds: call.durationSeconds,
    transcription: undefined, // Would come from voicemail-to-email parsing
    audioUrl: call.recordingUrl,
    isNew: true, // Would need state tracking for read/unread
  }));
}

/**
 * Check if a call has a recording available
 *
 * @param callId - The call ID to check
 * @returns Object with hasRecording flag and URL if available
 *
 * @functions_called fetchCallHistory
 * @called_by CallDetailView, VoicemailPlayer
 *
 * @version 1.0.0 - 2026-01-19T22:00:00Z - Initial implementation
 */
export async function getCallRecording(
  callId: string
): Promise<{ hasRecording: boolean; recordingUrl?: string }> {
  try {
    // Fetch recent call history and find the specific call
    const calls = await fetchCallHistory({ limit: 500 });
    const call = calls.find(c => c.callId === callId);

    if (!call) {
      return { hasRecording: false };
    }

    return {
      hasRecording: !!call.recordingUrl,
      recordingUrl: call.recordingUrl,
    };
  } catch (error) {
    console.error('Failed to get call recording:', error);
    return { hasRecording: false };
  }
}

/**
 * Get calls with recordings (answered calls that were recorded)
 *
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @returns Array of CDR records that have recordings
 *
 * @functions_called fetchCallHistory
 * @called_by RecordingsPage, CallHistoryPage
 *
 * @version 1.0.0 - 2026-01-19T22:00:00Z - Initial implementation
 */
export async function getRecordedCalls(
  startDate?: Date,
  endDate?: Date
): Promise<CytracomCDR[]> {
  const calls = await fetchCallHistory({
    startDate,
    endDate,
    limit: 200,
  });

  return calls.filter(call => call.recorded && call.recordingUrl);
}

/**
 * Get recent call logs from Supabase for current employee
 *
 * @param employeeId - Employee user profile ID
 * @param limit - Maximum number of records (default 50)
 * @returns Array of recent call log entries
 *
 * @functions_called getSupabaseServiceClient
 * @called_by EmployeeCallHistory, ReceptionDashboard
 *
 * @version 1.0.0 - 2026-01-19T22:00:00Z - Initial implementation
 */
export async function getEmployeeCallLogs(
  employeeId: string,
  limit: number = 50
): Promise<CallLogEntry[]> {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    console.warn('Cannot get call logs: Supabase not configured');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('call_logs')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch employee call logs:', error);
      return [];
    }

    return (data || []).map(row => ({
      employeeId: row.employee_id,
      extension: row.extension,
      destinationNumber: row.destination_number,
      destinationDisplay: row.destination_display,
      cytracomCallId: row.cytracom_call_id,
      status: row.status as CallLogStatus,
      errorMessage: row.error_message,
      repairshoprCustomerId: row.repairshopr_customer_id,
      customerName: row.customer_name,
      context: row.context,
    }));
  } catch (error) {
    console.error('Error fetching employee call logs:', error);
    return [];
  }
}

/**
 * Get all recent call logs from Supabase (for managers/admins)
 *
 * @param limit - Maximum number of records (default 100)
 * @returns Array of recent call log entries with employee info
 *
 * @functions_called getSupabaseServiceClient
 * @called_by CallLogsReport, AdminDashboard
 *
 * @version 1.0.0 - 2026-01-19T22:00:00Z - Initial implementation
 */
export async function getAllCallLogs(
  limit: number = 100
): Promise<(CallLogEntry & { employeeName?: string; createdAt?: Date })[]> {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    console.warn('Cannot get call logs: Supabase not configured');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('call_logs')
      .select(`
        *,
        user_profiles!call_logs_employee_id_fkey (
          full_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch all call logs:', error);
      return [];
    }

    return (data || []).map(row => ({
      employeeId: row.employee_id,
      extension: row.extension,
      destinationNumber: row.destination_number,
      destinationDisplay: row.destination_display,
      cytracomCallId: row.cytracom_call_id,
      status: row.status as CallLogStatus,
      errorMessage: row.error_message,
      repairshoprCustomerId: row.repairshopr_customer_id,
      customerName: row.customer_name,
      context: row.context,
      employeeName: row.user_profiles?.full_name,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
    }));
  } catch (error) {
    console.error('Error fetching all call logs:', error);
    return [];
  }
}
