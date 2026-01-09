import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { IntakeWizard } from '@/components/admin/intake/IntakeWizard';

export const metadata = {
  title: 'Customer Intake - Employee Portal',
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
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Customer Intake</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
          Create a new customer ticket and device entry
        </p>
      </div>

      {/* Wizard */}
      <IntakeWizard />
    </div>
  );
}
