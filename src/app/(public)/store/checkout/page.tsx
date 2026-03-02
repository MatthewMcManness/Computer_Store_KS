/**
 * Checkout page (/store/checkout).
 *
 * Client component that provides a checkout form with shipping address fields,
 * an order summary sidebar, and a "Place Order" button. In Phase 1 this serves
 * as a placeholder with a notice that payment processing (Stripe) is coming in
 * Phase 2. Validates the cart on load and redirects to cart if empty.
 *
 * @returns The checkout page with address form and order summary
 *
 * @functions_called useCart
 * @called_by Next.js App Router (route: /store/checkout)
 *
 * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Lock,
  Truck,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '@/components/store/cart-provider';
import { formatPrice } from '@/lib/store/pricing';
import type { OrderAddress } from '@/types/store';

/** US states for the state dropdown. */
const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, shipping, tax, total, itemCount, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [address, setAddress] = useState<OrderAddress>({
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: 'KS',
    zip_code: '',
    phone: '',
  });

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/store/cart');
    }
  }, [items, router]);

  /**
   * Handle checkout form submission.
   *
   * In Phase 1 this shows a placeholder message. Phase 2 will integrate
   * with Stripe Checkout for payment processing.
   *
   * @param e - Form submission event
   *
   * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Phase 1: Placeholder -- no real payment processing yet
      // Phase 2 will create a Stripe Checkout session here
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For now, redirect to success page with a placeholder
      clearCart();
      router.push('/store/checkout/success?phase=1');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/store/cart"
          className="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Back to cart"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Checkout
        </h1>
      </div>

      {/* Phase 1 Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">
            Payment processing coming soon
          </p>
          <p className="text-sm text-amber-700 mt-1">
            Online payments via Stripe are being integrated. For now, placing an
            order will confirm your intent and we will contact you to arrange
            payment. You can also call us or visit in-store.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Shipping Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="customer_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name *
                  </label>
                  <input
                    id="customer_name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label
                    htmlFor="customer_email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email *
                  </label>
                  <input
                    id="customer_email"
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-gray-400" />
                Shipping Address
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="full_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Recipient Name *
                  </label>
                  <input
                    id="full_name"
                    type="text"
                    required
                    value={address.full_name}
                    onChange={(e) =>
                      setAddress({ ...address, full_name: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label
                    htmlFor="address_line1"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Address Line 1 *
                  </label>
                  <input
                    id="address_line1"
                    type="text"
                    required
                    value={address.address_line1}
                    onChange={(e) =>
                      setAddress({ ...address, address_line1: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Main St"
                  />
                </div>

                <div>
                  <label
                    htmlFor="address_line2"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Address Line 2
                  </label>
                  <input
                    id="address_line2"
                    type="text"
                    value={address.address_line2 ?? ''}
                    onChange={(e) =>
                      setAddress({ ...address, address_line2: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Apt, Suite, Unit (optional)"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      City *
                    </label>
                    <input
                      id="city"
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) =>
                        setAddress({ ...address, city: e.target.value })
                      }
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Topeka"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      State *
                    </label>
                    <select
                      id="state"
                      required
                      value={address.state}
                      onChange={(e) =>
                        setAddress({ ...address, state: e.target.value })
                      }
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      {US_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="zip_code"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      ZIP *
                    </label>
                    <input
                      id="zip_code"
                      type="text"
                      required
                      pattern="[0-9]{5}(-[0-9]{4})?"
                      value={address.zip_code}
                      onChange={(e) =>
                        setAddress({ ...address, zip_code: e.target.value })
                      }
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="66604"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone (optional)
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={address.phone ?? ''}
                    onChange={(e) =>
                      setAddress({ ...address, phone: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="785-267-3223"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-20">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              {/* Items List */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-600 truncate pr-2">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="text-gray-900 font-medium flex-shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-4 bg-red-50 text-red-700 text-sm p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {/* Place Order */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Place Order
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                <Lock className="h-3 w-3" />
                Secure checkout
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
