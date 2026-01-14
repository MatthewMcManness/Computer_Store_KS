/**
 * @deprecated This file contains legacy RepairShopr authentication.
 * New code should use supabase-auth.ts and supabase-server.ts instead.
 * This file is kept for backward compatibility during the migration period.
 *
 * @see src/lib/supabase-auth.ts - New Supabase auth utilities
 * @see src/lib/supabase-server.ts - Server-side Supabase client
 */

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
const ROLES_COOKIE_NAME = 'user_roles'; // JSON array of roles for multi-role system
const SESSION_MAX_AGE = 8 * 60 * 60; // 8 hours in seconds

// Export for middleware
export { ROLE_COOKIE_NAME, ROLES_COOKIE_NAME };

/**
 * Retrieves the legacy admin password from environment variables.
 *
 * Supports testing environments by reading the password dynamically at runtime
 * rather than at module initialization. Falls back through multiple env vars
 * for compatibility with different deployment configurations.
 *
 * @returns The legacy admin password string
 *
 * @example
 * const password = getLegacyAdminPassword()
 * if (password === inputPassword) { // ... }
 *
 * @see verifyPassword for password verification
 * @see verifyBearerToken for API token verification
 *
 * @functions_called None (reads process.env directly)
 * @called_by verifyPassword, verifyBearerToken
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
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
  supabaseUserId: string; // Supabase auth.users UUID (for audit logging)
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'limited';
  /** Array of user roles (new multi-role system) */
  roles?: string[];
  userType: 'employee' | 'customer';
  /** User's assigned location ID */
  location_id?: string | null;
  /** User's default location ID (for global access users) */
  default_location_id?: string | null;
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
 * Determines the current authentication mode from environment configuration.
 *
 * Returns the active authentication strategy based on the AUTH_MODE environment
 * variable. Defaults to 'repairshopr' for backward compatibility. This function
 * is used throughout the auth system to route authentication requests appropriately.
 *
 * @returns 'repairshopr' for RepairShopr API auth (deprecated), 'legacy' for simple password auth
 *
 * @example
 * if (getAuthMode() === 'repairshopr') {
 *   return await authenticateWithRepairShopr(email, password)
 * } else {
 *   return verifyPassword(password) // legacy mode
 * }
 *
 * @see authenticateWithRepairShopr for RepairShopr authentication
 * @see authenticateWithSupabase for modern Supabase authentication
 *
 * @functions_called None (reads process.env directly)
 * @called_by isAuthenticated, getCurrentUser, getSessionToken, createSession, checkAuthFromRequest
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
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
// Customer Authentication (Supabase)
// =============================================================================

/**
 * Authenticate a customer with Supabase Auth
 * Uses Supabase's built-in auth system (same as password reset)
 * @param email Customer's email address
 * @param password Customer's password
 * @returns AuthResult with success status and user data
 */
