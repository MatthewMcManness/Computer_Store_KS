import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Link from 'next/link';
import NextImage from 'next/image';
import { Images, Monitor } from 'lucide-react';

/**
 * Admin dashboard landing page with quick-access cards.
 *
 * Displays two management tools:
 * - In-Store Manager for managing in-store computer inventory
 * - Photo Gallery for managing the photo gallery
 *
 * @returns Admin dashboard page with tool cards
 *
 * @sideEffects
 * - Checks authentication and redirects to login if not authenticated
 *
 * @functions_called isAuthenticated
 * @called_by Next.js App Router
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 * @version 2.0.0 - 2026-03-16T00:00:00Z - Simplified to In-Store and Gallery tools only
 */
export default async function AdminDashboardPage() {
  // Check authentication
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/login');
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Manage your in-store inventory and photo gallery
        </p>
      </div>

      {/* Tool Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 max-w-2xl">
        {/* In-Store Manager Card */}
        <Link
          href="/admin/in-store"
          className="group flex flex-col items-center gap-4 rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:group-hover:bg-blue-900/50">
            <Monitor className="h-8 w-8" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">In-Store Manager</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage computers available for sale in-store
            </p>
          </div>
        </Link>

        {/* Photo Gallery Card */}
        <Link
          href="/admin/photo-gallery"
          className="group flex flex-col items-center gap-4 rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:border-purple-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-600"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600 transition-colors group-hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:group-hover:bg-purple-900/50">
            <Images className="h-8 w-8" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Photo Gallery</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage photos and images for the website gallery
            </p>
          </div>
        </Link>
      </div>

      {/* RWS Footer */}
      <div className="mt-12 flex items-center justify-center gap-2 text-xs text-gray-400">
        <span>Created and Maintained by</span>
        <a
          href="https://resilientwebsolutions.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors"
        >
          <NextImage
            src="/assets/rws-logo.svg"
            alt="Resilient Web Solutions"
            width={16}
            height={16}
          />
          <span className="font-medium">Resilient Web Solutions</span>
        </a>
      </div>
    </div>
  );
}
