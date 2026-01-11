import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getLocationContext } from '@/lib/location-helpers';
import { getDefaultDashboard } from '@/lib/role-helpers';

export const dynamic = 'force-dynamic';

/**
 * Check current authentication status and retrieve user information.
 *
 * Verifies if the current request has a valid authentication session and returns
 * the authenticated user's details if present. Used by client-side components to
 * determine authentication state and user permissions.
 *
 * @returns NextResponse with authentication status:
 * - Authenticated (200): { authenticated: true, user: {...}, roles: [...], locationContext: {...} }
 * - Not authenticated (200): { authenticated: false }
 * - Server error (500): { authenticated: false, error: 'Auth check failed' }
 *
 * @throws {Error} When session verification fails
 *
 * @sideEffects
 * - Logs errors if auth check fails
 *
 * @example
 * // GET /api/auth/check
 * const response = await fetch('/api/auth/check');
 * const data = await response.json();
 * if (data.authenticated) {
 *   console.log('User:', data.user);
 *   console.log('Roles:', data.roles);
 *   console.log('Location:', data.locationContext);
 * }
 *
 * @functions_called getCurrentUser (from @/lib/auth), getLocationContext (from @/lib/location-helpers)
 * @called_by
 * - Client-side auth context providers
 * - Protected page components
 * - Middleware that needs to verify auth state
 * - AdminSidebar for location selector
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 * @version 1.1.0 - 2026-01-11T00:00:00Z - Added roles array and location context
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (user) {
      // Get user roles (from session or derive from single role)
      const roles = user.roles || (user.role ? [user.role] : ['customer']);

      // Get location context for the sidebar location selector
      let locationContext = null;
      if (user.userType === 'employee') {
        try {
          locationContext = await getLocationContext(roles, user.location_id || null);
        } catch (locError) {
          console.error('[AUTH CHECK] Failed to get location context:', locError);
          // Continue without location context - not a fatal error
        }
      }

      // Compute redirect URL based on roles
      const redirectUrl = user.userType === 'customer'
        ? '/portal'
        : getDefaultDashboard(roles);

      return NextResponse.json({
        authenticated: true,
        user: {
          email: user.email,
          name: user.name,
          role: user.role,
          userType: user.userType,
        },
        roles,
        redirectUrl,
        locationContext,
      });
    }

    return NextResponse.json({ authenticated: false });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Auth check failed' },
      { status: 500 }
    );
  }
}
