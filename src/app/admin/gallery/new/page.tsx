import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { ComputerForm } from '@/components/admin';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function AddComputerPage() {
  // Check authentication
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link
          href="/admin/gallery"
          className="mb-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Gallery
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Add New Computer</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
          Fill out the form below to add a new computer to the gallery
        </p>
      </div>

      {/* Form */}
      <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm">
        <ComputerForm />
      </div>
    </div>
  );
}
