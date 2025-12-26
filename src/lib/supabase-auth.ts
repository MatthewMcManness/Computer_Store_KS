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
 * User role types matching the database schema
 */
export type UserRole = 'admin' | 'technician' | 'receptionist' | 'customer';

/**
 * Check if a role is an employee role
 */
export function isEmployeeRole(role: UserRole): boolean {
  return role === 'admin' || role === 'technician' || role === 'receptionist';
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
  role: UserRole;
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
    redirectTo: redirectTo || `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
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
 */
export async function createUserProfile(
  userId: string,
  email: string,
  role: UserRole = 'customer',
  options?: {
    fullName?: string;
    repairshoprUserId?: number;
    repairshoprCustomerId?: number;
  }
): Promise<UserProfile | null> {
  const client = createAuthAdminClient();
  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from('user_profiles')
    .insert({
      id: userId,
      email,
      role,
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
 */
export function getSessionDurationForRole(role: UserRole): number {
  if (isEmployeeRole(role)) {
    return SESSION_DURATIONS.EMPLOYEE;
  }
  return SESSION_DURATIONS.CUSTOMER;
}

/**
 * Calculate session expiry time for a user
 */
export function calculateSessionExpiry(role: UserRole): Date {
  const duration = getSessionDurationForRole(role);
  return new Date(Date.now() + duration * 1000);
}

/**
 * Check if a session should be extended based on user role
 * Compares remaining time vs half of the total duration
 */
export function shouldExtendSession(
  expiresAt: Date,
  role: UserRole
): boolean {
  const duration = getSessionDurationForRole(role);
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
 */
export async function inviteUser(
  email: string,
  role: UserRole,
  options?: {
    fullName?: string;
    repairshoprUserId?: number;
  }
): Promise<{ error: Error | null }> {
  const client = createAuthAdminClient();
  if (!client) {
    return { error: new Error('Supabase admin not configured') };
  }

  // Use Supabase's admin invite function
  const { data, error } = await client.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/accept-invite`,
    data: {
      role,
      full_name: options?.fullName,
      repairshopr_user_id: options?.repairshoprUserId,
    },
  });

  if (error) {
    return { error: new Error(error.message) };
  }

  // Create the user profile with the specified role
  if (data.user) {
    await createUserProfile(data.user.id, email, role, {
      fullName: options?.fullName,
      repairshoprUserId: options?.repairshoprUserId,
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
