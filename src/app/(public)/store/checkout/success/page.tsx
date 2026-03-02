/**
 * Order confirmation / checkout success page (/store/checkout/success).
 *
 * Server component that displays an order confirmation message after
 * successful checkout. In Phase 1 this is a placeholder showing a
 * generic success message. Phase 2 will look up the Stripe session ID
 * from the URL to display actual order details.
 *
 * @param searchParams - URL search params (session_id from Stripe, or phase=1 for placeholder)
 * @returns Order confirmation page
 *
 * @functions_called getOrderByStripeSession
 * @called_by Next.js App Router (route: /store/checkout/success)
 *
 * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CheckCircle2,
  Package,
  ArrowRight,
  Mail,
  Phone,
  Store,
} from 'lucide-react';
import { getOrderByStripeSession } from '@/lib/store/orders';
import { formatPrice } from '@/lib/store/pricing';

export const metadata: Metadata = {
  title: 'Order Confirmed | Online Store',
  description: 'Your order has been confirmed. Thank you for shopping with Computer Store Kansas.',
};

export const dynamic = 'force-dynamic';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === 'string' ? params.session_id : null;
  const isPhase1 = params.phase === '1';

  // Phase 2: Look up order by Stripe session
  const order = sessionId ? await getOrderByStripeSession(sessionId) : null;

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8">
      {/* Success Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {order ? 'Order Confirmed!' : 'Thank You!'}
        </h1>
        <p className="text-gray-600 text-lg">
          {order
            ? `Your order ${order.order_number} has been placed successfully.`
            : 'Your order request has been received. We will be in touch shortly to confirm the details and arrange payment.'}
        </p>
      </div>

      {/* Order Details (Phase 2 -- when order exists) */}
      {order && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Order Details</h2>
            <span className="text-sm bg-blue-50 text-blue-700 font-medium px-3 py-1 rounded-full">
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Order Number</p>
              <p className="font-medium text-gray-900">{order.order_number}</p>
            </div>
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-medium text-gray-900">
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{order.customer_email}</p>
            </div>
            <div>
              <p className="text-gray-500">Total</p>
              <p className="font-bold text-gray-900">{formatPrice(order.total)}</p>
            </div>
          </div>

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Items</h3>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-600">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="text-gray-900 font-medium">
                      {formatPrice(item.total_price)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 mt-3 space-y-1 text-sm">
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
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Track Order Link */}
          <Link
            href={`/store/orders/${order.id}`}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <Package className="h-4 w-4" />
            Track Your Order
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Phase 1 Placeholder (when no real order) */}
      {!order && isPhase1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">What happens next?</h2>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                1
              </span>
              <span>
                We will review your order and confirm product availability.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                2
              </span>
              <span>
                You will receive an email or phone call to arrange payment.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                3
              </span>
              <span>
                Once payment is confirmed, we will ship your order or prepare it
                for in-store pickup.
              </span>
            </li>
          </ol>
        </div>
      )}

      {/* Contact Info */}
      <div className="bg-gray-50 rounded-xl p-6 text-center space-y-3">
        <p className="text-sm font-medium text-gray-900">
          Questions about your order?
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
          <a
            href="mailto:contact@computerstoreks.com"
            className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
          >
            <Mail className="h-4 w-4" />
            contact@computerstoreks.com
          </a>
          <a
            href="tel:785-267-3223"
            className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
          >
            <Phone className="h-4 w-4" />
            (785) 267-3223
          </a>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/store"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Store className="h-4 w-4" />
          Continue Shopping
        </Link>
        {order && (
          <Link
            href="/store/account/orders"
            className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            View All Orders
          </Link>
        )}
      </div>
    </div>
  );
}
