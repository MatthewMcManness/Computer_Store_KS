/**
 * Horizontal scrollable category navigation.
 *
 * Renders pill-style links for each category plus an "All" option.
 * Highlights the currently active category based on URL.
 *
 * @param categories - Array of store categories to display
 * @param activeSlug - Currently active category slug (empty for all)
 *
 * @functions_called none
 * @called_by StoreProductsPage, StoreLayout
 *
 * @version 1.0.0 - 2026-03-02T19:01:13Z - Initial implementation
 */

import Link from 'next/link';
import type { StoreCategory } from '@/types/store';
import { clsx } from 'clsx';

interface CategoryNavProps {
  categories: StoreCategory[];
  activeSlug?: string;
}

export function CategoryNav({ categories, activeSlug = '' }: CategoryNavProps) {
  return (
    <nav
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
      aria-label="Product categories"
    >
      <Link
        href="/store/products"
        className={clsx(
          'flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
          !activeSlug
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        )}
      >
        All
      </Link>

      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/store/products?category=${cat.slug}`}
          className={clsx(
            'flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap',
            activeSlug === cat.slug
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          {cat.name}
        </Link>
      ))}
    </nav>
  );
}
