import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { createRepairShoprClient, RepairShoprAPIError } from './repairshopr';
import {
  encryptSession,
  decryptSession,
  createSessionData,
  getSafeSession,
  type CreateSessionInput,
  type SessionData,
} from './session-cookie';

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
  userType: 'employee' | 'customer';
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
 * List of emails that should always have admin access
 * These users get admin role regardless of their RepairShopr permissions
 */
const ADMIN_EMAIL_WHITELIST = [
  'joseph@thecomputerstoreks.com',
  'contact@thecomputerstoreks.com',
  'owner@thecomputerstoreks.com',
  'joseph@computerstoreks.com',
  'contact@computerstoreks.com',
  'owner@computerstoreks.com',
].map(email => email.toLowerCase());

/**
 * Map RepairShopr admin status and permissions to our role system
 * @param isAdmin Whether the user is an admin in RepairShopr
 * @param permissions User permissions from RepairShopr
 * @param email User's email address (for whitelist check)
 * @returns Mapped role
 */
function mapRepairShoprRole(
  isAdmin: boolean,
  permissions: Record<string, Record<string, boolean>>,
  email?: string
): 'admin' | 'employee' | 'limited' {
  // Check email whitelist first
  if (email && ADMIN_EMAIL_WHITELIST.includes(email.toLowerCase())) {
    return 'admin';
  }

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
  // Step 1: Create client
  let client;
  try {
    client = createRepairShoprClient();
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error creating client';
    console.log(`[AUTH] Failed to create RepairShopr client:`, msg);
    return {
      success: false,
      error: `Configuration error: ${msg}`,
    };
  }

  // Step 2: Sign in to RepairShopr
  let signInResponse;
  try {
    signInResponse = await client.signIn(email, password);
  } catch (error) {
    if (error instanceof RepairShoprAPIError) {
      console.log(`[AUTH] RepairShopr sign-in failed:`, {
        code: error.code,
        status: error.status,
        message: error.message,
      });
      if (error.code === 'UNAUTHORIZED') {
        return { success: false, error: 'Invalid email or password' };
      }
      return { success: false, error: error.message };
    }
    const msg = error instanceof Error ? error.message : 'Unknown sign-in error';
    console.log(`[AUTH] Unexpected sign-in error:`, msg);
    return { success: false, error: `Sign-in failed: ${msg}` };
  }

  // Step 3: Get user details
  let meResponse;
  try {
    meResponse = await client.getMe(signInResponse.api_key);
  } catch (error) {
    if (error instanceof RepairShoprAPIError) {
      console.log(`[AUTH] RepairShopr getMe failed:`, error.message);
      return { success: false, error: error.message };
    }
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.log(`[AUTH] Unexpected getMe error:`, msg);
    return { success: false, error: `Failed to get user info: ${msg}` };
  }

  // Step 4: Create session
  try {
    const role = mapRepairShoprRole(meResponse.admin, meResponse.permissions, meResponse.user.email);
    const userData: CreateSessionInput = {
      userId: meResponse.user.id,
      email: meResponse.user.email,
      name: meResponse.user.full_name,
      role,
      userType: 'employee', // RepairShopr users are employees
    };

    const sessionData = createSessionData(userData, signInResponse.api_key);
    const encryptedSession = encryptSession(sessionData);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, encryptedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    cookieStore.set(ROLE_COOKIE_NAME, userData.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    return {
      success: true,
      user: {
        userId: userData.userId,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        userType: userData.userType,
      },
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown session error';
    console.log(`[AUTH] Session creation failed:`, msg);
    return { success: false, error: `Session error: ${msg}` };
  }
}

// =============================================================================
// Customer Authentication (Supabase)
// =============================================================================

/**
 * Authenticate a customer with Supabase credentials
 * @param email Customer's email address
 * @param password Customer's password
 * @returns AuthResult with success status and user data
 */
export async function authenticateWithSupabase(
  email: string,
  password: string
): Promise<AuthResult> {
  const { supabaseAdmin } = await import('./supabase');

  if (!supabaseAdmin) {
    console.log('[AUTH] Supabase not configured');
    return {
      success: false,
      error: 'Customer authentication is not available',
    };
  }

  try {
    // Step 1: Query customer account by email
    const { data: account, error: queryError } = await supabaseAdmin
      .from('customer_accounts')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (queryError) {
      console.log(`[AUTH] Customer account query error:`, queryError.message);
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    if (!account) {
      console.log(`[AUTH] Customer account not found: ${email}`);
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Step 2: Verify password hash
    const bcrypt = await import('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, account.password_hash);

    if (!isPasswordValid) {
      console.log(`[AUTH] Customer password verification failed: ${email}`);
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Step 3: Create customer session
    // Use first_name if available, otherwise fallback to email prefix
    const customerName = (account as { first_name?: string }).first_name || account.email.split('@')[0];

    const userData: CreateSessionInput = {
      userId: account.repairshopr_customer_id,
      email: account.email,
      name: customerName,
      role: 'limited', // Customers have limited access
      userType: 'customer',
    };

    const sessionData = createSessionData(userData, ''); // No API token for customers
    const encryptedSession = encryptSession(sessionData);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, encryptedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    cookieStore.set(ROLE_COOKIE_NAME, userData.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    console.log(`[AUTH] Customer login successful: ${email}`);

    return {
      success: true,
      user: {
        userId: userData.userId,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        userType: userData.userType,
      },
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[AUTH] Customer authentication error:`, msg);
    return {
      success: false,
      error: 'Authentication failed',
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
 * @returns Session token/encrypted session
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

  // RepairShopr mode: create encrypted session in cookie
  const sessionData = createSessionData(
    {
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      userType: user.userType,
    },
    '' // No API token when called directly
  );
  const encryptedSession = encryptSession(sessionData);

  cookieStore.set(SESSION_COOKIE_NAME, encryptedSession, {
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

  return encryptedSession;
}

/**
 * Destroy the current session
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();

  // With cookie-based sessions, we just delete the cookies
  // No server-side cleanup needed
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
    // Decrypt and validate session from cookie
    const session = decryptSession(sessionCookie.value);
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
    // Decrypt session from cookie
    const session = decryptSession(sessionCookie.value);
    if (!session) {
      return null;
    }

    // Return safe session data (getSafeSession removes apiToken)
    const safeSession = getSafeSession(session);
    return {
      userId: safeSession.userId,
      email: safeSession.email,
      name: safeSession.name,
      role: safeSession.role,
      userType: safeSession.userType,
    };
  }

  // Legacy mode: return a default admin user
  return {
    userId: 0,
    email: 'admin@local',
    name: 'Administrator',
    role: 'admin',
    userType: 'employee',
  };
}

/**
 * Get RepairShopr API token from session (for API routes)
 * Returns null if not authenticated or if user is not an employee
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  if (getAuthMode() === 'repairshopr') {
    // Decrypt session from cookie
    const session = decryptSession(sessionCookie.value);
    if (!session) {
      return null;
    }

    // Return the API token
    return session.apiToken || null;
  }

  // Legacy mode: no API token available
  return null;
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
    // Decrypt and validate session from cookie
    const session = decryptSession(sessionCookie.value);
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
