/**
 * SECURITY GATEKEEPER - Runs before every page request. Adds security
 * headers and checks if the visitor is allowed to see admin pages.
 *
 * WHEN TO EDIT: When adding new public pages, changing which pages
 * require login, or updating security headers.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { AUTHORIZED_EMAIL } from '@/lib/constants';

const ALLOWED_EMAIL = AUTHORIZED_EMAIL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || '';

const PUBLIC_ROUTES = new Set([
  '/', '/about', '/contact',
  '/reviews', '/services', '/silver-plan', '/why-linux', '/login', '/shop',
]);

// Exact API paths that are public (no sub-route access)
const PUBLIC_API_EXACT = new Set([
  '/api/contact',
  '/api/health',
  '/api/google-business/reviews',
  '/api/google-business/oauth/callback',
]);

// Non-API prefixes that allow all sub-routes
const PUBLIC_PREFIXES = [
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

  // Next.js React Fast Refresh uses eval() in dev mode; production
  // bundles do not. Only allow 'unsafe-eval' when running locally so
  // the deployed CSP stays strict.
  const scriptSrcExtras = process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : '';
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${scriptSrcExtras} https://www.googletagmanager.com https://www.google-analytics.com https://challenges.cloudflare.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in https://images.unsplash.com https://raw.githubusercontent.com",
    "connect-src 'self' https://*.supabase.co https://*.supabase.in https://www.google-analytics.com https://challenges.cloudflare.com",
    "frame-src https://challenges.cloudflare.com https://www.google.com https://cmc-td.com https://cmcengage.com",
    "font-src 'self'",
  ].join('; ');
  response.headers.set('Content-Security-Policy', csp);
}

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.has(pathname)) return true;
  if (PUBLIC_API_EXACT.has(pathname)) return true;
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
  // ─── AUTH FLOW OVERVIEW ─────────────────────────────────────────────
  // This is the main gatekeeper for the entire site. Every request
  // passes through here. The logic works like this:
  //
  //   1. Add security headers to EVERY response (CSP, X-Frame-Options, etc.)
  //   2. If the page is public (home, about, services, etc.) → let it through
  //   3. If the page is protected (admin, non-public API) → check auth:
  //      a. Read the Supabase session cookie from the browser
  //      b. Ask Supabase: "who is this user?"
  //      c. If their email is contact@computerstoreks.com → allow access
  //      d. If not logged in → redirect to /login
  //      e. If logged in as wrong email → redirect to /login?error=unauthorized
  //
  // The login itself happens via Google OAuth:
  //   /login page → "Sign in with Google" button → Google consent screen
  //   → Google redirects to /auth/callback → callback route checks email
  //   → if authorized, session cookie is set → redirect to /admin
  //
  // Only ONE email (contact@computerstoreks.com) is allowed. This is
  // defined in constants.ts as AUTHORIZED_EMAIL.
  // ────────────────────────────────────────────────────────────────────

  const { pathname } = request.nextUrl;
  const response = NextResponse.next({ request: { headers: request.headers } });
  addSecurityHeaders(response);

  // Step 2: Public pages pass through without any auth check
  if (isPublicRoute(pathname) && pathname !== '/login') return response;

  // If Supabase isn't configured, can't check auth — let everything through
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return response;

  // Step 3a: Create a Supabase client that reads auth cookies from the request
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

  // Step 3b: Ask Supabase "who is this user?" based on their cookie
  const { data: { user } } = await supabase.auth.getUser();

  // Step 3c-e: Protect non-public API routes
  if (pathname.startsWith('/api/') && !isPublicRoute(pathname)) {
    if (!user || user.email !== ALLOWED_EMAIL) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // If already logged in and visiting /login, skip straight to admin
  if (pathname === '/login') {
    if (user?.email === ALLOWED_EMAIL) {
      return NextResponse.redirect(new URL('/admin', SITE_URL || request.url));
    }
    return response;
  }

  // Protected /admin/* routes — must be logged in as the authorized email
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/login', SITE_URL || request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.email !== ALLOWED_EMAIL) {
      const loginUrl = new URL('/login', SITE_URL || request.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets|public|games).*)'],
};
