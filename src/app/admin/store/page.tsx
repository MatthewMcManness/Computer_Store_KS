'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Package,
  ShoppingCart,
  DollarSign,
  RefreshCw,
  Settings,
  TrendingUp,
  Clock,
  AlertCircle,
  Loader2,
  Tag,
  Boxes,
  CheckCircle,
} from 'lucide-react';
import type { StoreDashboardStats } from '@/types/store';

/**
 * Admin store dashboard page displaying aggregated statistics and quick actions.
 *
 * Fetches dashboard stats from the admin API and renders summary cards
 * for products, orders, revenue, and sync status. Provides quick action
 * buttons for common store management tasks.
 *
 * @returns {JSX.Element} Store dashboard page component
 *
 * @sideEffects
 * - Fetches data from /api/admin/store/dashboard on mount
 * - Triggers sync operations via /api/admin/store/sync on button click
 *
 * @functions_called fetch
 * @called_by Next.js App Router (/admin/store)
 *
 * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
 */
export default function AdminStoreDashboardPage() {
  const [stats, setStats] = useState<StoreDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncingCatalog, setSyncingCatalog] = useState(false);
  const [syncingStock, setSyncingStock] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/admin/store/dashboard');
        if (!response.ok) {
          throw new Error('Failed to load dashboard stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        console.error('[STORE DASHBOARD] Load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  /**
   * Triggers a catalog or stock sync operation via the admin API.
   *
   * @param type - The sync type to trigger ('catalog' or 'stock')
   *
   * @sideEffects
   * - Sends POST to /api/admin/store/sync
   * - Updates loading state and shows toast on completion
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const handleSync = async (type: 'catalog' | 'stock') => {
    const setter = type === 'catalog' ? setSyncingCatalog : setSyncingStock;
    setter(true);
    try {
      const response = await fetch('/api/admin/store/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (!response.ok) {
        throw new Error(`Sync failed`);
      }
      showToast(`${type === 'catalog' ? 'Catalog' : 'Stock'} sync started successfully`, 'success');
      // Reload stats after a short delay to pick up new sync status
      setTimeout(async () => {
        try {
          const res = await fetch('/api/admin/store/dashboard');
          if (res.ok) setStats(await res.json());
        } catch { /* ignore reload errors */ }
      }, 2000);
    } catch (err) {
      showToast(`Failed to start ${type} sync`, 'error');
      console.error(`[STORE DASHBOARD] ${type} sync error:`, err);
    } finally {
      setter(false);
    }
  };

  /**
   * Formats a currency value for display.
   *
   * @param amount - Dollar amount to format
   * @returns Formatted currency string (e.g., "$1,234.56")
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  /**
   * Formats an ISO datetime string into a human-readable relative or absolute format.
   *
   * @param dateStr - ISO 8601 datetime string, or null
   * @returns Human-readable time string or "Never"
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const formatSyncTime = (dateStr: string | null): string => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Store Dashboard</h1>
          <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
            Online store overview and management
          </p>
        </div>
        <Link
          href="/admin/store/settings"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 w-full sm:w-auto"
        >
          <Settings className="h-4 w-4" />
          Store Settings
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        {/* Total Products */}
        <div className="rounded-xl bg-white dark:bg-gray-900 p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Products</p>
            <Package className="h-5 w-5 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.total_products ?? 0}
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            {stats?.active_products ?? 0} active
          </p>
        </div>

        {/* In Stock */}
        <div className="rounded-xl bg-white dark:bg-gray-900 p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">In Stock</p>
            <Boxes className="h-5 w-5 text-green-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {stats?.in_stock_products ?? 0}
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            products available
          </p>
        </div>

        {/* Total Orders */}
        <div className="rounded-xl bg-white dark:bg-gray-900 p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
            <ShoppingCart className="h-5 w-5 text-purple-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.total_orders ?? 0}
          </p>
          <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
            {stats?.pending_orders ?? 0} pending
          </p>
        </div>

        {/* Revenue This Month */}
        <div className="rounded-xl bg-white dark:bg-gray-900 p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">Revenue (Month)</p>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {formatCurrency(stats?.revenue_month ?? 0)}
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            {formatCurrency(stats?.revenue_today ?? 0)} today
          </p>
        </div>
      </div>

      {/* Sync Status & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sync Status */}
        <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sync Status</h2>
          <div className="space-y-4">
            {/* Catalog Sync */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Catalog Sync</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatSyncTime(stats?.last_catalog_sync ?? null)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleSync('catalog')}
                disabled={syncingCatalog}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                {syncingCatalog ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                Sync
              </button>
            </div>

            {/* Stock Sync */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                  <Boxes className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Stock Sync</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatSyncTime(stats?.last_stock_sync ?? null)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleSync('stock')}
                disabled={syncingStock}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                {syncingStock ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                Sync
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/store/products"
              className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Products</span>
            </Link>
            <Link
              href="/admin/store/orders"
              className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ShoppingCart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Orders</span>
            </Link>
            <Link
              href="/admin/store/pricing"
              className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Tag className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Pricing</span>
            </Link>
            <Link
              href="/admin/store/settings"
              className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Settings className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-md rounded-lg p-4 shadow-lg ${
          toast.type === 'success'
            ? 'border-l-4 border-green-500 bg-white dark:bg-gray-900'
            : 'border-l-4 border-red-500 bg-white dark:bg-gray-900'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
            <p className={`text-sm font-medium ${
              toast.type === 'success' ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'
            }`}>
              {toast.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
