/**
 * SECURITY GATEKEEPER - Runs before every page request. Adds security
 * headers and enforces Cloudflare Access on admin pages and protected
 * API routes (defense-in-depth behind the edge).
 *
 * WHEN TO EDIT: When adding new public pages, changing which pages
 * require login, or updating security headers.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessJwt } from '@/lib/access-jwt';
import { AUTHORIZED_EMAIL } from '@/lib/constants';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || '';

// Emails allowed through the edge Access policy. The store employee plus
// the RWS operator.
const ADMIN_EMAILS = new Set([AUTHORIZED_EMAIL, 'owner@resilientwebsolutions.com']);

const PUBLIC_ROUTES = new Set([
  '/', '/about', '/contact',
  '/reviews', '/services', '/silver-plan', '/why-linux', '/shop',
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
  '/services/', '/_next/', '/assets/', '/public/',
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
 * @version 3.0.0 - 2026-06-30T00:00:00Z - Drop Supabase hosts from CSP (self-hosted)
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
    "img-src 'self' data: blob: https://images.unsplash.com https://raw.githubusercontent.com https://*.googleusercontent.com",
    "connect-src 'self' https://www.google-analytics.com https://challenges.cloudflare.com",
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
 * Auth model: Cloudflare Access gates `/admin/*` and the protected `/api/*`
 * surface at the edge. This middleware re-verifies the `Cf-Access-Jwt-Assertion`
 * header for defense-in-depth. When `CF_ACCESS_TEAM_DOMAIN` is unset (local
 * dev / build), the Access check falls open so the app still runs.
 *
 * @param request - Incoming Next.js request
 * @returns NextResponse - continues, or 401/redirect based on Access state
 *
 * @sideEffects Verifies the Access JWT, sets security headers, may redirect
 * @functions_called addSecurityHeaders, isPublicRoute, verifyAccessJwt
 * @called_by Next.js runtime
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 * @version 2.0.0 - 2026-03-20T00:00:00Z - Rewritten for single-user Google OAuth model
 * @version 3.0.0 - 2026-06-30T00:00:00Z - Replace Supabase auth with Cloudflare Access (edge) + JWT
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next({ request: { headers: request.headers } });
  addSecurityHeaders(response);

  // Public pages pass through without any auth check.
  if (isPublicRoute(pathname)) return response;

  // Local/dev (or any environment without Access configured): fall open so
  // builds and local runs work. The edge enforces auth in production.
  if (!process.env.CF_ACCESS_TEAM_DOMAIN) return response;

  // Protected path: require a valid Access JWT for an allowed admin email.
  const email = await verifyAccessJwt(request.headers.get('Cf-Access-Jwt-Assertion'));
  if (!email || !ADMIN_EMAILS.has(email)) {
    if (pathname.startsWith('/api/')) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // No in-app login page anymore; Cloudflare Access handles the login UI.
    return NextResponse.redirect(new URL('/', SITE_URL || request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets|public|games).*)'],
};
