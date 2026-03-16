import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { FileText, DollarSign, Send, CheckCircle } from 'lucide-react';

/**
 * Invoice Management page - Coming Soon placeholder.
 *
 * This page will provide invoice creation, tracking, and payment
 * management for customer services and repairs.
 *
 * @returns Invoice management placeholder page
 *
 * @functions_called isAuthenticated
 * @called_by AdminLayout, AdminSidebar navigation
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial placeholder implementation
 */
export default async function InvoicesPage() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/login');
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Invoice Management</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
          Create and track customer invoices
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
            <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Coming Soon</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
          Invoice Management will allow you to create, send, and track invoices
          for repair services, computer sales, and other transactions.
        </p>

        {/* Feature Preview */}
        <div className="grid gap-4 sm:grid-cols-3 mt-8">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <DollarSign className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Create Invoice</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Quick invoice generation</p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <Send className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Email Invoices</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Send to customers</p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <CheckCircle className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Track Payments</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Payment status</p>
          </div>
        </div>
      </div>
    </div>
  );
}
