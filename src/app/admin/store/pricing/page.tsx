'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Save,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Tag,
  Percent,
  DollarSign,
  Megaphone,
  Power,
} from 'lucide-react';
import type { StorePricingConfig, StorePricingRule, StoreCategory } from '@/types/store';

/**
 * Admin pricing rules management page.
 *
 * Displays and allows editing of global store pricing configuration
 * (default markup, shipping thresholds, tax rate, store toggle, announcement)
 * and category-specific markup rules.
 *
 * @returns {JSX.Element} Pricing management page component
 *
 * @sideEffects
 * - Fetches pricing config from /api/admin/store/pricing on mount
 * - Fetches categories from /api/admin/store/categories on mount
 * - Sends PUT to /api/admin/store/pricing for config updates
 * - Sends POST/DELETE to /api/admin/store/pricing/rules for category rules
 *
 * @functions_called fetch
 * @called_by Next.js App Router (/admin/store/pricing)
 *
 * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
 */
export default function AdminStorePricingPage() {
  const [config, setConfig] = useState<StorePricingConfig | null>(null);
  const [rules, setRules] = useState<StorePricingRule[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Editable config fields
  const [defaultMarkup, setDefaultMarkup] = useState('');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('');
  const [flatShippingRate, setFlatShippingRate] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [storeEnabled, setStoreEnabled] = useState(false);
  const [storeAnnouncement, setStoreAnnouncement] = useState('');

  // New rule form
  const [newRuleCategoryId, setNewRuleCategoryId] = useState('');
  const [newRuleMarkup, setNewRuleMarkup] = useState('');
  const [addingRule, setAddingRule] = useState(false);
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pricingRes, categoriesRes] = await Promise.all([
          fetch('/api/admin/store/pricing'),
          fetch('/api/admin/store/categories'),
        ]);

        if (!pricingRes.ok) throw new Error('Failed to load pricing config');
        const pricingData = await pricingRes.json();
        setConfig(pricingData.config);
        setRules(pricingData.rules || []);

        // Initialize form fields
        if (pricingData.config) {
          const c = pricingData.config as StorePricingConfig;
          setDefaultMarkup(String(c.default_markup_percent));
          setFreeShippingThreshold(String(c.free_shipping_threshold));
          setFlatShippingRate(String(c.flat_shipping_rate));
          setTaxRate(String(c.tax_rate));
          setStoreEnabled(c.store_enabled);
          setStoreAnnouncement(c.store_announcement || '');
        }

        if (categoriesRes.ok) {
          const catData = await categoriesRes.json();
          setCategories(catData.categories || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load pricing data');
        console.error('[STORE PRICING] Load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  /**
   * Saves global pricing configuration changes.
   *
   * @sideEffects Sends PUT to /api/admin/store/pricing
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/store/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          default_markup_percent: parseFloat(defaultMarkup) || 0,
          free_shipping_threshold: parseFloat(freeShippingThreshold) || 0,
          flat_shipping_rate: parseFloat(flatShippingRate) || 0,
          tax_rate: parseFloat(taxRate) || 0,
          store_enabled: storeEnabled,
          store_announcement: storeAnnouncement || null,
        }),
      });
      if (!response.ok) throw new Error('Failed to save configuration');
      const updated = await response.json();
      setConfig(updated.config);
      showToast('Pricing configuration saved', 'success');
    } catch (err) {
      showToast('Failed to save configuration', 'error');
      console.error('[STORE PRICING] Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Adds a new category pricing rule.
   *
   * @sideEffects Sends POST to /api/admin/store/pricing/rules
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const handleAddRule = async () => {
    if (!newRuleCategoryId || !newRuleMarkup) return;
    setAddingRule(true);
    try {
      const response = await fetch('/api/admin/store/pricing/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: newRuleCategoryId,
          markup_percent: parseFloat(newRuleMarkup),
        }),
      });
      if (!response.ok) throw new Error('Failed to add rule');
      const data = await response.json();
      setRules((prev) => [...prev, data.rule]);
      setNewRuleCategoryId('');
      setNewRuleMarkup('');
      showToast('Category rule added', 'success');
    } catch (err) {
      showToast('Failed to add category rule', 'error');
      console.error('[STORE PRICING] Add rule error:', err);
    } finally {
      setAddingRule(false);
    }
  };

  /**
   * Deletes a category pricing rule.
   *
   * @param ruleId - The rule ID to delete
   *
   * @sideEffects Sends DELETE to /api/admin/store/pricing/rules/[id]
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Delete this pricing rule?')) return;
    setDeletingRuleId(ruleId);
    try {
      const response = await fetch(`/api/admin/store/pricing/rules/${ruleId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete rule');
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      showToast('Category rule deleted', 'success');
    } catch (err) {
      showToast('Failed to delete rule', 'error');
      console.error('[STORE PRICING] Delete rule error:', err);
    } finally {
      setDeletingRuleId(null);
    }
  };

  /**
   * Returns the category name for a given category ID.
   *
   * @param categoryId - The category ID to look up
   * @returns Category name or the ID if not found
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const getCategoryName = (categoryId: string): string => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.name || categoryId;
  };

  // Categories not already in rules (for the add dropdown)
  const availableCategories = categories.filter(
    (c) => !rules.some((r) => r.category_id === c.id)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Pricing</h1>
          <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
            Global pricing configuration and category markup rules
          </p>
        </div>
        <button
          onClick={handleSaveConfig}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 w-full sm:w-auto"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save All Changes
        </button>
      </div>

      <div className="space-y-6">
        {/* Store Toggle & Announcement */}
        <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <Power className="h-5 w-5 text-gray-400" />
            Store Status
          </h2>
          <div className="space-y-4">
            {/* Store Enabled Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Store Enabled</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  When disabled, the store shows a maintenance message
                </p>
              </div>
              <button
                onClick={() => setStoreEnabled(!storeEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  storeEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    storeEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Announcement Banner */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Megaphone className="h-4 w-4" />
                Announcement Banner
              </label>
              <input
                type="text"
                value={storeAnnouncement}
                onChange={(e) => setStoreAnnouncement(e.target.value)}
                placeholder="e.g., Free shipping on orders over $100!"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Leave empty to hide the announcement banner
              </p>
            </div>
          </div>
        </div>

        {/* Global Pricing Settings */}
        <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <Percent className="h-5 w-5 text-gray-400" />
            Global Pricing Settings
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Default Markup (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={defaultMarkup}
                onChange={(e) => setDefaultMarkup(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Applied to cost price when no category rule exists
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.001"
                min="0"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Applied to order subtotal at checkout
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Free Shipping Threshold ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Orders above this amount get free shipping. Set 0 to disable.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Flat Shipping Rate ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={flatShippingRate}
                onChange={(e) => setFlatShippingRate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Shipping cost when order is below free shipping threshold
              </p>
            </div>
          </div>
        </div>

        {/* Category Pricing Rules */}
        <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <Tag className="h-5 w-5 text-gray-400" />
            Category Markup Rules
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Override the default markup percentage for specific categories.
          </p>

          {/* Existing Rules */}
          {rules.length > 0 ? (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Category
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Markup %
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {rule.category?.name || getCategoryName(rule.category_id)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                        {rule.markup_percent}%
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          disabled={deletingRuleId === rule.id}
                          className="rounded-lg p-1.5 text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 disabled:opacity-50"
                          title="Delete rule"
                        >
                          {deletingRuleId === rule.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mb-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No category rules yet. All products use the default markup.
              </p>
            </div>
          )}

          {/* Add New Rule */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <select
              value={newRuleCategoryId}
              onChange={(e) => setNewRuleCategoryId(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="relative w-full sm:w-32">
              <input
                type="number"
                step="0.1"
                min="0"
                value={newRuleMarkup}
                onChange={(e) => setNewRuleMarkup(e.target.value)}
                placeholder="Markup %"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 pr-8 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                %
              </span>
            </div>
            <button
              onClick={handleAddRule}
              disabled={!newRuleCategoryId || !newRuleMarkup || addingRule}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {addingRule ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add Rule
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-md rounded-lg p-4 shadow-lg ${
          toast.type === 'success'
            ? 'border-l-4 border-green-500 bg-white dark:bg-gray-900'
            : 'border-l-4 border-red-500 bg-white dark:bg-gray-900'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
            <p className={`text-sm font-medium ${
              toast.type === 'success' ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'
            }`}>
              {toast.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
