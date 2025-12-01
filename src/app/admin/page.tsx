import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Link from 'next/link';
import { Image, Plus, Settings, TrendingUp } from 'lucide-react';
import { isGitHubConfigured, getGitHubConfig } from '@/lib/github';
import { SaleDropdown } from '@/components/admin';
import fs from 'fs/promises';
import path from 'path';

async function getGalleryStats() {
  try {
    const filePath = path.join(process.cwd(), 'src/data/gallery.json');
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    const computers = data.computers || [];
    const desktops = computers.filter((c: { type: string }) => c.type === 'desktop').length;
    const laptops = computers.filter((c: { type: string }) => c.type === 'laptop').length;
    const blackFriday = computers.filter((c: { blackFriday?: { enabled: boolean } }) => c.blackFriday?.enabled).length;

    return {
      total: computers.length,
      desktops,
      laptops,
      blackFriday,
      lastUpdated: data.lastUpdated,
    };
  } catch {
    return {
      total: 0,
      desktops: 0,
      laptops: 0,
      blackFriday: 0,
      lastUpdated: null,
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
  const githubConfig = getGitHubConfig();

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-500">
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
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Computers</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Desktops</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{stats.desktops}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Image className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Laptops</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{stats.laptops}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
              <Image className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Black Friday</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{stats.blackFriday}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
              <Settings className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/gallery"
            className="flex items-center gap-4 rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <Image className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Manage Gallery</p>
              <p className="text-sm text-gray-500">View and edit all computers</p>
            </div>
          </Link>

          <Link
            href="/admin/gallery/new"
            className="flex items-center gap-4 rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Plus className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Add Computer</p>
              <p className="text-sm text-gray-500">Add a new computer to gallery</p>
            </div>
          </Link>

          <a
            href={process.env.NEXT_PUBLIC_SITE_URL || 'https://computerstoreks.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">View Site</p>
              <p className="text-sm text-gray-500">See the public website</p>
            </div>
          </a>
        </div>
      </div>

      {/* System Status */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">System Status</h2>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">GitHub Integration</span>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                githubConfig.configured
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {githubConfig.configured ? 'Connected' : 'Not Configured'}
              </span>
            </div>

            {githubConfig.configured && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Repository</span>
                  <span className="text-sm text-gray-900">
                    {githubConfig.owner}/{githubConfig.repo}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Branch</span>
                  <span className="text-sm text-gray-900">{githubConfig.branch}</span>
                </div>
              </>
            )}

            {stats.lastUpdated && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Updated</span>
                <span className="text-sm text-gray-900">
                  {new Date(stats.lastUpdated).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
