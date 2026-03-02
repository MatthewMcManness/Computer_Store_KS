'use client';

/**
 * Debounced search input for products.
 *
 * Updates the URL search param `?search=...` after a short debounce.
 * Shows a clear button when a value is present.
 *
 * @functions_called useRouter, useSearchParams
 * @called_by StoreProductsPage, StoreHeader
 *
 * @version 1.0.0 - 2026-03-02T19:01:13Z - Initial implementation
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

const DEBOUNCE_MS = 400;

export function ProductSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get('search') ?? '';

  const [value, setValue] = useState(initialSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep input in sync if URL changes externally
  useEffect(() => {
    setValue(searchParams?.get('search') ?? '');
  }, [searchParams]);

  const pushSearch = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      if (query) {
        params.set('search', query);
      } else {
        params.delete('search');
      }
      params.delete('page');
      router.push(`/store/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newVal = e.target.value;
    setValue(newVal);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushSearch(newVal);
    }, DEBOUNCE_MS);
  }

  function handleClear() {
    setValue('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    pushSearch('');
  }

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder="Search products..."
        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-9 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
