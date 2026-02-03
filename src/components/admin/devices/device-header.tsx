'use client';

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
  ArrowLeft,
  Building2,
} from 'lucide-react';
import Link from 'next/link';
import type { NinjaOneDevice } from '@/lib/ninjaone';
import { formatDistanceToNow } from '@/lib/utils';

/**
 * Props for the DeviceHeader component.
 */
interface DeviceHeaderProps {
  device: NinjaOneDevice;
}

/**
 * Returns the appropriate icon for a device class.
 */
function getDeviceIcon(deviceClass?: NinjaOneDevice['deviceClass']) {
  const iconClass = 'h-8 w-8';
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
 * Returns status display info.
 */
function getStatusInfo(status: NinjaOneDevice['status']) {
  switch (status) {
    case 'online':
      return {
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        dotColor: 'bg-green-500',
        label: 'Online',
        icon: Wifi,
      };
    case 'offline':
      return {
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        dotColor: 'bg-gray-400',
        label: 'Offline',
        icon: WifiOff,
      };
    default:
      return {
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        dotColor: 'bg-yellow-500',
        label: 'Unknown',
        icon: Circle,
      };
  }
}

/**
 * Displays the device header with name, status, and organization.
 *
 * @param props - Component properties
 * @returns JSX element
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export function DeviceHeader({ device }: DeviceHeaderProps) {
  const status = getStatusInfo(device.status);
  const StatusIcon = status.icon;

  return (
    <div className="mb-6">
      {/* Back link */}
      <Link
        href="/admin/devices"
        className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Devices
      </Link>

      {/* Device header card */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Device icon */}
          <div className={`flex-shrink-0 p-4 rounded-xl ${status.bgColor}`}>
            {getDeviceIcon(device.deviceClass)}
          </div>

          {/* Device info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {device.name}
                </h1>
                {device.systemName && device.systemName !== device.name && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {device.systemName}
                  </p>
                )}
              </div>

              {/* Status badge */}
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 ${status.bgColor}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${status.dotColor} animate-pulse`} />
                <StatusIcon className={`h-4 w-4 ${status.color}`} />
                <span className={`text-sm font-medium ${status.color}`}>
                  {status.label}
                </span>
              </div>
            </div>

            {/* Meta info */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
              {device.organizationName && (
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  <span>{device.organizationName}</span>
                </div>
              )}
              {device.os && (
                <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {device.os}
                </span>
              )}
              <span>
                Last seen: {formatDistanceToNow(device.lastSeen)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeviceHeader;
