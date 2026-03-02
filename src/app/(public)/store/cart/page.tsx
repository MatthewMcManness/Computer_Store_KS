/**
 * Shopping cart page (/store/cart).
 *
 * Client component that displays the user's current cart contents with
 * quantity controls, item removal, cart summary with totals, and navigation
 * to continue shopping or proceed to checkout. Uses the useCart() hook from
 * CartProvider for all cart state management.
 *
 * @returns The shopping cart page with items, totals, and action buttons
 *
 * @functions_called useCart
 * @called_by Next.js App Router (route: /store/cart)
 *
 * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Monitor,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '@/components/store/cart-provider';
import { formatPrice } from '@/lib/store/pricing';

export default function CartPage() {
  const { items, subtotal, shipping, tax, total, itemCount, updateQuantity, removeItem, clearCart } =
    useCart();

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShoppingCart className="h-20 w-20 text-gray-300 mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Your cart is empty
        </h1>
        <p className="text-gray-500 mb-8 max-w-md">
          Looks like you have not added any products yet. Browse our store to find
          what you need.
        </p>
        <Link
          href="/store/products"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <ShoppingBag className="h-5 w-5" />
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Shopping Cart
          <span className="text-lg font-normal text-gray-500 ml-2">
            ({itemCount} item{itemCount !== 1 ? 's' : ''})
          </span>
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 flex gap-4"
            >
              {/* Item Image */}
              <Link
                href={`/store/products/${item.sku}`}
                className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden relative"
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-2"
                    sizes="96px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300">
                    <Monitor className="h-8 w-8" />
                  </div>
                )}
              </Link>

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/store/products/${item.sku}`}
                  className="text-sm sm:text-base font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                >
                  {item.name}
                </Link>
                <p className="text-xs text-gray-400 mt-1">SKU: {item.sku}</p>
                <p className="text-base sm:text-lg font-bold text-gray-900 mt-2">
                  {formatPrice(item.price)}
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() =>
                        updateQuantity(item.product_id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className="p-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-3 py-1 text-sm font-medium text-gray-900 min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product_id, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.max_quantity}
                      className="p-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Stock warnings */}
                {item.stock_status === 'low_stock' && (
                  <p className="text-xs text-amber-600 mt-2">
                    Low stock - only {item.stock_quantity} available
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-20">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
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

            <Link
              href="/store/checkout"
              className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/store/products"
              className="mt-3 w-full inline-flex items-center justify-center gap-2 text-gray-600 px-6 py-2.5 rounded-lg font-medium hover:text-gray-900 hover:bg-gray-50 transition-colors text-sm text-center"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
