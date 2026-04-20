/**
 * SLIDESHOW MANAGER - Admin page for managing the in-store slideshow.
 * Lists all active slides in display order with options to reorder,
 * archive individual slides, and launch the live slideshow.
 *
 * WHEN TO EDIT: When changing the slide management interface.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Archive,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Code2,
  ImageIcon,
  Presentation,
} from 'lucide-react';
import type { SlideshowSlide } from '@/types/slideshow';

export default function SlideshowManagerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [slides, setSlides] = useState<SlideshowSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [reordering, setReordering] = useState(false);

  // Check for success message (after adding a slide)
  useEffect(() => {
    const message = searchParams?.get('message');
    if (message === 'added') {
      showToast('Slide added successfully!', 'success');
      router.replace('/admin/slideshow', { scroll: false });
    }
  }, [searchParams, router]);

  // Load slides
  useEffect(() => {
    loadSlides();
  }, []);

  async function loadSlides() {
    try {
      const response = await fetch('/api/slideshow?admin=true');
      const result = await response.json();
      if (result.success) {
        setSlides(result.data);
      } else {
        setError(result.error || 'Failed to load slides');
      }
    } catch {
      setError('Failed to load slides');
    } finally {
      setIsLoading(false);
    }
  }

  function showToast(message: string, type: 'success' | 'error' | 'info') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  // Move a slide up or down in the list, then persist the new order
  async function moveSlide(index: number, direction: 'up' | 'down') {
    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    // Swap using temp variable (TypeScript-safe)
    const temp = newSlides[index]!;
    newSlides[index] = newSlides[targetIndex]!;
    newSlides[targetIndex] = temp;
    setSlides(newSlides);

    // Persist new order
    setReordering(true);
    try {
      const response = await fetch('/api/slideshow/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: newSlides.map((s) => s.id) }),
      });
      const result = await response.json();
      if (!result.success) {
        showToast('Failed to save order', 'error');
        loadSlides(); // Reload to get back to the real order
      }
    } catch {
      showToast('Failed to save order', 'error');
      loadSlides();
    } finally {
      setReordering(false);
    }
  }

  // Archive (soft-delete) a slide
  async function handleArchive(id: string, title: string) {
    try {
      const response = await fetch(`/api/slideshow/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        setSlides((prev) => prev.filter((s) => s.id !== id));
        showToast(`"${title}" archived`, 'success');
      } else {
        showToast(result.error || 'Failed to archive slide', 'error');
      }
    } catch {
      showToast('Failed to archive slide', 'error');
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Slideshow Manager
          </h1>
          <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
            Manage slides for the in-store display
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => window.open('/slideshow', '_blank')}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
          >
            <Presentation className="h-4 w-4" />
            Launch Slideshow
          </button>
          <Link
            href="/admin/slideshow/archived"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Archive className="h-4 w-4" />
            View Archived
          </Link>
          <Link
            href="/admin/slideshow/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Slide
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Slide count */}
      {!isLoading && slides.length > 0 && (
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          {slides.length} slide{slides.length !== 1 ? 's' : ''} · rotates every 10 seconds
          {reordering && (
            <span className="ml-2 text-blue-500">Saving order...</span>
          )}
        </p>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading slides...</p>
        </div>

      ) : slides.length === 0 ? (
        // Empty state
        <div className="rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
            <Presentation className="h-7 w-7 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No slides yet</h3>
          <p className="mt-1 mb-6 text-sm text-gray-500 dark:text-gray-400">
            Add your first slide to start the in-store slideshow.
          </p>
          <Link
            href="/admin/slideshow/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add First Slide
          </Link>
        </div>

      ) : (
        // Slide list
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-4 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              {/* Order number */}
              <span className="flex-none w-7 text-center text-sm font-medium text-gray-400 dark:text-gray-500">
                {index + 1}
              </span>

              {/* Type icon */}
              <div className="flex-none flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                {slide.type === 'image' ? (
                  <ImageIcon className="h-5 w-5 text-purple-500" />
                ) : (
                  <Code2 className="h-5 w-5 text-blue-500" />
                )}
              </div>

              {/* Title + type badge */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{slide.title}</p>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-0.5 ${
                  slide.type === 'image'
                    ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                    : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                }`}>
                  {slide.type === 'image' ? 'Image' : 'HTML'}
                </span>
              </div>

              {/* Preview link (image only) */}
              {slide.type === 'image' && slide.imageUrl && (
                <a
                  href={slide.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="View image"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}

              {/* Up / Down reorder buttons */}
              <div className="flex-none flex items-center gap-1">
                <button
                  onClick={() => moveSlide(index, 'up')}
                  disabled={index === 0 || reordering}
                  className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => moveSlide(index, 'down')}
                  disabled={index === slides.length - 1 || reordering}
                  className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              {/* Archive button */}
              <button
                onClick={() => handleArchive(slide.id, slide.title)}
                className="flex-none inline-flex items-center gap-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Archive slide"
              >
                <Archive className="h-3.5 w-3.5" />
                Archive
              </button>
            </div>
          ))}
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
