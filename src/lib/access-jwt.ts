// src/lib/access-jwt.ts: verify Cloudflare Access JWT on protected requests (defense-in-depth).
import { jwtVerify, createRemoteJWKSet } from 'jose';

const TEAM_DOMAIN = process.env.CF_ACCESS_TEAM_DOMAIN; // e.g. resilientwebsolutions.cloudflareaccess.com
const AUD = process.env.CF_ACCESS_AUD;                 // the Access application AUD tag
const JWKS = TEAM_DOMAIN ? createRemoteJWKSet(new URL(`https://${TEAM_DOMAIN}/cdn-cgi/access/certs`)) : null;

/** Returns the verified email, or null if the Access JWT is missing or invalid. */
export async function verifyAccessJwt(token: string | null): Promise<string | null> {
  if (!token || !JWKS || !AUD || !TEAM_DOMAIN) return null;
  try {
    const { payload } = await jwtVerify(token, JWKS, { issuer: `https://${TEAM_DOMAIN}`, audience: AUD });
    return (payload.email as string) ?? null;
  } catch {
    return null;
  }
}
