'use client';

import Link from 'next/link';
import {
  Monitor,
  Laptop,
  Server,
  Apple,
  Cloud,
  HardDrive,
  Wifi,
  WifiOff,
  Circle,
} from 'lucide-react';
import type { NinjaOneDevice } from '@/lib/ninjaone';
import { formatDistanceToNow } from '@/lib/utils';

/**
 * Props for the DeviceCard component.
 */
interface DeviceCardProps {
  device: NinjaOneDevice;
  showLink?: boolean;
  onSelect?: (device: NinjaOneDevice) => void;
  selected?: boolean;
}

/**
 * Returns the appropriate icon for a device class.
 *
 * @param deviceClass - The NinjaOne device class
 * @returns React element with the icon
 */
function getDeviceIcon(deviceClass?: NinjaOneDevice['deviceClass']) {
  const iconClass = 'h-5 w-5';
  switch (deviceClass) {
    case 'WINDOWS_WORKSTATION':
      return <Monitor className={iconClass} />;
    case 'WINDOWS_SERVER':
      return <Server className={iconClass} />;
    case 'MAC':
      return <Apple className={iconClass} />;
    case 'LINUX':
      return <Server className={iconClass} />;
    case 'CLOUD_MONITOR':
      return <Cloud className={iconClass} />;
    case 'VMWARE_HOST':
      return <HardDrive className={iconClass} />;
    default:
      return <Laptop className={iconClass} />;
  }
}

/**
 * Returns status indicator color and label.
 *
 * @param status - Device online status
 * @returns Object with color class and label
 */
function getStatusIndicator(status: NinjaOneDevice['status']) {
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
 * Formats the last seen time in a human-readable format.
 *
 * @param lastSeen - Date when the device was last seen
 * @returns Formatted string like "5 minutes ago"
 */
function formatLastSeen(lastSeen: Date): string {
  return formatDistanceToNow(lastSeen);
}

/**
 * Displays a device card with status, basic info, and health indicators.
 *
 * @param props - Component properties
 * @returns JSX element
 *
 * @example
 * <DeviceCard device={device} showLink />
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export function DeviceCard({ device, showLink = true, onSelect, selected }: DeviceCardProps) {
  const status = getStatusIndicator(device.status);
  const StatusIcon = status.icon;

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
            {getDeviceIcon(device.deviceClass)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {device.name}
              </h3>
              {/* Status dot */}
              <span className={`flex-shrink-0 h-2 w-2 rounded-full ${status.bgColor}`} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {device.os}
            </p>
            {device.organizationName && (
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                {device.organizationName}
              </p>
            )}
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className={`flex items-center gap-1 text-xs font-medium ${status.color}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            <span>{status.label}</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {formatLastSeen(device.lastSeen)}
          </p>
        </div>
      </div>

      {/* Hardware summary with health indicators */}
      {(device.hardware.ramGb || device.hardware.diskDrives?.length) && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            {device.hardware.ramGb && (
              <span>{device.hardware.ramGb} GB RAM</span>
            )}
            {device.hardware.diskDrives && device.hardware.diskDrives.length > 0 && (() => {
              // Calculate overall disk usage for health indicator
              const totalSize = device.hardware.diskDrives.reduce((acc, d) => acc + (d.sizeGb || 0), 0);
              const totalFree = device.hardware.diskDrives.reduce((acc, d) => acc + (d.freeGb || 0), 0);
              const usedPercent = totalSize > 0 ? Math.round(((totalSize - totalFree) / totalSize) * 100) : 0;

              // Color based on usage threshold
              let colorClass = 'bg-green-500';
              if (usedPercent >= 90) colorClass = 'bg-red-500';
              else if (usedPercent >= 70) colorClass = 'bg-yellow-500';

              return (
                <div className="flex items-center gap-1.5">
                  <span>{totalSize} GB</span>
                  <div className="w-12 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colorClass}`}
                      style={{ width: `${usedPercent}%` }}
                    />
                  </div>
                </div>
              );
            })()}
            {device.hardware.processorName && (
              <span className="truncate">{device.hardware.processorName.split(' ').slice(0, 3).join(' ')}</span>
            )}
          </div>
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

export default DeviceCard;
