'use client';

import Link from 'next/link';
import {
  Monitor,
  Laptop,
  Server,
  Package,
  Wifi,
  WifiOff,
  Circle,
  Link as LinkIcon,
} from 'lucide-react';
import type { Device } from '@/lib/devices';
import { ProtectionTierBadge } from './protection-tier-badge';
import { formatDistanceToNow } from '@/lib/utils';

/**
 * Props for the UnifiedDeviceCard component.
 */
interface UnifiedDeviceCardProps {
  /** The device to display */
  device: Device;
  /** Whether to show link to detail page */
  showLink?: boolean;
  /** Callback when card is clicked (for selection mode) */
  onSelect?: (device: Device) => void;
  /** Whether this device is selected */
  selected?: boolean;
}

/**
 * Returns the appropriate icon for a device type.
 *
 * @param deviceType - The device type string
 * @returns React element with the icon
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
function getDeviceIcon(deviceType?: string) {
  const iconClass = 'h-5 w-5';
  switch (deviceType?.toLowerCase()) {
    case 'desktop':
      return <Monitor className={iconClass} />;
    case 'server':
      return <Server className={iconClass} />;
    case 'parts':
      return <Package className={iconClass} />;
    case 'laptop':
    default:
      return <Laptop className={iconClass} />;
  }
}

/**
 * Returns status indicator color and label.
 *
 * @param status - Device online status
 * @returns Object with color class and label
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
function getStatusIndicator(status?: string) {
  switch (status) {
    case 'online':
      return {
        color: 'text-green-500',
        bgColor: 'bg-green-500',
        label: 'Online',
        icon: Wifi,
      };
    case 'offline':
      return {
        color: 'text-gray-400',
        bgColor: 'bg-gray-400',
        label: 'Offline',
        icon: WifiOff,
      };
    default:
      return {
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500',
        label: 'Unknown',
        icon: Circle,
      };
  }
}

/**
 * Displays a unified device card with status, protection tier, and basic info.
 *
 * This component works with the unified devices system and shows:
 * - Device name and type icon
 * - Protection tier badge
 * - Online/offline status (for managed devices)
 * - Last seen time
 * - NinjaOne link indicator
 *
 * @param props - Component properties
 * @returns JSX element
 *
 * @example
 * <UnifiedDeviceCard device={device} showLink />
 *
 * @functions_called getDeviceIcon, getStatusIndicator, formatDistanceToNow, ProtectionTierBadge
 * @called_by UnifiedDeviceList, CustomerDevicesList
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export function UnifiedDeviceCard({ device, showLink = true, onSelect, selected }: UnifiedDeviceCardProps) {
  const status = getStatusIndicator(device.status);
  const StatusIcon = status.icon;
  const isManaged = device.protection_tier === 'silver' || device.protection_tier === 'silver-plus';
  const hasNinjaOne = !!device.ninjaone_device_id;

  const content = (
    <div
      className={`rounded-lg border p-4 transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      } ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={onSelect ? () => onSelect(device) : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Device icon and info */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="flex-shrink-0 p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
            {getDeviceIcon(device.device_type)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {device.name}
              </h3>
              {/* Status dot for managed devices */}
              {isManaged && (
                <span className={`flex-shrink-0 h-2 w-2 rounded-full ${status.bgColor}`} />
              )}
              {/* NinjaOne link indicator */}
              {hasNinjaOne && (
                <LinkIcon className="h-3 w-3 text-blue-500 flex-shrink-0" title="Linked to NinjaOne" />
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {device.os || device.manufacturer || device.device_type}
            </p>
            {/* Protection tier badge */}
            <div className="mt-1">
              <ProtectionTierBadge tier={device.protection_tier} size="sm" />
            </div>
          </div>
        </div>

        {/* Status indicator for managed devices */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {isManaged && hasNinjaOne ? (
            <>
              <div className={`flex items-center gap-1 text-xs font-medium ${status.color}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                <span>{status.label}</span>
              </div>
              {device.last_seen && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {formatDistanceToNow(new Date(device.last_seen))}
                </p>
              )}
            </>
          ) : (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {device.device_type || 'Device'}
            </span>
          )}
        </div>
      </div>

      {/* Hardware summary for managed devices */}
      {isManaged && hasNinjaOne && (device.ram_gb || device.processor) && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            {device.ram_gb && (
              <span>{device.ram_gb} GB RAM</span>
            )}
            {device.processor && (
              <span className="truncate">{device.processor.split(' ').slice(0, 3).join(' ')}</span>
            )}
          </div>
        </div>
      )}

      {/* Serial number for unmanaged devices */}
      {!isManaged && device.serial_number && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            S/N: {device.serial_number}
          </p>
        </div>
      )}
    </div>
  );

  if (showLink && !onSelect) {
    return (
      <Link href={`/admin/devices/${device.id}`}>
        {content}
      </Link>
    );
  }

  return content;
}

export default UnifiedDeviceCard;
