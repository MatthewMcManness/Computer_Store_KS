/**
 * Supabase Authentication Utilities
 *
 * Simplified single-employee auth model: one Google OAuth login
 * (contact@computerstoreks.com). No RBAC, no roles, no customer accounts.
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-03-20T00:00:00Z - Simplified to single-employee Google OAuth model
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { AUTHORIZED_EMAIL } from '@/lib/constants';

/**
 * Creates a Supabase client that can read/write auth cookies.
 * Used in server components and API routes to check who's logged in.
 */
async function createAuthServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

/**
 * Check if the current user is the authorized employee.
 *
 * @returns true if the current Supabase user's email matches AUTHORIZED_EMAIL
 *
 * @functions_called createAuthServerClient
 * @called_by API routes, admin pages, middleware
 *
 * @version 1.0.0 - 2026-03-20T00:00:00Z - Initial implementation
 */
export async function isAuthorizedEmployee(): Promise<boolean> {
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email === AUTHORIZED_EMAIL;
}

/**
 * Check if the current request has a valid Supabase session.
 *
 * This is used by API routes and admin pages for auth gating.
 * It verifies both that a session exists and that the user
 * is the authorized employee.
 *
 * @returns true if authenticated as the authorized employee
 *
 * @functions_called isAuthorizedEmployee
 * @called_by API routes, admin pages
 *
 * @version 1.0.0 - 2026-03-20T00:00:00Z - Initial implementation
 */
export async function isAuthenticated(): Promise<boolean> {
  return isAuthorizedEmployee();
}

/**
 * Get the current authenticated user (or null).
 *
 * @returns The Supabase User object, or null if not authenticated
 *
 * @functions_called createAuthServerClient
 * @called_by Auth check API route
 *
 * @version 1.0.0 - 2026-03-20T00:00:00Z - Initial implementation
 */
export async function getCurrentUser() {
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Sign out the current user.
 *
 * @sideEffects
 * - Destroys the Supabase session
 * - Clears auth cookies
 *
 * @functions_called createAuthServerClient
 * @called_by Logout API route
 *
 * @version 1.0.0 - 2026-03-20T00:00:00Z - Initial implementation
 */
export async function signOut() {
  const supabase = await createAuthServerClient();
  await supabase.auth.signOut();
}
