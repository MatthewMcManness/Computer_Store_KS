/**
 * Product listing page (/store/products).
 *
 * Server component that displays a filterable, sortable, paginated grid
 * of products. Reads filter state from URL search params: category, search,
 * page, min_price, max_price, in_stock, sort, and manufacturer.
 *
 * @param searchParams - URL query parameters from the request
 * @returns Product listing with search, filters, grid, and pagination
 *
 * @sideEffects
 * - Reads from store_products, store_categories tables via getProducts, getCategories, getCategoryBySlug
 *
 * @functions_called getProducts, getCategories, getCategoryBySlug, formatPrice
 * @called_by Next.js App Router (route: /store/products)
 *
 * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  SlidersHorizontal,
  Monitor,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Tag,
  X,
} from 'lucide-react';
import { getProducts, getCategories, getCategoryBySlug } from '@/lib/store/products';
import { formatPrice } from '@/lib/store/pricing';
import type { StoreProduct, ProductListParams } from '@/types/store';

export const dynamic = 'force-dynamic';

/**
 * Generate dynamic metadata based on the current category filter.
 *
 * @param searchParams - URL search params
 * @returns Metadata with category-specific or generic title/description
 *
 * @functions_called getCategoryBySlug
 * @called_by Next.js metadata API
 *
 * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const categorySlug = typeof params.category === 'string' ? params.category : undefined;

  if (categorySlug) {
    const category = await getCategoryBySlug(categorySlug);
    if (category) {
      return {
        title: `${category.name} | Online Store`,
        description: category.description ?? `Browse ${category.name} products at Computer Store Kansas.`,
      };
    }
  }

  return {
    title: 'All Products | Online Store',
    description: 'Browse our full selection of computer parts, accessories, and refurbished systems.',
  };
}

/** Available sort options for the product listing. */
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A-Z' },
  { value: 'name_desc', label: 'Name: Z-A' },
] as const;

export default async function ProductListingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  // Parse search params
  const category = typeof params.category === 'string' ? params.category : undefined;
  const search = typeof params.search === 'string' ? params.search : undefined;
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) || 1 : 1;
  const minPrice = typeof params.min_price === 'string' ? parseFloat(params.min_price) : undefined;
  const maxPrice = typeof params.max_price === 'string' ? parseFloat(params.max_price) : undefined;
  const inStock = params.in_stock === 'true';
  const sort = typeof params.sort === 'string' ? params.sort as ProductListParams['sort'] : undefined;
  const manufacturer = typeof params.manufacturer === 'string' ? params.manufacturer : undefined;

  // Fetch data in parallel
  const [result, categories, categoryInfo] = await Promise.all([
    getProducts({
      page,
      per_page: 24,
      category,
      search,
      min_price: minPrice,
      max_price: maxPrice,
      in_stock: inStock || undefined,
      sort,
      manufacturer,
    }),
    getCategories(),
    category ? getCategoryBySlug(category) : Promise.resolve(null),
  ]);

  // Build active filters for display
  const activeFilters: { key: string; label: string; removeHref: string }[] = [];

  if (category && categoryInfo) {
    activeFilters.push({
      key: 'category',
      label: categoryInfo.name,
      removeHref: buildFilterUrl(params, { category: undefined }),
    });
  }
  if (search) {
    activeFilters.push({
      key: 'search',
      label: `"${search}"`,
      removeHref: buildFilterUrl(params, { search: undefined }),
    });
  }
  if (inStock) {
    activeFilters.push({
      key: 'in_stock',
      label: 'In Stock Only',
      removeHref: buildFilterUrl(params, { in_stock: undefined }),
    });
  }
  if (manufacturer) {
    activeFilters.push({
      key: 'manufacturer',
      label: manufacturer,
      removeHref: buildFilterUrl(params, { manufacturer: undefined }),
    });
  }
  if (minPrice !== undefined) {
    activeFilters.push({
      key: 'min_price',
      label: `Min ${formatPrice(minPrice)}`,
      removeHref: buildFilterUrl(params, { min_price: undefined }),
    });
  }
  if (maxPrice !== undefined) {
    activeFilters.push({
      key: 'max_price',
      label: `Max ${formatPrice(maxPrice)}`,
      removeHref: buildFilterUrl(params, { max_price: undefined }),
    });
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {categoryInfo ? categoryInfo.name : 'All Products'}
        </h1>
        {categoryInfo?.description && (
          <p className="text-gray-600 mt-2">{categoryInfo.description}</p>
        )}
      </div>

      {/* Search & Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Form */}
        <form
          action="/store/products"
          method="GET"
          className="flex-1 relative"
        >
          {/* Preserve existing filters */}
          {category && <input type="hidden" name="category" value={category} />}
          {inStock && <input type="hidden" name="in_stock" value="true" />}
          {sort && <input type="hidden" name="sort" value={sort} />}
          {manufacturer && <input type="hidden" name="manufacturer" value={manufacturer} />}

          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </form>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-gray-500" />
          <div className="relative">
            <SortSelect currentSort={sort} params={params} />
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-500" />
          {activeFilters.map((filter) => (
            <Link
              key={filter.key}
              href={filter.removeHref}
              className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
            >
              {filter.label}
              <X className="h-3 w-3" />
            </Link>
          ))}
          <Link
            href="/store/products"
            className="text-xs text-gray-500 hover:text-gray-700 ml-2"
          >
            Clear all
          </Link>
        </div>
      )}

      {/* Results Count */}
      <p className="text-sm text-gray-500">
        {result.total} product{result.total !== 1 ? 's' : ''} found
      </p>

      {/* Category Sidebar + Product Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Categories</h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href={buildFilterUrl(params, { category: undefined, page: undefined })}
                  className={`block px-2 py-1.5 text-sm rounded transition-colors ${
                    !category
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  All Categories
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={buildFilterUrl(params, { category: cat.slug, page: undefined })}
                    className={`block px-2 py-1.5 text-sm rounded transition-colors ${
                      category === cat.slug
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {cat.name}
                    {cat.product_count !== undefined && (
                      <span className="text-gray-400 ml-1">({cat.product_count})</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            {/* In Stock Filter */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Availability</h3>
              <Link
                href={buildFilterUrl(params, {
                  in_stock: inStock ? undefined : 'true',
                  page: undefined,
                })}
                className={`block px-2 py-1.5 text-sm rounded transition-colors ${
                  inStock
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                In Stock Only
              </Link>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {result.products.length === 0 ? (
            <div className="text-center py-16">
              <Monitor className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No products found
              </h2>
              <p className="text-gray-500 mb-6">
                Try adjusting your filters or search terms.
              </p>
              <Link
                href="/store/products"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                View All Products
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {result.products.map((product: StoreProduct) => (
                  <ProductListCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {result.total_pages > 1 && (
                <Pagination
                  currentPage={result.page}
                  totalPages={result.total_pages}
                  params={params}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Internal Components
// ---------------------------------------------------------------------------

/**
 * Product card for the listing grid.
 *
 * @param product - Store product with effective_price
 * @returns A product card element
 *
 * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
 */
function ProductListCard({ product }: { product: StoreProduct }) {
  const price = product.effective_price ?? product.retail_price;
  const hasImage = product.images && product.images.length > 0;

  return (
    <Link
      href={`/store/products/${product.sku}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all"
    >
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {hasImage ? (
          <Image
            src={product.images[0]!}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <Monitor className="h-16 w-16" />
          </div>
        )}
        {product.stock_status === 'out_of_stock' && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
            <span className="bg-white text-gray-900 text-sm font-semibold px-3 py-1 rounded">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        {product.manufacturer && (
          <p className="text-xs text-gray-500 mb-1">{product.manufacturer}</p>
        )}
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
          {product.name}
        </h3>
        {product.short_description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">
            {product.short_description}
          </p>
        )}
        <div className="flex items-center gap-2">
          {price !== null && price !== undefined ? (
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(price)}
            </span>
          ) : (
            <span className="text-sm text-gray-500">Contact for price</span>
          )}
          {product.msrp && price && product.msrp > price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.msrp)}
            </span>
          )}
        </div>
        {product.stock_status === 'low_stock' && (
          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
            <Tag className="h-3 w-3" />
            Low stock
          </p>
        )}
      </div>
    </Link>
  );
}

