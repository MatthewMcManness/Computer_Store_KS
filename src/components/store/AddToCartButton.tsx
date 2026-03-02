/**
 * Add to Cart button component for the product detail page.
 *
 * Client component that provides a quantity selector and "Add to Cart" button.
 * Shows a confirmation message briefly after adding. Integrates with the
 * CartProvider context for cart operations.
 *
 * @param productId - UUID of the product
 * @param sku - Product SKU
 * @param name - Product display name
 * @param price - Effective retail price
 * @param maxQuantity - Maximum available quantity (stock)
 * @param image - Primary product image URL, or null
 * @returns Add to cart form with quantity selector
 *
 * @functions_called useCart
 * @called_by ProductDetailPage
 *
 * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
 */

'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { useCart } from '@/components/store/cart-provider';
import type { StockStatus } from '@/types/store';

interface AddToCartButtonProps {
  productId: string;
  sku: string;
  name: string;
  price: number;
  maxQuantity: number;
  image: string | null;
}

export function AddToCartButton({
  productId,
  sku,
  name,
  price,
  maxQuantity,
  image,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  /**
   * Handle adding the product to cart with the selected quantity.
   *
   * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
   */
  function handleAdd() {
    addItem({
      product_id: productId,
      sku,
      name,
      price,
      quantity,
      image,
      stock_status: 'in_stock' as StockStatus,
      stock_quantity: maxQuantity,
      max_quantity: maxQuantity,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="space-y-3">
      {/* Quantity Selector */}
      <div className="flex items-center gap-3">
        <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
          Quantity:
        </label>
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="p-2.5 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            id="quantity"
            type="number"
            min={1}
            max={maxQuantity}
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) {
                setQuantity(Math.max(1, Math.min(val, maxQuantity)));
              }
            }}
            className="w-14 text-center text-sm font-medium text-gray-900 border-0 focus:outline-none focus:ring-0"
          />
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
            disabled={quantity >= maxQuantity}
            className="p-2.5 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={added}
        className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold transition-all ${
          added
            ? 'bg-green-600 text-white'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
        }`}
      >
        {added ? (
          <>
            <Check className="h-5 w-5" />
            Added to Cart
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" />
            Add to Cart
          </>
        )}
      </button>
    </div>
  );
}
