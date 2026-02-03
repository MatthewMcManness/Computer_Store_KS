'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, Link as LinkIcon, Unlink, Package } from 'lucide-react';
import { DeviceHeader } from '@/components/admin/devices/device-header';
import { HardwarePanel } from '@/components/admin/devices/hardware-panel';
import { SystemPanel } from '@/components/admin/devices/system-panel';
import { NetworkPanel } from '@/components/admin/devices/network-panel';
import { DeviceActions } from '@/components/admin/devices/device-actions';
import { LinkAssetDialog } from '@/components/admin/devices/link-asset-dialog';
import type { NinjaOneDevice } from '@/lib/ninjaone';

/**
 * Device mapping information from API.
 */
interface DeviceMapping {
  id: string;
  assetId: number;
  syncStatus: string;
  lastSyncAt: string;
}

/**
 * Asset information from rs_assets.
 */
interface LinkedAsset {
  id: number;
  repairshoprId: number;
  name: string;
  assetTypeName?: string;
  customerId?: number;
}

/**
 * Admin Device Detail Page
 *
 * Displays comprehensive information about a NinjaOne managed device
 * including hardware, system, network details, and quick actions.
 *
 * @returns JSX element
 *
 * @sideEffects
 * - Fetches device data from NinjaOne API
 * - Fetches linked asset information
 * - Redirects to login if not authenticated
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export default function DeviceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const deviceId = params?.id as string;

  const [device, setDevice] = useState<NinjaOneDevice | null>(null);
  const [mapping, setMapping] = useState<DeviceMapping | null>(null);
  const [linkedAsset, setLinkedAsset] = useState<LinkedAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  // Check authentication
  useEffect(() => {
    fetch('/api/auth/check')
      .then(res => {
        if (!res.ok) router.push('/login');
      })
      .catch(() => router.push('/login'));
  }, [router]);

  /**
   * Fetches device details from the API.
   */
  const loadDevice = useCallback(async () => {
    if (!deviceId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ninjaone/devices/${deviceId}`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load device');
      }

      const data = await response.json();
      setDevice(data.device);
      setMapping(data.mapping);

      // If there's a mapping, fetch the linked asset details
      if (data.mapping?.assetId) {
        try {
          const assetResponse = await fetch(`/api/repairshopr/assets/${data.mapping.assetId}`);
          if (assetResponse.ok) {
            const assetData = await assetResponse.json();
            setLinkedAsset(assetData.asset);
          }
        } catch (assetErr) {
          console.error('Failed to load linked asset:', assetErr);
        }
      }
    } catch (err) {
      console.error('Failed to load device:', err);
      setError(err instanceof Error ? err.message : 'Failed to load device');
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  // Load device on mount
  useEffect(() => {
    loadDevice();
  }, [loadDevice]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Device not found'}</p>
        <button
          onClick={() => router.push('/admin/devices')}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Back to Devices
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Device Header */}
      <DeviceHeader device={device} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Hardware & System */}
        <div className="lg:col-span-2 space-y-6">
          <HardwarePanel hardware={device.hardware} />
          <SystemPanel
            osDetails={device.osDetails}
            os={device.os}
            createdAt={device.createdAt}
            lastSeen={device.lastSeen}
          />
          <NetworkPanel adapters={device.networkAdapters} />
        </div>

        {/* Right Column - Actions & Linked Asset */}
        <div className="space-y-6">
          {/* Linked Asset Panel */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-500" />
              Linked Asset
            </h2>

            {mapping && linkedAsset ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {linkedAsset.name}
                  </p>
                  {linkedAsset.assetTypeName && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {linkedAsset.assetTypeName}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    ID: {linkedAsset.id} • Synced: {mapping.syncStatus}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/admin/customers/${linkedAsset.customerId}`)}
                    disabled={!linkedAsset.customerId}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                  >
                    View Customer
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm('Unlink this device from the asset?')) return;
                      try {
                        await fetch(`/api/admin/device-mappings/${mapping.id}`, {
                          method: 'DELETE',
                        });
                        setMapping(null);
                        setLinkedAsset(null);
                      } catch (err) {
                        console.error('Failed to unlink:', err);
                      }
                    }}
                    className="px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Unlink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400 mb-3">
                  No asset linked to this device
                </p>
                <button
                  onClick={() => setShowLinkDialog(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <LinkIcon className="h-4 w-4" />
                  Link to Asset
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <DeviceActions device={device} onActionComplete={loadDevice} />

          {/* Device Notes */}
          {device.notes && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Notes
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">
                {device.notes}
              </p>
            </div>
          )}

          {/* Tags */}
          {device.tags && device.tags.length > 0 && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {device.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Link Asset Dialog */}
      {device && (
        <LinkAssetDialog
          device={device}
          isOpen={showLinkDialog}
          onClose={() => setShowLinkDialog(false)}
          onLinked={loadDevice}
        />
      )}
    </div>
  );
}
