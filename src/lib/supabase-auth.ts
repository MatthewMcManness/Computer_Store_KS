/**
 * Supabase Authentication Utilities
 *
 * Provides authentication helpers for Computer Store KS with:
 * - Email/password authentication via Supabase Auth
 * - Custom session durations by user role
 * - Integration with user_profiles table
 *
 * Session Durations:
 * - Employees (admin, technician, receptionist): 8 hours
 * - Customers: 30 days (with "remember me")
 *
 * @see docs/supabase/auth-configuration.md
 */

import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// =============================================================================
// Configuration Constants
// =============================================================================

/**
 * Session durations in seconds
 */
export const SESSION_DURATIONS = {
  /** Employee session: 8 hours */
  EMPLOYEE: 8 * 60 * 60, // 28,800 seconds
  /** Customer session: 30 days */
  CUSTOMER: 30 * 24 * 60 * 60, // 2,592,000 seconds
  /** Default (guest/unknown): 1 hour */
  DEFAULT: 60 * 60, // 3,600 seconds
} as const;

/**
 * Legacy user role types (for backward compatibility)
 * @deprecated Use roles array from src/types/roles.ts instead
 */
export type LegacyUserRole = 'admin' | 'technician' | 'receptionist' | 'customer';

/**
 * Re-export types from the new roles system
 */
export type { UserRole, BusinessRole, AddOnRole, EmployeeRole } from '@/types/roles';

/**
 * Check if a legacy role is an employee role
 * @deprecated Use isEmployee from src/lib/role-helpers.ts instead
 */
export function isEmployeeRole(role: string): boolean {
  return ['admin', 'technician', 'receptionist', 'manager', 'owner', 'lead_technician', 'lead_developer'].includes(role);
}

// =============================================================================
// Supabase Client Creation
// =============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Create a Supabase client for auth operations
 * Uses the anon key for client-side operations
 */
export function createAuthClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase auth not configured: missing URL or anon key');
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * Create a Supabase admin client for server-side auth operations
 * Uses the service role key which bypasses RLS
 */
export function createAuthAdminClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase admin auth not configured: missing URL or service key');
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// =============================================================================
// User Profile Types
// =============================================================================

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  /**
   * Legacy single role field (deprecated, kept for backward compatibility)
   * @deprecated Use `roles` array instead
   */
  role: LegacyUserRole;
  /**
   * Array of user roles (new multi-role system)
   * Business roles: receptionist, technician, lead_technician, manager, owner
   * Add-on roles: social_media, lead_developer
   * Customer role: customer
   */
  roles: string[];
  /**
   * Location ID - UUID reference to locations table
   * Employees are assigned to a location; owner/lead_developer can access all
   */
  location_id: string | null;
  /**
   * Default location ID - UUID reference to locations table
   * For users with global access (owner/lead_developer), this is their preferred
   * location that gets pre-selected when opening the portal.
   * Falls back to location_id if not set.
   */
  default_location_id: string | null;
  repairshopr_user_id: number | null;
  repairshopr_customer_id: number | null;
  protection_plan_tier: 'bronze' | 'silver' | 'gold' | null;
  created_at: string;
  updated_at: string;
}

export interface AuthenticatedUser {
  user: User;
  session: Session;
  profile: UserProfile | null;
}

// =============================================================================
// Authentication Functions
// =============================================================================

/**
 * Sign up a new user with email and password
 */
export async function signUp(
  email: string,
  password: string,
  metadata?: { full_name?: string }
): Promise<{ user: User | null; error: Error | null }> {
  const client = createAuthClient();
  if (!client) {
    return { user: null, error: new Error('Supabase auth not configured') };
  }

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { user: null, error: new Error(error.message) };
  }

  return { user: data.user, error: null };
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
  const client = createAuthClient();
  if (!client) {
    return { user: null, session: null, error: new Error('Supabase auth not configured') };
  }

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, session: null, error: new Error(error.message) };
  }

  return { user: data.user, session: data.session, error: null };
}

