/**
 * Order history page (/store/account/orders).
 *
 * Server component that displays a paginated list of the authenticated
 * user's orders. Requires authentication via middleware. Each order shows
 * status badges, date, total, and links to the individual order detail page.
 *
 * @param searchParams - URL query params (page for pagination)
 * @returns Paginated order history list
 *
 * @sideEffects
 * - Reads from store_orders and store_order_items tables
 * - Reads user session from cookies
 *
 * @functions_called getUserOrders, formatPrice
 * @called_by Next.js App Router (route: /store/account/orders)
 *
 * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { getUserOrders } from '@/lib/store/orders';
import { formatPrice } from '@/lib/store/pricing';
import type { OrderStatus } from '@/types/store';

export const metadata: Metadata = {
  title: 'Order History | My Account',
  description: 'View your past orders from Computer Store Kansas.',
};

export const dynamic = 'force-dynamic';

/** Compact status badge configuration. */
const STATUS_BADGES: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pending: { label: 'Pending', className: 'bg-yellow-50 text-yellow-700' },
  payment_confirmed: { label: 'Confirmed', className: 'bg-blue-50 text-blue-700' },
  submitted_to_supplier: { label: 'Ordered', className: 'bg-indigo-50 text-indigo-700' },
  processing: { label: 'Processing', className: 'bg-blue-50 text-blue-700' },
  shipped: { label: 'Shipped', className: 'bg-purple-50 text-purple-700' },
  delivered: { label: 'Delivered', className: 'bg-green-50 text-green-700' },
  cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-700' },
  refunded: { label: 'Refunded', className: 'bg-gray-100 text-gray-700' },
};

export default async function OrderHistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) || 1 : 1;
  const perPage = 10;

  // TODO: Get user profile ID from session/auth
  // For now, redirect to login if no session exists.
  // Phase 2 will integrate with the auth system.
  const userProfileId: string | null = null;

  if (!userProfileId) {
    // Show a message asking users to log in
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Sign in to view your orders
        </h1>
        <p className="text-gray-500 mb-8">
          You need to be logged in to view your order history. If you placed an
          order as a guest, you can track it using your order number and email.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/portal"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/store"
            className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const { orders, total } = await getUserOrders(userProfileId, page, perPage);
  const totalPages = Math.ceil(total / perPage);

  // Empty state
  if (orders.length === 0 && page === 1) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          No orders yet
        </h1>
        <p className="text-gray-500 mb-8">
          You have not placed any orders yet. Browse our store to find what you
          need.
        </p>
        <Link
          href="/store/products"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Start Shopping
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Order History
      </h1>

      <p className="text-sm text-gray-500">
        {total} order{total !== 1 ? 's' : ''} total
      </p>

      {/* Order List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const badge = STATUS_BADGES[order.status];
          const itemCount =
            order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

          return (
            <Link
              key={order.id}
              href={`/store/orders/${order.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className="font-semibold text-gray-900">
                      {order.order_number}
                    </h2>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    &middot; {itemCount} item{itemCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(order.total)}
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          aria-label="Order history pagination"
          className="flex items-center justify-center gap-2 pt-4"
        >
          {page > 1 && (
            <Link
              href={`/store/account/orders?page=${page - 1}`}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          )}
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/store/account/orders?page=${page + 1}`}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
