/**
 * IN-STORE COMPUTER MANAGER - Lists all computers for sale with options to
 * add, edit, archive, adjust stock, and print flyers.
 *
 * WHEN TO EDIT: When changing the computer management interface.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GalleryTable, SaleDropdown } from '@/components/admin';
import type { GalleryComputer } from '@/types/gallery';
import { Plus, Filter, Archive } from 'lucide-react';

export default function AdminGalleryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [computers, setComputers] = useState<GalleryComputer[]>([]);
  const [filteredComputers, setFilteredComputers] = useState<GalleryComputer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Check for success message from add/edit pages
  useEffect(() => {
    const message = searchParams?.get('message');
    if (message === 'added') {
      showToast('Computer added successfully!', 'success');
      // Clear the URL param
      router.replace('/admin/in-store', { scroll: false });
    } else if (message === 'updated') {
      showToast('Computer updated successfully!', 'success');
      router.replace('/admin/in-store', { scroll: false });
    }
  }, [searchParams, router]);

  // Load computers
  useEffect(() => {
    const loadComputers = async () => {
      try {
        const response = await fetch('/api/in-store?admin=true');
        const result = await response.json();

        if (result.success) {
          setComputers(result.data);
          setFilteredComputers(result.data);
        } else {
          setError(result.error || 'Failed to load gallery');
        }
      } catch (err) {
        setError('Failed to load gallery');
        console.error('Load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadComputers();
  }, []);

  // Filter computers
  useEffect(() => {
    if (currentFilter === 'all') {
      setFilteredComputers(computers);
    } else if (currentFilter === 'desktop' || currentFilter === 'laptop') {
      setFilteredComputers(computers.filter(c => c.type === currentFilter));
    } else {
      setFilteredComputers(computers.filter(c => c.category === currentFilter));
    }
  }, [currentFilter, computers]);

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), type === 'success' ? 4000 : 4000);
  };

  // Delete computer
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/in-store/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setComputers(computers.filter(c => c.id !== id));
        showToast('Computer archived successfully!', 'success');
      } else {
        showToast(result.error || 'Failed to archive computer', 'error');
      }
    } catch (err) {
      showToast('Failed to archive computer', 'error');
      console.error('Delete error:', err);
    }
  };

  // Update stock quantity
  const handleStockChange = async (id: string, delta: number) => {
    try {
      const response = await fetch(`/api/in-store/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state with new stock quantity
        setComputers(computers.map(c =>
          c.id === id ? { ...c, stockQuantity: result.data.stockQuantity } : c
        ));
      } else {
        showToast(result.error || 'Failed to update stock', 'error');
      }
    } catch (err) {
      showToast('Failed to update stock', 'error');
      console.error('Stock update error:', err);
    }
  };

  const filters = [
    { label: 'All', value: 'all' },
    { label: 'Desktops', value: 'desktop' },
    { label: 'Laptops', value: 'laptop' },
    { label: 'Custom', value: 'custom' },
    { label: 'Refurbished', value: 'refurbished' },
    { label: 'New', value: 'new' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">In-Store Manager</h1>
          <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
            Manage your computer inventory
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-500">Sale:</span>
          <SaleDropdown onSaleChange={() => {
            // Reload computers when sale changes
            window.location.reload();
          }} />
          <Link
            href="/admin/in-store/archived"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 w-full sm:w-auto"
          >
            <Archive className="h-4 w-4" />
            View Archived
          </Link>
          <Link
            href="/admin/in-store/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add Computer
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {filters.map(filter => (
            <button
              key={filter.value}
              onClick={() => setCurrentFilter(filter.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
                currentFilter === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Computer count */}
      <div className="mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredComputers.length} of {computers.length} computers
        </p>
      </div>

      {/* Gallery Table */}
      <GalleryTable
        computers={filteredComputers}
        onDelete={handleDelete}
        onStockChange={handleStockChange}
        isLoading={isLoading}
      />

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
