'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  X,
  Loader2,
  Link as LinkIcon,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import type { Device } from '@/lib/devices';
import type { EsetDevice } from '@/lib/eset';

/**
 * Props for the LinkEsetDialog component.
 */
interface LinkEsetDialogProps {
  /** The device to link */
  device: Device;
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** Callback when device is successfully linked */
  onLinked?: (device: Device) => void;
}

/**
 * Returns status display info for an ESET functionality status.
 *
 * @param status - ESET device functionality status
 * @returns Object with color, icon, and label
 *
 * @version 1.0.0 - 2026-02-03T22:58:18Z - Initial implementation
 */
function getEsetStatusInfo(status: EsetDevice['functionalityStatus']) {
  switch (status) {
    case 'OK':
      return {
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        Icon: ShieldCheck,
        label: 'OK',
      };
    case 'ATTENTION_RECOMMENDED':
      return {
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        Icon: Shield,
        label: 'Attention Recommended',
      };
    case 'ATTENTION_REQUIRED':
      return {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        Icon: ShieldAlert,
        label: 'Attention Required',
      };
    default:
      return {
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        Icon: Shield,
        label: 'Unknown',
      };
  }
}

/**
 * Dialog for searching and linking an ESET device to a local device.
 *
 * Follows the same pattern as LinkNinjaOneDialog: modal with search input,
 * fetches ESET devices from /api/eset/devices, allows selection and linking.
 *
 * @param props - Component properties
 * @returns JSX element
 *
 * @example
 * <LinkEsetDialog
 *   device={device}
 *   isOpen={showDialog}
 *   onClose={() => setShowDialog(false)}
 *   onLinked={() => refreshDevice()}
 * />
 *
 * @functions_called getEsetStatusInfo
 * @called_by DeviceDetailPage
 *
 * @version 1.0.0 - 2026-02-03T22:58:18Z - Initial implementation
 */
export function LinkEsetDialog({
  device,
  isOpen,
  onClose,
  onLinked,
}: LinkEsetDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [esetDevices, setEsetDevices] = useState<EsetDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<EsetDevice | null>(null);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Search for ESET devices.
   */
  const searchDevices = useCallback(async (query: string) => {
    setSearching(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (query.trim()) {
        params.set('search', query.trim());
      }

      const response = await fetch(`/api/eset/devices?${params}`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to search ESET devices');
      }

      const data = await response.json();
      setEsetDevices(data.devices || []);
    } catch (err) {
      console.error('Failed to search ESET devices:', err);
      setError(err instanceof Error ? err.message : 'Failed to search devices');
      setEsetDevices([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // Initial load - fetch all devices
  useEffect(() => {
    if (isOpen) {
      searchDevices('');
    }
  }, [isOpen, searchDevices]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      searchDevices(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, isOpen, searchDevices]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedDevice(null);
      setError(null);
    }
  }, [isOpen]);

  /**
   * Link the selected ESET device to the local device.
   */
  const handleLink = async () => {
    if (!selectedDevice) return;

    setLinking(true);
    setError(null);

    try {
      const response = await fetch(`/api/devices/${device.id}/link-eset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eset_device_id: selectedDevice.uuid,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to link device');
      }

      const data = await response.json();
      onLinked?.(data.device);
      onClose();
    } catch (err) {
      console.error('Failed to link device:', err);
      setError(err instanceof Error ? err.message : 'Failed to link device');
    } finally {
      setLinking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-900 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Link to ESET Device
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Search and select an ESET managed device to link with &quot;{device.name}&quot;
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by device name, OS, or IP..."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-4 mt-4 rounded-lg bg-red-50 dark:bg-red-900/30 p-3 flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Device List */}
        <div className="flex-1 overflow-y-auto p-4">
          {searching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : esetDevices.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Shield className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p>No ESET devices found</p>
              {searchQuery && (
                <p className="text-sm mt-1">Try a different search term</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {esetDevices.map((esetDevice) => {
                const isSelected = selectedDevice?.uuid === esetDevice.uuid;
                const statusInfo = getEsetStatusInfo(esetDevice.functionalityStatus);
                const StatusIcon = statusInfo.Icon;

                return (
                  <button
                    key={esetDevice.uuid}
                    onClick={() => setSelectedDevice(esetDevice)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 p-2 rounded-lg ${statusInfo.bgColor}`}>
                        <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {esetDevice.displayName}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {esetDevice.operatingSystem || 'Unknown OS'}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-gray-500">
                          {esetDevice.lastSyncTime && (
                            <span>
                              Last sync: {new Date(esetDevice.lastSyncTime).toLocaleDateString()}
                            </span>
                          )}
                          {esetDevice.primaryLocalIpAddress && (
                            <span>IP: {esetDevice.primaryLocalIpAddress}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedDevice ? (
              <>
                Selected: <span className="font-medium text-gray-900 dark:text-white">{selectedDevice.displayName}</span>
              </>
            ) : (
              'Select a device to link'
            )}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={linking}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleLink}
              disabled={!selectedDevice || linking}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {linking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Linking...
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4" />
                  Link Device
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LinkEsetDialog;
