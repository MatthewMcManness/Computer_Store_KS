import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { Crown, Users, ArrowUpDown, BarChart3 } from 'lucide-react';

/**
 * Lead Tech Dashboard page - Coming Soon placeholder.
 *
 * This page will provide lead technicians with oversight tools
 * for managing the repair team and assigning tickets.
 *
 * @returns Lead tech dashboard placeholder page
 *
 * @functions_called isAuthenticated
 * @called_by AdminLayout, AdminSidebar navigation
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial placeholder implementation
 */
export default async function LeadTechDashboardPage() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/login');
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Lead Tech Dashboard</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
          Team oversight and ticket assignment
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/50">
            <Crown className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Coming Soon</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
          The Lead Tech Dashboard will give you oversight of the repair team,
          enabling ticket assignment, workload balancing, and performance tracking.
        </p>

        {/* Feature Preview */}
        <div className="grid gap-4 sm:grid-cols-3 mt-8">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <Users className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Team View</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">See tech workloads</p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <ArrowUpDown className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Assign Tickets</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Balance workload</p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <BarChart3 className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Performance</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Team metrics</p>
          </div>
        </div>
      </div>
    </div>
  );
}
