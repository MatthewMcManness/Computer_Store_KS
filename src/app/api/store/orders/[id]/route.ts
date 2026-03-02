/**
 * Order detail API route.
 *
 * GET: Returns a single order by ID with its line items.
 * Access is granted if:
 *   - The authenticated user owns the order, OR
 *   - The `email` query parameter matches the order's customer_email
 * Otherwise returns 403.
 *
 * @param request - NextRequest with optional `email` query parameter
 * @param params - Route parameters containing the order ID
 * @returns NextResponse with StoreOrder (including items) or error
 *
 * @sideEffects
 * - Reads from store_orders and store_order_items tables
 *
 * @functions_called getCurrentUser, getOrderById
 * @called_by Order confirmation page, order detail page
 *
 * @version 1.0.0 - 2026-03-02T19:01:25Z - Initial implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getOrderById } from '@/lib/store/orders';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check access: authenticated user owns the order
    const user = await getCurrentUser();
    if (user && user.supabaseUserId && order.user_profile_id === user.supabaseUserId) {
      return NextResponse.json(order);
    }

    // Check access: email query parameter matches order email
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get('email');
    if (emailParam && emailParam.toLowerCase() === order.customer_email.toLowerCase()) {
      return NextResponse.json(order);
    }

    // No valid access method
    return NextResponse.json(
      { error: 'You do not have permission to view this order' },
      { status: 403 }
    );
  } catch (error) {
    console.error('Error in GET /api/store/orders/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
