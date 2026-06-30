import { NextResponse } from 'next/server';
import { query, isDbConfigured } from '@/lib/db';

/**
 * Forces this route to execute on every request instead of being
 * statically cached at build time. Without this, Next.js 14 freezes
 * the response (and the DB query) at build time, so the database is
 * never actually touched in production. The per-request query below
 * verifies database connectivity on every health check.
 */
export const dynamic = 'force-dynamic';

/**
 * Minimal public health check endpoint.
 *
 * Returns only status and timestamp. No env var presence checks,
 * service configuration details, or error messages are exposed
 * to avoid information disclosure to unauthenticated callers.
 *
 * @returns NextResponse with status ('ok' | 'degraded') and ISO timestamp
 *
 * @sideEffects Queries Postgres to verify database connectivity
 * @called_by Uptime monitors, platform health checks
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 * @version 2.0.0 - 2026-03-20T00:00:00Z - Strip info disclosure, return minimal response
 * @version 2.1.0 - 2026-06-09T00:00:00Z - Force dynamic so the DB keep-alive query runs per request
 * @version 3.0.0 - 2026-06-30T00:00:00Z - Probe self-hosted Postgres via pg
 */
export async function GET() {
  let dbOk = false;

  if (isDbConfigured()) {
    try {
      await query('select 1 from gallery_computers limit 1');
      dbOk = true;
    } catch {
      // DB unreachable -- status will be 'degraded'
    }
  }

  return NextResponse.json({
    status: dbOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
  });
}
