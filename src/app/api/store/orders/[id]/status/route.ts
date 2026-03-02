/**
 * Order status quick-check API route.
 *
 * GET: Returns the current status, tracking number, and tracking
 * carrier for an order. Lightweight endpoint for status polling
 * without fetching full order details.
 *
 * @param request - NextRequest (unused)
 * @param params - Route parameters containing the order ID
 * @returns NextResponse with status, tracking_number, and tracking_carrier
 *
 * @sideEffects
 * - Reads from store_orders table
 *
 * @functions_called getOrderById
 * @called_by Order tracking page, status polling
 *
 * @version 1.0.0 - 2026-03-02T19:01:25Z - Initial implementation
 */

import { NextRequest, NextResponse } from 'next/server';
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

    return NextResponse.json({
      order_id: order.id,
      order_number: order.order_number,
      status: order.status,
      tracking_number: order.tracking_number,
      tracking_carrier: order.tracking_carrier,
      updated_at: order.updated_at,
    });
  } catch (error) {
    console.error('Error in GET /api/store/orders/[id]/status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order status' },
      { status: 500 }
    );
  }
}