/**
 * Sign in with Google OAuth
 * Redirects to Google for authentication, then back to /auth/callback
 */
export async function signInWithGoogle(
  redirectTo?: string
): Promise<{ error: Error | null }> {
  const client = createAuthClient();
  if (!client) {
    return { error: new Error('Supabase auth not configured') };
  }

  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback${redirectTo ? `?returnTo=${encodeURIComponent(redirectTo)}` : ''}`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    return { error: new Error(error.message) };
  }

  return { error: null };
}

/**
 * Sign in with magic link (passwordless)
 */
export async function signInWithMagicLink(
  email: string,
  redirectTo?: string
): Promise<{ error: Error | null }> {
  const client = createAuthClient();
  if (!client) {
    return { error: new Error('Supabase auth not configured') };
  }

  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo || `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: new Error(error.message) };
  }

  return { error: null };
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: Error | null }> {
  const client = createAuthClient();
  if (!client) {
    return { error: new Error('Supabase auth not configured') };
  }

  const { error } = await client.auth.signOut();

  if (error) {
    return { error: new Error(error.message) };
  }

  return { error: null };
}

/**
 * Request password reset email
 */
export async function requestPasswordReset(
  email: string,
  redirectTo?: string
): Promise<{ error: Error | null }> {
  const client = createAuthClient();
  if (!client) {
    return { error: new Error('Supabase auth not configured') };
  }

  const { error } = await client.auth.resetPasswordForEmail(email, {
    // Redirect to auth/confirm which verifies the token, then redirects to reset-password/confirm
    redirectTo: redirectTo || `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
  });

  if (error) {
    return { error: new Error(error.message) };
  }

  return { error: null };
}

/**
 * Update password (after reset or for logged-in user)
 */
export async function updatePassword(
  newPassword: string
): Promise<{ error: Error | null }> {
  const client = createAuthClient();
  if (!client) {
    return { error: new Error('Supabase auth not configured') };
  }

  const { error } = await client.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: new Error(error.message) };
  }

  return { error: null };
}

// =============================================================================
// Session Management
// =============================================================================

/**
 * Get the current session
 */
export async function getSession(): Promise<Session | null> {
  const client = createAuthClient();
  if (!client) {
    return null;
  }

  const { data: { session } } = await client.auth.getSession();
  return session;
}

/**
 * Get the current user
 */
export async function getUser(): Promise<User | null> {
  const client = createAuthClient();
  if (!client) {
    return null;
  }

  const { data: { user } } = await client.auth.getUser();
  return user;
}

/**
 * Refresh the current session
 */
export async function refreshSession(): Promise<Session | null> {
  const client = createAuthClient();
  if (!client) {
    return null;
  }

  const { data: { session } } = await client.auth.refreshSession();
  return session;
}

// =============================================================================
// User Profile Functions
// =============================================================================

/**
 * Get user profile from the database
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const client = createAuthAdminClient();
  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data as UserProfile;
}

/**
 * Create a user profile after signup
 * This should be called after successful auth signup
 *
 * @param userId - Supabase auth user ID
 * @param email - User email address
 * @param roles - Array of roles (new system) or single role string (legacy)
 * @param options - Additional profile options including locationId
 *
 * @functions_called createAuthAdminClient, getDefaultLocationId
 * @called_by signUp, inviteUser, auth callback
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-01-11T00:00:00Z - Added multi-role support
 * @version 3.0.0 - 2026-01-11T00:00:00Z - Added location support
 */
export async function createUserProfile(
  userId: string,
  email: string,
  roles: string[] | string = ['customer'],
  options?: {
    fullName?: string;
    repairshoprUserId?: number;
    repairshoprCustomerId?: number;
    locationId?: string;
  }
): Promise<UserProfile | null> {
  const client = createAuthAdminClient();
  if (!client) {
    return null;
  }

  // Convert single role to array for new system
  const rolesArray = Array.isArray(roles) ? roles : [roles];

  // Determine legacy role for backward compatibility
  // Map new roles to legacy: owner/lead_developer/manager -> admin,
  // lead_technician/technician -> technician, receptionist -> receptionist
  let legacyRole: LegacyUserRole = 'customer';
  if (rolesArray.some(r => ['owner', 'lead_developer', 'manager'].includes(r))) {
    legacyRole = 'admin';
  } else if (rolesArray.some(r => ['lead_technician', 'technician'].includes(r))) {
    legacyRole = 'technician';
  } else if (rolesArray.includes('receptionist')) {
    legacyRole = 'receptionist';
  }

  // Get location ID - use provided or fetch default for employees
  let locationId = options?.locationId || null;

  // If no location provided and this is an employee, get the default location
  // Customers don't need a location
  if (!locationId && legacyRole !== 'customer') {
    // Fetch default location (Topeka)
    const { data: defaultLocation } = await client
      .from('locations')
      .select('id')
      .eq('slug', 'topeka')
      .single();

    if (defaultLocation) {
      locationId = defaultLocation.id;
    }
  }

  const { data, error } = await client
    .from('user_profiles')
    .insert({
      id: userId,
      email,
      role: legacyRole, // Legacy field for backward compatibility
      roles: rolesArray, // New multi-role field
      location_id: locationId, // Location assignment
      full_name: options?.fullName || null,
      repairshopr_user_id: options?.repairshoprUserId || null,
      repairshopr_customer_id: options?.repairshoprCustomerId || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user profile:', error);
    return null;
  }

  return data as UserProfile;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'email' | 'created_at' | 'updated_at'>>
): Promise<UserProfile | null> {
  const client = createAuthAdminClient();
  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }

  return data as UserProfile;
}

// =============================================================================
// Session Duration Management
// =============================================================================

/**
 * Get the appropriate session duration for a user role
 * @param role - Legacy single role or first role from roles array
 */
export function getSessionDurationForRole(role: string): number {
  if (isEmployeeRole(role)) {
    return SESSION_DURATIONS.EMPLOYEE;
  }
  return SESSION_DURATIONS.CUSTOMER;
}

/**
 * Get the appropriate session duration based on roles array
 * @param roles - Array of user roles
 */
export function getSessionDurationForRoles(roles: string[]): number {
  // If user has any employee role, use employee session duration
  const hasEmployeeRole = roles.some(r => isEmployeeRole(r));
  return hasEmployeeRole ? SESSION_DURATIONS.EMPLOYEE : SESSION_DURATIONS.CUSTOMER;
}

/**
 * Calculate session expiry time for a user
 * @param roleOrRoles - Single role string or array of roles
 */
export function calculateSessionExpiry(roleOrRoles: string | string[]): Date {
  const duration = Array.isArray(roleOrRoles)
    ? getSessionDurationForRoles(roleOrRoles)
    : getSessionDurationForRole(roleOrRoles);
  return new Date(Date.now() + duration * 1000);
}

/**
 * Check if a session should be extended based on user role
 * Compares remaining time vs half of the total duration
 * @param expiresAt - Session expiry date
 * @param roleOrRoles - Single role string or array of roles
 */
export function shouldExtendSession(
  expiresAt: Date,
  roleOrRoles: string | string[]
): boolean {
  const duration = Array.isArray(roleOrRoles)
    ? getSessionDurationForRoles(roleOrRoles)
    : getSessionDurationForRole(roleOrRoles);
  const halfDuration = duration / 2;
  const remainingTime = (expiresAt.getTime() - Date.now()) / 1000;

  return remainingTime < halfDuration;
}

// =============================================================================
// Admin Functions (Server-side only)
// =============================================================================

/**
 * Invite a new employee user
 * Sends an invitation email with a link to set up their account
 *
 * @param email - User email address
 * @param role - Single role or array of roles
 * @param options - Additional options including location
 *
 * @functions_called createAuthAdminClient, createUserProfile
 * @called_by EmployeesPage, employee API routes
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-01-11T00:00:00Z - Added multi-role support
 * @version 3.0.0 - 2026-01-11T00:00:00Z - Added location support
 */
export async function inviteUser(
  email: string,
  role: UserRole,
  options?: {
    fullName?: string;
    repairshoprUserId?: number;
    locationId?: string;
  }
): Promise<{ error: Error | null }> {
  const client = createAuthAdminClient();
  if (!client) {
    return { error: new Error('Supabase admin not configured') };
  }

  // Use Supabase's admin invite function
  // Redirect to password reset confirmation page where they can set their password
  const { data, error } = await client.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/confirm`,
    data: {
      role,
      full_name: options?.fullName,
      repairshopr_user_id: options?.repairshoprUserId,
      location_id: options?.locationId,
    },
  });

  if (error) {
    return { error: new Error(error.message) };
  }

  // Create the user profile with the specified role and location
  if (data.user) {
    await createUserProfile(data.user.id, email, role, {
      fullName: options?.fullName,
      repairshoprUserId: options?.repairshoprUserId,
      locationId: options?.locationId,
    });
  }

  return { error: null };
}

