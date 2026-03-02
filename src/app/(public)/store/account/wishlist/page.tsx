/**
 * Wishlist page (/store/account/wishlist).
 *
 * Client component that fetches and displays the user's saved wishlist items.
 * Provides "Add to Cart" and "Remove from Wishlist" actions for each product.
 * Shows an empty state with a link to browse products when the wishlist is empty.
 *
 * @returns Wishlist page with product grid and action buttons
 *
 * @functions_called useCart, fetch /api/store/wishlist
 * @called_by Next.js App Router (route: /store/account/wishlist)
 *
 * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  ShoppingCart,
  Trash2,
  Monitor,
  Loader2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '@/components/store/cart-provider';
import { formatPrice } from '@/lib/store/pricing';
import type { StoreWishlistItem } from '@/types/store';

export default function WishlistPage() {
  const { addItem } = useCart();
  const [wishlistItems, setWishlistItems] = useState<StoreWishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  /**
   * Fetch the user's wishlist from the API.
   *
   * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
   */
  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/store/wishlist');

      if (res.status === 401) {
        setError('sign-in-required');
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to load wishlist');
      }

      const data = await res.json();
      setWishlistItems(data.items ?? []);
    } catch {
      setError('Unable to load your wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  /**
   * Remove an item from the wishlist.
   *
   * @param wishlistItemId - The wishlist entry ID to remove
   *
   * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
   */
  async function handleRemove(wishlistItemId: string) {
    setRemovingIds((prev) => new Set(prev).add(wishlistItemId));

    try {
      const res = await fetch(`/api/store/wishlist/${wishlistItemId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setWishlistItems((prev) => prev.filter((item) => item.id !== wishlistItemId));
      }
    } catch {
      // Silently fail -- item remains in UI
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(wishlistItemId);
        return next;
      });
    }
  }

  /**
   * Add a wishlist item to the cart.
   *
   * @param item - The wishlist item with embedded product data
   *
   * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
   */
  function handleAddToCart(item: StoreWishlistItem) {
    if (!item.product) return;

    const product = item.product;
    const price = product.effective_price ?? product.retail_price;
    if (price === null || price === undefined) return;

    addItem({
      product_id: product.id,
      sku: product.sku,
      name: product.name,
      price,
      quantity: 1,
      image: product.images?.[0] ?? null,
      stock_status: product.stock_status,
      stock_quantity: product.stock_quantity,
      max_quantity: product.stock_quantity,
    });
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 text-sm">Loading your wishlist...</p>
      </div>
    );
  }

  // Sign-in required
  if (error === 'sign-in-required') {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Sign in to view your wishlist
        </h1>
        <p className="text-gray-500 mb-8">
          Save your favorite products and access them from any device.
        </p>
        <Link
          href="/portal"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Sign In
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <AlertCircle className="h-16 w-16 text-red-300 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Something went wrong
        </h1>
        <p className="text-gray-500 mb-8">{error}</p>
        <button
          onClick={fetchWishlist}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state
  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Your wishlist is empty
        </h1>
        <p className="text-gray-500 mb-8">
          Save products you are interested in and come back to them later.
        </p>
        <Link
          href="/store/products"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Browse Products
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        My Wishlist
        <span className="text-lg font-normal text-gray-500 ml-2">
          ({wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''})
        </span>
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((item) => {
          const product = item.product;
          if (!product) return null;

          const price = product.effective_price ?? product.retail_price;
          const hasImage = product.images && product.images.length > 0;
          const isInStock =
            product.stock_status === 'in_stock' || product.stock_status === 'low_stock';
          const isRemoving = removingIds.has(item.id);

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Product Image */}
              <Link
                href={`/store/products/${product.sku}`}
                className="block aspect-square bg-gray-100 relative overflow-hidden"
              >
                {hasImage ? (
                  <Image
                    src={product.images[0]!}
                    alt={product.name}
                    fill
                    className="object-contain p-4 hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300">
                    <Monitor className="h-16 w-16" />
                  </div>
                )}
                {!isInStock && (
                  <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                    <span className="bg-white text-gray-900 text-sm font-semibold px-3 py-1 rounded">
                      Out of Stock
                    </span>
                  </div>
                )}
              </Link>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                <Link
                  href={`/store/products/${product.sku}`}
                  className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 block"
                >
                  {product.name}
                </Link>

                {price !== null && price !== undefined ? (
                  <span className="text-lg font-bold text-gray-900 block">
                    {formatPrice(price)}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500 block">
                    Contact for price
                  </span>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {isInStock && price !== null && price !== undefined && (
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-600 text-white text-sm px-3 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={isRemoving}
                    className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:text-red-600 hover:border-red-300 disabled:opacity-50 transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    {isRemoving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
