import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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
