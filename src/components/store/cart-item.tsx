'use client';

/**
 * Single cart item row for the cart page.
 *
 * Displays product image, name, SKU, unit price, quantity controls,
 * line total, and a remove button. Responsive: stacks on mobile.
 *
 * @param item - Fully resolved CartItem
 *
 * @functions_called useCart
 * @called_by CartPage
 *
 * @version 1.0.0 - 2026-03-02T19:01:13Z - Initial implementation
 */

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/store/pricing';
import { useCart } from './cart-provider';
import type { CartItem as CartItemType } from '@/types/store';

interface CartItemProps {
  item: CartItemType;
}

export function CartItemRow({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  const lineTotal = Math.round(item.price * item.quantity * 100) / 100;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-gray-200 py-4">
      {/* Image */}
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 text-xs text-gray-500">
            No Image
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {item.name}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">SKU: {item.sku}</p>
        <p className="text-sm text-gray-700 mt-1 sm:hidden">
          {formatPrice(item.price)}
        </p>
      </div>

      {/* Unit Price (desktop) */}
      <div className="hidden sm:block w-24 text-right text-sm text-gray-700">
        {formatPrice(item.price)}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
          className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Decrease quantity"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-8 text-center text-sm font-medium">
          {item.quantity}
        </span>
        <button
          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
          disabled={item.quantity >= item.max_quantity}
          className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Increase quantity"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Line Total */}
      <div className="w-24 text-right text-sm font-semibold text-gray-900">
        {formatPrice(lineTotal)}
      </div>

      {/* Remove */}
      <button
        onClick={() => removeItem(item.product_id)}
        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
        aria-label={`Remove ${item.name} from cart`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
