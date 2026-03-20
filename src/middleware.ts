import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const ALLOWED_EMAIL = 'contact@computerstoreks.com';

const PUBLIC_ROUTES = new Set([
  '/', '/about', '/contact', '/gallery', '/in-store-pcs',
  '/reviews', '/services', '/silver-plan', '/why-linux', '/login',
]);

const PUBLIC_PREFIXES = [
  '/api/contact', '/api/health', '/api/in-store', '/api/photo-gallery',
  '/services/', '/auth/callback', '/_next/', '/assets/', '/public/',
];

/**
 * Add security headers to a response.
 *
 * @param response - NextResponse to modify in place
 *
 * @sideEffects Modifies response.headers
 * @called_by middleware
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 * @version 2.0.0 - 2026-03-20T00:00:00Z - Simplified for single-user auth rewrite
 */
function addSecurityHeaders(response: NextResponse): void {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=()');
  response.headers.set('X-XSS-Protection', '1; mode=block');
}

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Middleware for security headers, public route bypass, and admin auth.
 *
 * Auth model: one Google OAuth user (contact@computerstoreks.com).
 * Public routes pass through with security headers only. Admin routes
 * require a valid Supabase session with the allowed email. Authenticated
 * users on /login are redirected to /admin.
 *
 * @param request - Incoming Next.js request
 * @returns NextResponse - continues, or redirects based on auth state
 *
 * @sideEffects Queries Supabase auth, reads/sets cookies, may redirect
 * @functions_called addSecurityHeaders, isPublicRoute, createServerClient, supabase.auth.getUser
 * @called_by Next.js runtime
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 * @version 2.0.0 - 2026-03-20T00:00:00Z - Rewritten for single-user Google OAuth model
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next({ request: { headers: request.headers } });
  addSecurityHeaders(response);

  if (isPublicRoute(pathname) && pathname !== '/login') return response;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return response;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  // Authenticated user on /login -> redirect to admin
  if (pathname === '/login') {
    if (user?.email === ALLOWED_EMAIL) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return response;
  }

  // Protected /admin/* routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.email !== ALLOWED_EMAIL) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets|public|games).*)'],
};
