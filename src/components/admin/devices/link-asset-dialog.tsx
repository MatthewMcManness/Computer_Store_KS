'use client';

import { useState, useEffect } from 'react';
import { X, Search, Loader2, Package, Check } from 'lucide-react';
import type { NinjaOneDevice } from '@/lib/ninjaone';

/**
 * Asset search result from RepairShopr/Supabase.
 */
interface AssetSearchResult {
  id: number;
  repairshoprId: number;
  name: string;
  assetTypeName?: string;
  customerName?: string;
  customerId?: number;
}

/**
 * Props for the LinkAssetDialog component.
 */
interface LinkAssetDialogProps {
  device: NinjaOneDevice;
  isOpen: boolean;
  onClose: () => void;
  onLinked: () => void;
}

/**
 * Dialog for linking a NinjaOne device to a Supabase asset.
 *
 * @param props - Component properties
 * @returns JSX element or null if not open
 *
 * @sideEffects
 * - Searches assets via API
 * - Creates device mapping via API
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export function LinkAssetDialog({ device, isOpen, onClose, onLinked }: LinkAssetDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [assets, setAssets] = useState<AssetSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetSearchResult | null>(null);

  // Search assets when query changes
  useEffect(() => {
    const searchAssets = async () => {
      if (searchQuery.length < 2) {
        setAssets([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/repairshopr/assets/search?q=${encodeURIComponent(searchQuery)}`
        );

        if (!response.ok) {
          throw new Error('Failed to search assets');
        }

        const data = await response.json();
        setAssets(data.assets || []);
      } catch (err) {
        console.error('Error searching assets:', err);
        setError('Failed to search assets');
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchAssets, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  /**
   * Links the device to the selected asset.
   */
  const handleLink = async () => {
    if (!selectedAsset) return;

    setLinking(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/device-mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ninjaoneDeviceId: device.id,
          assetId: selectedAsset.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to link device');
      }

      onLinked();
      onClose();
    } catch (err) {
      console.error('Error linking device:', err);
      setError(err instanceof Error ? err.message : 'Failed to link device');
    } finally {
      setLinking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Link Device to Asset
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {device.displayName || device.systemName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets by name or serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              autoFocus
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Assets List */}
          <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : searchQuery.length < 2 ? (
              <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                Enter at least 2 characters to search
              </div>
            ) : assets.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No assets found
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {assets.map((asset) => {
                  const isSelected = selectedAsset?.id === asset.id;
                  return (
                    <button
                      key={asset.id}
                      onClick={() => setSelectedAsset(isSelected ? null : asset)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/30'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className={`flex-shrink-0 rounded-lg p-2 ${
                        isSelected
                          ? 'bg-blue-100 dark:bg-blue-900/50'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        {isSelected ? (
                          <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Package className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {asset.name}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          {asset.assetTypeName && (
                            <span>{asset.assetTypeName}</span>
                          )}
                          {asset.customerName && (
                            <>
                              <span>•</span>
                              <span className="truncate">{asset.customerName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <button
            onClick={onClose}
            disabled={linking}
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleLink}
            disabled={!selectedAsset || linking}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {linking && <Loader2 className="h-4 w-4 animate-spin" />}
            {linking ? 'Linking...' : 'Link Asset'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LinkAssetDialog;
