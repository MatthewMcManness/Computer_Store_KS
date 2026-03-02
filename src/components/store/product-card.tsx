'use client';

/**
 * Product card for grid display on the storefront.
 *
 * Shows product image, name, manufacturer, price (with MSRP comparison),
 * stock indicator, Add to Cart button, and wishlist toggle.
 *
 * @param product - StoreProduct to render
 *
 * @functions_called useCart, PriceDisplay, StockIndicator, WishlistButton
 * @called_by ProductGrid
 *
 * @version 1.0.0 - 2026-03-02T19:01:13Z - Initial implementation
 */

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import type { StoreProduct } from '@/types/store';
import { useCart } from './cart-provider';
import { PriceDisplay } from './price-display';
import { StockIndicator } from './stock-indicator';
import { WishlistButton } from './wishlist-button';

interface ProductCardProps {
  product: StoreProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const price = product.effective_price ?? product.retail_price ?? 0;
  const canAdd =
    product.stock_status !== 'out_of_stock' &&
    product.stock_status !== 'discontinued' &&
    price > 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!canAdd) return;

    addItem({
      product_id: product.id,
      sku: product.sku,
      quantity: 1,
      name: product.name,
      price,
      image: product.images?.[0] ?? null,
      stock_status: product.stock_status,
      stock_quantity: product.stock_quantity,
      max_quantity: product.stock_quantity,
    });
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Wishlist */}
      <div className="absolute right-2 top-2 z-10">
        <WishlistButton productId={product.id} />
      </div>

      {/* Image */}
      <Link href={`/store/products/${product.sku}`} className="block">
        <div className="aspect-square overflow-hidden bg-gray-100">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              width={400}
              height={400}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
              <span className="text-sm text-gray-400">No Image</span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        {product.manufacturer && (
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {product.manufacturer}
          </p>
        )}

        <Link
          href={`/store/products/${product.sku}`}
          className="mt-1 text-sm font-medium text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors"
        >
          {product.name}
        </Link>

        <div className="mt-2">
          <PriceDisplay price={price} msrp={product.msrp} size="sm" />
        </div>

        <div className="mt-2">
          <StockIndicator status={product.stock_status} />
        </div>

        {/* Add to Cart */}
        <div className="mt-auto pt-3">
          <button
            onClick={handleAddToCart}
            disabled={!canAdd}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            {canAdd ? 'Add to Cart' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
}
