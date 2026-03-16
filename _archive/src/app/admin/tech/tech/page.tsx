import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { Wrench, ListTodo, Clock, CheckCircle2 } from 'lucide-react';

/**
 * Tech Dashboard page - Coming Soon placeholder.
 *
 * This page will serve as the main workspace for technicians,
 * showing assigned tickets, repair queues, and daily tasks.
 *
 * @returns Tech dashboard placeholder page
 *
 * @functions_called isAuthenticated
 * @called_by AdminLayout, AdminSidebar navigation
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial placeholder implementation
 */
export default async function TechDashboardPage() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/login');
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Tech Dashboard</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
          Your repair queue and assigned work
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50">
            <Wrench className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Coming Soon</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
          The Tech Dashboard will be your central workspace showing assigned tickets,
          repair priorities, and time tracking for efficient workflow management.
        </p>

        {/* Feature Preview */}
        <div className="grid gap-4 sm:grid-cols-3 mt-8">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <ListTodo className="h-6 w-6 text-indigo-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">My Queue</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Assigned repairs</p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <Clock className="h-6 w-6 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Time Tracking</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Log repair time</p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Completed</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Today&apos;s finished</p>
          </div>
        </div>
      </div>
    </div>
  );
}
