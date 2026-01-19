import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Link from 'next/link';
import NextImage from 'next/image';
import { ClipboardList } from 'lucide-react';
import { CallCustomerTickets } from '@/components/admin/call-customer-tickets';
import { ReceptionPhoneWidgets } from '@/components/admin/reception-phone-widgets';

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

      {/* Phone System Widgets (Missed Calls, Voicemails) */}
      <div className="mb-8">
        <ReceptionPhoneWidgets />
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
