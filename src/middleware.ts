import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// =============================================================================
// Configuration
// =============================================================================

const SESSION_COOKIE_NAME = 'admin_session';
const ROLE_COOKIE_NAME = 'user_role';

// Valid roles
type UserRole = 'admin' | 'employee' | 'limited';

/**
 * Route permission matrix
 * Maps routes to allowed roles
 * More specific routes should come before general ones
 */
const routePermissions: Record<string, UserRole[]> = {
  // Admin-only routes
  '/admin/settings': ['admin'],

  // Gallery management - all authenticated users can manage gallery
  '/admin/gallery/new': ['admin', 'employee', 'limited'],
  '/admin/gallery': ['admin', 'employee', 'limited'],

  // Dashboard - all roles
  '/admin': ['admin', 'employee', 'limited'],
};

// Default: require authentication but allow any role
const DEFAULT_ALLOWED_ROLES: UserRole[] = ['admin', 'employee', 'limited'];

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get the allowed roles for a given pathname
 * Checks for exact match first, then prefix matches
 */
function getAllowedRoles(pathname: string): UserRole[] {
  // Check for exact match first
  const exactMatch = routePermissions[pathname];
  if (exactMatch) {
    return exactMatch;
  }

  // Check for prefix matches (longest match first)
  const sortedRoutes = Object.keys(routePermissions).sort(
    (a, b) => b.length - a.length
  );

  for (const route of sortedRoutes) {
    if (pathname.startsWith(route)) {
      const prefixMatch = routePermissions[route];
      if (prefixMatch) {
        return prefixMatch;
      }
    }
  }

  return DEFAULT_ALLOWED_ROLES;
}

/**
 * Validate and parse role from cookie
 */
function parseRole(roleValue: string | undefined): UserRole | null {
  if (!roleValue) {
    return null;
  }

  // Validate role is one of the expected values
  if (roleValue === 'admin' || roleValue === 'employee' || roleValue === 'limited') {
    return roleValue;
  }

  return null;
}

// =============================================================================
// Middleware
// =============================================================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip non-admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Skip login page - let the page handle auth check via API
  // This avoids redirect loops when session cookie exists but is invalid
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Check authentication for protected admin routes
  const session = request.cookies.get(SESSION_COOKIE_NAME);

  if (!session?.value) {
    // Not authenticated - redirect to login
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Get role from cookie
  const roleCookie = request.cookies.get(ROLE_COOKIE_NAME);
  const userRole = parseRole(roleCookie?.value);

  // If no valid role cookie, assume admin (backward compatibility with legacy sessions)
  const effectiveRole: UserRole = userRole || 'admin';

  // Check role permission
  const allowedRoles = getAllowedRoles(pathname);

  if (!allowedRoles.includes(effectiveRole)) {
    // Log unauthorized access attempt
    console.log(
      `[AUTH] Unauthorized access attempt: ${pathname} by role ${effectiveRole}`
    );

    // Redirect to dashboard with error
    const dashboardUrl = new URL('/admin', request.url);
    dashboardUrl.searchParams.set('error', 'unauthorized');
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
