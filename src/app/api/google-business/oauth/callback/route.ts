/**
 * OAUTH CALLBACK - Public endpoint that Google redirects the admin to
 * after they grant consent. Verifies the CSRF state, exchanges the
 * code for an access + refresh token, stores the refresh token in
 * Supabase, and seeds the reviews cache with a first fetch.
 *
 * WHEN TO EDIT: When changing how the OAuth grant is persisted, when
 * tightening CSRF handling, or when changing the success/error
 * redirect targets.
 */

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { AUTHORIZED_EMAIL } from '@/lib/constants';
import {
  exchangeCodeForTokens,
  forceRefresh,
  isGoogleBusinessConfigured,
  storeRefreshToken,
} from '@/lib/google-business';

export const dynamic = 'force-dynamic';

const STATE_COOKIE = 'gbp_oauth_state';

function adminUrl(request: NextRequest, params: Record<string, string>): URL {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  const url = new URL('/admin', origin);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url;
}

/** GET /api/google-business/oauth/callback?code=...&state=... */
export async function GET(request: NextRequest) {
  if (!isGoogleBusinessConfigured()) {
    return NextResponse.redirect(adminUrl(request, { gbp: 'not_configured' }));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);

  if (error) {
    return NextResponse.redirect(adminUrl(request, { gbp: 'denied', detail: error }));
  }
  if (!code || !state) {
    return NextResponse.redirect(adminUrl(request, { gbp: 'missing_params' }));
  }
  if (!expectedState || expectedState !== state) {
    return NextResponse.redirect(adminUrl(request, { gbp: 'state_mismatch' }));
  }

  // Step 1: exchange the code for tokens.
  let tokens;
  try {
    tokens = await exchangeCodeForTokens(code);
  } catch (err) {
    console.error('[oauth-callback] token exchange failed:', err);
    return NextResponse.redirect(adminUrl(request, { gbp: 'exchange_failed' }));
  }
  if (!tokens.refresh_token) {
    // Should not happen with prompt=consent + access_type=offline.
    return NextResponse.redirect(adminUrl(request, { gbp: 'no_refresh_token' }));
  }

  // Step 2: persist the refresh token. Once this succeeds the grant is
  // recoverable even if the cache seed below fails.
  try {
    await storeRefreshToken(tokens.refresh_token, tokens.scope, AUTHORIZED_EMAIL);
  } catch (err) {
    console.error('[oauth-callback] storeRefreshToken failed:', err);
    return NextResponse.redirect(adminUrl(request, { gbp: 'db_failed' }));
  }

  // Step 3: seed the cache. Failures here are typically the GBP
  // allowlist not yet clearing — the token is fine and the next
  // refresh attempt (manual or lazy) will succeed once Google
  // approves the project. Report as `pending` so the operator can
  // tell the two cases apart.
  try {
    await forceRefresh();
  } catch (err) {
    console.error('[oauth-callback] forceRefresh failed (likely allowlist pending):', err);
    return NextResponse.redirect(adminUrl(request, { gbp: 'pending' }));
  }

  return NextResponse.redirect(adminUrl(request, { gbp: 'connected' }));
}
