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
      <div className="mb-8">
        <Link
          href="/admin/gallery"
          className="mb-4 inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Gallery
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add New Computer</h1>
        <p className="mt-1 text-gray-500">
          Fill out the form below to add a new computer to the gallery
        </p>
      </div>

      {/* Form */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <ComputerForm />
      </div>
    </div>
  );
}
