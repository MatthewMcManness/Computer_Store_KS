/**
 * GBP OAUTH - All Google OAuth 2.0 logic for the Business Profile
 * integration. Builds the consent URL, exchanges authorization codes
 * for tokens, refreshes access tokens, and reads/writes the long-lived
 * refresh token from the Postgres `oauth_tokens` table.
 *
 * WHEN TO EDIT: When changing OAuth scopes, switching to a new auth
 * flow, or changing where the refresh token is stored.
 *
 * SERVER-ONLY: Reads OAuth client secret and the database connection.
 * Never import from a Client Component.
 */

import { query } from '@/lib/db';
import {
  GOOGLE_OAUTH_AUTH_URL,
  GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET,
  GOOGLE_OAUTH_REDIRECT_URI,
  GOOGLE_OAUTH_TOKEN_URL,
  GBP_OAUTH_SCOPE,
  OAUTH_PROVIDER,
  isGoogleBusinessConfigured,
} from './config';
import type { GoogleTokenResponse } from './types-internal';

/** Shape of a stored OAuth grant row returned from the database. */
export interface StoredOAuthGrant {
  refresh_token: string;
  scope: string;
  account_email: string | null;
}

/**
 * Build the URL we redirect the admin to so Google can show its
 * consent screen. `state` is an opaque CSRF token the caller generates
 * and verifies on the callback.
 */
export function buildAuthUrl(state: string): string {
  if (!isGoogleBusinessConfigured()) {
    throw new Error('Google OAuth env vars not configured');
  }
  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CLIENT_ID as string,
    redirect_uri: GOOGLE_OAUTH_REDIRECT_URI as string,
    response_type: 'code',
    scope: GBP_OAUTH_SCOPE,
    // access_type=offline + prompt=consent guarantees Google sends a
    // refresh_token. Without these, we only get a 1-hour access token
    // with no way to renew. See playbook Appendix B.
    access_type: 'offline',
    prompt: 'consent',
    state,
    include_granted_scopes: 'true',
  });
  return `${GOOGLE_OAUTH_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange the `?code=` returned by Google for an access + refresh
 * token pair. Called from the OAuth callback route.
 */
export async function exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
  if (!isGoogleBusinessConfigured()) {
    throw new Error('Google OAuth env vars not configured');
  }
  const body = new URLSearchParams({
    code,
    client_id: GOOGLE_OAUTH_CLIENT_ID as string,
    client_secret: GOOGLE_OAUTH_CLIENT_SECRET as string,
    redirect_uri: GOOGLE_OAUTH_REDIRECT_URI as string,
    grant_type: 'authorization_code',
  });

  const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OAuth token exchange failed (${response.status}): ${text}`);
  }
  return (await response.json()) as GoogleTokenResponse;
}

/**
 * Trade a stored refresh token for a fresh 1-hour access token. Google
 * does not rotate refresh tokens on use, so the stored row stays valid
 * across many calls.
 */
export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokenResponse> {
  if (!isGoogleBusinessConfigured()) {
    throw new Error('Google OAuth env vars not configured');
  }
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: GOOGLE_OAUTH_CLIENT_ID as string,
    client_secret: GOOGLE_OAUTH_CLIENT_SECRET as string,
    grant_type: 'refresh_token',
  });

  const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Access token refresh failed (${response.status}): ${text}`);
  }
  return (await response.json()) as GoogleTokenResponse;
}

/**
 * Persist a refresh token in Postgres. Upserts on the unique `provider`
 * column so running the OAuth flow again simply replaces the old grant.
 */
export async function storeRefreshToken(
  refreshToken: string,
  scope: string,
  accountEmail: string | null,
): Promise<void> {
  await query(
    `insert into oauth_tokens (provider, refresh_token, scope, account_email, updated_at)
     values ($1, $2, $3, $4, now())
     on conflict (provider) do update set
       refresh_token = excluded.refresh_token, scope = excluded.scope,
       account_email = excluded.account_email, updated_at = now()`,
    [OAUTH_PROVIDER, refreshToken, scope, accountEmail],
  );
}

/** Read the stored Google refresh token, or null if no grant exists yet. */
export async function getStoredRefreshToken(): Promise<StoredOAuthGrant | null> {
  const rows = await query<StoredOAuthGrant>(
    `select refresh_token, scope, account_email from oauth_tokens where provider = $1 limit 1`,
    [OAUTH_PROVIDER],
  );
  return rows[0] ?? null;
}
