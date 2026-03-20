import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import {
  canAccessRoute,
  isEmployee,
  isCustomer,
  getUnauthorizedRedirect,
} from '@/lib/role-helpers';

// =============================================================================
// Configuration
// =============================================================================

/**
 * Legacy user role types for backward compatibility
 * @deprecated Use roles array from role-helpers instead
 */
type LegacyUserRole = 'admin' | 'technician' | 'receptionist' | 'customer';

/**
 * Legacy session cookie name for backward compatibility with RepairShopr auth
 * @deprecated Will be removed once Supabase auth is fully migrated
 */
const LEGACY_SESSION_COOKIE = 'admin_session';
const LEGACY_ROLE_COOKIE = 'user_role';
const LEGACY_ROLES_COOKIE = 'user_roles'; // JSON array of actual roles

// =============================================================================
// Route Configuration
// =============================================================================

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/reset-password',
  '/reset-password/confirm',
  '/auth/confirm',
  '/about',
  '/contact',
  '/in-store-pcs',
  '/reviews',
  '/silver-plan',
  '/why-linux',
];

/**
 * Public route prefixes (routes that start with these are public)
 */
const PUBLIC_PREFIXES = [
  '/services',
  '/blog',
  '/api/public',
  '/api/contact',
  '/api/health',
  '/auth/callback',
  '/_next',
  '/static',
  '/images',
  '/favicon',
];

/**
 * Auth routes (login, register, etc.) - redirect if already authenticated
 */
const AUTH_ROUTES = ['/login', '/register', '/reset-password', '/reset-password/confirm'];

/**
 * Route permission matrix
 * @deprecated Use ROUTE_PERMISSIONS from @/types/roles instead
 * This simplified version is kept for backward compatibility with legacy auth
 */
interface LegacyRoutePermission {
  pattern: string;
  roles: LegacyUserRole[];
  exact?: boolean;
}

/**
 * Legacy route permissions for backward compatibility
 * @deprecated Permission checking now uses canAccessRoute() from role-helpers
 */
const LEGACY_ROUTE_PERMISSIONS: LegacyRoutePermission[] = [
  // Admin-only routes (mapped from lead_developer permission)
  { pattern: '/admin/settings', roles: ['admin'], exact: true },
  { pattern: '/admin/users', roles: ['admin'] },

  // Staff routes (any employee role)
  { pattern: '/admin', roles: ['admin', 'technician', 'receptionist'] },
  { pattern: '/employee', roles: ['admin', 'technician', 'receptionist'] },

  // Customer portal - any authenticated user
  { pattern: '/portal', roles: ['customer', 'admin', 'technician', 'receptionist'] },
];

// =============================================================================
// Security Headers
// =============================================================================

