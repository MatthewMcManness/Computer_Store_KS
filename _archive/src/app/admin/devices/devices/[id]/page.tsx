'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  Link as LinkIcon,
  Unlink,
  Edit2,
  Trash2,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import { DeviceHeader } from '@/components/admin/devices/device-header';
import { HardwarePanel } from '@/components/admin/devices/hardware-panel';
import { SystemPanel } from '@/components/admin/devices/system-panel';
import { NetworkPanel } from '@/components/admin/devices/network-panel';
import { DeviceActions } from '@/components/admin/devices/device-actions';
import { LinkNinjaOneDialog } from '@/components/admin/devices/link-ninjaone-dialog';
import { LinkEsetDialog } from '@/components/admin/devices/link-eset-dialog';
import { EsetStatusPanel } from '@/components/admin/devices/eset-status-panel';
import { DeviceFormModal } from '@/components/admin/devices/device-form';
import { ProtectionTierBadgeWithUnmanaged } from '@/components/admin/devices/protection-tier-badge';
import type { Device } from '@/lib/devices';
import type { NinjaOneDevice } from '@/lib/ninjaone';
import type { EsetDevice } from '@/lib/eset';

/**
 * Admin Device Detail Page
 *
 * Displays comprehensive information about a device including:
 * - Basic device info (always shown)
 * - Protection tier management
 * - NinjaOne panels (hardware, system, network, actions) for Silver/Silver+ with linked NinjaOne
 * - Prompt to link NinjaOne for Silver/Silver+ without linked device
 * - Customer link
 *
 * @returns JSX element
 *
 * @sideEffects
 * - Fetches device data from unified devices API
 * - Fetches NinjaOne device data for managed devices
 * - Redirects to login if not authenticated
 *
 * @functions_called DeviceHeader, HardwarePanel, SystemPanel, NetworkPanel, DeviceActions,
 *                   LinkNinjaOneDialog, DeviceFormModal, ProtectionTierBadgeWithUnmanaged
 * @called_by AdminLayout (via routing)
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-02-03T00:00:00Z - Updated for unified devices system
 */
