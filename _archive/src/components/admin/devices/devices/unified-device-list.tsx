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
  Plus,
  Shield,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { UnifiedDeviceCard } from './unified-device-card';
import { DeviceFormModal } from './device-form';
import type { Device, DeviceProtectionTier } from '@/lib/devices';

/**
 * Props for the UnifiedDeviceList component.
 */
interface UnifiedDeviceListProps {
  /** Initial devices to display (optional, will fetch if not provided) */
  initialDevices?: Device[];
  /** Filter devices by customer ID */
  customerId?: number;
  /** Callback when a device is selected */
  onSelect?: (device: Device) => void;
  /** Currently selected device ID */
  selectedDeviceId?: number;
  /** Show as compact list */
  compact?: boolean;
  /** Hide the "Add Device" button */
  hideAddButton?: boolean;
  /** Callback when a new device is created */
  onDeviceCreated?: (device: Device) => void;
}

type StatusFilter = 'all' | 'online' | 'offline';
type TierFilter = 'all' | 'eset' | 'silver' | 'silver-plus' | 'unmanaged';
type DeviceTypeFilter = 'all' | 'Desktop' | 'Laptop' | 'Server' | 'Parts';

/**
 * Displays a list of unified devices with search and filter capabilities.
 *
 * This component fetches from the unified /api/devices endpoint and supports:
 * - Search by name or serial number
 * - Filter by status (online/offline)
 * - Filter by protection tier
 * - Filter by device type
 * - Adding new devices
 *
 * @param props - Component properties
 * @returns JSX element
 *
 * @sideEffects
 * - Fetches devices from /api/devices on mount
 * - Refetches when filters change
 *
 * @functions_called UnifiedDeviceCard, DeviceFormModal
 * @called_by DevicesPage, CustomerDevicesSection
 *
 * @example
 * <UnifiedDeviceList onSelect={(device) => console.log(device)} />
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export function UnifiedDeviceList({
  initialDevices,
  customerId,
  onSelect,
  selectedDeviceId,
  compact = false,
  hideAddButton = false,
  onDeviceCreated,
}: UnifiedDeviceListProps) {
  const [devices, setDevices] = useState<Device[]>(initialDevices || []);
  const [loading, setLoading] = useState(!initialDevices);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [typeFilter, setTypeFilter] = useState<DeviceTypeFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  /**
   * Fetches devices from the API.
   */
  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (customerId) {
        params.set('customer_id', customerId.toString());
      }
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      if (tierFilter !== 'all') {
        if (tierFilter === 'unmanaged') {
          params.set('protection_tier', 'null');
        } else {
          params.set('protection_tier', tierFilter);
        }
      }
      if (typeFilter !== 'all') {
        params.set('device_type', typeFilter);
      }
      if (searchQuery) {
        params.set('search', searchQuery);
      }

      const queryString = params.toString();
      const url = queryString ? `/api/devices?${queryString}` : '/api/devices';

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
  }, [customerId, statusFilter, tierFilter, typeFilter, searchQuery]);

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
        // Tier filter
        if (tierFilter !== 'all') {
          if (tierFilter === 'unmanaged' && device.protection_tier !== null) {
            return false;
          } else if (tierFilter !== 'unmanaged' && device.protection_tier !== tierFilter) {
            return false;
          }
        }
        // Type filter
        if (typeFilter !== 'all' && device.device_type !== typeFilter) {
          return false;
        }
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesName = device.name.toLowerCase().includes(query);
          const matchesSerial = device.serial_number?.toLowerCase().includes(query);
          const matchesModel = device.model?.toLowerCase().includes(query);
          if (!matchesName && !matchesSerial && !matchesModel) {
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

  // Count by tier
  const tierCounts = {
    all: devices.length,
    eset: devices.filter((d) => d.protection_tier === 'eset').length,
    silver: devices.filter((d) => d.protection_tier === 'silver').length,
    'silver-plus': devices.filter((d) => d.protection_tier === 'silver-plus').length,
    unmanaged: devices.filter((d) => d.protection_tier === null).length,
  };

  /**
   * Handle device creation success.
   */
  const handleDeviceCreated = (device: Device) => {
    // Add the new device to the list
    setDevices((prev) => [device, ...prev]);
    setShowAddModal(false);
    onDeviceCreated?.(device);
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
            placeholder="Search by name, serial, or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!hideAddButton && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Device</span>
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
              showFilters || statusFilter !== 'all' || tierFilter !== 'all' || typeFilter !== 'all'
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

          {/* Protection Tier Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Protection Tier
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all' as const, label: 'All Tiers', icon: Monitor, count: tierCounts.all },
                { value: 'eset' as const, label: 'ESET', icon: Shield, count: tierCounts.eset },
                { value: 'silver' as const, label: 'Silver', icon: ShieldCheck, count: tierCounts.silver },
                { value: 'silver-plus' as const, label: 'Silver+', icon: Sparkles, count: tierCounts['silver-plus'] },
                { value: 'unmanaged' as const, label: 'Unmanaged', icon: Circle, count: tierCounts.unmanaged },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTierFilter(option.value)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    tierFilter === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <option.icon className="h-4 w-4" />
                  {option.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-xs ${
                    tierFilter === option.value
                      ? 'bg-blue-500'
                      : 'bg-gray-100 dark:bg-gray-600'
                  }`}>
                    {option.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Device Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Device Type
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all' as const, label: 'All Types' },
                { value: 'Desktop' as const, label: 'Desktop' },
                { value: 'Laptop' as const, label: 'Laptop' },
                { value: 'Server' as const, label: 'Server' },
                { value: 'Parts' as const, label: 'Parts' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTypeFilter(option.value)}
                  className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    typeFilter === option.value
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
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery || statusFilter !== 'all' || tierFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your filters'
              : customerId
              ? 'No devices registered for this customer'
              : 'Get started by adding your first device'}
          </p>
          {!hideAddButton && !customerId && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Device
            </button>
          )}
        </div>
      )}

      {/* Device Grid */}
      {!loading && !error && filteredDevices.length > 0 && (
        <div className={compact ? 'space-y-2' : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'}>
          {filteredDevices.map((device) => (
            <UnifiedDeviceCard
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
          {(searchQuery || statusFilter !== 'all' || tierFilter !== 'all' || typeFilter !== 'all') && ` of ${devices.length}`}
        </p>
      )}

      {/* Add Device Modal */}
      <DeviceFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        customerId={customerId}
        onSuccess={handleDeviceCreated}
      />
    </div>
  );
}

export default UnifiedDeviceList;
