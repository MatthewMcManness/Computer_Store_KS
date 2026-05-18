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

  try {
    const tokens = await exchangeCodeForTokens(code);
    if (!tokens.refresh_token) {
      // Should not happen with prompt=consent + access_type=offline,
      // but bail loudly if Google ever decides not to give one.
      return NextResponse.redirect(adminUrl(request, { gbp: 'no_refresh_token' }));
    }
    await storeRefreshToken(tokens.refresh_token, tokens.scope, AUTHORIZED_EMAIL);
    // Seed the cache so the next visitor doesn't pay the cold-start cost.
    await forceRefresh();
    return NextResponse.redirect(adminUrl(request, { gbp: 'connected' }));
  } catch (err) {
    console.error('[oauth-callback] failed:', err);
    return NextResponse.redirect(adminUrl(request, { gbp: 'exchange_failed' }));
  }
}
