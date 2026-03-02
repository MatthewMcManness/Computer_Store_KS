'use client';

/**
 * Filter sidebar/bar for product listings.
 *
 * Provides category, price range, in-stock, and manufacturer filters.
 * Updates URL search params for server-side filtering and shareable URLs.
 *
 * @param categories - Available categories
 * @param manufacturers - Available manufacturer names
 *
 * @functions_called useRouter, useSearchParams
 * @called_by StoreProductsPage
 *
 * @version 1.0.0 - 2026-03-02T19:01:13Z - Initial implementation
 */

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import type { StoreCategory } from '@/types/store';

interface ProductFiltersProps {
  categories: StoreCategory[];
  manufacturers: string[];
}

export function ProductFilters({
  categories,
  manufacturers,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams?.get('category') ?? '';
  const currentManufacturer = searchParams?.get('manufacturer') ?? '';
  const currentMinPrice = searchParams?.get('min_price') ?? '';
  const currentMaxPrice = searchParams?.get('max_price') ?? '';
  const inStockOnly = searchParams?.get('in_stock') === 'true';

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 on filter change
      params.delete('page');
      router.push(`/store/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams();
    const search = searchParams?.get('search');
    if (search) params.set('search', search);
    router.push(`/store/products?${params.toString()}`);
  }, [router, searchParams]);

  const hasFilters =
    currentCategory ||
    currentManufacturer ||
    currentMinPrice ||
    currentMaxPrice ||
    inStockOnly;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">Category</h3>
        <ul className="space-y-1.5">
          <li>
            <button
              onClick={() => updateParam('category', '')}
              className={`text-sm transition-colors ${
                !currentCategory
                  ? 'font-medium text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Categories
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => updateParam('category', cat.slug)}
                className={`text-sm transition-colors ${
                  currentCategory === cat.slug
                    ? 'font-medium text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {cat.name}
                {cat.product_count != null && (
                  <span className="ml-1 text-gray-400">
                    ({cat.product_count})
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={currentMinPrice}
            onChange={(e) => updateParam('min_price', e.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            min={0}
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={currentMaxPrice}
            onChange={(e) => updateParam('max_price', e.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            min={0}
          />
        </div>
      </div>

      {/* In Stock Only */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) =>
              updateParam('in_stock', e.target.checked ? 'true' : '')
            }
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">In Stock Only</span>
        </label>
      </div>

      {/* Manufacturers */}
      {manufacturers.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Manufacturer
          </h3>
          <ul className="space-y-1.5 max-h-48 overflow-y-auto">
            <li>
              <button
                onClick={() => updateParam('manufacturer', '')}
                className={`text-sm transition-colors ${
                  !currentManufacturer
                    ? 'font-medium text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Manufacturers
              </button>
            </li>
            {manufacturers.map((mfr) => (
              <li key={mfr}>
                <button
                  onClick={() => updateParam('manufacturer', mfr)}
                  className={`text-sm transition-colors ${
                    currentManufacturer === mfr
                      ? 'font-medium text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mfr}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
