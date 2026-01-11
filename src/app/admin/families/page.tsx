import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { Users, Link2, UserPlus, History } from 'lucide-react';

/**
 * Family Management page - Coming Soon placeholder.
 *
 * This page will allow staff to manage family groups, linking
 * related customers together for shared billing and ticket access.
 *
 * @returns Family management placeholder page
 *
 * @functions_called isAuthenticated
 * @called_by AdminLayout, AdminSidebar navigation
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial placeholder implementation
 */
export default async function FamiliesPage() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Family Management</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
          Link customers into family groups
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
            <Users className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Coming Soon</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
          Family Management will enable you to group related customers together,
          allowing shared billing, combined ticket history, and family-wide discounts.
        </p>

        {/* Feature Preview */}
        <div className="grid gap-4 sm:grid-cols-3 mt-8">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <Link2 className="h-6 w-6 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Link Members</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Connect related customers</p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <UserPlus className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Add Members</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Grow family groups</p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <History className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Shared History</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Combined ticket view</p>
          </div>
        </div>
      </div>
    </div>
  );
}
