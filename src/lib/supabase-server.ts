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
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-03-20T00:00:00Z - Simplified: removed role/profile helpers (single-employee model)
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

// =============================================================================
// Configuration
// =============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Check if Supabase is configured.
 *
 * @returns true if both SUPABASE_URL and SUPABASE_ANON_KEY are set
 *
 * @called_by Middleware, server components
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */
export function isSupabaseServerConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

// =============================================================================
// Server Component Client
// =============================================================================

/**
 * Create a Supabase client for use in Server Components.
 * This client can read cookies but cannot modify them.
 *
 * @returns Supabase server client or null if not configured
 *
 * @called_by getServerUser, server components
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
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
 * Create a Supabase client for use in Middleware.
 * This client can both read and write cookies via request/response.
 *
 * @param request - The Next.js middleware request
 * @param response - The Next.js middleware response
 * @returns Supabase server client or null if not configured
 *
 * @called_by Middleware
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
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
// Route Handler Client (for API routes)
// =============================================================================

/**
 * Create a Supabase client for use in Route Handlers (API routes).
 *
 * @returns Supabase server client or null if not configured
 *
 * @called_by OAuth callback route, API routes
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
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
 * Create a Supabase client for use in Server Actions.
 * This client can modify cookies for session management.
 *
 * @returns Supabase server client or null if not configured
 *
 * @called_by Server actions
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
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
 * Get the current user from server context.
 * Useful for protecting server components and actions.
 *
 * @returns The Supabase User object, or null if not authenticated
 *
 * @functions_called createSupabaseServerClient
 * @called_by Server components, server actions
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
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
 * Alias for createSupabaseRouteClient for simpler imports.
 */
export const createClient = createSupabaseRouteClient;
