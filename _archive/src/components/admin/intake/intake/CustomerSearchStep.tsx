'use client';

import { useState, useEffect } from 'react';
import { Search, UserPlus, Sparkles, Building2 } from 'lucide-react';
import type { RepairShoprCustomer } from '@/lib/repairshopr';

// Extended customer type with silver plan status from API
interface CustomerWithSilverStatus extends RepairShoprCustomer {
  is_silver_plan?: boolean;
}

// =============================================================================
// Types
// =============================================================================

interface CustomerSearchStepProps {
  onSelectCustomer: (customer: RepairShoprCustomer, skipToDevice: boolean) => void;
  onCreateNew: () => void;
}

// =============================================================================
// Component
// =============================================================================

export function CustomerSearchStep({
  onSelectCustomer,
  onCreateNew,
}: CustomerSearchStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<CustomerWithSilverStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchCustomers(searchQuery);
      } else {
        setResults([]);
        setHasSearched(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchCustomers = async (query: string) => {
    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(
        `/api/repairshopr/customers?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error('Failed to search customers');
      }

      const data = await response.json();
      setResults(data.customers || []);
    } catch (error) {
      console.error('[CustomerSearchStep] Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCustomer = (customer: RepairShoprCustomer) => {
    // Skip to device step (not to customer form)
    onSelectCustomer(customer, true);
  };

  return (
    <div className="rounded-lg bg-white dark:bg-gray-900 p-8 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Step 1: Search Customer
      </h2>

      {/* Search Input with New Customer Button */}
      <div className="mb-6">
        <label
          htmlFor="customer-search"
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Search for existing customer
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="customer-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or phone"
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 py-3 pl-10 pr-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => onCreateNew()}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 whitespace-nowrap"
          >
            <UserPlus className="h-5 w-5" />
            New Customer
          </button>
        </div>
        {searchQuery.length > 0 && searchQuery.length < 2 && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Type at least 2 characters to search
          </p>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="mb-6 flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">Searching...</span>
        </div>
      )}

      {/* Search Results */}
      {!isLoading && hasSearched && searchQuery.length >= 2 && (
        <div className="mb-6">
          {results.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Found {results.length} customer{results.length !== 1 ? 's' : ''}
              </p>
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {results.map((customer) => (
                  <div
                    key={customer.id}
                    className={`flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:hover:border-blue-600 dark:hover:bg-blue-900/30 ${customer.is_silver_plan ? 'silver-plan-card' : ''}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {customer.fullname}
                        </h3>
                        {customer.is_silver_plan && (
                          <span className="silver-plan-badge inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold">
                            <Sparkles className="h-3 w-3" />
                            Silver Plan
                          </span>
                        )}
                        {customer.business_name && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-1 text-xs font-medium text-blue-800 dark:text-blue-200">
                            <Building2 className="h-3 w-3" />
                            {customer.business_name}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 space-y-0.5 text-sm text-gray-600 dark:text-gray-400">
                        {customer.email && (
                          <p>
                            <span className="font-medium">Email:</span>{' '}
                            {customer.email}
                          </p>
                        )}
                        {customer.phone && (
                          <p>
                            <span className="font-medium">Phone:</span>{' '}
                            {customer.phone}
                          </p>
                        )}
                        {customer.mobile && (
                          <p>
                            <span className="font-medium">Mobile:</span>{' '}
                            {customer.mobile}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectCustomer(customer)}
                      className="ml-4 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No customers found for &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try a different search or click &ldquo;New Customer&rdquo; above to create one
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
