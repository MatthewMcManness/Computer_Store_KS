/**
 * Responsive grid of product cards.
 *
 * Renders 1 column on mobile, 2 on tablet, 3-4 on desktop.
 * Shows loading skeletons or an empty state when appropriate.
 *
 * @param products - Array of products to display
 * @param loading - Whether to show loading skeleton
 *
 * @functions_called ProductCard
 * @called_by StoreProductsPage, CategoryPage, SearchResultsPage
 *
 * @version 1.0.0 - 2026-03-02T19:01:13Z - Initial implementation
 */

import type { StoreProduct } from '@/types/store';
import { ProductCard } from './product-card';
import { PackageOpen } from 'lucide-react';

interface ProductGridProps {
  products: StoreProduct[];
  loading?: boolean;
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-5 w-20 rounded bg-gray-200" />
        <div className="h-9 w-full rounded bg-gray-200" />
      </div>
    </div>
  );
}

export function ProductGrid({ products, loading = false }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <PackageOpen className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">
          No products found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
