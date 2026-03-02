/**
 * Cart totals summary panel.
 *
 * Shows subtotal, shipping, tax, and total. Includes a note about the
 * free shipping threshold and an optional checkout button.
 *
 * @param subtotal - Cart subtotal
 * @param shipping - Calculated shipping cost
 * @param tax - Calculated tax amount
 * @param total - Grand total
 * @param freeShippingThreshold - Subtotal required for free shipping
 * @param showCheckout - Whether to show the checkout button (default true)
 *
 * @functions_called formatPrice
 * @called_by CartPage, CheckoutPage
 *
 * @version 1.0.0 - 2026-03-02T19:01:13Z - Initial implementation
 */

import Link from 'next/link';
import { formatPrice } from '@/lib/store/pricing';

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  freeShippingThreshold?: number;
  showCheckout?: boolean;
}

export function CartSummary({
  subtotal,
  shipping,
  tax,
  total,
  freeShippingThreshold = 100,
  showCheckout = true,
}: CartSummaryProps) {
  const remainingForFree = freeShippingThreshold - subtotal;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Order Summary
      </h2>

      <dl className="space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-600">Subtotal</dt>
          <dd className="font-medium text-gray-900">{formatPrice(subtotal)}</dd>
        </div>

        <div className="flex justify-between">
          <dt className="text-gray-600">Shipping</dt>
          <dd className="font-medium text-gray-900">
            {shipping === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              formatPrice(shipping)
            )}
          </dd>
        </div>

        {remainingForFree > 0 && shipping > 0 && (
          <p className="text-xs text-blue-600">
            Add {formatPrice(remainingForFree)} more for free shipping!
          </p>
        )}

        <div className="flex justify-between">
          <dt className="text-gray-600">Tax</dt>
          <dd className="font-medium text-gray-900">{formatPrice(tax)}</dd>
        </div>

        <div className="flex justify-between border-t border-gray-200 pt-3">
          <dt className="text-base font-semibold text-gray-900">Total</dt>
          <dd className="text-base font-semibold text-gray-900">
            {formatPrice(total)}
          </dd>
        </div>
      </dl>

      {showCheckout && (
        <Link
          href="/store/checkout"
          className="mt-6 block w-full rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Proceed to Checkout
        </Link>
      )}
    </div>
  );
}
