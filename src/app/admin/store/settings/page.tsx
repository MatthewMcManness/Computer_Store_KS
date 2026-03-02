'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  Boxes,
  ShoppingCart,
  Settings,
  Key,
  Power,
  Megaphone,
} from 'lucide-react';
import type { StoreSyncConfig, SyncStatus } from '@/types/store';

/**
 * Represents the status of an environment variable (configured or not).
 */
interface EnvVarStatus {
  name: string;
  configured: boolean;
}

/**
 * Admin store settings page showing sync status, store configuration, and env var status.
 *
 * Displays the last sync times and statuses for catalog, stock, and order status syncs,
 * with manual trigger buttons. Also shows store toggle, announcement text, and
 * environment variable configuration status (without revealing values).
 *
 * @returns {JSX.Element} Store settings page component
 *
 * @sideEffects
 * - Fetches sync configs from /api/admin/store/settings on mount
 * - Fetches env var status from /api/admin/store/settings/env on mount
 * - Sends POST to /api/admin/store/sync for manual sync triggers
 * - Sends PUT to /api/admin/store/settings for store config updates
 *
 * @functions_called fetch
 * @called_by Next.js App Router (/admin/store/settings)
 *
 * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
 */
export default function AdminStoreSettingsPage() {
  const [syncConfigs, setSyncConfigs] = useState<StoreSyncConfig[]>([]);
  const [envVars, setEnvVars] = useState<EnvVarStatus[]>([]);
  const [storeEnabled, setStoreEnabled] = useState(false);
  const [storeAnnouncement, setStoreAnnouncement] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncingType, setSyncingType] = useState<string | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [settingsRes, envRes] = await Promise.all([
          fetch('/api/admin/store/settings'),
          fetch('/api/admin/store/settings/env'),
        ]);

        if (!settingsRes.ok) throw new Error('Failed to load settings');
        const settingsData = await settingsRes.json();
        setSyncConfigs(settingsData.sync_configs || []);
        setStoreEnabled(settingsData.store_enabled ?? false);
        setStoreAnnouncement(settingsData.store_announcement || '');

        if (envRes.ok) {
          const envData = await envRes.json();
          setEnvVars(envData.variables || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
        console.error('[STORE SETTINGS] Load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  /**
   * Triggers a manual sync operation.
   *
   * @param type - The sync type to trigger ('catalog', 'stock', or 'order_status')
   *
   * @sideEffects Sends POST to /api/admin/store/sync
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const handleSync = async (type: string) => {
    setSyncingType(type);
    try {
      const response = await fetch('/api/admin/store/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (!response.ok) throw new Error('Sync failed');
      showToast(`${type.replace(/_/g, ' ')} sync started successfully`, 'success');
      // Reload sync configs after a delay
      setTimeout(async () => {
        try {
          const res = await fetch('/api/admin/store/settings');
          if (res.ok) {
            const data = await res.json();
            setSyncConfigs(data.sync_configs || []);
          }
        } catch { /* ignore reload errors */ }
      }, 3000);
    } catch (err) {
      showToast(`Failed to start ${type} sync`, 'error');
      console.error(`[STORE SETTINGS] ${type} sync error:`, err);
    } finally {
      setSyncingType(null);
    }
  };

  /**
   * Saves store configuration (enabled toggle and announcement).
   *
   * @sideEffects Sends PUT to /api/admin/store/settings
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      const response = await fetch('/api/admin/store/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_enabled: storeEnabled,
          store_announcement: storeAnnouncement || null,
        }),
      });
      if (!response.ok) throw new Error('Failed to save configuration');
      showToast('Store configuration saved', 'success');
    } catch (err) {
      showToast('Failed to save configuration', 'error');
      console.error('[STORE SETTINGS] Save config error:', err);
    } finally {
      setSavingConfig(false);
    }
  };

  /**
   * Formats an ISO datetime string for display.
   *
   * @param dateStr - ISO 8601 datetime string, or null
   * @returns Formatted date/time string or "Never"
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  /**
   * Returns a color-coded badge for sync status.
   *
   * @param status - The sync status value
   * @returns CSS classes for the status badge
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const getSyncStatusClasses = (status: SyncStatus): string => {
    switch (status) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'running':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      case 'never':
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  /**
   * Returns the icon component for a sync type.
   *
   * @param type - The sync type
   * @returns JSX icon element
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const getSyncIcon = (type: string) => {
    switch (type) {
      case 'catalog':
        return <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'stock':
        return <Boxes className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'order_status':
        return <ShoppingCart className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      default:
        return <RefreshCw className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const formatSyncType = (type: string): string => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
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
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Store Settings</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
          TD Synnex sync management and store configuration
        </p>
      </div>

      <div className="space-y-6">
        {/* TD Synnex Sync Status */}
        <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <RefreshCw className="h-5 w-5 text-gray-400" />
            TD Synnex Sync
          </h2>
          <div className="space-y-4">
            {syncConfigs.length > 0 ? (
              syncConfigs.map((config) => (
                <div
                  key={config.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
                      {getSyncIcon(config.sync_type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatSyncType(config.sync_type)} Sync
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getSyncStatusClasses(config.last_sync_status)}`}>
                          {config.last_sync_status === 'never' ? 'Never Run' : config.last_sync_status.charAt(0).toUpperCase() + config.last_sync_status.slice(1)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="h-3 w-3" />
                          {formatDate(config.last_sync_at)}
                        </span>
                      </div>
                      {config.last_sync_message && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {config.last_sync_message}
                        </p>
                      )}
                      {config.sync_type === 'catalog' && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {config.product_count} products in catalog
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleSync(config.sync_type)}
                    disabled={syncingType === config.sync_type}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 sm:w-auto w-full"
                  >
                    {syncingType === config.sync_type ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Sync Now
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No sync configurations found. Sync configs will be created on first sync.
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
                  {['catalog', 'stock', 'order_status'].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleSync(type)}
                      disabled={syncingType === type}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {syncingType === type ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Sync {formatSyncType(type)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Store Configuration */}
        <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <Settings className="h-5 w-5 text-gray-400" />
            Store Configuration
          </h2>
          <div className="space-y-4">
            {/* Store Enabled Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Store Enabled</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Toggle the entire store on or off
                </p>
              </div>
              <button
                onClick={() => setStoreEnabled(!storeEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  storeEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    storeEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Announcement */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Megaphone className="h-4 w-4" />
                Announcement Banner Text
              </label>
              <input
                type="text"
                value={storeAnnouncement}
                onChange={(e) => setStoreAnnouncement(e.target.value)}
                placeholder="e.g., Grand opening sale - 10% off everything!"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleSaveConfig}
              disabled={savingConfig}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {savingConfig ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Save Configuration
            </button>
          </div>
        </div>

        {/* Environment Variables Status */}
        <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <Key className="h-5 w-5 text-gray-400" />
            Environment Variables
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Shows which required environment variables are configured. Values are never revealed.
          </p>
          {envVars.length > 0 ? (
            <div className="space-y-2">
              {envVars.map((v) => (
                <div
                  key={v.name}
                  className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2.5"
                >
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{v.name}</span>
                  {v.configured ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 dark:text-green-400">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Configured
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Not Configured
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Environment variable status not available. The settings API endpoint may need to be implemented.
              </p>
            </div>
          )}
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
