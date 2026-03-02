/**
 * Admin stock sync trigger API route (Phase 3 stub).
 *
 * POST: Triggers a stock/inventory refresh from TD Synnex. This is a
 * stub for Phase 3 implementation. Currently returns a "not yet
 * configured" message.
 *
 * Accepts authentication via either:
 *   - Employee session (getCurrentUser + isEmployee)
 *   - Shared secret via `?secret=` query parameter (for cron jobs)
 *
 * @param request - NextRequest with optional `secret` query parameter
 * @returns NextResponse with sync status message
 *
 * @functions_called getCurrentUser, isEmployee
 * @called_by Admin dashboard (manual sync), cron job
 *
 * @version 1.0.0 - 2026-03-02T19:01:25Z - Initial implementation (Phase 3 stub)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { isEmployee } from '@/lib/role-helpers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check auth: shared secret OR employee session
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const cronSecret = process.env.STORE_CRON_SECRET;

    let authorized = false;

    if (secret && cronSecret && secret === cronSecret) {
      authorized = true;
    } else {
      const user = await getCurrentUser();
      if (user) {
        const roles = user.roles || [user.role];
        if (isEmployee(roles)) {
          authorized = true;
        }
      }
    }

    if (!authorized) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Phase 3: TD Synnex stock refresh will be implemented here
    return NextResponse.json({
      success: true,
      message: 'Stock sync not yet configured. TD Synnex integration pending (Phase 3).',
      sync_type: 'stock',
      status: 'not_configured',
    });
  } catch (error) {
    console.error('Error in POST /api/admin/store/sync/stock:', error);
    return NextResponse.json(
      { error: 'Sync operation failed' },
      { status: 500 }
    );
  }
}
