/**
 * Order listing API route (authentication required).
 *
 * GET: Returns a paginated list of orders belonging to the
 * authenticated user, sorted by creation date descending.
 * Each order includes its line items.
 *
 * @param request - NextRequest with optional page and per_page query params
 * @returns NextResponse with paginated orders array and total count
 *
 * @sideEffects
 * - Reads from store_orders and store_order_items tables
 *
 * @functions_called getCurrentUser, getUserOrders
 * @called_by User order history page, account dashboard
 *
 * @version 1.0.0 - 2026-03-02T19:01:25Z - Initial implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserOrders } from '@/lib/store/orders';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('per_page') || '20', 10);

    const result = await getUserOrders(
      user.supabaseUserId,
      Math.max(1, page),
      Math.min(Math.max(1, perPage), 50)
    );

    return NextResponse.json({
      orders: result.orders,
      total: result.total,
      page,
      per_page: perPage,
      total_pages: Math.ceil(result.total / perPage),
    });
  } catch (error) {
    console.error('Error in GET /api/store/orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
