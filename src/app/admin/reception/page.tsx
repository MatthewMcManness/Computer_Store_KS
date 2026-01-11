import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { ClipboardList, Clock, Users, Inbox } from 'lucide-react';

/**
 * Reception Dashboard page - Coming Soon placeholder.
 *
 * This page will serve as the main dashboard for front desk staff,
 * showing pending customer intakes, walk-ins, and daily reception tasks.
 *
 * @returns Reception dashboard placeholder page
 *
 * @functions_called isAuthenticated
 * @called_by AdminLayout, AdminSidebar navigation
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial placeholder implementation
 */
export default async function ReceptionDashboardPage() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Reception Dashboard</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
          Front desk operations center
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
            <ClipboardList className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Coming Soon</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
          The Reception Dashboard will provide a centralized view of daily front desk operations,
          including walk-in customer management, intake queue, and appointment scheduling.
        </p>

        {/* Feature Preview */}
        <div className="grid gap-4 sm:grid-cols-3 mt-8">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Walk-in Queue</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manage customers waiting</p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <Clock className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Appointments</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Today&apos;s schedule</p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <Inbox className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Intake Tasks</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pending intakes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
