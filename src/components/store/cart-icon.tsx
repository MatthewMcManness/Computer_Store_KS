'use client';

/**
 * Cart icon with badge showing the number of items.
 *
 * Renders a ShoppingCart icon that links to the cart page. When the
 * cart has items, a red badge displays the count.
 *
 * @functions_called useCart
 * @called_by StoreHeader, SiteHeader
 *
 * @version 1.0.0 - 2026-03-02T19:01:13Z - Initial implementation
 */

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from './cart-provider';

export function CartIcon() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/store/cart"
      className="relative inline-flex items-center p-2 text-gray-700 hover:text-blue-600 transition-colors"
      aria-label={`Shopping cart with ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
    >
      <ShoppingCart className="h-6 w-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
}