/**
 * Delete a user account (admin only)
 */
export async function deleteUser(userId: string): Promise<{ error: Error | null }> {
  const client = createAuthAdminClient();
  if (!client) {
    return { error: new Error('Supabase admin not configured') };
  }

  const { error } = await client.auth.admin.deleteUser(userId);

  if (error) {
    return { error: new Error(error.message) };
  }

  return { error: null };
}

/**
 * Get all users (admin only)
 */
export async function listUsers(
  page: number = 1,
  perPage: number = 50
): Promise<{ users: User[]; error: Error | null }> {
  const client = createAuthAdminClient();
  if (!client) {
    return { users: [], error: new Error('Supabase admin not configured') };
  }

  const { data, error } = await client.auth.admin.listUsers({
    page,
    perPage,
  });

  if (error) {
    return { users: [], error: new Error(error.message) };
  }

  return { users: data.users, error: null };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if Supabase Auth is properly configured
 */
export function isAuthConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

/**
 * Check if Supabase Admin Auth is properly configured
 */
export function isAdminAuthConfigured(): boolean {
  return !!(supabaseUrl && supabaseServiceKey);
}

/**
 * Get user-friendly error message for auth errors
 */
export function getAuthErrorMessage(error: Error): string {
  const message = error.message.toLowerCase();

  if (message.includes('invalid login credentials')) {
    return 'Invalid email or password. Please try again.';
  }
  if (message.includes('email not confirmed')) {
    return 'Please verify your email address before signing in.';
  }
  if (message.includes('user already registered')) {
    return 'An account with this email already exists.';
  }
  if (message.includes('password')) {
    return 'Password must be at least 12 characters long.';
  }
  if (message.includes('rate limit')) {
    return 'Too many attempts. Please wait a few minutes before trying again.';
  }

  return 'An error occurred. Please try again.';
}

// =============================================================================
// Role Checking Utilities
// =============================================================================

// Import role helpers for the new multi-role system
import {
  isEmployee as isEmployeeFromHelpers,
  isManagement as isManagementFromHelpers,
  isLeadDeveloper as isLeadDeveloperFromHelpers,
  hasBlogAccess as hasBlogAccessFromHelpers,
  hasAnyRole as hasAnyRoleFromHelpers,
} from '@/lib/role-helpers';

/**
 * Check if user profile has admin-level access (owner, manager, or lead_developer)
 * Uses new roles array with fallback to legacy role
 */
export function isAdmin(profile: UserProfile | null): boolean {
  if (!profile) return false;
  // Check new roles array first
  if (profile.roles && profile.roles.length > 0) {
    return isManagementFromHelpers(profile.roles);
  }
  // Fallback to legacy role
  return profile.role === 'admin';
}

/**
 * Check if user profile has technician-level access
 * Uses new roles array with fallback to legacy role
 */
export function isTechnician(profile: UserProfile | null): boolean {
  if (!profile) return false;
  // Check new roles array first
  if (profile.roles && profile.roles.length > 0) {
    return hasAnyRoleFromHelpers(profile.roles, ['technician', 'lead_technician']);
  }
  // Fallback to legacy role
  return profile.role === 'technician';
}

/**
 * Check if user profile has receptionist role
 * Uses new roles array with fallback to legacy role
 */
export function isReceptionist(profile: UserProfile | null): boolean {
  if (!profile) return false;
  // Check new roles array first
  if (profile.roles && profile.roles.length > 0) {
    return profile.roles.includes('receptionist');
  }
  // Fallback to legacy role
  return profile.role === 'receptionist';
}

/**
 * Check if user profile has customer role
 * Uses new roles array with fallback to legacy role
 */
export function isCustomer(profile: UserProfile | null): boolean {
  if (!profile) return false;
  // Check new roles array first
  if (profile.roles && profile.roles.length > 0) {
    return profile.roles.includes('customer') && profile.roles.length === 1;
  }
  // Fallback to legacy role
  return profile.role === 'customer';
}

/**
 * Check if user profile has any staff role (any employee role)
 * Uses new roles array with fallback to legacy role
 */
export function isStaff(profile: UserProfile | null): boolean {
  if (!profile) return false;
  // Check new roles array first
  if (profile.roles && profile.roles.length > 0) {
    return isEmployeeFromHelpers(profile.roles);
  }
  // Fallback to legacy role
  return isEmployeeRole(profile.role);
}

/**
 * Check if user profile has any of the specified roles
 * Uses new roles array with fallback to legacy role
 */
export function hasRole(profile: UserProfile | null, roles: string[]): boolean {
  if (!profile) return false;
  // Check new roles array first
  if (profile.roles && profile.roles.length > 0) {
    return hasAnyRoleFromHelpers(profile.roles, roles);
  }
  // Fallback to legacy role
  return roles.includes(profile.role);
}

/**
 * Check if user profile has lead developer access (superuser)
 */
export function isLeadDeveloper(profile: UserProfile | null): boolean {
  if (!profile) return false;
  if (profile.roles && profile.roles.length > 0) {
    return isLeadDeveloperFromHelpers(profile.roles);
  }
  return false;
}

/**
 * Check if user profile has blog access (social_media or manager+)
 */
export function hasBlogAccess(profile: UserProfile | null): boolean {
  if (!profile) return false;
  if (profile.roles && profile.roles.length > 0) {
    return hasBlogAccessFromHelpers(profile.roles);
  }
  // Fallback: admin can access blog
  return profile.role === 'admin';
}

/**
 * Get the user's roles array (with fallback from legacy role)
 */
export function getUserRoles(profile: UserProfile | null): string[] {
  if (!profile) return [];
  // Return new roles array if available
  if (profile.roles && profile.roles.length > 0) {
    return profile.roles;
  }
  // Fallback: convert legacy role to array
  return [profile.role];
}

// =============================================================================
// Location Utilities
// =============================================================================

import { canAccessAllLocations } from '@/types/locations';

/**
 * Get the user's location ID
 */
export function getUserLocationId(profile: UserProfile | null): string | null {
  if (!profile) return null;
  return profile.location_id;
}

/**
 * Check if user can access all locations (owner or lead_developer)
 */
export function userCanAccessAllLocations(profile: UserProfile | null): boolean {
  if (!profile) return false;
  const roles = getUserRoles(profile);
  return canAccessAllLocations(roles);
}
