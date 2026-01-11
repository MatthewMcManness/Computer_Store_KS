import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { ClipboardCheck, Wrench, MessageSquare, Camera } from 'lucide-react';

/**
 * Ticket Work page - Coming Soon placeholder.
 *
 * This page will provide the detailed interface for technicians
 * to work on individual repair tickets with notes and photos.
 *
 * @returns Ticket work placeholder page
 *
 * @functions_called isAuthenticated
 * @called_by AdminLayout, AdminSidebar navigation
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial placeholder implementation
 */
export default async function TicketWorkPage() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Ticket Work</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
          Detailed repair workspace
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/50">
            <ClipboardCheck className="h-8 w-8 text-teal-600 dark:text-teal-400" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Coming Soon</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
          Ticket Work will provide a detailed repair workspace where technicians can
          document progress, add notes, upload photos, and track parts used.
        </p>

        {/* Feature Preview */}
        <div className="grid gap-4 sm:grid-cols-3 mt-8">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <Wrench className="h-6 w-6 text-teal-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Repair Steps</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Track progress</p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <MessageSquare className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Tech Notes</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Document findings</p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <Camera className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Photo Docs</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Before/after shots</p>
          </div>
        </div>
      </div>
    </div>
  );
}
