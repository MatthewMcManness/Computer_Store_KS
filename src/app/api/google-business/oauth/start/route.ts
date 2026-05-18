/**
 * OAUTH START - Admin-only entry point for the one-time Google
 * Business Profile connect flow. Generates a CSRF state token, stores
 * it in an HTTP-only cookie, and redirects the admin to Google's
 * consent screen.
 *
 * WHEN TO EDIT: When changing the OAuth scope, the CSRF strategy, or
 * the post-callback redirect target.
 */

import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/supabase-auth';
import { buildAuthUrl, isGoogleBusinessConfigured } from '@/lib/google-business';

export const dynamic = 'force-dynamic';

const STATE_COOKIE = 'gbp_oauth_state';
const STATE_TTL_SECONDS = 10 * 60;

/** GET /api/google-business/oauth/start — redirects to Google consent. */
export async function GET() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }

  if (!isGoogleBusinessConfigured()) {
    return NextResponse.json(
      { success: false, error: 'not_configured' },
      { status: 503 },
    );
  }

  const state = randomBytes(32).toString('base64url');
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: STATE_TTL_SECONDS,
  });

  return NextResponse.redirect(buildAuthUrl(state));
}
