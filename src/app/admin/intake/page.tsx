import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { IntakeWizard } from '@/components/admin/intake/IntakeWizard';

export const metadata = {
  title: 'Customer Intake - Admin Panel',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function IntakePage() {
  // Check authentication
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect('/admin/login');
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customer Intake</h1>
        <p className="mt-1 text-gray-500">
          Create a new customer ticket and device entry
        </p>
      </div>

      {/* Wizard */}
      <IntakeWizard />
    </div>
  );
}
