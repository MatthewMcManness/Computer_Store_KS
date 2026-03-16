import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthMode,
  authenticateWithSupabase,
  verifyPassword,
  createSession,
} from '@/lib/auth';
import { getDefaultDashboard } from '@/lib/role-helpers';

export const dynamic = 'force-dynamic';

// =============================================================================
// Rate Limiting
// =============================================================================

interface RateLimitEntry {
  attempts: number;
  resetAt: number;
}

// In-memory rate limit store (keyed by IP)
const rateLimitStore = new Map<string, RateLimitEntry>();

// TODO: Restore stricter limits after fixing auth system
// Original: 5 attempts per 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 50; // Lenient for development
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Clean up expired rate limit entries periodically.
 *
 * Removes entries from the rate limit store whose reset time has passed,
 * preventing memory leaks from accumulating expired entries.
 *
 * @sideEffects
 * - Modifies rateLimitStore by removing expired entries
 *
 * @functions_called None
 * @called_by checkRateLimit (probabilistically)
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetAt) {
      rateLimitStore.delete(ip);
    }
  }
}

/**
 * Check if an IP address is currently rate limited for login attempts.
 *
 * Determines whether the given IP has exceeded the maximum allowed login attempts
 * within the rate limit window. Probabilistically triggers cleanup of expired entries.
 *
 * @param ip - Client IP address to check
 * @returns Object containing isLimited flag and retryAfter seconds
 * - isLimited: true if the IP has exceeded the limit
 * - retryAfter: seconds remaining until the rate limit window expires (0 if not limited)
 *
 * @sideEffects
 * - May delete expired entries from rateLimitStore (10% probability)
 * - May delete the IP's entry if the rate limit window has expired
 *
 * @functions_called cleanupRateLimitStore
 * @called_by POST (login handler)
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
function checkRateLimit(ip: string): { isLimited: boolean; retryAfter: number } {
  // Clean up expired entries occasionally
  if (Math.random() < 0.1) {
    cleanupRateLimitStore();
  }

  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry) {
    return { isLimited: false, retryAfter: 0 };
  }

  // Check if window has expired
  if (now >= entry.resetAt) {
    rateLimitStore.delete(ip);
    return { isLimited: false, retryAfter: 0 };
  }

  // Check if limit exceeded
  if (entry.attempts >= RATE_LIMIT_MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { isLimited: true, retryAfter };
  }

  return { isLimited: false, retryAfter: 0 };
}

/**
 * Record a login attempt from an IP address for rate limiting.
 *
 * Increments the attempt counter for the given IP address. If no entry exists
 * or the previous window has expired, creates a new rate limit window.
 *
 * @param ip - Client IP address to record attempt for
 *
 * @sideEffects
 * - Creates or updates entry in rateLimitStore for the IP address
 * - Sets or increments attempt counter
 * - Sets reset time for new windows
 *
 * @functions_called None
 * @called_by POST (login handler, before authentication)
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
function recordLoginAttempt(ip: string): void {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now >= entry.resetAt) {
    // Start new window
    rateLimitStore.set(ip, {
      attempts: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
  } else {
    // Increment existing
    entry.attempts++;
  }
}

/**
 * Extract the client's IP address from the incoming request.
 *
 * Checks common reverse proxy headers (x-forwarded-for, x-real-ip) to determine
 * the true client IP address, with fallback to 'unknown' if no IP can be determined.
 *
 * @param request - The incoming Next.js request object
 * @returns Client IP address string, or 'unknown' if unable to determine
 *
 * @functions_called None
 * @called_by POST (login handler)
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
function getClientIP(request: NextRequest): string {
  // Check common headers first
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIP = forwarded.split(',')[0];
    return firstIP?.trim() || 'unknown';
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback
  return 'unknown';
}

// =============================================================================
// Request/Response Types
// =============================================================================

interface LoginRequest {
  email?: string;
  password: string;
}

// =============================================================================
// POST Handler
// =============================================================================

/**
 * Handle user login authentication.
 *
 * Authenticates users via Supabase (repairshopr mode) or legacy password verification,
 * with rate limiting protection against brute force attacks. For successful employee logins,
 * triggers a background sync to ensure fresh data availability.
 *
 * @param request - The incoming HTTP POST request containing login credentials
 * @returns NextResponse with authentication result:
 * - Success (200): { success: true, user: { email, name, role, userType } }
 * - Rate limited (429): { success: false, error: string, code: 'RATE_LIMITED' }
 * - Invalid credentials (401): { success: false, error: string, code: 'INVALID_CREDENTIALS' }
 * - Bad request (400): { success: false, error: string }
 * - Server error (500): { success: false, error: string }
 *
 * @throws {Error} When authentication or session creation fails
 *
 * @sideEffects
 * - Records login attempt for rate limiting (increments counter)
 * - May create or update user session (Supabase or legacy)
 * - Logs authentication attempts and results
 *
 * @example
 * // POST /api/auth/login
 * // Body: { email: "user@example.com", password: "secret123" }
 * const response = await fetch('/api/auth/login', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ email, password })
 * });
 *
 * @functions_called
 * - getClientIP
 * - checkRateLimit
 * - recordLoginAttempt
 * - getAuthMode (from @/lib/auth)
 * - authenticateWithSupabase (from @/lib/auth)
 * - verifyPassword (from @/lib/auth)
 * - createSession (from @/lib/auth)
 *
 * @called_by Login form components via fetch
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export async function POST(request: NextRequest) {
  console.log('[AUTH] Login request received');
  const clientIP = getClientIP(request);

  // Check rate limit first
  const { isLimited, retryAfter } = checkRateLimit(clientIP);
  if (isLimited) {
    console.log(`[AUTH] Rate limited: ${clientIP}`);
    return NextResponse.json(
      {
        success: false,
        error: 'Too many login attempts. Please try again later.',
        code: 'RATE_LIMITED',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
        },
      }
    );
  }

  try {
    // Parse request body
    let body: LoginRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { email, password } = body;

    // Validate password is present (required in both modes)
    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    const authMode = getAuthMode();

    // Supabase-only authentication mode
    if (authMode === 'repairshopr') {
      // Email is required
      if (!email) {
        return NextResponse.json(
          { success: false, error: 'Email is required' },
          { status: 400 }
        );
      }

      // Record attempt before auth
      recordLoginAttempt(clientIP);

      // Authenticate via Supabase (the only auth method now)
      const supabaseResult = await authenticateWithSupabase(email, password);

      if (supabaseResult.success && supabaseResult.user) {
        // Audit log - never log passwords
        console.log(`[AUTH] Login successful: ${email}`);

        // Get roles and compute redirect URL
        const roles = supabaseResult.user.roles ||
          (supabaseResult.user.role ? [supabaseResult.user.role] : ['customer']);
        const redirectUrl = supabaseResult.user.userType === 'customer'
          ? '/portal'
          : getDefaultDashboard(roles);

        return NextResponse.json({
          success: true,
          user: {
            email: supabaseResult.user.email,
            name: supabaseResult.user.name,
            role: supabaseResult.user.role,
            userType: supabaseResult.user.userType,
          },
          redirectUrl,
        });
      }

      // Authentication failed
      console.log(`[AUTH] Login attempt: ${email} - FAILED`);

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        },
        { status: 401 }
      );
    }

    // Legacy mode
    // Record attempt before auth
    recordLoginAttempt(clientIP);

    if (verifyPassword(password)) {
      await createSession();

      // Audit log for legacy mode
      console.log(`[AUTH] Login attempt: legacy - SUCCESS`);

      return NextResponse.json({
        success: true,
        message: 'Authentication successful',
      });
    } else {
      // Audit log for legacy mode
      console.log(`[AUTH] Login attempt: legacy - FAILED`);

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid password',
          code: 'INVALID_CREDENTIALS',
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
