import { redirect, notFound } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { ComputerForm } from '@/components/admin';
import type { GalleryComputer, GalleryData } from '@/types/gallery';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import fs from 'fs/promises';
import path from 'path';

async function getComputer(id: string): Promise<GalleryComputer | null> {
  try {
    const filePath = path.join(process.cwd(), 'src/data/gallery.json');
    const content = await fs.readFile(filePath, 'utf-8');
    const data: GalleryData = JSON.parse(content);

    const computerId = parseInt(id);
    return data.computers.find(c => c.id === computerId) || null;
  } catch {
    return null;
  }
}

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
  const computer = await getComputer(id);

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
