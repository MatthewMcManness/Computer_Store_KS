'use client';

/**
 * Checkout shipping address form.
 *
 * If the user is logged in, allows selecting from saved addresses or
 * entering a new one. For guests, shows the address form directly.
 * Submitting triggers the checkout flow.
 *
 * @param savedAddresses - User's saved addresses (empty for guests)
 * @param onSubmit - Callback with address and contact info for checkout
 *
 * @functions_called AddressForm
 * @called_by CheckoutPage
 *
 * @version 1.0.0 - 2026-03-02T19:01:13Z - Initial implementation
 */

import { useState } from 'react';
import type { StoreAddress, OrderAddress } from '@/types/store';
import { AddressForm } from './address-form';
import type { AddressFormData } from './address-form';

interface CheckoutFormProps {
  savedAddresses?: StoreAddress[];
  onSubmit: (data: {
    shipping_address: OrderAddress;
    customer_email: string;
    customer_name: string;
  }) => void;
  loading?: boolean;
}

export function CheckoutForm({
  savedAddresses = [],
  onSubmit,
  loading = false,
}: CheckoutFormProps) {
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    savedAddresses.find((a) => a.is_default)?.id ?? 'new'
  );
  const [email, setEmail] = useState('');

  const selectedSaved = savedAddresses.find((a) => a.id === selectedAddressId);

  function handleAddressSubmit(data: AddressFormData) {
    const address: OrderAddress = {
      full_name: data.full_name,
      address_line1: data.address_line1,
      address_line2: data.address_line2 || undefined,
      city: data.city,
      state: data.state,
      zip_code: data.zip_code,
      phone: data.phone || undefined,
    };

    onSubmit({
      shipping_address: address,
      customer_email: email,
      customer_name: data.full_name,
    });
  }

  function handleSavedSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSaved) return;

    const address: OrderAddress = {
      full_name: selectedSaved.full_name,
      address_line1: selectedSaved.address_line1,
      address_line2: selectedSaved.address_line2 || undefined,
      city: selectedSaved.city,
      state: selectedSaved.state,
      zip_code: selectedSaved.zip_code,
      phone: selectedSaved.phone || undefined,
    };

    onSubmit({
      shipping_address: address,
      customer_email: email,
      customer_name: selectedSaved.full_name,
    });
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">
        Shipping Information
      </h2>

      {/* Email */}
      <div>
        <label
          htmlFor="checkout-email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email Address *
        </label>
        <input
          id="checkout-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="you@example.com"
        />
      </div>

      {/* Saved Address Selector */}
      {savedAddresses.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shipping Address
          </label>
          <div className="space-y-2">
            {savedAddresses.map((addr) => (
              <label
                key={addr.id}
                className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                  selectedAddressId === addr.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="saved_address"
                  value={addr.id}
                  checked={selectedAddressId === addr.id}
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                  className="mt-1 h-4 w-4 text-blue-600"
                />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {addr.label || addr.full_name}
                  </p>
                  <p className="text-gray-600">
                    {addr.address_line1}
                    {addr.address_line2 ? `, ${addr.address_line2}` : ''}
                  </p>
                  <p className="text-gray-600">
                    {addr.city}, {addr.state} {addr.zip_code}
                  </p>
                </div>
              </label>
            ))}

            <label
              className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                selectedAddressId === 'new'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="saved_address"
                value="new"
                checked={selectedAddressId === 'new'}
                onChange={(e) => setSelectedAddressId(e.target.value)}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-900">
                Use a new address
              </span>
            </label>
          </div>

          {/* Submit for saved address */}
          {selectedAddressId !== 'new' && (
            <form onSubmit={handleSavedSubmit} className="mt-4">
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : 'Continue to Payment'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* New Address Form */}
      {(selectedAddressId === 'new' || savedAddresses.length === 0) && (
        <AddressForm
          onSubmit={handleAddressSubmit}
          showLabel={false}
          showDefault={false}
          submitText={loading ? 'Processing...' : 'Continue to Payment'}
          loading={loading || !email}
        />
      )}
    </div>
  );
}
