import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { createRepairShoprClient, RepairShoprAPIError } from './repairshopr';
import {
  createSession as createStoreSession,
  getSession,
  getSessionSafe,
  deleteSession,
  type CreateSessionData,
} from './session-store';

// =============================================================================
// Configuration
// =============================================================================

const SESSION_COOKIE_NAME = 'admin_session';
const ROLE_COOKIE_NAME = 'user_role'; // Separate cookie for Edge middleware access
const SESSION_MAX_AGE = 8 * 60 * 60; // 8 hours in seconds

// Export for middleware
export { ROLE_COOKIE_NAME };

/**
 * Get the legacy admin password from environment
 * Read dynamically to support test environment changes
 */
function getLegacyAdminPassword(): string {
  return process.env.LEGACY_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'admin123';
}

// =============================================================================
// Types
// =============================================================================

/**
 * User session data (without sensitive API token)
 */
export interface UserSession {
  userId: number;
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'limited';
}

/**
 * Authentication result
 */
export interface AuthResult {
  success: boolean;
  error?: string;
  user?: UserSession;
}

// =============================================================================
// Auth Mode
// =============================================================================

/**
 * Get the current authentication mode
 * @returns 'repairshopr' | 'legacy'
 */
export function getAuthMode(): 'repairshopr' | 'legacy' {
  const mode = process.env.AUTH_MODE || 'repairshopr';
  return mode === 'legacy' ? 'legacy' : 'repairshopr';
}

// =============================================================================
// Legacy Auth Functions (for backward compatibility)
// =============================================================================

/**
 * Simple session token generator (for legacy mode)
 */
function generateSessionToken(): string {
  return Buffer.from(`${Date.now()}-${Math.random().toString(36)}`).toString('base64');
}

/**
 * Verify password (legacy mode only)
 */
export function verifyPassword(password: string): boolean {
  return password === getLegacyAdminPassword();
}

// =============================================================================
// RepairShopr Role Mapping
// =============================================================================

/**
 * Map RepairShopr admin status and permissions to our role system
 * @param isAdmin Whether the user is an admin in RepairShopr
 * @param permissions User permissions from RepairShopr
 * @returns Mapped role
 */
function mapRepairShoprRole(
  isAdmin: boolean,
  permissions: Record<string, Record<string, boolean>>
): 'admin' | 'employee' | 'limited' {
  // Admin users get admin role
  if (isAdmin) {
    return 'admin';
  }

  // Check if user has significant write permissions
  const hasWritePermissions = Object.values(permissions).some(
    (perms) => perms.write === true || perms.create === true
  );

  if (hasWritePermissions) {
    return 'employee';
  }

  return 'limited';
}

// =============================================================================
// RepairShopr Authentication
// =============================================================================

/**
 * Authenticate a user with RepairShopr credentials
 * @param email User's email address
 * @param password User's password
 * @returns AuthResult with success status and user data
 */
export async function authenticateWithRepairShopr(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    // Create RepairShopr client
    const client = createRepairShoprClient();

    // Sign in to get API token
    const signInResponse = await client.signIn(email, password);

    // Get user details
    const meResponse = await client.getMe(signInResponse.api_key);

    // Map role
    const role = mapRepairShoprRole(meResponse.admin, meResponse.permissions);

    // Create session data
    const userData: CreateSessionData = {
      userId: meResponse.user.id,
      email: meResponse.user.email,
      name: meResponse.user.full_name,
      role,
    };

    // Create session in session store (with encrypted API token)
    const sessionId = createStoreSession(userData, signInResponse.api_key);

    // Set session cookie (contains only session ID, not the token)
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    // Set role cookie (for Edge middleware access - not sensitive)
    cookieStore.set(ROLE_COOKIE_NAME, userData.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    // Return success with user data (no sensitive info)
    return {
      success: true,
      user: {
        userId: userData.userId,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      },
    };
  } catch (error) {
    // Handle RepairShopr API errors
    if (error instanceof RepairShoprAPIError) {
      if (error.code === 'UNAUTHORIZED') {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }
      if (error.code === 'NETWORK_ERROR') {
        return {
          success: false,
          error: 'Unable to connect to authentication service. Please try again.',
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }

    // Handle other errors (missing env vars, etc)
    if (error instanceof Error) {
      // Check for missing subdomain
      if (error.message.includes('REPAIRSHOPR_SUBDOMAIN')) {
        return {
          success: false,
          error: 'Authentication service is not configured. Please contact support.',
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

// =============================================================================
// Session Management
// =============================================================================

/**
 * Create session (dual-mode support)
 * In RepairShopr mode, this is called internally by authenticateWithRepairShopr
 * In legacy mode, this creates a simple session token
 * @param user Optional user data for RepairShopr mode
 * @returns Session token/ID
 */
export async function createSession(user?: UserSession): Promise<string> {
  const cookieStore = await cookies();

  if (getAuthMode() === 'legacy' || !user) {
    // Legacy mode: simple token-based session
    const token = generateSessionToken();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });
    // Legacy mode: always admin role
    cookieStore.set(ROLE_COOKIE_NAME, 'admin', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });
    return token;
  }

  // RepairShopr mode: use session store
  // Note: This path is typically used internally by authenticateWithRepairShopr
  // which passes the API token. For external callers without a token,
  // we create a session without one.
  const sessionId = createStoreSession(
    {
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    '' // No API token when called directly
  );

  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  // Set role cookie for Edge middleware
  cookieStore.set(ROLE_COOKIE_NAME, user.role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  return sessionId;
}

/**
 * Destroy the current session
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (sessionCookie?.value && getAuthMode() === 'repairshopr') {
    // Delete from session store
    deleteSession(sessionCookie.value);
  }

  // Always delete both cookies
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(ROLE_COOKIE_NAME);
}

/**
 * Check if user is authenticated (for server components)
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return false;
  }

  if (getAuthMode() === 'repairshopr') {
    // Validate against session store
    const session = getSession(sessionCookie.value);
    return session !== null;
  }

  // Legacy mode: just check cookie exists
  return true;
}

/**
 * Get the current user's session data (without API token)
 * @returns UserSession or null if not authenticated
 */
export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  if (getAuthMode() === 'repairshopr') {
    // Get from session store (safe version without API token)
    const session = getSessionSafe(sessionCookie.value);
    if (!session) {
      return null;
    }

    return {
      userId: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
    };
  }

  // Legacy mode: return a default admin user
  return {
    userId: 0,
    email: 'admin@local',
    name: 'Administrator',
    role: 'admin',
  };
}

/**
 * Get session token (for API routes)
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  return session?.value || null;
}

/**
 * Middleware helper to check auth from request
 */
export function checkAuthFromRequest(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return false;
  }

  if (getAuthMode() === 'repairshopr') {
    // Validate against session store
    const session = getSession(sessionCookie.value);
    return session !== null;
  }

  // Legacy mode: just check cookie exists
  return true;
}

/**
 * Verify Bearer token (for API routes that use Authorization header)
 */
export function verifyBearerToken(authHeader: string | null): boolean {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7);
  return token === getLegacyAdminPassword();
}