/**
 * Add security headers to Next.js response.
 *
 * Sets standard security headers to protect against common web vulnerabilities:
 * - X-Frame-Options: Prevent clickjacking
 * - X-Content-Type-Options: Prevent MIME sniffing
 * - Referrer-Policy: Control referrer information
 * - Permissions-Policy: Disable unnecessary browser features
 * - X-XSS-Protection: Legacy XSS protection for older browsers
 *
 * @param response - NextResponse object to modify with security headers
 * @returns void - Modifies response headers in place
 *
 * @sideEffects
 * - Modifies response.headers by adding security headers
 *
 * @functions_called response.headers.set
 * @called_by middleware function
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
function addSecurityHeaders(response: NextResponse): void {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=()'
  );

  // XSS Protection (legacy, but still useful for older browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block');
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Determine if a route is publicly accessible without authentication.
 *
 * Checks pathname against PUBLIC_ROUTES array and PUBLIC_PREFIXES.
 * Public routes include homepage, contact, gallery, services, and static assets.
 *
 * @param pathname - URL pathname to check (e.g., '/about', '/services/virus-removal')
 * @returns true if route is public, false if authentication required
 *
 * @sideEffects None - pure function
 *
 * @example
 * isPublicRoute('/about') // true
 * isPublicRoute('/admin') // false
 * isPublicRoute('/services/diagnostics') // true (matches /services prefix)
 *
 * @functions_called Array.includes, Array.some, String.startsWith
 * @called_by middleware function
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
function isPublicRoute(pathname: string): boolean {
  // Check exact matches
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }

  // Check prefixes
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Check if pathname is an authentication route (login, register, password reset).
 *
 * Auth routes have special behavior: authenticated users are redirected away.
 *
 * @param pathname - URL pathname to check
 * @returns true if pathname is an auth route, false otherwise
 *
 * @sideEffects None - pure function
 *
 * @functions_called Array.includes
 * @called_by middleware function
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname);
}

/**
 * Get required user roles for accessing a specific route (legacy system).
 *
 * @deprecated Use canAccessRoute() from role-helpers instead for multi-role permission checking
 *
 * Searches LEGACY_ROUTE_PERMISSIONS configuration for matching patterns.
 * Supports exact matches and prefix matches (e.g., /admin matches /admin/gallery).
 *
 * @param pathname - URL pathname to check
 * @returns Array of LegacyUserRole strings required to access route, or null if no restrictions
 *
 * @sideEffects None - pure function
 *
 * @example
 * getLegacyRequiredRoles('/admin/settings') // ['admin']
 * getLegacyRequiredRoles('/admin/gallery') // ['admin', 'technician', 'receptionist']
 * getLegacyRequiredRoles('/about') // null (no restrictions)
 *
 * @functions_called Array iteration, String.startsWith
 * @called_by middleware function (legacy fallback only)
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 * @version 1.1.0 - 2026-01-11T00:00:00Z - Renamed to getLegacyRequiredRoles, deprecated
 */
function getLegacyRequiredRoles(pathname: string): LegacyUserRole[] | null {
  // Check each permission rule
  for (const perm of LEGACY_ROUTE_PERMISSIONS) {
    if (perm.exact) {
      if (pathname === perm.pattern) {
        return perm.roles;
      }
    } else {
      if (pathname.startsWith(perm.pattern)) {
        return perm.roles;
      }
    }
  }

  return null;
}

/**
 * Check if user's legacy role is in the list of required roles for a route.
 *
 * @deprecated Use canAccessRoute() from role-helpers instead for multi-role permission checking
 *
 * @param userRole - Current user's legacy role (or null if not authenticated)
 * @param requiredRoles - Array of legacy roles allowed to access the route
 * @returns true if user has one of the required roles, false otherwise
 *
 * @sideEffects None - pure function
 *
 * @functions_called Array.includes
 * @called_by middleware function (legacy fallback only)
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 * @version 1.1.0 - 2026-01-11T00:00:00Z - Renamed to hasLegacyRequiredRole, deprecated
 */
