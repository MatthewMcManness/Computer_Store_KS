/**
 * Supabase Server-Side Client Utilities
 *
 * Provides server-side Supabase client creation for:
 * - Server Components
 * - Server Actions
 * - Route Handlers (API routes)
 * - Middleware
 *
 * Uses @supabase/ssr for proper cookie handling in Next.js
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import type { UserProfile, UserRole } from './supabase-auth';

// =============================================================================
// Configuration
// =============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Check if Supabase is configured
 */
export function isSupabaseServerConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

// =============================================================================
// Server Component Client
// =============================================================================

/**
 * Create a Supabase client for use in Server Components
 * This client can read cookies but cannot modify them
 */
export async function createSupabaseServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing sessions.
        }
      },
    },
  });
}

// =============================================================================
// Middleware Client
// =============================================================================

/**
 * Create a Supabase client for use in Middleware
 * This client can both read and write cookies via request/response
 */
export function createSupabaseMiddlewareClient(
  request: NextRequest,
  response: NextResponse
) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });
}

// =============================================================================
// Session & User Helpers for Middleware
// =============================================================================

export interface MiddlewareAuthResult {
  user: {
    id: string;
    email: string;
  } | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  role: UserRole | null;
}

/**
 * Get authenticated user and profile from middleware context
 * Returns user info without making additional database calls if possible
 */
export async function getMiddlewareAuth(
  request: NextRequest,
  response: NextResponse
): Promise<MiddlewareAuthResult> {
  const supabase = createSupabaseMiddlewareClient(request, response);

  if (!supabase) {
    return {
      user: null,
      profile: null,
      isAuthenticated: false,
      role: null,
    };
  }

  try {
    // Get the session - this validates the JWT from cookies
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        user: null,
        profile: null,
        isAuthenticated: false,
        role: null,
      };
    }

    // Get user profile with role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      user: {
        id: user.id,
        email: user.email || '',
      },
      profile: profile as UserProfile | null,
      isAuthenticated: true,
      role: (profile?.role as UserRole) || null,
    };
  } catch (error) {
    console.error('[MIDDLEWARE AUTH] Error getting auth:', error);
    return {
      user: null,
      profile: null,
      isAuthenticated: false,
      role: null,
    };
  }
}

// =============================================================================
// Route Handler Client (for API routes)
// =============================================================================

/**
 * Create a Supabase client for use in Route Handlers (API routes)
 * Similar to server component client but for API context
 */
export async function createSupabaseRouteClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignore errors in read-only contexts
        }
      },
    },
  });
}

// =============================================================================
// Server Action Client
// =============================================================================

/**
 * Create a Supabase client for use in Server Actions
 * This client can modify cookies for session management
 */
export async function createSupabaseActionClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get the current user from server context
 * Useful for protecting server components and actions
 */
export async function getServerUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

/**
 * Get the current user's profile from server context
 */
export async function getServerUserProfile(): Promise<UserProfile | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) return null;
  return profile as UserProfile;
}

/**
 * Check if the current server user has a specific role
 */
export async function serverUserHasRole(
  allowedRoles: UserRole[]
): Promise<boolean> {
  const profile = await getServerUserProfile();
  if (!profile) return false;
  return allowedRoles.includes(profile.role);
}

/**
 * Alias for createSupabaseRouteClient for simpler imports
 */
export const createClient = createSupabaseRouteClient;
