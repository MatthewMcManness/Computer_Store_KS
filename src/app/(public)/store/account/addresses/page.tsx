/**
 * Saved addresses page (/store/account/addresses).
 *
 * Client component that provides CRUD operations for saved shipping/billing
 * addresses. Users can add, edit, delete, and set a default address. Data is
 * fetched from and persisted to /api/store/addresses.
 *
 * @returns Addresses management page with address cards and add/edit forms
 *
 * @functions_called fetch /api/store/addresses
 * @called_by Next.js App Router (route: /store/account/addresses)
 *
 * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  Loader2,
  AlertCircle,
  ArrowRight,
  X,
  Check,
} from 'lucide-react';
import type { StoreAddress } from '@/types/store';

/** US states for the state dropdown. */
const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
] as const;

/** Empty address form state. */
const EMPTY_ADDRESS = {
  label: '',
  full_name: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: 'KS',
  zip_code: '',
  phone: '',
  is_default: false,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<StoreAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_ADDRESS);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /**
   * Fetch saved addresses from the API.
   *
   * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
   */
  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/store/addresses');

      if (res.status === 401) {
        setError('sign-in-required');
        return;
      }

      if (!res.ok) throw new Error('Failed to load addresses');

      const data = await res.json();
      setAddresses(data.addresses ?? []);
    } catch {
      setError('Unable to load your addresses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  /**
   * Open the form for adding a new address.
   *
   * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
   */
  function handleAddNew() {
    setEditingId(null);
    setFormData(EMPTY_ADDRESS);
    setShowForm(true);
  }

  /**
   * Open the form for editing an existing address.
   *
   * @param address - The address to edit
   *
   * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
   */
  function handleEdit(address: StoreAddress) {
    setEditingId(address.id);
    setFormData({
      label: address.label,
      full_name: address.full_name,
      address_line1: address.address_line1,
      address_line2: address.address_line2 ?? '',
      city: address.city,
      state: address.state,
      zip_code: address.zip_code,
      phone: address.phone ?? '',
      is_default: address.is_default,
    });
    setShowForm(true);
  }

  /**
   * Cancel form editing and reset state.
   *
   * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
   */
  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_ADDRESS);
  }

  /**
   * Save (create or update) an address via the API.
   *
   * @param e - Form submission event
   *
   * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
   */
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingId
        ? `/api/store/addresses/${editingId}`
        : '/api/store/addresses';

      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save address');

      handleCancel();
      await fetchAddresses();
    } catch {
      setError('Failed to save address. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  /**
   * Delete an address via the API.
   *
   * @param addressId - ID of the address to delete
   *
   * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
   */
  async function handleDelete(addressId: string) {
    setDeletingId(addressId);

    try {
      const res = await fetch(`/api/store/addresses/${addressId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== addressId));
      }
    } catch {
      // Silently fail
    } finally {
      setDeletingId(null);
    }
  }

  /**
   * Set an address as the default.
   *
   * @param addressId - ID of the address to set as default
   *
   * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
   */
  async function handleSetDefault(addressId: string) {
    try {
      const res = await fetch(`/api/store/addresses/${addressId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_default: true }),
      });

      if (res.ok) {
        await fetchAddresses();
      }
    } catch {
      // Silently fail
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 text-sm">Loading your addresses...</p>
      </div>
    );
  }

  // Sign-in required
  if (error === 'sign-in-required') {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Sign in to manage addresses
        </h1>
        <p className="text-gray-500 mb-8">
          Save your shipping addresses for faster checkout.
        </p>
        <Link
          href="/portal"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Sign In
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Saved Addresses
        </h1>
        {!showForm && (
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Address
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && error !== 'sign-in-required' && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl flex items-start gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </h2>
            <button
              type="button"
              onClick={handleCancel}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close form"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
                Label *
              </label>
              <input
                id="label"
                type="text"
                required
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Home, Work, etc."
              />
            </div>
            <div>
              <label htmlFor="addr_full_name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="addr_full_name"
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="addr_line1" className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1 *
            </label>
            <input
              id="addr_line1"
              type="text"
              required
              value={formData.address_line1}
              onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="addr_line2" className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2
            </label>
            <input
              id="addr_line2"
              type="text"
              value={formData.address_line2}
              onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Apt, Suite, Unit (optional)"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="col-span-2">
              <label htmlFor="addr_city" className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                id="addr_city"
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="addr_state" className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <select
                id="addr_state"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="addr_zip" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP *
              </label>
              <input
                id="addr_zip"
                type="text"
                required
                pattern="[0-9]{5}(-[0-9]{4})?"
                value={formData.zip_code}
                onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="addr_phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone (optional)
            </label>
            <input
              id="addr_phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="addr_default"
              type="checkbox"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="addr_default" className="text-sm text-gray-700">
              Set as default address
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {editingId ? 'Update Address' : 'Save Address'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="text-sm text-gray-600 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Address Cards */}
      {addresses.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No saved addresses
          </h2>
          <p className="text-gray-500 mb-6">
            Add a shipping address to speed up checkout.
          </p>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white rounded-xl border p-5 relative ${
                address.is_default ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-200'
              }`}
            >
              {/* Default badge */}
              {address.is_default && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  <Star className="h-3 w-3" />
                  Default
                </span>
              )}

              <h3 className="font-semibold text-gray-900 text-sm mb-2">
                {address.label}
              </h3>
              <div className="text-sm text-gray-600 space-y-0.5">
                <p>{address.full_name}</p>
                <p>{address.address_line1}</p>
                {address.address_line2 && <p>{address.address_line2}</p>}
                <p>
                  {address.city}, {address.state} {address.zip_code}
                </p>
                {address.phone && <p>{address.phone}</p>}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(address)}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
                {!address.is_default && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600 font-medium transition-colors"
                  >
                    <Star className="h-3 w-3" />
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleDelete(address.id)}
                  disabled={deletingId === address.id}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-red-600 font-medium disabled:opacity-50 transition-colors ml-auto"
                >
                  {deletingId === address.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
