/**
 * ARCHIVED COMPUTERS - Shows computers that were removed from the public gallery.
 * Allows restoring or permanently deleting them.
 *
 * WHEN TO EDIT: When changing the archive/restore workflow.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, RotateCcw, Trash2, Eye, AlertTriangle } from 'lucide-react';
import type { GalleryComputer } from '@/types/gallery';

/**
 * Admin page for viewing and managing archived (soft-deleted) computers.
 *
 * Displays computers that have been archived from the main gallery with
 * options to restore them or permanently delete them. Permanent deletion
 * requires two confirmation steps to prevent accidental data loss.
 *
 * @returns {JSX.Element} Archived gallery management page
 *
 * @sideEffects
 * - Fetches archived computers from /api/in-store/archived
 * - Can restore computers via POST to /api/in-store/[id]/restore
 * - Can permanently delete via DELETE to /api/in-store/archived
 *
 * @functions_called fetch, useState, useEffect, useRouter
 * @called_by AdminLayout (via routing)
 *
 * @version 1.0.0 - 2026-01-15T00:00:00Z - Initial implementation
 */
export default function ArchivedGalleryPage() {
  const router = useRouter();
  const [computers, setComputers] = useState<GalleryComputer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; step: 1 | 2 } | null>(null);

  // Load archived computers
  useEffect(() => {
    const loadComputers = async () => {
      try {
        const response = await fetch('/api/in-store/archived');
        const result = await response.json();

        if (result.success) {
          setComputers(result.data);
        } else {
          setError(result.error || 'Failed to load archived computers');
        }
      } catch (err) {
        setError('Failed to load archived computers');
        console.error('Load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadComputers();
  }, []);

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Restore computer
  const handleRestore = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/in-store/${id}/restore`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        setComputers(computers.filter(c => c.id !== id));
        showToast(`"${name}" has been restored to the gallery!`, 'success');
      } else {
        showToast(result.error || 'Failed to restore computer', 'error');
      }
    } catch (err) {
      showToast('Failed to restore computer', 'error');
      console.error('Restore error:', err);
    }
  };

  // Start permanent delete process (step 1)
  const startDelete = (id: string, name: string) => {
    setDeleteConfirm({ id, name, step: 1 });
  };

  // Confirm step 1, move to step 2
  const confirmStep1 = () => {
    if (deleteConfirm) {
      setDeleteConfirm({ ...deleteConfirm, step: 2 });
    }
  };

  // Final confirmation and delete
  const confirmFinalDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await fetch('/api/in-store/archived', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteConfirm.id }),
      });

      const result = await response.json();

      if (result.success) {
        setComputers(computers.filter(c => c.id !== deleteConfirm.id));
        showToast(`"${deleteConfirm.name}" has been permanently deleted.`, 'info');
      } else {
        showToast(result.error || 'Failed to delete computer', 'error');
      }
    } catch (err) {
      showToast('Failed to delete computer', 'error');
      console.error('Delete error:', err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Cancel delete process
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link
          href="/admin/in-store"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to In-Store Manager
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Archived Computers</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
          Computers that have been removed from the gallery. You can restore them or permanently delete them.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading archived computers...</p>
        </div>
      ) : computers.length === 0 ? (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <Eye className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No archived computers</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Computers you archive from the gallery will appear here.
          </p>
        </div>
      ) : (
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
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Archived
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
              {computers.map((computer) => (
                <tr key={computer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                        {computer.image ? (
                          <Image
                            src={computer.image}
                            alt={computer.name}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover opacity-50"
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
                          {computer.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                      {computer.type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {computer.price}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {computer.archivedAt
                      ? new Date(computer.archivedAt).toLocaleDateString()
                      : 'Unknown'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRestore(computer.id, computer.name)}
                        className="inline-flex items-center gap-1 rounded-lg bg-green-50 dark:bg-green-900/30 px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Restore
                      </button>
                      <button
                        onClick={() => startDelete(computer.id, computer.name)}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-50 dark:bg-red-900/30 px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
            {deleteConfirm.step === 1 ? (
              <>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Delete Computer?
                  </h3>
                </div>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  Are you sure you want to permanently delete <strong>"{deleteConfirm.name}"</strong>?
                  This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmStep1}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Yes, Delete
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Final Confirmation
                  </h3>
                </div>
                <p className="mb-2 text-gray-600 dark:text-gray-400">
                  This is your <strong className="text-red-600 dark:text-red-400">final warning</strong>.
                </p>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  <strong>"{deleteConfirm.name}"</strong> will be permanently deleted from the database.
                  All associated data will be lost forever.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmFinalDelete}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Permanently Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-md rounded-lg p-4 shadow-lg ${
          toast.type === 'success'
            ? 'border-l-4 border-green-500 bg-white dark:bg-gray-800'
            : toast.type === 'info'
            ? 'border-l-4 border-blue-500 bg-white dark:bg-gray-800'
            : 'border-l-4 border-red-500 bg-white dark:bg-gray-800'
        }`}>
          <p className={`text-sm font-medium ${
            toast.type === 'success'
              ? 'text-green-800 dark:text-green-400'
              : toast.type === 'info'
              ? 'text-blue-800 dark:text-blue-400'
              : 'text-red-800 dark:text-red-400'
          }`}>
            {toast.message}
          </p>
        </div>
      )}
    </div>
  );
}
