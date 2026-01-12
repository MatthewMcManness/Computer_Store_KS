'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Database, Users, FileText, CreditCard, Package, MessageSquare, Receipt, Check, X, Loader2, ShieldAlert, Tags } from 'lucide-react';

interface SyncCounts {
  customers?: number;
  tickets?: number;
  ticket_comments?: number;
  assets?: number;
  invoices?: number;
  products?: number;
  payments?: number;
}

interface SyncLog {
  id: number;
  sync_type: string;
  entity_type: string | null;
  started_at: string;
  completed_at: string | null;
  records_synced: number;
  records_failed: number;
  status: string;
  errors: string[] | null;
}

interface SyncResult {
  success: boolean;
  entity?: string;
  synced?: number;
  failed?: number;
  errors?: string[];
  duration?: number;
  totalSynced?: number;
  totalFailed?: number;
  results?: SyncResult[];
}

type SyncType = 'full' | 'customers' | 'tickets' | 'ticket_comments' | 'assets' | 'invoices' | 'products' | 'payments';

const syncEntities: { type: SyncType; label: string; icon: React.ReactNode; description: string }[] = [
  { type: 'customers', label: 'Customers', icon: <Users className="h-5 w-5" />, description: 'Customer profiles and contact info' },
  { type: 'tickets', label: 'Tickets', icon: <FileText className="h-5 w-5" />, description: 'Work orders and service tickets' },
  { type: 'ticket_comments', label: 'Comments', icon: <MessageSquare className="h-5 w-5" />, description: 'Ticket notes and comments' },
  { type: 'assets', label: 'Assets', icon: <Package className="h-5 w-5" />, description: 'Customer devices and equipment' },
  { type: 'invoices', label: 'Invoices', icon: <Receipt className="h-5 w-5" />, description: 'Billing invoices' },
  { type: 'products', label: 'Products', icon: <Package className="h-5 w-5" />, description: 'Inventory and products' },
  { type: 'payments', label: 'Payments', icon: <CreditCard className="h-5 w-5" />, description: 'Payment records' },
];

