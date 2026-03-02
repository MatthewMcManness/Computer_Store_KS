'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Star,
  StarOff,
  Eye,
  EyeOff,
  DollarSign,
  Loader2,
  AlertCircle,
  ChevronLeft,
  Package,
  X,
} from 'lucide-react';
import type { StoreProduct, StoreCategory } from '@/types/store';

/** Number of products per page. */
const PER_PAGE = 25;

/**
 * Admin product management page with search, filtering, and inline toggles.
 *
 * Displays a paginated table of store products fetched from the admin API.
 * Supports searching by name/SKU, filtering by category and stock status,
 * inline toggling of featured/active flags, and expandable row details.
 *
 * @returns {JSX.Element} Product management page component
 *
 * @sideEffects
 * - Fetches product data from /api/admin/store/products on mount and filter change
 * - Fetches categories from /api/admin/store/categories on mount
 * - Sends PATCH requests to /api/admin/store/products/[id] for toggles
 * - Sends POST to /api/admin/store/sync for catalog sync
 *
 * @functions_called fetch
 * @called_by Next.js App Router (/admin/store/products)
 *
 * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
 */
export default function AdminStoreProductsPage() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [overrideModal, setOverrideModal] = useState<{ product: StoreProduct } | null>(null);
  const [overridePrice, setOverridePrice] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideExpiry, setOverrideExpiry] = useState('');
  const [savingOverride, setSavingOverride] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  /**
   * Loads products from the admin API with current filters and pagination.
   *
   * @sideEffects Fetches from /api/admin/store/products and updates component state
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(PER_PAGE),
      });
      if (search) params.set('search', search);
      if (categoryFilter) params.set('category', categoryFilter);
      if (stockFilter) params.set('stock_status', stockFilter);

      const response = await fetch(`/api/admin/store/products?${params}`);
      if (!response.ok) throw new Error('Failed to load products');
      const data = await response.json();
      setProducts(data.products || []);
      setTotalPages(data.total_pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      console.error('[STORE PRODUCTS] Load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, categoryFilter, stockFilter]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Load categories once on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/admin/store/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error('[STORE PRODUCTS] Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  /**
   * Toggles a boolean field (is_featured or is_active) on a product.
   *
   * @param productId - The product ID to update
   * @param field - The field to toggle
   * @param currentValue - The current value of the field
   *
   * @sideEffects Sends PATCH to /api/admin/store/products/[id]
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const handleToggle = async (productId: string, field: 'is_featured' | 'is_active', currentValue: boolean) => {
    setTogglingId(productId);
    try {
      const response = await fetch(`/api/admin/store/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !currentValue }),
      });
      if (!response.ok) throw new Error('Update failed');
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, [field]: !currentValue } : p))
      );
    } catch (err) {
      showToast(`Failed to update product`, 'error');
      console.error('[STORE PRODUCTS] Toggle error:', err);
    } finally {
      setTogglingId(null);
    }
  };

  /**
   * Triggers a catalog sync operation.
   *
   * @sideEffects Sends POST to /api/admin/store/sync
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const handleSyncCatalog = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/admin/store/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'catalog' }),
      });
      if (!response.ok) throw new Error('Sync failed');
      showToast('Catalog sync started', 'success');
      setTimeout(() => loadProducts(), 3000);
    } catch (err) {
      showToast('Failed to start catalog sync', 'error');
    } finally {
      setSyncing(false);
    }
  };

  /**
   * Saves a price override for a product.
   *
   * @sideEffects Sends POST to /api/admin/store/products/[id]/override
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const handleSaveOverride = async () => {
    if (!overrideModal || !overridePrice) return;
    setSavingOverride(true);
    try {
      const response = await fetch(`/api/admin/store/products/${overrideModal.product.id}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          override_price: parseFloat(overridePrice),
          reason: overrideReason || null,
          expires_at: overrideExpiry || null,
        }),
      });
      if (!response.ok) throw new Error('Failed to save override');
      showToast('Price override saved', 'success');
      setOverrideModal(null);
      setOverridePrice('');
      setOverrideReason('');
      setOverrideExpiry('');
      loadProducts();
    } catch (err) {
      showToast('Failed to save price override', 'error');
    } finally {
      setSavingOverride(false);
    }
  };

  /**
   * Formats a number as a USD currency string.
   *
   * @param amount - Dollar amount, or null
   * @returns Formatted string or dash for null
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const formatPrice = (amount: number | null): string => {
    if (amount === null || amount === undefined) return '--';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  /**
   * Returns Tailwind CSS classes for a stock status badge.
   *
   * @param status - The stock status value
   * @returns CSS class string for the badge
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const getStockBadgeClasses = (status: string): string => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'low_stock':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'out_of_stock':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'discontinued':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  const formatStockLabel = (status: string): string => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Debounced search: reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, stockFilter]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
            {total} products in catalog
          </p>
        </div>
        <button
          onClick={handleSyncCatalog}
          disabled={syncing}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 w-full sm:w-auto"
        >
          {syncing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Sync Catalog
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, SKU, or manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Stock Filter */}
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Stock</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
          <option value="discontinued">Discontinued</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl bg-white dark:bg-gray-900 p-8 sm:p-12 text-center shadow-sm">
          <Package className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No products found</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {search || categoryFilter || stockFilter
              ? 'Try adjusting your filters.'
              : 'Sync the catalog to import products from TD Synnex.'}
          </p>
        </div>
      ) : (
        <>
          {/* Products Table */}
          <div className="overflow-x-auto rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="w-8 px-3 py-3"></th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Name
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Manufacturer
                  </th>
                  <th className="hidden xl:table-cell px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Category
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Cost
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Retail
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Override
                  </th>
                  <th className="hidden sm:table-cell px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Featured
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Active
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {products.map((product) => (
                  <>
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => setExpandedRow(expandedRow === product.id ? null : product.id)}
                    >
                      <td className="px-3 py-3 text-gray-400">
                        {expandedRow === product.id ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs font-mono text-gray-600 dark:text-gray-400">
                        {product.sku}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px] lg:max-w-[300px]">
                          {product.name}
                        </p>
                      </td>
                      <td className="hidden lg:table-cell whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {product.manufacturer || '--'}
                      </td>
                      <td className="hidden xl:table-cell whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {product.category?.name || '--'}
                      </td>
                      <td className="hidden md:table-cell whitespace-nowrap px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">
                        {formatPrice(product.cost_price)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                        {formatPrice(product.retail_price)}
                      </td>
                      <td className="hidden md:table-cell whitespace-nowrap px-4 py-3 text-right">
                        {product.price_override ? (
                          <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                            {formatPrice(product.price_override.override_price)}
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOverrideModal({ product });
                              setOverridePrice('');
                              setOverrideReason('');
                              setOverrideExpiry('');
                            }}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Set
                          </button>
                        )}
                      </td>
                      <td className="hidden sm:table-cell whitespace-nowrap px-4 py-3 text-center">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStockBadgeClasses(product.stock_status)}`}>
                          {formatStockLabel(product.stock_status)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggle(product.id, 'is_featured', product.is_featured);
                          }}
                          disabled={togglingId === product.id}
                          className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                          title={product.is_featured ? 'Remove featured' : 'Set featured'}
                        >
                          {product.is_featured ? (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          ) : (
                            <StarOff className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                          )}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggle(product.id, 'is_active', product.is_active);
                          }}
                          disabled={togglingId === product.id}
                          className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                          title={product.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {product.is_active ? (
                            <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                          )}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOverrideModal({ product });
                            setOverridePrice(
                              product.price_override
                                ? String(product.price_override.override_price)
                                : ''
                            );
                            setOverrideReason('');
                            setOverrideExpiry('');
                          }}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <DollarSign className="h-3 w-3" />
                          Override
                        </button>
                      </td>
                    </tr>
                    {/* Expanded Row */}
                    {expandedRow === product.id && (
                      <tr key={`${product.id}-detail`} className="bg-gray-50 dark:bg-gray-800/50">
                        <td colSpan={12} className="px-6 py-4">
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                              <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Manufacturer Part</p>
                              <p className="mt-1 text-sm text-gray-900 dark:text-white">{product.manufacturer_part || '--'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">MSRP</p>
                              <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatPrice(product.msrp)}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Weight</p>
                              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                {product.weight_lbs ? `${product.weight_lbs} lbs` : '--'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Stock Quantity</p>
                              <p className="mt-1 text-sm text-gray-900 dark:text-white">{product.stock_quantity}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Effective Price</p>
                              <p className="mt-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                {formatPrice(product.effective_price ?? product.retail_price)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Last Synced</p>
                              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                {product.last_synced_at
                                  ? new Date(product.last_synced_at).toLocaleString()
                                  : 'Never'}
                              </p>
                            </div>
                            {product.short_description && (
                              <div className="sm:col-span-2 lg:col-span-3">
                                <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Description</p>
                                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                  {product.short_description}
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages} ({total} products)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Price Override Modal */}
      {overrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Price Override</h3>
              <button
                onClick={() => setOverrideModal(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 truncate">
              {overrideModal.product.name}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Override Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={overridePrice}
                  onChange={(e) => setOverridePrice(e.target.value)}
                  placeholder={formatPrice(overrideModal.product.retail_price)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason (optional)
                </label>
                <input
                  type="text"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g., Clearance sale"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expires At (optional)
                </label>
                <input
                  type="datetime-local"
                  value={overrideExpiry}
                  onChange={(e) => setOverrideExpiry(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setOverrideModal(null)}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveOverride}
                  disabled={!overridePrice || savingOverride}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingOverride && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Override
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-md rounded-lg p-4 shadow-lg ${
          toast.type === 'success'
            ? 'border-l-4 border-green-500 bg-white dark:bg-gray-900'
            : 'border-l-4 border-red-500 bg-white dark:bg-gray-900'
        }`}>
          <p className={`text-sm font-medium ${
            toast.type === 'success' ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'
          }`}>
            {toast.message}
          </p>
        </div>
      )}
    </div>
  );
}
