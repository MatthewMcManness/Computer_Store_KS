/**
 * Admin store dashboard statistics API route.
 *
 * GET: Returns aggregated dashboard statistics including product counts,
 * order counts, revenue figures, and sync timestamps. Requires employee
 * authentication.
 *
 * @param request - NextRequest (unused)
 * @returns NextResponse with StoreDashboardStats
 *
 * @sideEffects
 * - Reads from store_products, store_orders, store_sync_config tables
 *
 * @functions_called getCurrentUser, isEmployee, getDashboardStats
 * @called_by Admin store dashboard page
 *
 * @version 1.0.0 - 2026-03-02T19:01:25Z - Initial implementation
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { isEmployee } from '@/lib/role-helpers';
import { getDashboardStats } from '@/lib/store/orders';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const roles = user.roles || [user.role];
    if (!isEmployee(roles)) {
      return NextResponse.json(
        { error: 'Employee access required' },
        { status: 403 }
      );
    }

    const stats = await getDashboardStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in GET /api/admin/store/dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
