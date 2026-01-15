import { redirect, notFound } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { ComputerForm } from '@/components/admin';
import { getComputerByIdAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function EditComputerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Check authentication
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/login');
  }

  const { id } = await params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  if (!isSupabaseAdminConfigured()) {
    return (
      <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-6">
        <p className="text-red-700 dark:text-red-400">Database not configured. Please check your environment variables.</p>
      </div>
    );
  }

  const computer = await getComputerByIdAdmin(id);

  if (!computer) {
    notFound();
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Edit Computer</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
          Update the information for {computer.name}
        </p>
      </div>

      {/* Form */}
      <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm">
        <ComputerForm computer={computer} />
      </div>
    </div>
  );
}
