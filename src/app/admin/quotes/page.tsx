import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { Calculator, FileText, Send, Clock } from 'lucide-react';

/**
 * Quote Generator page - Coming Soon placeholder.
 *
 * This page will provide tools to create and send repair quotes
 * to customers before work begins.
 *
 * @returns Quote generator placeholder page
 *
 * @functions_called isAuthenticated
 * @called_by AdminLayout, AdminSidebar navigation
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial placeholder implementation
 */
export default async function QuotesPage() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/login');
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Quote Generator</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
          Create and send repair estimates
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/50">
            <Calculator className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Coming Soon</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
          The Quote Generator will help you quickly create detailed repair estimates,
          send them to customers, and track approval status.
        </p>

        {/* Feature Preview */}
        <div className="grid gap-4 sm:grid-cols-3 mt-8">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <FileText className="h-6 w-6 text-cyan-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Build Quote</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Add parts & labor</p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <Send className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Send Quote</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Email to customer</p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <Clock className="h-6 w-6 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Track Status</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pending approvals</p>
          </div>
        </div>
      </div>
    </div>
  );
}