function hasLegacyRequiredRole(userRole: LegacyUserRole | null, requiredRoles: LegacyUserRole[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

/**
 * Get default redirect URL for a user based on their roles array.
 *
 * Employees (any business role or add-on) go to /admin dashboard.
 * Customers go to /portal. Unauthenticated users go to /login.
 *
 * @param roles - User's roles array (or null/empty if not authenticated)
 * @returns Absolute path to redirect to
 *
 * @sideEffects None - pure function
 *
 * @example
 * getRoleRedirectUrl(['technician', 'social_media']) // '/admin'
 * getRoleRedirectUrl(['customer']) // '/portal'
 * getRoleRedirectUrl(null) // '/login'
 *
 * @functions_called isEmployee (from role-helpers), isCustomer (from role-helpers)
 * @called_by middleware function
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 * @version 2.0.0 - 2026-01-11T00:00:00Z - Updated for multi-role system
 */
function getRoleRedirectUrl(roles: string[] | null): string {
  if (!roles || roles.length === 0) return '/login';

  if (isEmployee(roles)) {
    return '/admin';
  }
  if (isCustomer(roles)) {
    return '/portal';
  }
  return '/';
}

/**
 * Get default redirect URL for a user based on their legacy single role.
 *
 * @deprecated Use getRoleRedirectUrl with roles array instead
 *
 * @param role - User's legacy role (or null if not authenticated)
 * @returns Absolute path to redirect to
 *
 * @functions_called None
 * @called_by middleware function (legacy fallback only)
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
function getLegacyRoleRedirectUrl(role: LegacyUserRole | null): string {
  if (!role) return '/login';

  switch (role) {
    case 'admin':
    case 'technician':
    case 'receptionist':
      return '/admin';
    case 'customer':
      return '/portal';
    default:
      return '/';
  }
}

// =============================================================================
// Supabase Auth Helpers
// =============================================================================

/**
 * Create Supabase client configured for Next.js middleware.
 *
 * Uses @supabase/ssr to create a server-side Supabase client that works
 * with Next.js middleware cookies. Returns null if Supabase credentials
 * are not configured.
 *
 * @param request - Incoming Next.js request (for reading cookies)
 * @param response - Next.js response object (for setting cookies)
 * @returns Supabase client instance or null if credentials missing
 *
 * @sideEffects None - creates client but doesn't make requests yet
 *
 * @functions_called createServerClient (Supabase SSR), request.cookies.getAll/set,
 *                    response.cookies.set
 * @called_by middleware function
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
function createMiddlewareSupabaseClient(request: NextRequest, response: NextResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
// Legacy Auth Support
// =============================================================================

/**
 * Check legacy RepairShopr session cookies for authentication.
 *
 * DEPRECATED: This function supports backward compatibility during migration
 * from RepairShopr authentication to Supabase. Will be removed once all users
 * are migrated to Supabase auth.
 *
 * Reads admin_session and user_role cookies set by RepairShopr auth system
 * and maps legacy roles to both the old single role and new roles array.
 *
 * @deprecated Will be removed after full migration to Supabase auth
 *
 * @param request - Next.js request with cookies
 * @returns Object with isAuth flag, legacy role, and roles array
 *
 * @sideEffects None - only reads cookies
 *
 * @functions_called request.cookies.get
 * @called_by middleware function
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 * @version 2.0.0 - 2026-01-11T00:00:00Z - Added roles array for multi-role support
 */
function checkLegacyAuth(request: NextRequest): {
  isAuth: boolean;
  legacyRole: LegacyUserRole | null;
  roles: string[];
} {
  const sessionCookie = request.cookies.get(LEGACY_SESSION_COOKIE);
  const roleCookie = request.cookies.get(LEGACY_ROLE_COOKIE);
  const rolesCookie = request.cookies.get(LEGACY_ROLES_COOKIE);

  if (!sessionCookie?.value) {
    return { isAuth: false, legacyRole: null, roles: [] };
  }

  // Debug: Log all cookie values
  console.log(`[AUTH DEBUG] Legacy cookies - session: ${sessionCookie?.value ? 'present' : 'missing'}, role: ${roleCookie?.value}, roles: ${rolesCookie?.value}`);

  // First, try to read the actual roles array from the user_roles cookie
  if (rolesCookie?.value) {
    try {
      const actualRoles = JSON.parse(rolesCookie.value);
      if (Array.isArray(actualRoles) && actualRoles.length > 0) {
        // Determine legacy role from actual roles for backward compatibility
        let legacyRole: LegacyUserRole | null = null;
        if (actualRoles.some((r: string) => ['owner', 'lead_developer', 'manager'].includes(r))) {
          legacyRole = 'admin';
        } else if (actualRoles.some((r: string) => ['technician', 'lead_technician'].includes(r))) {
          legacyRole = 'technician';
        } else if (actualRoles.includes('receptionist')) {
          legacyRole = 'receptionist';
        } else if (actualRoles.includes('customer')) {
          legacyRole = 'customer';
        }
        console.log(`[AUTH DEBUG] Legacy auth with actual roles: ${JSON.stringify(actualRoles)}`);
        return { isAuth: true, legacyRole, roles: actualRoles };
      }
    } catch {
      // JSON parse failed, fall through to legacy mapping
    }
  }

  // Fallback: Map legacy roles to new role system
  const legacyRole = roleCookie?.value;
  let role: LegacyUserRole | null = null;
  let roles: string[] = [];

  if (legacyRole === 'admin') {
    role = 'admin';
    // Map legacy admin to owner + lead_developer (full access)
    roles = ['owner', 'lead_developer'];
  } else if (legacyRole === 'employee') {
    role = 'technician';
    roles = ['technician'];
  } else if (legacyRole === 'limited') {
    role = 'receptionist';
    roles = ['receptionist'];
  }

  return { isAuth: true, legacyRole: role, roles };
}

// =============================================================================
// Main Middleware
// =============================================================================

/**
 * Next.js middleware for authentication, authorization, and security headers.
 *
 * Runs on every request (see config matcher) to:
 * 1. Add security headers to all responses
 * 2. Allow public routes without authentication
 * 3. Check authentication via Supabase (primary) or legacy RepairShopr (fallback)
 * 4. Enforce multi-role permission-based access control for protected routes
 * 5. Redirect authenticated users away from auth pages
 * 6. Redirect unauthenticated users to login with return URL
 *
 * Authentication Flow:
 * - Try Supabase auth first (reads session from cookies)
 * - Fall back to legacy RepairShopr session if Supabase not configured/fails
 * - Get user roles array from user_profiles table (Supabase) or mapped from cookie (legacy)
 * - Use canAccessRoute() from role-helpers for permission-based route protection
 *
 * @param request - Incoming Next.js request
 * @returns NextResponse - Either continues request, or redirects based on auth/authz
 *
 * @sideEffects
 * - Queries Supabase auth API and database
 * - Reads session cookies (Supabase and legacy)
 * - May redirect user (returns NextResponse.redirect)
 * - Adds security headers to response
 * - Logs unauthorized access attempts to console
 *
 * @example
 * // Automatically runs on requests matching config.matcher
 * // User visits /admin without auth -> redirected to /login?returnTo=/admin
 * // User with ['customer'] roles visits /admin -> redirected to /portal?error=unauthorized
 * // User with ['technician'] roles visits /admin/tech -> request continues
 *
 * @functions_called isPublicRoute, isAuthRoute, addSecurityHeaders, createMiddlewareSupabaseClient,
 *                    checkLegacyAuth, canAccessRoute (role-helpers), getRoleRedirectUrl,
 *                    getUnauthorizedRedirect (role-helpers)
 * @called_by Next.js runtime (automatic on matching routes)
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 * @version 2.0.0 - 2026-01-11T00:00:00Z - Updated for multi-role permission system
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create response to potentially modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Add security headers to all responses
  addSecurityHeaders(response);

  // Skip middleware for public routes
  if (isPublicRoute(pathname)) {
    return response;
  }

  // Initialize auth state
  let isAuthenticated = false;
  let userRoles: string[] = [];
  let legacyRole: LegacyUserRole | null = null;

  // SECURITY: Check our custom session cookies FIRST and EXCLUSIVELY if present.
  // Our custom cookies (admin_session, user_roles) are set during login and are authoritative.
  // We NEVER fall back to Supabase session cookies if our session exists - this prevents
  // stale Supabase sessions from being used (major security risk).
  const legacyAuth = checkLegacyAuth(request);

  if (legacyAuth.isAuth) {
    // We have a custom session - use it exclusively
    isAuthenticated = true;
    userRoles = legacyAuth.roles;
    legacyRole = legacyAuth.legacyRole;
    console.log(`[AUTH DEBUG] Using custom session cookies - roles: ${JSON.stringify(userRoles)}`);

    // If roles are empty but session exists, something is wrong - don't fall back to Supabase
    if (userRoles.length === 0) {
      console.warn('[AUTH DEBUG] Custom session exists but roles are empty - user should re-login');
    }
  }

  // Only try Supabase auth if NO custom session exists at all
  // This is for backwards compatibility only - all logins should set custom cookies
  const supabase = createMiddlewareSupabaseClient(request, response);

  if (supabase && !legacyAuth.isAuth) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (!error && user) {
        isAuthenticated = true;
        console.log(`[AUTH DEBUG] Supabase user found: ${user.id}, email: ${user.email}`);

        // Get user profile for roles
        // Note: Using session client - RLS policy "Users can read own profile" allows this
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role, roles')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error(`[AUTH DEBUG] Profile query error: ${profileError.message}`);
        }

        if (profile) {
          console.log(`[AUTH DEBUG] Profile found - role: ${profile.role}, roles: ${JSON.stringify(profile.roles)}`);
          // Use roles array if available, otherwise map from legacy role
          if (profile.roles && Array.isArray(profile.roles) && profile.roles.length > 0) {
            userRoles = profile.roles;
          } else if (profile.role) {
            // Map legacy single role to roles array
            legacyRole = profile.role as LegacyUserRole;
            switch (profile.role) {
              case 'admin':
                userRoles = ['owner', 'lead_developer'];
                break;
              case 'technician':
                userRoles = ['technician'];
                break;
              case 'receptionist':
                userRoles = ['receptionist'];
                break;
              case 'customer':
                userRoles = ['customer'];
                break;
              default:
                userRoles = ['customer'];
            }
          }
        } else {
          console.log(`[AUTH DEBUG] No profile found for user ${user.id}`);
        }
      } else {
        console.log(`[AUTH DEBUG] Supabase auth - no user or error: ${error?.message || 'no user'}`);
      }
    } catch (error) {
      console.error('[MIDDLEWARE] Supabase auth error:', error);
    }
  }

  // Legacy auth was already checked first above, no need to check again

  // Handle auth routes - redirect authenticated users away
  if (isAuthRoute(pathname) && isAuthenticated) {
    const redirectUrl = getRoleRedirectUrl(userRoles);
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Check if route requires authentication using new multi-role permission system
  // For admin routes, use the new canAccessRoute() function
  if (pathname.startsWith('/admin')) {
    // Route requires authentication
    if (!isAuthenticated) {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Debug logging for authorization issues
    console.log(`[AUTH DEBUG] Route: ${pathname}, userRoles: ${JSON.stringify(userRoles)}`);

    // Check permission-based authorization
    if (!canAccessRoute(userRoles, pathname)) {
      console.log(
        `[AUTH] Unauthorized access attempt: ${pathname} by roles ${JSON.stringify(userRoles)}`
      );

      // Redirect to appropriate dashboard with error
      const redirectUrl = getUnauthorizedRedirect(userRoles);
      const errorUrl = new URL(redirectUrl, request.url);
      errorUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(errorUrl);
    }

    return response;
  }

  // For non-admin routes (portal, employee), use legacy permission check
  const requiredRoles = getLegacyRequiredRoles(pathname);

  if (requiredRoles) {
    // Route requires authentication
    if (!isAuthenticated) {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role authorization using legacy system
    // Map new roles to legacy role for backward compatibility
    const effectiveLegacyRole = legacyRole || (
      userRoles.some(r => ['owner', 'manager', 'lead_developer'].includes(r)) ? 'admin' :
      userRoles.some(r => ['lead_technician', 'technician'].includes(r)) ? 'technician' :
      userRoles.includes('receptionist') ? 'receptionist' :
      userRoles.includes('customer') ? 'customer' : null
    );

    if (!hasLegacyRequiredRole(effectiveLegacyRole, requiredRoles)) {
      console.log(
        `[AUTH] Unauthorized access attempt: ${pathname} by roles ${JSON.stringify(userRoles)}`
      );

      // Redirect to appropriate dashboard with error
      const redirectUrl = getRoleRedirectUrl(userRoles);
      const errorUrl = new URL(redirectUrl, request.url);
      errorUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(errorUrl);
    }
  }

  return response;
}

// =============================================================================
// Middleware Config
// =============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
