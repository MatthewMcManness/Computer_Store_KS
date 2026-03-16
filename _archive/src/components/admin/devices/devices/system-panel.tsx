'use client';

import { Settings, Clock, Calendar } from 'lucide-react';
import type { NinjaOneOS } from '@/lib/ninjaone';

/**
 * Props for the SystemPanel component.
 */
interface SystemPanelProps {
  osDetails?: NinjaOneOS;
  os: string;
  createdAt?: Date;
  lastSeen: Date;
}

/**
 * Formats a date for display.
 */
function formatDate(date: Date | string | undefined): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/**
 * Calculates uptime from last boot time.
 */
function formatUptime(lastBootTime?: string): string {
  if (!lastBootTime) return 'N/A';

  const bootDate = new Date(lastBootTime);
  const now = new Date();
  const diffMs = now.getTime() - bootDate.getTime();

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.length > 0 ? parts.join(' ') : 'Just started';
}

/**
 * Displays system/OS information panel for a device.
 *
 * @param props - Component properties
 * @returns JSX element
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export function SystemPanel({ osDetails, os, createdAt, lastSeen }: SystemPanelProps) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Settings className="h-5 w-5 text-purple-500" />
        System
      </h2>

      <div className="space-y-4">
        {/* Operating System */}
        <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Operating System</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {osDetails?.name || os}
          </p>
          {osDetails?.version && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Version {osDetails.version}
              {osDetails.build && ` (Build ${osDetails.build})`}
            </p>
          )}
        </div>

        {/* Architecture */}
        {osDetails?.architecture && (
          <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Architecture</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {osDetails.architecture}
            </p>
          </div>
        )}

        {/* Last Boot / Uptime */}
        {osDetails?.lastBootTime && (
          <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Uptime</p>
            </div>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatUptime(osDetails.lastBootTime)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last boot: {formatDate(osDetails.lastBootTime)}
            </p>
          </div>
        )}

        {/* Last Seen */}
        <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-gray-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Last Contact</p>
          </div>
          <p className="font-medium text-gray-900 dark:text-white">
            {formatDate(lastSeen)}
          </p>
        </div>

        {/* Device Registered */}
        {createdAt && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Device Registered</p>
            </div>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDate(createdAt)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SystemPanel;