export default function DeviceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const deviceId = params?.id as string;

  const [device, setDevice] = useState<Device | null>(null);
  const [ninjaDevice, setNinjaDevice] = useState<NinjaOneDevice | null>(null);
  const [esetDevice, setEsetDevice] = useState<EsetDevice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showLinkEsetDialog, setShowLinkEsetDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [unlinkingEset, setUnlinkingEset] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Check authentication
  useEffect(() => {
    fetch('/api/auth/check')
      .then(res => {
        if (!res.ok) router.push('/login');
      })
      .catch(() => router.push('/login'));
  }, [router]);

  /**
   * Fetches device details from the unified devices API.
   */
  const loadDevice = useCallback(async () => {
    if (!deviceId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/devices/${deviceId}`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load device');
      }

      const data = await response.json();
      setDevice(data.device);

      // If device has NinjaOne linked, fetch NinjaOne data for hardware panels
      if (data.device.ninjaone_device_id) {
        try {
          const ninjaResponse = await fetch(`/api/ninjaone/devices/${data.device.ninjaone_device_id}`);
          if (ninjaResponse.ok) {
            const ninjaData = await ninjaResponse.json();
            setNinjaDevice(ninjaData.device);
          }
        } catch (ninjaErr) {
          console.error('Failed to load NinjaOne device data:', ninjaErr);
        }
      } else {
        setNinjaDevice(null);
      }

      // If device has ESET linked, fetch ESET data for status panel
      if (data.device.eset_device_id) {
        try {
          const esetResponse = await fetch(`/api/eset/devices/${data.device.eset_device_id}`);
          if (esetResponse.ok) {
            const esetData = await esetResponse.json();
            setEsetDevice(esetData.device);
          }
        } catch (esetErr) {
          console.error('Failed to load ESET device data:', esetErr);
        }
      } else {
        setEsetDevice(null);
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

  /**
   * Handles unlinking from NinjaOne.
   */
  const handleUnlink = async () => {
    if (!device || !device.ninjaone_device_id) return;
    if (!confirm('Unlink this device from NinjaOne? Hardware data will no longer sync.')) return;

    setUnlinking(true);
    try {
      const response = await fetch(`/api/devices/${device.id}/link-ninjaone`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to unlink device');
      }
      // Reload to refresh state
      await loadDevice();
    } catch (err) {
      console.error('Failed to unlink device:', err);
      alert(err instanceof Error ? err.message : 'Failed to unlink device');
    } finally {
      setUnlinking(false);
    }
  };

  /**
   * Handles unlinking from ESET.
   */
  const handleUnlinkEset = async () => {
    if (!device || !device.eset_device_id) return;
    if (!confirm('Unlink this device from ESET? Protection status will no longer sync.')) return;

    setUnlinkingEset(true);
    try {
      const response = await fetch(`/api/devices/${device.id}/link-eset`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to unlink device');
      }
      await loadDevice();
    } catch (err) {
      console.error('Failed to unlink ESET device:', err);
      alert(err instanceof Error ? err.message : 'Failed to unlink device');
    } finally {
      setUnlinkingEset(false);
    }
  };

  /**
   * Handles device deletion.
   */
  const handleDelete = async () => {
    if (!device) return;
    if (!confirm(`Delete "${device.name}"? This action cannot be undone.`)) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/devices/${device.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete device');
      }
      router.push('/admin/devices');
    } catch (err) {
      console.error('Failed to delete device:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete device');
      setDeleting(false);
    }
  };

  /**
   * Handles successful device update.
   */
  const handleDeviceUpdated = (updatedDevice: Device) => {
    setDevice(updatedDevice);
    setShowEditModal(false);
  };

  /**
   * Handles successful NinjaOne link.
   */
  const handleLinked = async () => {
    await loadDevice();
  };

  // Check if device should show NinjaOne panels
  const isManaged = device && (device.protection_tier === 'silver' || device.protection_tier === 'silver-plus');
  const hasNinjaOne = device && device.ninjaone_device_id;
  const showNinjaPanels = isManaged && hasNinjaOne && ninjaDevice;

  // Check if device should show ESET panels
  const isEsetTier = device && device.protection_tier === 'eset';
  const hasEset = device && device.eset_device_id;
  const showEsetPanels = isEsetTier && hasEset && esetDevice;

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
      {/* Back link - always goes to customer page */}
      <div className="mb-4">
        <Link
          href={device.customer_id ? `/admin/customers/${device.customer_id}` : '/admin/devices'}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
          {device.customer_id ? 'Back to Customer' : 'Back to Devices'}
        </Link>
      </div>

      {/* Customer name - always shown */}
      {device.customer_name && device.customer_id && (
        <div className="mb-2">
          <Link
            href={`/admin/customers/${device.customer_id}`}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            Customer: {device.customer_name}
          </Link>
        </div>
      )}

      {/* Device Header - NinjaOne header or custom header */}
      {showNinjaPanels && ninjaDevice ? (
        <div className="mb-6">
          <DeviceHeader device={ninjaDevice} />
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <ProtectionTierBadgeWithUnmanaged tier={device.protection_tier} size="md" />
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {device.name}
              </h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <ProtectionTierBadgeWithUnmanaged tier={device.protection_tier} size="md" />
                {device.device_type && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {device.device_type}
                  </span>
                )}
                {device.os && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {device.os}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Device Info & NinjaOne Panels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Device Info Panel - Always shown */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Device Information
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                <dd className="text-sm text-gray-900 dark:text-white">{device.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</dt>
                <dd className="text-sm text-gray-900 dark:text-white">{device.device_type || 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Manufacturer</dt>
                <dd className="text-sm text-gray-900 dark:text-white">{device.manufacturer || 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Model</dt>
                <dd className="text-sm text-gray-900 dark:text-white">{device.model || 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Serial Number</dt>
                <dd className="text-sm text-gray-900 dark:text-white font-mono">{device.serial_number || 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Operating System</dt>
                <dd className="text-sm text-gray-900 dark:text-white">{device.os || 'Not specified'}</dd>
              </div>
            </dl>
          </div>

          {/* NinjaOne Hardware Panel - Only for managed devices with linked NinjaOne */}
          {showNinjaPanels && ninjaDevice && (
            <>
              <HardwarePanel hardware={ninjaDevice.hardware} />
              <SystemPanel
                osDetails={ninjaDevice.osDetails}
                os={ninjaDevice.os}
                createdAt={ninjaDevice.createdAt}
                lastSeen={ninjaDevice.lastSeen}
              />
              <NetworkPanel adapters={ninjaDevice.networkAdapters} />
            </>
          )}

          {/* ESET Status Panel - Only for ESET tier with linked device */}
          {showEsetPanels && esetDevice && (
            <EsetStatusPanel
              device={esetDevice}
              unlinking={unlinkingEset}
              onUnlink={handleUnlinkEset}
            />
          )}

          {/* Prompt to link ESET - For ESET tier without linked device */}
          {isEsetTier && !hasEset && (
            <div className="rounded-lg border-2 border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2 rounded-lg bg-amber-100 dark:bg-amber-800">
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-1">
                    ESET Not Linked
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mb-4">
                    This device has an ESET protection plan but is not linked to an ESET managed device.
                    Link it to view protection status and product information.
                  </p>
                  <button
                    onClick={() => setShowLinkEsetDialog(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Link to ESET Device
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Prompt to link NinjaOne - For managed tiers without linked device */}
          {isManaged && !hasNinjaOne && (
            <div className="rounded-lg border-2 border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2 rounded-lg bg-amber-100 dark:bg-amber-800">
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-1">
                    NinjaOne Not Linked
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mb-4">
                    This device has a {device.protection_tier === 'silver-plus' ? 'Silver+' : 'Silver'} protection plan
                    but is not linked to a NinjaOne managed device. Link it to enable hardware monitoring,
                    remote access, and quick actions.
                  </p>
                  <button
                    onClick={() => setShowLinkDialog(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Link to NinjaOne Device
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
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
        </div>

        {/* Right Column - Actions & Info */}
        <div className="space-y-6">
          {/* Protection Tier Panel */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Protection Plan
            </h2>
            <div className="space-y-3">
              <ProtectionTierBadgeWithUnmanaged tier={device.protection_tier} size="lg" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {device.protection_tier === 'silver-plus'
                  ? 'NinjaOne RMM monitoring with priority support'
                  : device.protection_tier === 'silver'
                  ? 'NinjaOne RMM monitoring'
                  : device.protection_tier === 'eset'
                  ? 'ESET Protect antivirus monitoring'
                  : 'Basic device record - no active monitoring'}
              </p>
              <button
                onClick={() => setShowEditModal(true)}
                className="w-full px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                Change Protection Plan
              </button>
            </div>
          </div>

          {/* NinjaOne Link Panel */}
          {isManaged && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-blue-500" />
                NinjaOne Link
              </h2>

              {hasNinjaOne ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      Linked to NinjaOne
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Device ID: {device.ninjaone_device_id}
                    </p>
                  </div>
                  <button
                    onClick={handleUnlink}
                    disabled={unlinking}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                  >
                    {unlinking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Unlink className="h-4 w-4" />
                    )}
                    Unlink from NinjaOne
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400 mb-3 text-sm">
                    Not linked to NinjaOne
                  </p>
                  <button
                    onClick={() => setShowLinkDialog(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Link Device
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ESET Link Panel */}
          {isEsetTier && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-green-500" />
                ESET Link
              </h2>

              {hasEset ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      Linked to ESET
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-mono break-all">
                      UUID: {device.eset_device_id}
                    </p>
                  </div>
                  <button
                    onClick={handleUnlinkEset}
                    disabled={unlinkingEset}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                  >
                    {unlinkingEset ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Unlink className="h-4 w-4" />
                    )}
                    Unlink from ESET
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400 mb-3 text-sm">
                    Not linked to ESET
                  </p>
                  <button
                    onClick={() => setShowLinkEsetDialog(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Link Device
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions - Only for managed devices with linked NinjaOne */}
          {showNinjaPanels && ninjaDevice && (
            <DeviceActions device={ninjaDevice} onActionComplete={loadDevice} />
          )}
        </div>
      </div>

      {/* Link NinjaOne Dialog */}
      {device && (
        <LinkNinjaOneDialog
          device={device}
          isOpen={showLinkDialog}
          onClose={() => setShowLinkDialog(false)}
          onLinked={handleLinked}
        />
      )}

      {/* Link ESET Dialog */}
      {device && (
        <LinkEsetDialog
          device={device}
          isOpen={showLinkEsetDialog}
          onClose={() => setShowLinkEsetDialog(false)}
          onLinked={handleLinked}
        />
      )}

      {/* Edit Device Modal */}
      <DeviceFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        device={device}
        onSuccess={handleDeviceUpdated}
      />
    </div>
  );
}
