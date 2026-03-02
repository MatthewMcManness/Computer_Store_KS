'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  ShoppingCart,
  ExternalLink,
} from 'lucide-react';
import type { StoreOrder, OrderStatus } from '@/types/store';

/** Number of orders per page. */
const PER_PAGE = 20;

/** All order statuses for the filter dropdown. */
const ORDER_STATUSES: { value: OrderStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'payment_confirmed', label: 'Payment Confirmed' },
  { value: 'submitted_to_supplier', label: 'Submitted to Supplier' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

/**
 * Admin order management page with search, status filtering, and pagination.
 *
 * Displays a table of customer orders fetched from the admin API. Supports
 * searching by order number, customer email, or customer name, and filtering
 * by order status. Each row links to the order detail page.
 *
 * @returns {JSX.Element} Order management page component
 *
 * @sideEffects
 * - Fetches order data from /api/admin/store/orders on mount and filter change
 *
 * @functions_called fetch
 * @called_by Next.js App Router (/admin/store/orders)
 *
 * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
 */
export default function AdminStoreOrdersPage() {
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  /**
   * Loads orders from the admin API with current filters and pagination.
   *
   * @sideEffects Fetches from /api/admin/store/orders and updates state
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(PER_PAGE),
      });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const response = await fetch(`/api/admin/store/orders?${params}`);
      if (!response.ok) throw new Error('Failed to load orders');
      const data = await response.json();
      setOrders(data.orders || []);
      setTotalPages(data.total_pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      console.error('[STORE ORDERS] Load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  /**
   * Returns Tailwind CSS classes for an order status badge.
   *
   * @param status - The order status value
   * @returns CSS class string for the badge
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const getStatusBadgeClasses = (status: OrderStatus): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'payment_confirmed':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      case 'submitted_to_supplier':
        return 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400';
      case 'processing':
        return 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-400';
      case 'shipped':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400';
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'refunded':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  /**
   * Formats an order status value into a display label.
   *
   * @param status - The order status value
   * @returns Human-readable status label
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const formatStatus = (status: string): string => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  /**
   * Formats an ISO datetime string for display.
   *
   * @param dateStr - ISO 8601 datetime string
   * @returns Formatted date string
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  /**
   * Formats a number as a USD currency string.
   *
   * @param amount - Dollar amount
   * @returns Formatted currency string
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
          {total} total orders
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order #, email, or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
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
      ) : orders.length === 0 ? (
        <div className="rounded-xl bg-white dark:bg-gray-900 p-8 sm:p-12 text-center shadow-sm">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No orders found</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {search || statusFilter
              ? 'Try adjusting your filters.'
              : 'Orders will appear here once customers start checking out.'}
          </p>
        </div>
      ) : (
        <>
          {/* Orders Table */}
          <div className="overflow-x-auto rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Order #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Customer
                  </th>
                  <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Total
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {order.order_number}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {order.customer_name}
                    </td>
                    <td className="hidden sm:table-cell whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {order.customer_email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClasses(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="hidden md:table-cell whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link
                        href={`/admin/store/orders/${order.id}`}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        View
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages} ({total} orders)
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
    </div>
  );
}
