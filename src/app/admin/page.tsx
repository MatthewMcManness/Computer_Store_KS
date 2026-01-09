import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Link from 'next/link';
import NextImage from 'next/image';
import { Image, Plus, Settings, TrendingUp, Users, RefreshCw } from 'lucide-react';
import { isGitHubConfigured } from '@/lib/github';
import { getAllComputers, isSupabaseConfigured, getActiveSaleAdmin } from '@/lib/supabase';
import { SaleDropdown } from '@/components/admin';

async function getGalleryStats() {
  try {
    if (!isSupabaseConfigured()) {
      return {
        total: 0,
        desktops: 0,
        laptops: 0,
        blackFriday: 0,
        lastUpdated: null,
      };
    }

    const computers = await getAllComputers();
    const activeSale = await getActiveSaleAdmin();

    const desktops = computers.filter(c => c.type === 'desktop').length;
    const laptops = computers.filter(c => c.type === 'laptop').length;
    const blackFriday = computers.filter(c => c.blackFriday?.enabled).length;

    return {
      total: computers.length,
      desktops,
      laptops,
      blackFriday,
      activeSale: activeSale?.name || 'No Sale',
    };
  } catch {
    return {
      total: 0,
      desktops: 0,
      laptops: 0,
      blackFriday: 0,
      activeSale: null,
    };
  }
}

export default async function AdminDashboardPage() {
  // Check authentication
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  const stats = await getGalleryStats();
  const githubConnected = isGitHubConfigured();
  const supabaseConnected = isSupabaseConfigured();

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
            Welcome to the Computer Store Kansas admin panel
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Global Sale:</span>
          <SaleDropdown />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Computers</p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Desktops</p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{stats.desktops}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <Image className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Laptops</p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{stats.laptops}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <Image className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">On Sale</p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{stats.blackFriday}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/50">
              <Settings className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/gallery"
            className="flex items-center gap-4 rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-900"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <Image className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Manage Gallery</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">View and edit all computers</p>
            </div>
          </Link>

          <Link
            href="/admin/gallery/new"
            className="flex items-center gap-4 rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-900"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50">
              <Plus className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Add Computer</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Add a new computer to gallery</p>
            </div>
          </Link>

          <Link
            href="/admin/customers"
            className="flex items-center gap-4 rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-900"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
              <Users className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Customers</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage customer portal access</p>
            </div>
          </Link>

          <Link
            href="/admin/sync"
            className="flex items-center gap-4 rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-900"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/50">
              <RefreshCw className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Data Sync</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sync RepairShopr data</p>
            </div>
          </Link>

          <a
            href={process.env.NEXT_PUBLIC_SITE_URL || 'https://computerstoreks.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-900"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">View Site</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">See the public website</p>
            </div>
          </a>
        </div>
      </div>

      {/* System Status */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">System Status</h2>
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Database (Supabase)</span>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                supabaseConnected
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400'
              }`}>
                {supabaseConnected ? 'Connected' : 'Not Configured'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Image Storage (GitHub)</span>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                githubConnected
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400'
              }`}>
                {githubConnected ? 'Connected' : 'Not Configured'}
              </span>
            </div>

            {stats.activeSale && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Active Sale</span>
                <span className="text-sm text-gray-900 dark:text-white">{stats.activeSale}</span>
              </div>
            )}
          </div>
        </div>
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
