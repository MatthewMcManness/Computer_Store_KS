import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Link from 'next/link';
import NextImage from 'next/image';
import { ClipboardList, Settings, RefreshCw } from 'lucide-react';
import { isGitHubConfigured } from '@/lib/github';
import { isSupabaseConfigured } from '@/lib/supabase';
import { CallCustomerTickets } from '@/components/admin/call-customer-tickets';

export default async function AdminDashboardPage() {
  // Check authentication
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  const githubConnected = isGitHubConfigured();
  const supabaseConnected = isSupabaseConfigured();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reception Dashboard</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Customer intake and ticket management
        </p>
      </div>

      {/* Customer Intake Button - Prominent placement */}
      <div className="mb-8">
        <Link
          href="/admin/intake"
          className="flex items-center justify-center gap-3 rounded-xl bg-blue-600 px-8 py-6 text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
        >
          <ClipboardList className="h-8 w-8" />
          <div className="text-left">
            <p className="text-xl font-bold">New Customer Intake</p>
            <p className="text-sm text-blue-100">Create a new ticket for a walk-in customer</p>
          </div>
        </Link>
      </div>

      {/* Call Customer Tickets Card */}
      <div className="mb-8">
        <CallCustomerTickets />
      </div>

      {/* System Status - Simplified */}
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
