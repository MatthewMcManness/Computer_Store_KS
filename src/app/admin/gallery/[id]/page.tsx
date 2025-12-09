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
    redirect('/admin/login');
  }

  const { id } = await params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  if (!isSupabaseAdminConfigured()) {
    return (
      <div className="rounded-xl bg-red-50 p-6">
        <p className="text-red-700">Database not configured. Please check your environment variables.</p>
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
      <div className="mb-8">
        <Link
          href="/admin/gallery"
          className="mb-4 inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Gallery
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Computer</h1>
        <p className="mt-1 text-gray-500">
          Update the information for {computer.name}
        </p>
      </div>

      {/* Form */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <ComputerForm computer={computer} />
      </div>
    </div>
  );
}
