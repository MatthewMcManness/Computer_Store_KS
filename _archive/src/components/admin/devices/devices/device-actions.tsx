'use client';

import { useState } from 'react';
import {
  MoreVertical,
  RotateCcw,
  Download,
  Search,
  ExternalLink,
  Monitor,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import type { NinjaOneDevice } from '@/lib/ninjaone';

/**
 * Props for the DeviceActions component.
 */
interface DeviceActionsProps {
  device: NinjaOneDevice;
  onActionComplete?: () => void;
}

type ActionType = 'restart' | 'update' | 'scan';

/**
 * Displays quick action buttons for device management.
 *
 * @param props - Component properties
 * @returns JSX element
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export function DeviceActions({ device, onActionComplete }: DeviceActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState<ActionType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<ActionType | null>(null);

  /**
   * Executes a device action.
   */
  const executeAction = async (action: ActionType) => {
    setLoading(action);
    setError(null);
    setSuccess(null);
    setShowConfirm(null);
    setShowMenu(false);

    try {
      const response = await fetch(`/api/ninjaone/devices/${device.id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Failed to ${action} device`);
      }

      const data = await response.json();
      setSuccess(data.message || `${action} initiated successfully`);

      if (onActionComplete) {
        setTimeout(onActionComplete, 2000);
      }
    } catch (err) {
      console.error(`Failed to ${action}:`, err);
      setError(err instanceof Error ? err.message : `Failed to ${action}`);
    } finally {
      setLoading(null);
    }
  };

  const actions: { type: ActionType; label: string; icon: typeof RotateCcw; confirm?: boolean }[] = [
    { type: 'restart', label: 'Restart', icon: RotateCcw, confirm: true },
    { type: 'update', label: 'Run Updates', icon: Download },
    { type: 'scan', label: 'Run Scan', icon: Search },
  ];

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Monitor className="h-5 w-5 text-orange-500" />
        Quick Actions
      </h2>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm">
          {success}
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="mb-4 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Confirm {showConfirm}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Are you sure you want to {showConfirm} this device? This action cannot be undone.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => executeAction(showConfirm)}
                  disabled={loading !== null}
                  className="px-3 py-1.5 text-sm font-medium bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                >
                  {loading === showConfirm ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    `Yes, ${showConfirm}`
                  )}
                </button>
                <button
                  onClick={() => setShowConfirm(null)}
                  disabled={loading !== null}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon;
          const isLoading = loading === action.type;
          const isDisabled = loading !== null || device.status !== 'online';

          return (
            <button
              key={action.type}
              onClick={() => {
                if (action.confirm) {
                  setShowConfirm(action.type);
                } else {
                  executeAction(action.type);
                }
              }}
              disabled={isDisabled}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                isDisabled
                  ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              ) : (
                <Icon className="h-5 w-5 text-gray-400" />
              )}
              <span className="font-medium text-gray-900 dark:text-white">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Offline Warning */}
      {device.status !== 'online' && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
          Device must be online to perform actions
        </p>
      )}

      {/* Remote Access Section */}
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Remote Access
        </h3>
        <button
          onClick={async () => {
            try {
              const response = await fetch(`/api/ninjaone/devices/${device.id}/remote`, {
                method: 'POST',
              });
              if (response.ok) {
                const data = await response.json();
                if (data.url) {
                  window.open(data.url, '_blank');
                } else {
                  setError('Remote access not available for this device');
                }
              } else {
                const data = await response.json().catch(() => ({}));
                setError(data.error || 'Failed to start remote session');
              }
            } catch (err) {
              setError('Failed to start remote session');
            }
          }}
          disabled={device.status !== 'online'}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
            device.status === 'online'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          <ExternalLink className="h-4 w-4" />
          Remote Connect
        </button>
      </div>
    </div>
  );
}

export default DeviceActions;
