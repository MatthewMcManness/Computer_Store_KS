'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { GalleryComputer } from '@/types/gallery';
import { Pencil, Trash2, Eye, Printer } from 'lucide-react';
import { generateFlyer } from '@/lib/flyer-generator';

interface GalleryTableProps {
  computers: GalleryComputer[];
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export function GalleryTable({ computers, onDelete, isLoading }: GalleryTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    if (onDelete) {
      onDelete(id);
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'custom':
        return 'bg-orange-100 text-orange-800';
      case 'new':
        return 'bg-purple-100 text-purple-800';
      case 'refurbished':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'desktop':
        return 'bg-blue-100 text-blue-800';
      case 'laptop':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading computers...</p>
        </div>
      </div>
    );
  }

  if (computers.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <Eye className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No computers found</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Get started by adding your first computer.</p>
          <Link
            href="/admin/gallery/new"
            className="mt-4 inline-flex items-center rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-indigo-700"
          >
            Add Computer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Computer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
          {computers.map((computer) => (
            <tr
              key={computer.id}
              onClick={() => setSelectedId(computer.id)}
              className={cn(
                'cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800',
                selectedId === computer.id && 'bg-purple-50 dark:bg-purple-900/20'
              )}
            >
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                    {computer.image ? (
                      <Image
                        src={computer.image}
                        alt={computer.name}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Eye className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="font-medium text-gray-900 dark:text-white">{computer.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {computer.specs.length} specs
                    </div>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className={cn(
                  'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                  getTypeBadgeClass(computer.type)
                )}>
                  {computer.type}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className={cn(
                  'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                  getCategoryBadgeClass(computer.category)
                )}>
                  {computer.category === 'custom'
                    ? (computer.type === 'laptop' ? 'New' : 'Custom Build')
                    : computer.category}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                {computer.blackFriday?.enabled ? (
                  <div>
                    <span className="text-gray-400 line-through">{computer.blackFriday.originalPrice}</span>
                    <span className="ml-2 text-red-600 dark:text-red-400">{computer.blackFriday.salePrice}</span>
                  </div>
                ) : (
                  computer.price
                )}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {computer.blackFriday?.enabled ? (
                  <span className="inline-flex rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-1 text-xs font-medium text-red-800 dark:text-red-400">
                    Black Friday
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-1 text-xs font-medium text-green-800 dark:text-green-400">
                    Active
                  </span>
                )}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      generateFlyer(computer);
                    }}
                    className="rounded p-1 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                    title="Generate sales flyer"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                  <Link
                    href={`/admin/gallery/${computer.id}`}
                    className="rounded p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(computer.id, computer.name);
                    }}
                    className="rounded p-1 text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
