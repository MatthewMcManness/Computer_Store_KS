'use client';

/**
 * Wishlist toggle button (heart icon).
 *
 * Filled heart when product is in the user's wishlist, outline otherwise.
 * Calls POST/DELETE to /api/store/wishlist to persist state. If the user
 * is not logged in, prompts them to log in.
 *
 * @param productId - UUID of the product
 * @param size - Button size variant
 *
 * @functions_called none (uses fetch)
 * @called_by ProductCard, ProductDetail
 *
 * @version 1.0.0 - 2026-03-02T19:01:13Z - Initial implementation
 */

import { useCallback, useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { clsx } from 'clsx';

interface WishlistButtonProps {
  productId: string;
  size?: 'sm' | 'lg';
}

export function WishlistButton({
  productId,
  size = 'sm',
}: WishlistButtonProps) {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check wishlist status on mount
  useEffect(() => {
    async function check() {
      try {
        const res = await fetch(
          `/api/store/wishlist?product_id=${productId}`
        );
        if (res.ok) {
          const data = await res.json();
          setInWishlist(!!data.in_wishlist);
        }
      } catch {
        // Not logged in or endpoint unavailable.
      }
    }
    check();
  }, [productId]);

  const toggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (loading) return;

      setLoading(true);
      try {
        const method = inWishlist ? 'DELETE' : 'POST';
        const res = await fetch('/api/store/wishlist', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: productId }),
        });

        if (res.status === 401) {
          // User is not authenticated
          window.location.href = '/store/account?redirect=wishlist';
          return;
        }

        if (res.ok) {
          setInWishlist(!inWishlist);
        }
      } catch {
        // Silently fail.
      } finally {
        setLoading(false);
      }
    },
    [productId, inWishlist, loading]
  );

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={clsx(
        'rounded-full transition-colors disabled:opacity-50',
        size === 'sm' && 'p-1.5',
        size === 'lg' && 'p-2.5 border border-gray-300 hover:border-red-300',
        inWishlist
          ? 'text-red-500 hover:text-red-600'
          : 'text-gray-400 hover:text-red-500'
      )}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={clsx(
          size === 'sm' && 'h-5 w-5',
          size === 'lg' && 'h-6 w-6',
          inWishlist && 'fill-current'
        )}
      />
    </button>
  );
}
