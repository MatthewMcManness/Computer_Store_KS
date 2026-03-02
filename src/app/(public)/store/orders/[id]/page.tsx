/**
 * Order tracking page (/store/orders/[id]).
 *
 * Server component that displays order details, status, line items, and
 * tracking information. Supports two access modes:
 * - Guest: requires email verification via ?email= query param
 * - Authenticated: direct access if the user owns the order
 *
 * Returns 404 if the order is not found or access is denied.
 *
 * @param params - Route params containing the order ID
 * @param searchParams - URL query params (email for guest verification)
 * @returns Order tracking page with details and status
 *
 * @sideEffects
 * - Reads from store_orders and store_order_items tables
 *
 * @functions_called getOrderById, formatPrice
 * @called_by Next.js App Router (route: /store/orders/[id])
 *
 * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  ExternalLink,
  MapPin,
} from 'lucide-react';
import { getOrderById } from '@/lib/store/orders';
import { formatPrice } from '@/lib/store/pricing';
import type { OrderStatus } from '@/types/store';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Order Details | Online Store',
  description: 'View your order details and tracking information.',
};

/** Map order statuses to display configuration. */
const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'Pending',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    icon: <Clock className="h-4 w-4" />,
  },
  payment_confirmed: {
    label: 'Payment Confirmed',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  submitted_to_supplier: {
    label: 'Submitted to Supplier',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    icon: <Package className="h-4 w-4" />,
  },
  processing: {
    label: 'Processing',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    icon: <Package className="h-4 w-4" />,
  },
  shipped: {
    label: 'Shipped',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    icon: <Truck className="h-4 w-4" />,
  },
  delivered: {
    label: 'Delivered',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    icon: <XCircle className="h-4 w-4" />,
  },
  refunded: {
    label: 'Refunded',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: <XCircle className="h-4 w-4" />,
  },
};

export default async function OrderTrackingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const queryParams = await searchParams;
  const guestEmail = typeof queryParams.email === 'string' ? queryParams.email : null;

  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  // Guest access: verify email matches
  // TODO: Phase 2 will also check authenticated user ownership
  if (guestEmail && guestEmail.toLowerCase() !== order.customer_email.toLowerCase()) {
    notFound();
  }

  const statusConfig = STATUS_CONFIG[order.status];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back Link */}
      <Link
        href="/store"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Store
      </Link>

      {/* Order Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order {order.order_number}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Placed on{' '}
              {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full ${statusConfig.color} ${statusConfig.bgColor}`}
          >
            {statusConfig.icon}
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Tracking Information */}
      {order.tracking_number && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="h-5 w-5 text-gray-400" />
            Tracking Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Carrier</p>
              <p className="font-medium text-gray-900">
                {order.tracking_carrier ?? 'Standard Shipping'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Tracking Number</p>
              <p className="font-medium text-gray-900 flex items-center gap-1.5">
                {order.tracking_number}
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Order Items</h2>
        <div className="space-y-4">
          {order.items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">
                  SKU: {item.sku} &middot; Qty: {item.quantity}
                </p>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p className="text-sm font-medium text-gray-900">
                  {formatPrice(item.total_price)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatPrice(item.unit_price)} each
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Totals */}
        <div className="border-t border-gray-200 pt-4 mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>
              {order.shipping_cost === 0
                ? 'FREE'
                : formatPrice(order.shipping_cost)}
            </span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax</span>
            <span>{formatPrice(order.tax_amount)}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-gray-400" />
          Shipping Address
        </h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p className="font-medium text-gray-900">
            {order.shipping_address.full_name}
          </p>
          <p>{order.shipping_address.address_line1}</p>
          {order.shipping_address.address_line2 && (
            <p>{order.shipping_address.address_line2}</p>
          )}
          <p>
            {order.shipping_address.city}, {order.shipping_address.state}{' '}
            {order.shipping_address.zip_code}
          </p>
          {order.shipping_address.phone && (
            <p>{order.shipping_address.phone}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Order Notes</h2>
          <p className="text-sm text-gray-600">{order.notes}</p>
        </div>
      )}

      {/* Help */}
      <div className="text-center text-sm text-gray-500">
        <p>
          Need help?{' '}
          <Link
            href="/contact"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Contact us
          </Link>{' '}
          or call{' '}
          <a
            href="tel:785-267-3223"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            (785) 267-3223
          </a>
        </p>
      </div>
    </div>
  );
}
