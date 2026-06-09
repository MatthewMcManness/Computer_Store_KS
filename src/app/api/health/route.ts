import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Forces this route to execute on every request instead of being
 * statically cached at build time. Without this, Next.js 14 freezes
 * the response (and the Supabase query) at build time, so the DB is
 * never actually touched in production -- which lets Supabase's free
 * tier auto-pause after 7 days of inactivity. The per-request query
 * below is what keeps the database alive between UptimeRobot pings.
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
 * @sideEffects Queries Supabase to verify database connectivity
 * @called_by UptimeRobot, Render health checks
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 * @version 2.0.0 - 2026-03-20T00:00:00Z - Strip info disclosure, return minimal response
 * @version 2.1.0 - 2026-06-09T00:00:00Z - Force dynamic so the DB keep-alive query runs per request
 */
export async function GET() {
  let dbOk = false;

  if (supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin
        .from('gallery_computers')
        .select('*', { count: 'exact', head: true });
      dbOk = !error;
    } catch {
      // DB unreachable -- status will be 'degraded'
    }
  }

  return NextResponse.json({
    status: dbOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
  });
}