/**
 * Sort select rendered as a native HTML select (server component compatible).
 *
 * Since this is a server component, the sort uses link-based navigation.
 * Each option is a link that rebuilds the URL with the new sort param.
 *
 * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
 */
function SortSelect({
  currentSort,
  params,
}: {
  currentSort: string | undefined;
  params: Record<string, string | string[] | undefined>;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {SORT_OPTIONS.map((option) => (
        <Link
          key={option.value}
          href={buildFilterUrl(params, { sort: option.value, page: undefined })}
          className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${
            currentSort === option.value || (!currentSort && option.value === 'newest')
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}

/**
 * Pagination controls for the product listing.
 *
 * @param currentPage - Current page number (1-based)
 * @param totalPages - Total number of pages
 * @param params - Current URL search params for link building
 *
 * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
 */
function Pagination({
  currentPage,
  totalPages,
  params,
}: {
  currentPage: number;
  totalPages: number;
  params: Record<string, string | string[] | undefined>;
}) {
  const pages = generatePageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label="Product pagination"
      className="flex items-center justify-center gap-1 mt-8"
    >
      {currentPage > 1 && (
        <Link
          href={buildFilterUrl(params, { page: String(currentPage - 1) })}
          className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      )}

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <Link
            key={p}
            href={buildFilterUrl(params, { page: String(p) })}
            className={`px-3.5 py-2 text-sm rounded-lg transition-colors ${
              Number(p) === currentPage
                ? 'bg-blue-600 text-white font-medium'
                : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {p}
          </Link>
        )
      )}

      {currentPage < totalPages && (
        <Link
          href={buildFilterUrl(params, { page: String(currentPage + 1) })}
          className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a URL for /store/products with modified search params.
 *
 * @param current - Current URL search params
 * @param overrides - Params to set (undefined removes the param)
 * @returns A relative URL string
 *
 * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
 */
function buildFilterUrl(
  current: Record<string, string | string[] | undefined>,
  overrides: Record<string, string | undefined>
): string {
  const merged: Record<string, string> = {};

  for (const [key, value] of Object.entries(current)) {
    if (typeof value === 'string') {
      merged[key] = value;
    }
  }

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete merged[key];
    } else {
      merged[key] = value;
    }
  }

  const qs = new URLSearchParams(merged).toString();
  return `/store/products${qs ? `?${qs}` : ''}`;
}

/**
 * Generate page numbers with ellipsis for pagination display.
 *
 * @param current - Current page number
 * @param total - Total number of pages
 * @returns Array of page numbers and ellipsis markers
 *
 * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
 */
function generatePageNumbers(
  current: number,
  total: number
): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [1];

  if (current > 3) {
    pages.push('...');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push('...');
  }

  pages.push(total);

  return pages;
}
