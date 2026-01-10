'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Mail, Phone, Loader2, ChevronLeft, ChevronRight, Filter, Shield, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import type { RepairShoprCustomer } from '@/lib/repairshopr';

type ProtectionPlanTier = 'eset' | 'silver' | 'silver-plus' | null;

interface Business {
  name: string;
  primaryCustomer: RepairShoprCustomer;
  customerCount: number;
  plan_tier?: ProtectionPlanTier;
}

interface PaginationMeta {
  total_entries: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export default function BusinessesPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [planFilter, setPlanFilter] = useState<ProtectionPlanTier | 'all'>('all');
  const [migrationProgress, setMigrationProgress] = useState<{
    migrated: number;
    not_migrated: number;
    total: number;
    percent_complete: number;
  } | null>(null);

  const perPage = 50;

  // Check authentication
  useEffect(() => {
    fetch('/api/auth/check')
      .then(res => {
        if (!res.ok) router.push('/admin/login');
      })
      .catch(() => router.push('/admin/login'));
  }, [router]);

  // Load migration progress
  const loadMigrationProgress = useCallback(async () => {
    try {
      const response = await fetch('/api/repairshopr/migration-progress');
      if (response.ok) {
        const data = await response.json();
        setMigrationProgress(data);
      }
    } catch (err) {
      console.error('Failed to load migration progress:', err);
    }
  }, []);

  useEffect(() => {
    loadMigrationProgress();
  }, [loadMigrationProgress]);

  // Load businesses
  const loadBusinesses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/repairshopr/businesses?page=${page}&per_page=${perPage}`);
      if (!response.ok) throw new Error('Failed to load businesses');

      const data = await response.json();
      setBusinesses(data.businesses || []);
      setMeta(data.meta || null);
    } catch (err) {
      console.error('Failed to load businesses:', err);
      setError('Failed to load businesses');
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  // Get plan tier badge color
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

  // Filter businesses by plan
  const filteredBusinesses = businesses.filter((business) => {
    if (planFilter === 'all') return true;
    return business.plan_tier === planFilter;
  });

  if (loading && businesses.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Business Management</h1>
          <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
            View and manage business customers
          </p>
        </div>
        {/* Migration Progress Indicator */}
        {migrationProgress && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm">
            {migrationProgress.percent_complete === 100 ? (
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            )}
            <span className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">{migrationProgress.migrated}</span>
              <span className="text-gray-500 dark:text-gray-400">/{migrationProgress.total}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">
                ({migrationProgress.percent_complete}%)
              </span>
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">migrated</span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/50 p-3 text-sm text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

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
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:hover:bg-blue-900'
            }`}
          >
            <Shield className="h-3 w-3" />
            Silver
          </button>
          <button
            onClick={() => setPlanFilter('silver-plus')}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              planFilter === 'silver-plus'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-200 dark:hover:bg-purple-900'
            }`}
          >
            <Shield className="h-3 w-3" />
            Silver+
          </button>
        </div>
      </div>

      {/* Businesses List */}
      <div className="rounded-xl bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        {/* Desktop Table Header */}
        <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400">
          <div className="col-span-4">Business Name</div>
          <div className="col-span-3">Contact</div>
          <div className="col-span-2">Customers</div>
          <div className="col-span-2">Protection Plan</div>
          <div className="col-span-1"></div>
        </div>

        {/* Business Rows */}
        {filteredBusinesses.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredBusinesses.map((business) => (
              <Link
                key={business.name}
                href={`/admin/businesses/${business.primaryCustomer.id}`}
                className="block hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                {/* Desktop Row */}
                <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 items-center">
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex-shrink-0">
                      <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      {business.name}
                    </span>
                  </div>
                  <div className="col-span-3 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {business.primaryCustomer.email && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{business.primaryCustomer.email}</span>
                      </div>
                    )}
                    {business.primaryCustomer.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{business.primaryCustomer.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="h-4 w-4" />
                    {business.customerCount}
                  </div>
                  <div className="col-span-2">
                    {getPlanBadge(business.plan_tier ?? null)}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Mobile Card */}
                <div className="md:hidden p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex-shrink-0">
                      <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-gray-900 dark:text-white truncate">
                          {business.name}
                        </span>
                        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Users className="h-3.5 w-3.5" />
                        {business.customerCount} customer{business.customerCount !== 1 ? 's' : ''}
                        {business.plan_tier && (
                          <span className="ml-2">
                            {getPlanBadge(business.plan_tier)}
                          </span>
                        )}
                      </div>
                      {business.primaryCustomer.email && (
                        <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 truncate">
                          <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{business.primaryCustomer.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            {planFilter !== 'all' ? 'No businesses match the selected filter' : 'No businesses found'}
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.total_pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, meta.total_entries)} of {meta.total_entries} businesses
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
    </div>
  );
}
