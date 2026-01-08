import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// =============================================================================
// Configuration
// =============================================================================

/**
 * User role types matching the database schema
 */
type UserRole = 'admin' | 'technician' | 'receptionist' | 'customer';

/**
 * Legacy session cookie name for backward compatibility with RepairShopr auth
 * @deprecated Will be removed once Supabase auth is fully migrated
 */
const LEGACY_SESSION_COOKIE = 'admin_session';
const LEGACY_ROLE_COOKIE = 'user_role';

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
  '/about',
  '/contact',
  '/gallery',
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
 * Maps route patterns to required roles
 */
interface RoutePermission {
  pattern: string;
  roles: UserRole[];
  exact?: boolean;
}

const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Admin-only routes
  { pattern: '/admin/settings', roles: ['admin'], exact: true },
  { pattern: '/admin/users', roles: ['admin'] },

  // Staff routes (admin, technician, receptionist)
  { pattern: '/admin', roles: ['admin', 'technician', 'receptionist'] },
  { pattern: '/employee', roles: ['admin', 'technician', 'receptionist'] },

  // Customer portal - authenticated customers only
  { pattern: '/portal', roles: ['customer', 'admin', 'technician', 'receptionist'] },
];

// =============================================================================
// Security Headers
// =============================================================================

/**
 * Add security headers to response
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
 * Check if a route is public
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
 * Check if a route is an auth route
 */
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname);
}

/**
 * Get required roles for a route
 */
function getRequiredRoles(pathname: string): UserRole[] | null {
  // Check each permission rule
  for (const perm of ROUTE_PERMISSIONS) {
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
 * Check if user has required role
 */
function hasRequiredRole(userRole: UserRole | null, requiredRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

/**
 * Get redirect URL based on user role
 */
function getRoleRedirectUrl(role: UserRole | null): string {
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
 * Create Supabase client for middleware
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
 * Check legacy RepairShopr session
 * @deprecated Will be removed after migration to Supabase auth
 */
function checkLegacyAuth(request: NextRequest): { isAuth: boolean; role: UserRole | null } {
  const sessionCookie = request.cookies.get(LEGACY_SESSION_COOKIE);
  const roleCookie = request.cookies.get(LEGACY_ROLE_COOKIE);

  if (!sessionCookie?.value) {
    return { isAuth: false, role: null };
  }

  // Map legacy roles to new role system
  const legacyRole = roleCookie?.value;
  let role: UserRole | null = null;

  if (legacyRole === 'admin') {
    role = 'admin';
  } else if (legacyRole === 'employee') {
    role = 'technician'; // Map employee to technician
  } else if (legacyRole === 'limited') {
    role = 'receptionist'; // Map limited to receptionist
  }

  return { isAuth: true, role };
}

// =============================================================================
// Main Middleware
// =============================================================================

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

  // Skip admin login page to prevent redirect loops
  if (pathname === '/admin/login') {
    return response;
  }

  // Initialize auth state
  let isAuthenticated = false;
  let userRole: UserRole | null = null;

  // Try Supabase auth first
  const supabase = createMiddlewareSupabaseClient(request, response);

  if (supabase) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (!error && user) {
        isAuthenticated = true;

        // Get user profile for role
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role) {
          userRole = profile.role as UserRole;
        }
      }
    } catch (error) {
      console.error('[MIDDLEWARE] Supabase auth error:', error);
    }
  }

  // Fall back to legacy auth if Supabase not configured or failed
  if (!isAuthenticated) {
    const legacyAuth = checkLegacyAuth(request);
    isAuthenticated = legacyAuth.isAuth;
    userRole = legacyAuth.role;
  }

  // Handle auth routes - redirect authenticated users away
  if (isAuthRoute(pathname) && isAuthenticated) {
    const redirectUrl = getRoleRedirectUrl(userRole);
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Check if route requires authentication
  const requiredRoles = getRequiredRoles(pathname);

  if (requiredRoles) {
    // Route requires authentication
    if (!isAuthenticated) {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role authorization
    if (!hasRequiredRole(userRole, requiredRoles)) {
      console.log(
        `[AUTH] Unauthorized access attempt: ${pathname} by role ${userRole}`
      );

      // Redirect to appropriate dashboard with error
      const redirectUrl = getRoleRedirectUrl(userRole);
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
