/**
 * GBP CONFIG - Reads Google Business Profile integration settings from
 * the environment and exposes the constants shared across this module
 * (API base URLs, cache TTL, OAuth scope).
 *
 * WHEN TO EDIT: When adding a new env var, changing the cache TTL, or
 * pointing at a different Google API endpoint.
 *
 * SERVER-ONLY: All env vars here are server-only (no NEXT_PUBLIC_).
 */

export const GOOGLE_OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
export const GOOGLE_OAUTH_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
export const GOOGLE_OAUTH_REDIRECT_URI = process.env.GOOGLE_OAUTH_REDIRECT_URI;

/** Bearer scope requested during the OAuth grant. */
export const GBP_OAUTH_SCOPE = 'https://www.googleapis.com/auth/business.manage';

/** Google's OAuth 2.0 endpoints. */
export const GOOGLE_OAUTH_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';

/** Account Management v1 (lists accounts the OAuth user manages). */
export const GBP_ACCOUNTS_API_BASE = 'https://mybusinessaccountmanagement.googleapis.com/v1';

/** Business Information v1 (lists locations under an account). */
export const GBP_BUSINESS_INFO_API_BASE = 'https://mybusinessbusinessinformation.googleapis.com/v1';

/**
 * Legacy v4 endpoint. This is the ONLY place Google currently exposes
 * reviews, despite the v4 suffix. There is no v1 reviews endpoint as
 * of 2026. See docs/google-reviews-playbook.md §1 Gotcha #2.
 */
export const GBP_REVIEWS_API_BASE = 'https://mybusiness.googleapis.com/v4';

/** How long a `reviews_cache` row is considered fresh. */
export const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Tag used in the `oauth_tokens.provider` column. */
export const OAUTH_PROVIDER = 'google' as const;

/**
 * True when all three OAuth env vars are set. Does not verify that the
 * refresh token has actually been minted or that the GBP API allowlist
 * has cleared — those are separate readiness checks.
 */
export function isGoogleBusinessConfigured(): boolean {
  return !!(GOOGLE_OAUTH_CLIENT_ID && GOOGLE_OAUTH_CLIENT_SECRET && GOOGLE_OAUTH_REDIRECT_URI);
}
