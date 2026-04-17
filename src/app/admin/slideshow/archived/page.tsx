/**
 * ARCHIVED SLIDES - Shows slides removed from the active slideshow.
 * Allows restoring them or permanently deleting them.
 *
 * WHEN TO EDIT: When changing the archive/restore workflow for slides.
 */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Trash2, ImageIcon, Code2, Eye, AlertTriangle } from 'lucide-react';
import type { SlideshowSlide } from '@/types/slideshow';

export default function ArchivedSlidesPage() {
  const [slides, setSlides] = useState<SlideshowSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string; step: 1 | 2 } | null>(null);

  useEffect(() => {
    fetch('/api/slideshow/archived')
      .then((r) => r.json())
      .then((result) => {
        if (result.success) {
          setSlides(result.data);
        } else {
          setError(result.error || 'Failed to load archived slides');
        }
      })
      .catch(() => setError('Failed to load archived slides'))
      .finally(() => setIsLoading(false));
  }, []);

  function showToast(message: string, type: 'success' | 'error' | 'info') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleRestore(id: string, title: string) {
    try {
      const response = await fetch(`/api/slideshow/${id}/restore`, { method: 'POST' });
      const result = await response.json();
      if (result.success) {
        setSlides((prev) => prev.filter((s) => s.id !== id));
        showToast(`"${title}" restored to the slideshow!`, 'success');
      } else {
        showToast(result.error || 'Failed to restore slide', 'error');
      }
    } catch {
      showToast('Failed to restore slide', 'error');
    }
  }

  async function confirmFinalDelete() {
    if (!deleteConfirm) return;
    try {
      const response = await fetch('/api/slideshow/archived', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteConfirm.id }),
      });
      const result = await response.json();
      if (result.success) {
        setSlides((prev) => prev.filter((s) => s.id !== deleteConfirm.id));
        showToast(`"${deleteConfirm.title}" permanently deleted.`, 'info');
      } else {
        showToast(result.error || 'Failed to delete slide', 'error');
      }
    } catch {
      showToast('Failed to delete slide', 'error');
    } finally {
      setDeleteConfirm(null);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link
          href="/admin/slideshow"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Slideshow Manager
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Archived Slides</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
          Slides removed from the slideshow. Restore them or permanently delete them.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading archived slides...</p>
        </div>

      ) : slides.length === 0 ? (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <Eye className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No archived slides</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Slides you archive from the slideshow manager will appear here.
          </p>
        </div>

      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Slide
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Archived
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {slides.map((slide) => (
                <tr key={slide.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 flex-none">
                        {slide.type === 'image' ? (
                          <ImageIcon className="h-4 w-4 text-purple-500" />
                        ) : (
                          <Code2 className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{slide.title}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      slide.type === 'image'
                        ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                        : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    }`}>
                      {slide.type === 'image' ? 'Image' : 'HTML'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {slide.archivedAt
                      ? new Date(slide.archivedAt).toLocaleDateString()
                      : 'Unknown'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRestore(slide.id, slide.title)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 dark:bg-green-900/30 px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Restore
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ id: slide.id, title: slide.title, step: 1 })}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Slide?</h3>
                </div>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  Permanently delete <strong>&ldquo;{deleteConfirm.title}&rdquo;</strong>?
                  This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ ...deleteConfirm, step: 2 })}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Final Confirmation</h3>
                </div>
                <p className="mb-2 text-gray-600 dark:text-gray-400">
                  This is your <strong className="text-red-600 dark:text-red-400">final warning</strong>.
                </p>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  <strong>&ldquo;{deleteConfirm.title}&rdquo;</strong> will be permanently deleted.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmFinalDelete}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                  >
                    Permanently Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-md rounded-lg p-4 shadow-lg border-l-4 bg-white dark:bg-gray-800 ${
          toast.type === 'success' ? 'border-green-500' :
          toast.type === 'info'    ? 'border-blue-500' :
                                     'border-red-500'
        }`}>
          <p className={`text-sm font-medium ${
            toast.type === 'success' ? 'text-green-800 dark:text-green-400' :
            toast.type === 'info'    ? 'text-blue-800 dark:text-blue-400' :
                                       'text-red-800 dark:text-red-400'
          }`}>
            {toast.message}
          </p>
        </div>
      )}
    </div>
  );
}
