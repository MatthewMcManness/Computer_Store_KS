import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthMode,
  authenticateWithSupabase,
  verifyPassword,
  createSession,
} from '@/lib/auth';
import { getDefaultDashboard } from '@/lib/role-helpers';
import { createRateLimiter } from '@/lib/rate-limiter';
import { getClientIP } from '@/lib/request-helpers';

export const dynamic = 'force-dynamic';

// =============================================================================
// Rate Limiting
// =============================================================================

// TODO: Restore stricter limits after fixing auth system
// Original: 5 attempts per 15 minutes
const rateLimiter = createRateLimiter(50, 5 * 60 * 1000); // 50 attempts / 5 min

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

  // Check rate limit first (without recording - record happens before auth)
  const rateLimit = rateLimiter.check(clientIP, false);
  if (!rateLimit.allowed) {
    const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
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
      rateLimiter.record(clientIP);

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
    rateLimiter.record(clientIP);

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
