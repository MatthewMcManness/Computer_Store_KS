'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Loader2, ChevronLeft, ChevronRight, Filter, Shield, Home, Edit2, Trash2, Plus, X } from 'lucide-react';

type ProtectionPlanTier = 'eset' | 'silver' | 'silver-plus' | null;

interface Family {
  id: number;
  name: string;
  customerCount: number;
  plan_tier?: ProtectionPlanTier;
}

interface PaginationMeta {
  total_entries: number;
  page: number;
  per_page: number;
  total_pages: number;
}

/**
 * Family Management page - list and filter families.
 * Allows staff to view family groups with their members and protection plans.
 */
export default function FamiliesPage() {
  const router = useRouter();
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [planFilter, setPlanFilter] = useState<ProtectionPlanTier | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Create family modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [creatingFamily, setCreatingFamily] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Delete family state
  const [deletingFamilyId, setDeletingFamilyId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [familyToDelete, setFamilyToDelete] = useState<Family | null>(null);

  const perPage = 50;

  // Check authentication and user role
  useEffect(() => {
    fetch('/api/auth/check')
      .then(res => res.json())
      .then(data => {
        if (!data?.authenticated || !data?.user) {
          router.push('/login');
        } else if (data.user.role === 'admin') {
          setIsAdmin(true);
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  // Load families
  const loadFamilies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let url = `/api/repairshopr/families?page=${page}&per_page=${perPage}`;
      if (planFilter !== 'all') {
        url += `&plan_tier=${planFilter}`;
      }
      if (searchQuery.trim()) {
        url += `&q=${encodeURIComponent(searchQuery.trim())}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to load families');

      const data = await response.json();
      setFamilies(data.families || []);
      setMeta(data.meta || null);
    } catch (err) {
      console.error('Failed to load families:', err);
      setError('Failed to load families');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, planFilter, searchQuery]);

  useEffect(() => {
    loadFamilies();
  }, [loadFamilies]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [planFilter, searchQuery]);

  // Create new family
  const handleCreateFamily = async () => {
    if (!newFamilyName.trim()) return;

    setCreatingFamily(true);
    setCreateError(null);

    try {
      const response = await fetch('/api/repairshopr/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFamilyName.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create family');
      }

      const data = await response.json();

      // Add new family to list and navigate to it
      router.push(`/admin/families/${data.family.id}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create family');
    } finally {
      setCreatingFamily(false);
    }
  };

  // Delete family
  const handleDeleteFamily = async (family: Family) => {
    if (family.customerCount > 0) {
      setError('Cannot delete family with assigned customers');
      return;
    }

    setDeletingFamilyId(family.id);
    try {
      const response = await fetch(`/api/repairshopr/families/${family.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete family');
      }

      // Remove from list
      setFamilies(prev => prev.filter(f => f.id !== family.id));
      setShowDeleteConfirm(false);
      setFamilyToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete family');
    } finally {
      setDeletingFamilyId(null);
    }
  };

  // Get plan tier badge
  const getPlanBadge = (tier: ProtectionPlanTier) => {
    if (!tier) return null;
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      'eset': { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-200', label: 'ESET' },
      'silver': { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-800 dark:text-blue-200', label: 'Silver' },
      'silver-plus': { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-800 dark:text-purple-200', label: 'Silver+' },
    };
    const badge = badges[tier];
    if (!badge) return null;
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${badge.bg} ${badge.text}`}>
        <Shield className="h-3 w-3" />
        {badge.label}
      </span>
    );
  };

  if (loading && families.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Family Management</h1>
          <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
            View and manage family groups
          </p>
        </div>
        <button
          onClick={() => {
            setNewFamilyName('');
            setCreateError(null);
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Family
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/50 p-3 text-sm text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search families..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-64 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Plan Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Filter className="h-4 w-4" />
          <span>Filter:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPlanFilter('all')}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              planFilter === 'all'
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setPlanFilter('eset')}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              planFilter === 'eset'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:hover:bg-green-900'
            }`}
          >
            <Shield className="h-3 w-3" />
            ESET
          </button>
          <button
            onClick={() => setPlanFilter('silver')}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              planFilter === 'silver'
                ? 'bg-slate-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <Shield className="h-3 w-3" />
            Silver
          </button>
          <button
            onClick={() => setPlanFilter('silver-plus')}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-colors border-2 ${
              planFilter === 'silver-plus'
                ? 'border-amber-500 bg-transparent text-amber-500 dark:border-amber-400 dark:text-amber-400'
                : 'border-transparent bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <Shield className="h-3 w-3" />
            Silver+
          </button>
        </div>
      </div>

      {/* Families List */}
      <div className="rounded-xl bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        {/* Desktop Table Header */}
        <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400">
          <div className="col-span-5">Family Name</div>
          <div className="col-span-2">Members</div>
          <div className="col-span-3">Protection Plan</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Family Rows */}
        {families.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {families.map((family) => (
              <Link
                key={family.id}
                href={`/admin/families/${family.id}`}
                className="block hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                {/* Desktop Row */}
                <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 items-center">
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50 flex-shrink-0">
                      <Home className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      {family.name}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="h-4 w-4" />
                    {family.customerCount}
                  </div>
                  <div className="col-span-3">
                    {getPlanBadge(family.plan_tier ?? null)}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/admin/families/${family.id}/edit`);
                      }}
                      className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:bg-gray-700"
                      title="Edit family"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    {isAdmin && family.customerCount === 0 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setFamilyToDelete(family);
                          setShowDeleteConfirm(true);
                        }}
                        disabled={deletingFamilyId === family.id}
                        className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg dark:text-red-400 dark:hover:bg-red-900/30 disabled:opacity-50"
                        title="Delete family"
                      >
                        {deletingFamilyId === family.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile Card */}
                <div className="md:hidden p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50 flex-shrink-0">
                      <Home className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-gray-900 dark:text-white truncate">
                          {family.name}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              router.push(`/admin/families/${family.id}/edit`);
                            }}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:bg-gray-700"
                            title="Edit family"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {isAdmin && family.customerCount === 0 && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setFamilyToDelete(family);
                                setShowDeleteConfirm(true);
                              }}
                              disabled={deletingFamilyId === family.id}
                              className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg dark:text-red-400 dark:hover:bg-red-900/30 disabled:opacity-50"
                              title="Delete family"
                            >
                              {deletingFamilyId === family.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Users className="h-3.5 w-3.5" />
                        {family.customerCount} member{family.customerCount !== 1 ? 's' : ''}
                        {family.plan_tier && (
                          <span className="ml-2">
                            {getPlanBadge(family.plan_tier)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            {planFilter !== 'all' || searchQuery ? 'No families match your search criteria' : 'No families found'}
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.total_pages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, meta.total_entries)} of {meta.total_entries} {planFilter !== 'all' ? `${planFilter === 'eset' ? 'ESET' : planFilter === 'silver' ? 'Silver' : 'Silver+'} plan` : ''} families
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {meta.total_pages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(meta.total_pages, p + 1))}
              disabled={page === meta.total_pages}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create Family Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Family</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {createError && (
              <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/50 p-3 text-sm text-red-800 dark:text-red-200">
                {createError}
              </div>
            )}

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Family Name
              </label>
              <input
                type="text"
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
                placeholder="e.g., Smith Family"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newFamilyName.trim()) {
                    handleCreateFamily();
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={creatingFamily}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFamily}
                disabled={creatingFamily || !newFamilyName.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {creatingFamily && <Loader2 className="h-4 w-4 animate-spin" />}
                {creatingFamily ? 'Creating...' : 'Create Family'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && familyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Delete Family</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete &quot;{familyToDelete.name}&quot;? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setFamilyToDelete(null);
                }}
                disabled={deletingFamilyId !== null}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFamily(familyToDelete)}
                disabled={deletingFamilyId !== null}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletingFamilyId !== null && <Loader2 className="h-4 w-4 animate-spin" />}
                {deletingFamilyId !== null ? 'Deleting...' : 'Delete Family'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