export async function authenticateWithSupabase(
  email: string,
  password: string
): Promise<AuthResult> {
  const { createFreshAdminClient } = await import('./supabase');

  // IMPORTANT: Always use a fresh client for authentication to avoid tainting
  // the global supabaseAdmin singleton with user session context.
  // Calling signInWithPassword on a shared client can cause RLS issues on
  // subsequent queries through that client.
  const authClient = createFreshAdminClient();
  if (!authClient) {
    console.log('[AUTH] Supabase not configured');
    return {
      success: false,
      error: 'Customer authentication is not available',
    };
  }

  try {
    // Step 1: Sign in with Supabase Auth using a dedicated fresh client
    // This prevents tainting the global supabaseAdmin with user session context
    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password,
    });

    if (authError) {
      console.log(`[AUTH] Supabase auth error:`, authError.message);
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    if (!authData.user) {
      console.log(`[AUTH] Supabase auth: no user returned`);
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Step 2: Get or create user profile from user_profiles table
    // IMPORTANT: Use a fresh admin client to ensure service_role context
    // (signInWithPassword may have attached user session to the original client)
    console.log(`[AUTH] Looking up profile for user ID: ${authData.user.id}`);
    const freshAdmin = createFreshAdminClient();
    if (!freshAdmin) {
      console.log('[AUTH] Could not create fresh admin client for profile lookup');
      return {
        success: false,
        error: 'Authentication configuration error',
      };
    }

    let { data: profile, error: profileError } = await freshAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.log(`[AUTH] Profile lookup error: ${profileError.code} - ${profileError.message}`);
    }
    if (profile) {
      console.log(`[AUTH] Found profile - role: ${profile.role}, roles: ${JSON.stringify(profile.roles)}, raw profile: ${JSON.stringify(profile)}`);
    }

    // Only create profile if it truly doesn't exist (PGRST116 = no rows returned)
    if (!profile && profileError?.code === 'PGRST116') {
      console.log(`[AUTH] Creating user profile for new user: ${email}`);
      const { data: newProfile, error: insertError } = await freshAdmin
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email || email.toLowerCase(),
          full_name: authData.user.user_metadata?.full_name || email.split('@')[0],
          role: 'customer',
        })
        .select()
        .single();

      if (insertError) {
        console.error(`[AUTH] Failed to create user profile:`, insertError.message);
      } else {
        console.log(`[AUTH] Created new profile with role: customer`);
        profile = newProfile;
      }
    }

    // Use profile data if available, otherwise fall back to auth user data
    const customerName = profile?.full_name || authData.user.user_metadata?.full_name || email.split('@')[0];
    const repairshoprCustomerId = profile?.repairshopr_customer_id || 0;
    const repairshoprUserId = profile?.repairshopr_user_id || 0;

    // Get roles array (new multi-role system) or fallback to single role
    // Profile may have 'roles' (TEXT[]) or 'role' (TEXT)
    // IMPORTANT: Check for non-empty array since [] is truthy in JavaScript
    const profileRoles: string[] = (profile?.roles && Array.isArray(profile.roles) && profile.roles.length > 0)
      ? profile.roles
      : (profile?.role ? [profile.role] : ['customer']);
    console.log(`[AUTH] Computed profileRoles: ${JSON.stringify(profileRoles)} (from profile.roles: ${JSON.stringify(profile?.roles)}, profile.role: ${profile?.role})`);

    // Get location_id from profile
    const locationId: string | null = profile?.location_id || null;

    // Get default_location_id from profile (for global access users)
    const defaultLocationId: string | null = profile?.default_location_id || null;

    // Determine role and userType based on profile
    // Profile roles: 'admin', 'technician', 'receptionist', 'customer', 'owner', etc.
    // Session roles: 'admin', 'employee', 'limited'
    // UserTypes: 'employee', 'customer'
    const profileRole = profile?.role || 'customer';
    const isEmployee = ['admin', 'owner', 'manager', 'lead_technician', 'technician', 'receptionist', 'lead_developer', 'social_media'].some(r => profileRoles.includes(r));

    let sessionRole: 'admin' | 'employee' | 'limited';
    // Admin role for admin, owner, or lead_developer
    if (profileRoles.includes('admin') || profileRoles.includes('owner') || profileRoles.includes('lead_developer')) {
      sessionRole = 'admin';
    } else if (isEmployee) {
      sessionRole = 'employee';
    } else {
      sessionRole = 'limited';
    }

    // Step 3: Create session based on profile role
    const userData: CreateSessionInput = {
      userId: isEmployee ? repairshoprUserId : repairshoprCustomerId,
      supabaseUserId: authData.user.id, // Store UUID for audit logging
      email: authData.user.email || email,
      name: customerName,
      role: sessionRole,
      roles: profileRoles, // Multi-role system: store all roles in session
      userType: isEmployee ? 'employee' : 'customer',
      location_id: locationId, // User's assigned location
      default_location_id: defaultLocationId, // User's default location (for global access users)
    };

    const sessionData = createSessionData(userData); // No API token - use shared key instead
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

    // Set the actual roles array as JSON for the multi-role system
    const rolesJsonValue = JSON.stringify(profileRoles);
    console.log(`[AUTH] Setting user_roles cookie to: ${rolesJsonValue}`);
    cookieStore.set(ROLES_COOKIE_NAME, rolesJsonValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    console.log(`[AUTH] Login successful via Supabase Auth: ${email} (roles: ${profileRoles.join(',')}, userType: ${userData.userType})`);

    return {
      success: true,
      user: {
        userId: userData.userId,
        supabaseUserId: userData.supabaseUserId,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        roles: profileRoles,
        userType: userData.userType,
        location_id: locationId,
        default_location_id: defaultLocationId,
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
      supabaseUserId: user.supabaseUserId || '',
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
  cookieStore.delete(ROLES_COOKIE_NAME);
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
      supabaseUserId: safeSession.supabaseUserId || '',
      email: safeSession.email,
      name: safeSession.name,
      role: safeSession.role,
      roles: safeSession.roles || (safeSession.role ? [safeSession.role] : []),
      userType: safeSession.userType,
      location_id: safeSession.location_id || null,
      default_location_id: safeSession.default_location_id || null,
    };
  }

  // Legacy mode: return a default admin user
  return {
    userId: 0,
    supabaseUserId: '',
    email: 'admin@local',
    name: 'Administrator',
    role: 'admin',
    roles: ['admin', 'owner', 'lead_developer'],
    userType: 'employee',
    location_id: null,
    default_location_id: null,
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

// =============================================================================
// Audit Logging Helpers
// =============================================================================

/**
 * Employee info structure for audit logging
 */
export interface EmployeeAuditInfo {
  userId: string;
  email: string;
  name: string;
}

/**
 * Get employee info for audit logging from current session
 * Returns null if user is not authenticated or is a customer
 *
 * @returns EmployeeAuditInfo or null
 */
export async function getEmployeeAuditInfo(): Promise<EmployeeAuditInfo | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  // Only employees can perform auditable actions
  if (user.userType !== 'employee') {
    return null;
  }

  // supabaseUserId is required for audit logging
  if (!user.supabaseUserId) {
    console.warn('[AUTH] Employee has no Supabase UUID - cannot create audit log');
    return null;
  }

  return {
    userId: user.supabaseUserId,
    email: user.email,
    name: user.name,
  };
}

/**
 * Check if current user is a staff member (employee or admin)
 */
export async function isStaffUser(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null && user.userType === 'employee';
}
