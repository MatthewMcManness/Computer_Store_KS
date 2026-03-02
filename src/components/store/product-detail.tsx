'use client';

/**
 * Full product detail view.
 *
 * Displays product images, name, manufacturer, SKU, price, stock status,
 * description, specifications table, quantity selector with Add to Cart,
 * and wishlist button. Includes category breadcrumbs when available.
 *
 * @param product - Fully populated StoreProduct
 *
 * @functions_called useCart, PriceDisplay, StockIndicator, WishlistButton
 * @called_by ProductDetailPage (/store/products/[sku])
 *
 * @version 1.0.0 - 2026-03-02T19:01:13Z - Initial implementation
 */

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Minus, Plus, ShoppingCart } from 'lucide-react';
import type { StoreProduct } from '@/types/store';
import { useCart } from './cart-provider';
import { PriceDisplay } from './price-display';
import { StockIndicator } from './stock-indicator';
import { WishlistButton } from './wishlist-button';

interface ProductDetailProps {
  product: StoreProduct;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const price = product.effective_price ?? product.retail_price ?? 0;
  const canAdd =
    product.stock_status !== 'out_of_stock' &&
    product.stock_status !== 'discontinued' &&
    price > 0;

  const images = product.images?.length ? product.images : [];
  const specs = product.specs ?? {};
  const specEntries = Object.entries(specs);

  function handleAddToCart() {
    if (!canAdd) return;
    addItem({
      product_id: product.id,
      sku: product.sku,
      quantity,
      name: product.name,
      price,
      image: images[0] ?? null,
      stock_status: product.stock_status,
      stock_quantity: product.stock_quantity,
      max_quantity: product.stock_quantity,
    });
    setQuantity(1);
  }

  return (
    <div>
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-gray-500">
        <Link href="/store" className="hover:text-blue-600 transition-colors">
          Store
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        {product.category && (
          <>
            <Link
              href={`/store/products?category=${product.category.slug}`}
              className="hover:text-blue-600 transition-colors"
            >
              {product.category.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
          </>
        )}
        <span className="text-gray-900 truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            {images.length > 0 ? (
              <Image
                src={images[selectedImage] ?? ''}
                alt={product.name}
                width={600}
                height={600}
                className="h-full w-full object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                <span className="text-lg text-gray-400">No Image</span>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded border-2 transition-colors ${
                    idx === selectedImage
                      ? 'border-blue-600'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <Image
                    src={img ?? ''}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {product.manufacturer && (
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {product.manufacturer}
            </p>
          )}

          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            {product.name}
          </h1>

          <p className="mt-1 text-sm text-gray-500">SKU: {product.sku}</p>

          <div className="mt-4">
            <PriceDisplay price={price} msrp={product.msrp} size="lg" />
          </div>

          <div className="mt-3">
            <StockIndicator status={product.stock_status} />
          </div>

          {product.description && (
            <p className="mt-6 text-sm leading-relaxed text-gray-700">
              {product.description}
            </p>
          )}

          {/* Quantity + Add to Cart */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="flex h-10 w-10 items-center justify-center rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity((q) =>
                    Math.min(q + 1, product.stock_quantity)
                  )
                }
                disabled={quantity >= product.stock_quantity}
                className="flex h-10 w-10 items-center justify-center rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!canAdd}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {canAdd ? 'Add to Cart' : 'Unavailable'}
            </button>

            <WishlistButton productId={product.id} size="lg" />
          </div>

          {/* Specifications */}
          {specEntries.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Specifications
              </h2>
              <table className="w-full text-sm">
                <tbody>
                  {specEntries.map(([key, value]) => (
                    <tr key={key} className="border-b border-gray-100">
                      <td className="py-2 pr-4 font-medium text-gray-600 w-1/3">
                        {key}
                      </td>
                      <td className="py-2 text-gray-900">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