export default function SyncPage() {
  const [counts, setCounts] = useState<SyncCounts>({});
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<SyncType | null>(null);
  const [lastResult, setLastResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Status sync state
  const [statusSyncInfo, setStatusSyncInfo] = useState<{ totalTickets: number; totalOverrides: number; needsSync: number } | null>(null);
  const [syncingStatuses, setSyncingStatuses] = useState(false);
  const [statusSyncResult, setStatusSyncResult] = useState<{ success: boolean; created: number; errors?: number; message?: string } | null>(null);

  // Check if user is admin
  useEffect(() => {
    async function checkAdmin() {
      try {
        const response = await fetch('/api/auth/check');
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.authenticated && data.user?.role === 'admin');
        }
      } catch {
        // Ignore errors, default to non-admin
      }
    }
    checkAdmin();
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/sync?logs=20');
      if (!response.ok) {
        throw new Error('Failed to fetch sync status');
      }
      const data = await response.json();
      setCounts(data.counts || {});
      setLogs(data.logs || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Fetch status sync info
  const fetchStatusSyncInfo = useCallback(async () => {
    try {
      const response = await fetch('/api/repairshopr/tickets/sync-statuses');
      if (response.ok) {
        const data = await response.json();
        setStatusSyncInfo(data);
      }
    } catch (err) {
      console.error('Failed to fetch status sync info:', err);
    }
  }, []);

  useEffect(() => {
    fetchStatusSyncInfo();
  }, [fetchStatusSyncInfo]);

  // Run status sync
  const runStatusSync = async () => {
    setSyncingStatuses(true);
    setStatusSyncResult(null);

    try {
      const response = await fetch('/api/repairshopr/tickets/sync-statuses', {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok) {
        setStatusSyncResult(data);
        // Refresh the info
        await fetchStatusSyncInfo();
      } else {
        setStatusSyncResult({ success: false, created: 0, message: data.error || 'Sync failed' });
      }
    } catch (err) {
      setStatusSyncResult({ success: false, created: 0, message: err instanceof Error ? err.message : 'Sync failed' });
    } finally {
      setSyncingStatuses(false);
    }
  };

  // Poll for updates while syncing
  useEffect(() => {
    if (syncing) {
      const interval = setInterval(() => {
        fetchStatus();
      }, 2000); // Poll every 2 seconds
      return () => clearInterval(interval);
    }
  }, [syncing, fetchStatus]);

  const runSync = async (type: SyncType) => {
    setSyncing(type);
    setLastResult(null);
    setError(null);

    try {
      const response = await fetch('/api/admin/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Sync failed');
      }

      const data = await response.json();
      setLastResult(data.result);

      // Refresh status after sync
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Data Sync</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
          Sync RepairShopr data to Supabase for faster queries
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
            <X className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Last Sync Result */}
      {lastResult && (
        <div className={`mb-6 rounded-lg p-4 ${lastResult.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
          <div className="flex items-center gap-2">
            {lastResult.success ? (
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <X className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            )}
            <span className={lastResult.success ? 'text-green-800 dark:text-green-400' : 'text-yellow-800 dark:text-yellow-400'}>
              {lastResult.results ? (
                <>Full sync complete: {lastResult.totalSynced} synced, {lastResult.totalFailed} failed in {formatDuration(lastResult.duration || 0)}</>
              ) : (
                <>{lastResult.entity}: {lastResult.synced} synced, {lastResult.failed} failed in {formatDuration(lastResult.duration || 0)}</>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Full Sync Button - Admin Only */}
      {isAdmin ? (
        <div className="mb-8">
          <button
            onClick={() => runSync('full')}
            disabled={syncing !== null}
            className="flex items-center gap-3 rounded-xl bg-blue-600 px-6 py-4 text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncing === 'full' ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <RefreshCw className="h-6 w-6" />
            )}
            <div className="text-left">
              <p className="font-semibold">Run Full Sync</p>
              <p className="text-sm text-blue-200">Sync all entities in order</p>
            </div>
          </button>
        </div>
      ) : (
        <div className="mb-8 rounded-xl bg-yellow-50 border-2 border-yellow-200 p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-yellow-800 dark:text-yellow-200">
              Admin access required to run syncs. Contact an administrator if you need to sync data.
            </p>
          </div>
        </div>
      )}

      {/* Live Sync Progress */}
      {syncing === 'full' && (
        <div className="mb-8 rounded-xl bg-blue-50 border-2 border-blue-200 p-6 dark:bg-blue-900/20 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-4">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Full Sync In Progress...</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {syncEntities.map(({ type, label }) => {
              const entityLog = logs.find(l => l.entity_type === type && l.sync_type === 'entity');
              const isRunning = entityLog?.status === 'running';
              const isComplete = entityLog?.status === 'completed';
              const isFailed = entityLog?.status === 'failed';

              return (
                <div
                  key={type}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                    isRunning ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200' :
                    isComplete ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' :
                    isFailed ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200' :
                    'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {isRunning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isComplete ? (
                    <Check className="h-4 w-4" />
                  ) : isFailed ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border-2 border-current" />
                  )}
                  <span className="font-medium">{label}</span>
                  {isComplete && entityLog && (
                    <span className="text-xs opacity-75">({entityLog.records_synced})</span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-blue-700 dark:text-blue-300">
            Syncing all data from RepairShopr. This may take several minutes for large datasets.
          </p>
        </div>
      )}

      {/* Current Counts */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Current Synced Data</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {syncEntities.map(({ type, label, icon }) => (
            <div key={type} className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                    {icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {counts[type as keyof SyncCounts]?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Sync Buttons - Admin Only */}
      {isAdmin && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Sync Individual Entities</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {syncEntities.map(({ type, label, icon, description }) => (
              <button
                key={type}
                onClick={() => runSync(type)}
                disabled={syncing !== null}
                className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-900 text-left"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {syncing === type ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    icon
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ticket Status Sync - Admin Only */}
      {isAdmin && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Ticket Status Mapping</h2>
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400">
                  <Tags className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Sync Ticket Statuses</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Map RepairShopr statuses to custom statuses for filtering
                  </p>
                  {statusSyncInfo && (
                    <p className="mt-1 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {statusSyncInfo.totalOverrides} of {statusSyncInfo.totalTickets} tickets have status mappings
                      </span>
                      {statusSyncInfo.needsSync > 0 && (
                        <span className="ml-2 text-orange-600 dark:text-orange-400">
                          ({statusSyncInfo.needsSync} need sync)
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={runStatusSync}
                disabled={syncingStatuses || syncing !== null}
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncingStatuses ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {syncingStatuses ? 'Syncing...' : 'Sync Statuses'}
              </button>
            </div>

            {/* Status Sync Result */}
            {statusSyncResult && (
              <div className={`mt-4 rounded-lg p-3 ${statusSyncResult.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <div className="flex items-center gap-2">
                  {statusSyncResult.success ? (
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                  <span className={statusSyncResult.success ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}>
                    {statusSyncResult.message || `Created ${statusSyncResult.created} status mappings`}
                    {statusSyncResult.errors && statusSyncResult.errors > 0 && ` (${statusSyncResult.errors} errors)`}
                  </span>
                </div>
              </div>
            )}

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              This creates custom status mappings for tickets based on their RepairShopr status.
              Run this once after the initial data sync, then the webhook will handle new tickets automatically.
            </p>
          </div>
        </div>
      )}

      {/* Recent Sync Logs */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Recent Sync History</h2>
        <div className="rounded-xl bg-white shadow-sm dark:bg-gray-900 overflow-x-auto">
          {logs.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No sync operations yet
            </div>
          ) : (
            <table className="w-full min-w-[500px]">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Started</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Synced</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Failed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {log.sync_type === 'full' ? 'Full Sync' : log.entity_type || log.sync_type}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(log.started_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        log.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' :
                        log.status === 'running' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {log.records_synced.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {log.records_failed > 0 ? (
                        <span className="text-red-600 dark:text-red-400">{log.records_failed}</span>
                      ) : (
                        log.records_failed
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 rounded-xl bg-blue-50 p-6 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <Database className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">About Data Sync</h3>
            <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">
              This syncs data from RepairShopr to our Supabase database. The synced data enables faster local queries
              and provides a backup of all RepairShopr data. Run a full sync before go-live and periodically to keep
              data current.
            </p>
            <ul className="mt-3 text-sm text-blue-800 dark:text-blue-200 list-disc list-inside space-y-1">
              <li>Full sync syncs all entities in dependency order</li>
              <li>Existing records are updated (upsert behavior)</li>
              <li>Sync operations are logged for auditing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
