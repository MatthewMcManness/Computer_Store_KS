import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { ShoppingCart, CreditCard, Receipt, Barcode } from 'lucide-react';

/**
 * Point of Sale page - Coming Soon placeholder.
 *
 * This page will provide a quick checkout interface for walk-in
 * purchases, including computer sales and service payments.
 *
 * @returns POS placeholder page
 *
 * @functions_called isAuthenticated
 * @called_by AdminLayout, AdminSidebar navigation
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial placeholder implementation
 */
export default async function POSPage() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Point of Sale</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
          Quick checkout for walk-in sales
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50">
            <ShoppingCart className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Coming Soon</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
          The Point of Sale system will enable quick checkout for walk-in customers,
          including computer sales, accessories, and service payments.
        </p>

        {/* Feature Preview */}
        <div className="grid gap-4 sm:grid-cols-3 mt-8">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <Barcode className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Scan Items</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Quick product lookup</p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <CreditCard className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Accept Payment</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Card or cash</p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <Receipt className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Print Receipt</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Email or print</p>
          </div>
        </div>
      </div>
    </div>
  );
}
