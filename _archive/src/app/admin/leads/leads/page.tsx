import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { Target, Phone, Calendar, TrendingUp } from 'lucide-react';

/**
 * Lead Tracking page - Coming Soon placeholder.
 *
 * This page will provide lead management for potential customers,
 * tracking inquiries and follow-up activities.
 *
 * @returns Lead tracking placeholder page
 *
 * @functions_called isAuthenticated
 * @called_by AdminLayout, AdminSidebar navigation
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial placeholder implementation
 */
export default async function LeadsPage() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/login');
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Lead Tracking</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
          Manage potential customer inquiries
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/50">
            <Target className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Coming Soon</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
          Lead Tracking will help you capture and follow up on potential customers,
          tracking inquiries from phone calls, website forms, and walk-ins.
        </p>

        {/* Feature Preview */}
        <div className="grid gap-4 sm:grid-cols-3 mt-8">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <Phone className="h-6 w-6 text-orange-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Log Inquiries</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Track all contacts</p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <Calendar className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Follow-ups</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Schedule reminders</p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Conversion</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Track success rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
