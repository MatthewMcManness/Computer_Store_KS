'use client';

/**
 * Reusable address form for checkout and saved address management.
 *
 * Renders labeled fields for full address entry with US state dropdown.
 * Supports optional label, is_default checkbox, and passes validated
 * data to the parent via onSubmit callback.
 *
 * @param onSubmit - Callback with address data on valid submission
 * @param initialData - Optional pre-filled address values
 * @param showLabel - Show the address label field (e.g., "Home", "Work")
 * @param showDefault - Show the "Set as default" checkbox
 * @param submitText - Button label (default "Save Address")
 * @param loading - Disable form during submission
 *
 * @functions_called none
 * @called_by CheckoutForm, AccountAddressesPage
 *
 * @version 1.0.0 - 2026-03-02T19:01:13Z - Initial implementation
 */

import { useState } from 'react';
import type { StoreAddress } from '@/types/store';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
] as const;

export interface AddressFormData {
  label: string;
  full_name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  is_default: boolean;
}

interface AddressFormProps {
  onSubmit: (data: AddressFormData) => void;
  initialData?: Partial<StoreAddress>;
  showLabel?: boolean;
  showDefault?: boolean;
  submitText?: string;
  loading?: boolean;
}

export function AddressForm({
  onSubmit,
  initialData,
  showLabel = true,
  showDefault = true,
  submitText = 'Save Address',
  loading = false,
}: AddressFormProps) {
  const [form, setForm] = useState<AddressFormData>({
    label: initialData?.label ?? '',
    full_name: initialData?.full_name ?? '',
    address_line1: initialData?.address_line1 ?? '',
    address_line2: initialData?.address_line2 ?? '',
    city: initialData?.city ?? '',
    state: initialData?.state ?? '',
    zip_code: initialData?.zip_code ?? '',
    phone: initialData?.phone ?? '',
    is_default: initialData?.is_default ?? false,
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const target = e.target;
    const value =
      target instanceof HTMLInputElement && target.type === 'checkbox'
        ? target.checked
        : target.value;
    setForm((prev) => ({ ...prev, [target.name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showLabel && (
        <div>
          <label htmlFor="addr-label" className="block text-sm font-medium text-gray-700 mb-1">
            Label
          </label>
          <input
            id="addr-label"
            name="label"
            type="text"
            value={form.label}
            onChange={handleChange}
            placeholder='e.g., "Home", "Work"'
            className={inputClass}
          />
        </div>
      )}

      <div>
        <label htmlFor="addr-full-name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          id="addr-full-name"
          name="full_name"
          type="text"
          required
          value={form.full_name}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="addr-line1" className="block text-sm font-medium text-gray-700 mb-1">
          Address Line 1 *
        </label>
        <input
          id="addr-line1"
          name="address_line1"
          type="text"
          required
          value={form.address_line1}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="addr-line2" className="block text-sm font-medium text-gray-700 mb-1">
          Address Line 2
        </label>
        <input
          id="addr-line2"
          name="address_line2"
          type="text"
          value={form.address_line2}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="addr-city" className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            id="addr-city"
            name="city"
            type="text"
            required
            value={form.city}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="addr-state" className="block text-sm font-medium text-gray-700 mb-1">
            State *
          </label>
          <select
            id="addr-state"
            name="state"
            required
            value={form.state}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select</option>
            {US_STATES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="addr-zip" className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code *
          </label>
          <input
            id="addr-zip"
            name="zip_code"
            type="text"
            required
            pattern="[0-9]{5}(-[0-9]{4})?"
            value={form.zip_code}
            onChange={handleChange}
            placeholder="66604"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="addr-phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          id="addr-phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          placeholder="(555) 123-4567"
          className={inputClass}
        />
      </div>

      {showDefault && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="is_default"
            checked={form.is_default}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Set as default address</span>
        </label>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Saving...' : submitText}
      </button>
    </form>
  );
}
