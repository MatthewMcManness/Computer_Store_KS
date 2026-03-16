'use client';

import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Globe,
  Network,
  FolderTree,
  Package,
  Unlink,
  Loader2,
  Monitor,
} from 'lucide-react';
import type { EsetDevice } from '@/lib/eset';

/**
 * Props for the EsetStatusPanel component.
 */
interface EsetStatusPanelProps {
  /** ESET device data */
  device: EsetDevice;
  /** Whether the device is currently being unlinked */
  unlinking?: boolean;
  /** Callback when unlink button is clicked */
  onUnlink?: () => void;
}

/**
 * Returns status display info for an ESET functionality status.
 *
 * @param status - ESET device functionality status
 * @returns Object with color classes, icon, and label
 *
 * @version 1.0.0 - 2026-02-03T22:58:18Z - Initial implementation
 */
function getStatusDisplay(status: EsetDevice['functionalityStatus']) {
  switch (status) {
    case 'OK':
      return {
        color: 'text-green-700 dark:text-green-300',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        dotColor: 'bg-green-500',
        Icon: ShieldCheck,
        label: 'Protected',
        description: 'ESET protection is active and up to date.',
      };
    case 'ATTENTION_RECOMMENDED':
      return {
        color: 'text-yellow-700 dark:text-yellow-300',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        dotColor: 'bg-yellow-500',
        Icon: Shield,
        label: 'Attention Recommended',
        description: 'Some ESET components may need attention.',
      };
    case 'ATTENTION_REQUIRED':
      return {
        color: 'text-red-700 dark:text-red-300',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        dotColor: 'bg-red-500',
        Icon: ShieldAlert,
        label: 'Attention Required',
        description: 'ESET protection requires immediate attention.',
      };
    default:
      return {
        color: 'text-gray-700 dark:text-gray-300',
        bgColor: 'bg-gray-50 dark:bg-gray-800',
        borderColor: 'border-gray-200 dark:border-gray-700',
        dotColor: 'bg-gray-400',
        Icon: Shield,
        label: 'Unknown',
        description: 'ESET protection status is unknown.',
      };
  }
}

/**
 * Displays ESET Protect status information for a linked device.
 *
 * Shows functionality status, installed products, last sync time,
 * device info, network info, and group membership. Includes
 * an unlink button.
 *
 * @param props - Component properties
 * @returns JSX element
 *
 * @example
 * <EsetStatusPanel
 *   device={esetDevice}
 *   unlinking={unlinking}
 *   onUnlink={handleUnlink}
 * />
 *
 * @functions_called getStatusDisplay
 * @called_by DeviceDetailPage
 *
 * @version 1.0.0 - 2026-02-03T22:58:18Z - Initial implementation
 */
export function EsetStatusPanel({ device, unlinking, onUnlink }: EsetStatusPanelProps) {
  const statusDisplay = getStatusDisplay(device.functionalityStatus);
  const StatusIcon = statusDisplay.Icon;

  return (
    <div className="space-y-6">
      {/* Protection Status Card */}
      <div className={`rounded-lg border ${statusDisplay.borderColor} ${statusDisplay.bgColor} p-5`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <StatusIcon className={`h-8 w-8 ${statusDisplay.color}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${statusDisplay.dotColor} animate-pulse`} />
              <h3 className={`text-lg font-semibold ${statusDisplay.color}`}>
                {statusDisplay.label}
              </h3>
            </div>
            <p className={`text-sm mt-1 ${statusDisplay.color} opacity-80`}>
              {statusDisplay.description}
            </p>
            {device.lastSyncTime && (
              <p className="text-xs mt-2 text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last sync: {new Date(device.lastSyncTime).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Installed Products */}
      {device.activeProducts.length > 0 && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-500" />
            Installed ESET Products
          </h3>
          <div className="space-y-3">
            {device.activeProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {product.productName}
                  </p>
                  {product.productVersion && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Version {product.productVersion}
                    </p>
                  )}
                </div>
                {product.subscriptionValidTo && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Valid until
                    </p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {new Date(product.subscriptionValidTo).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Device Info */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Monitor className="h-4 w-4 text-blue-500" />
          ESET Device Info
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {device.deviceType && (
            <div>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Device Type</dt>
              <dd className="text-sm text-gray-900 dark:text-white">{device.deviceType}</dd>
            </div>
          )}
          {device.operatingSystem && (
            <div>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Operating System</dt>
              <dd className="text-sm text-gray-900 dark:text-white">
                {device.operatingSystem}
                {device.osVersion && ` (${device.osVersion})`}
              </dd>
            </div>
          )}
          {device.enrollmentStatus && (
            <div>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Enrollment Status</dt>
              <dd className="text-sm text-gray-900 dark:text-white">{device.enrollmentStatus}</dd>
            </div>
          )}
          {device.connectorVersion && (
            <div>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Connector Version</dt>
              <dd className="text-sm text-gray-900 dark:text-white">{device.connectorVersion}</dd>
            </div>
          )}
          {device.hardware?.totalPhysicalMemoryGb && (
            <div>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Memory</dt>
              <dd className="text-sm text-gray-900 dark:text-white">{device.hardware.totalPhysicalMemoryGb} GB</dd>
            </div>
          )}
          {device.fqdn && (
            <div>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">FQDN</dt>
              <dd className="text-sm text-gray-900 dark:text-white font-mono text-xs">{device.fqdn}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Network Info */}
      {(device.primaryLocalIpAddress || device.publicIpAddress) && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Network className="h-4 w-4 text-blue-500" />
            Network
          </h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {device.primaryLocalIpAddress && (
              <div>
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Local IP</dt>
                <dd className="text-sm text-gray-900 dark:text-white font-mono">{device.primaryLocalIpAddress}</dd>
              </div>
            )}
            {device.publicIpAddress && (
              <div>
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Public IP</dt>
                <dd className="text-sm text-gray-900 dark:text-white font-mono flex items-center gap-1">
                  <Globe className="h-3 w-3 text-gray-400" />
                  {device.publicIpAddress}
                </dd>
              </div>
            )}
            {device.macAddresses && device.macAddresses.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">MAC Addresses</dt>
                <dd className="text-sm text-gray-900 dark:text-white font-mono">
                  {device.macAddresses.join(', ')}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Group Membership */}
      {device.parentGroupUuid && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <FolderTree className="h-4 w-4 text-blue-500" />
            Device Group
          </h3>
          <p className="text-sm text-gray-900 dark:text-white">
            {device.parentGroupName || device.parentGroupUuid}
          </p>
        </div>
      )}

      {/* Unlink Button */}
      {onUnlink && (
        <button
          onClick={onUnlink}
          disabled={unlinking}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
        >
          {unlinking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Unlink className="h-4 w-4" />
          )}
          Unlink from ESET
        </button>
      )}
    </div>
  );
}

export default EsetStatusPanel;
