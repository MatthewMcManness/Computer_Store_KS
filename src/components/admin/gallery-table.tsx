/**
 * ADMIN COMPUTER TABLE - The table in the admin panel that lists all
 * computers for sale. Supports editing, archiving, stock adjustment,
 * and printing sales flyers.
 *
 * WHEN TO EDIT: When changing the admin computer list layout, adding
 * columns, or modifying the stock/archive/flyer actions.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { GalleryComputer } from '@/types/gallery';
import { Pencil, Trash2, Printer, Minus, Plus } from 'lucide-react';
import { generateFlyer } from '@/lib/flyer-generator';

/**
 * Props for the GalleryTable component.
 */
interface GalleryTableProps {
  computers: GalleryComputer[];
  onDelete?: (id: string) => void;
  onStockChange?: (id: string, delta: number) => void;
  isLoading?: boolean;
}

/**
 * Admin table displaying gallery computers with management actions.
 *
 * Renders a responsive table with:
 * - Computer thumbnail and name
 * - Type and category badges
 * - Price (with sale pricing if applicable)
 * - Status indicators (Active, Black Friday, etc.)
 * - Action buttons: Generate flyer, Edit, Delete
 * - Row selection highlighting
 * - Empty and loading states
 *
 * @param props - Component properties
 * @param props.computers - Array of computers to display
 * @param props.onDelete - Optional callback when delete is confirmed
 * @param props.isLoading - Loading state for initial data fetch
 *
 * @returns {JSX.Element} Table of computers or empty/loading state
 *
 * @sideEffects
 * - Calls generateFlyer() which downloads PDF file
 * - Shows browser confirm dialog before delete
 * - Calls onDelete callback on confirmed deletion
 *
 * @example
 * <GalleryTable
 *   computers={computers}
 *   onDelete={(id) => handleDelete(id)}
 *   isLoading={false}
 * />
 *
 * @functions_called generateFlyer, cn
 * @called_by AdminGalleryPage
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export function GalleryTable({ computers, onDelete, onStockChange, isLoading }: GalleryTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [updatingStock, setUpdatingStock] = useState<string | null>(null);

  const handleStockChange = async (id: string, delta: number) => {
    if (updatingStock) return; // Prevent double clicks
    setUpdatingStock(id);
    try {
      if (onStockChange) {
        await onStockChange(id, delta);
      }
    } finally {
      setUpdatingStock(null);
    }
  };

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
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No computers found</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Get started by adding your first computer.</p>
          <Link
            href="/admin/in-store/new"
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
            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Stock
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
                <div className="font-medium text-gray-900 dark:text-white">{computer.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {computer.specs.length} specs
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
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStockChange(computer.id, -1);
                    }}
                    disabled={computer.stockQuantity <= 0 || updatingStock === computer.id}
                    className={cn(
                      'rounded p-1 transition-colors',
                      computer.stockQuantity <= 0
                        ? 'cursor-not-allowed text-gray-300 dark:text-gray-600'
                        : 'text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400'
                    )}
                    title="Decrease stock"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className={cn(
                    'min-w-[2rem] text-center font-medium',
                    computer.stockQuantity === 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-900 dark:text-white'
                  )}>
                    {updatingStock === computer.id ? '...' : computer.stockQuantity}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStockChange(computer.id, 1);
                    }}
                    disabled={updatingStock === computer.id}
                    className="rounded p-1 text-gray-500 transition-colors hover:bg-green-50 hover:text-green-600 dark:text-gray-400 dark:hover:bg-green-900/30 dark:hover:text-green-400"
                    title="Increase stock"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {computer.stockQuantity === 0 ? (
                  <span className="inline-flex rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-1 text-xs font-medium text-red-800 dark:text-red-400">
                    Out of Stock
                  </span>
                ) : computer.blackFriday?.enabled ? (
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
                    href={`/admin/in-store/${computer.id}`}
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
