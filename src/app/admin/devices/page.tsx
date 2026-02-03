'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Monitor } from 'lucide-react';
import { DeviceList } from '@/components/admin/devices/device-list';

/**
 * Admin Devices Page
 *
 * Displays a list of all NinjaOne managed devices with search, filter,
 * and navigation capabilities.
 *
 * @returns JSX element
 *
 * @sideEffects
 * - Fetches user authentication on mount
 * - Redirects to login if not authenticated
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export default function DevicesPage() {
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    fetch('/api/auth/check')
      .then(res => {
        if (!res.ok) router.push('/login');
      })
      .catch(() => router.push('/login'));
  }, [router]);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Monitor className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Devices
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Monitor and manage NinjaOne devices
            </p>
          </div>
        </div>
      </div>

      {/* Device List */}
      <DeviceList />
    </div>
  );
}
