'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Loader2,
  RefreshCw,
  Monitor,
  Wifi,
  WifiOff,
  Circle,
  ChevronDown,
} from 'lucide-react';
import { DeviceCard } from './device-card';
import type { NinjaOneDevice } from '@/lib/ninjaone';

/**
 * Props for the DeviceList component.
 */
interface DeviceListProps {
  /** Initial devices to display (optional, will fetch if not provided) */
  initialDevices?: NinjaOneDevice[];
  /** Filter devices by customer email/org name */
  customerSearch?: string;
  /** Callback when a device is selected */
  onSelect?: (device: NinjaOneDevice) => void;
  /** Currently selected device ID */
  selectedDeviceId?: number;
  /** Show as compact list */
  compact?: boolean;
}

type StatusFilter = 'all' | 'online' | 'offline';
type DeviceClassFilter = 'all' | 'WINDOWS_WORKSTATION' | 'WINDOWS_SERVER' | 'MAC' | 'LINUX';

/**
 * Displays a list of NinjaOne devices with search and filter capabilities.
 *
 * @param props - Component properties
 * @returns JSX element
 *
 * @example
 * <DeviceList onSelect={(device) => console.log(device)} />
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export function DeviceList({
  initialDevices,
  customerSearch,
  onSelect,
  selectedDeviceId,
  compact = false,
}: DeviceListProps) {
  const [devices, setDevices] = useState<NinjaOneDevice[]>(initialDevices || []);
  const [loading, setLoading] = useState(!initialDevices);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [classFilter, setClassFilter] = useState<DeviceClassFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  /**
   * Fetches devices from the API.
   */
  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let endpoint = '/api/ninjaone/devices';
      const params = new URLSearchParams();

      if (customerSearch) {
        endpoint = `/api/ninjaone/devices/customer/${encodeURIComponent(customerSearch)}`;
      } else {
        if (statusFilter !== 'all') {
          params.set('status', statusFilter);
        }
        if (classFilter !== 'all') {
          params.set('deviceClass', classFilter);
        }
        if (searchQuery) {
          params.set('search', searchQuery);
        }
      }

      const queryString = params.toString();
      const url = queryString ? `${endpoint}?${queryString}` : endpoint;

      const response = await fetch(url);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to fetch devices');
      }

      const data = await response.json();
      setDevices(data.devices || []);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  }, [customerSearch, statusFilter, classFilter, searchQuery]);

  // Fetch devices on mount and when filters change
  useEffect(() => {
    if (!initialDevices) {
      fetchDevices();
    }
  }, [fetchDevices, initialDevices]);

  // Filter devices locally when we have initialDevices
  const filteredDevices = initialDevices
    ? devices.filter((device) => {
        // Status filter
        if (statusFilter !== 'all' && device.status !== statusFilter) {
          return false;
        }
        // Class filter
        if (classFilter !== 'all' && device.deviceClass !== classFilter) {
          return false;
        }
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesName = device.name.toLowerCase().includes(query);
          const matchesSystemName = device.systemName?.toLowerCase().includes(query);
          const matchesSerial = device.hardware.serialNumber?.toLowerCase().includes(query);
          if (!matchesName && !matchesSystemName && !matchesSerial) {
            return false;
          }
        }
        return true;
      })
    : devices;

  // Count by status
  const statusCounts = {
    all: devices.length,
    online: devices.filter((d) => d.status === 'online').length,
    offline: devices.filter((d) => d.status === 'offline').length,
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or serial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Filter Toggle & Refresh */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
              showFilters || statusFilter !== 'all' || classFilter !== 'all'
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={fetchDevices}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 space-y-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all' as const, label: 'All', icon: Monitor, count: statusCounts.all },
                { value: 'online' as const, label: 'Online', icon: Wifi, count: statusCounts.online },
                { value: 'offline' as const, label: 'Offline', icon: WifiOff, count: statusCounts.offline },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    statusFilter === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <option.icon className="h-4 w-4" />
                  {option.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-xs ${
                    statusFilter === option.value
                      ? 'bg-blue-500'
                      : 'bg-gray-100 dark:bg-gray-600'
                  }`}>
                    {option.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Device Class Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Device Type
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all' as const, label: 'All Types' },
                { value: 'WINDOWS_WORKSTATION' as const, label: 'Windows PC' },
                { value: 'WINDOWS_SERVER' as const, label: 'Windows Server' },
                { value: 'MAC' as const, label: 'Mac' },
                { value: 'LINUX' as const, label: 'Linux' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setClassFilter(option.value)}
                  className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    classFilter === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-4 text-red-700 dark:text-red-400">
          {error}
          <button
            onClick={fetchDevices}
            className="ml-2 font-medium underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredDevices.length === 0 && (
        <div className="text-center py-12">
          <Monitor className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No devices found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery || statusFilter !== 'all' || classFilter !== 'all'
              ? 'Try adjusting your filters'
              : customerSearch
              ? 'No devices found for this customer'
              : 'No devices are registered in NinjaOne'}
          </p>
        </div>
      )}

      {/* Device Grid */}
      {!loading && !error && filteredDevices.length > 0 && (
        <div className={compact ? 'space-y-2' : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'}>
          {filteredDevices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              showLink={!onSelect}
              onSelect={onSelect}
              selected={selectedDeviceId === device.id}
            />
          ))}
        </div>
      )}

      {/* Results count */}
      {!loading && filteredDevices.length > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Showing {filteredDevices.length} device{filteredDevices.length === 1 ? '' : 's'}
          {(searchQuery || statusFilter !== 'all' || classFilter !== 'all') && ` of ${devices.length}`}
        </p>
      )}
    </div>
  );
}

export default DeviceList;
