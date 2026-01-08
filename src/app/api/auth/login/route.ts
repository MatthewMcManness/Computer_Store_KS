import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthMode,
  authenticateWithRepairShopr,
  authenticateWithSupabase,
  verifyPassword,
  createSession,
} from '@/lib/auth';

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

const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Clean up expired rate limit entries periodically
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
 * Check if an IP is rate limited
 * @returns Object with isLimited flag and retryAfter seconds
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
 * Record a login attempt for rate limiting
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
 * Get client IP from request
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

    // Supabase-first mode with RepairShopr fallback for legacy employees
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

      // Step 1: Try Supabase authentication first (primary auth system)
      const supabaseResult = await authenticateWithSupabase(email, password);

      if (supabaseResult.success && supabaseResult.user) {
        // Audit log - never log passwords
        console.log(`[AUTH] Login successful via Supabase: ${email}`);

        return NextResponse.json({
          success: true,
          user: {
            email: supabaseResult.user.email,
            name: supabaseResult.user.name,
            role: supabaseResult.user.role,
            userType: supabaseResult.user.userType,
          },
          // Pass through debug info if present
          _debug: (supabaseResult as { _debug?: unknown })._debug,
        });
      }

      // Step 2: If Supabase failed, try RepairShopr (fallback for legacy employees)
      console.log(`[AUTH] Supabase auth failed for ${email}, trying RepairShopr fallback...`);
      const repairShoprResult = await authenticateWithRepairShopr(email, password);

      if (repairShoprResult.success && repairShoprResult.user) {
        // Audit log - never log passwords
        console.log(`[AUTH] Legacy employee login successful: ${email}`);

        return NextResponse.json({
          success: true,
          user: {
            email: repairShoprResult.user.email,
            name: repairShoprResult.user.name,
            role: repairShoprResult.user.role,
            userType: repairShoprResult.user.userType,
          },
        });
      }

      // Both authentication methods failed
      console.log(`[AUTH] Login attempt: ${email} - FAILED (both Supabase and RepairShopr auth)`);

      // Determine appropriate error code
      let code: string = 'INVALID_CREDENTIALS';
      let status = 401;

      if (
        repairShoprResult.error?.includes('Unable to connect') ||
        repairShoprResult.error?.includes('not configured')
      ) {
        code = 'SERVICE_UNAVAILABLE';
        status = 503;
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
          code,
        },
        { status }
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
