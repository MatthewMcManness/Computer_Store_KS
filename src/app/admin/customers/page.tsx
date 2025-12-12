'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, Mail, Phone, Building, Key, Check, X, Loader2 } from 'lucide-react';
import type { RepairShoprCustomer } from '@/lib/repairshopr';

interface CustomerAccount {
  id: string;
  email: string;
  repairshopr_customer_id: number;
  created_at: string;
  updated_at: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<RepairShoprCustomer[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<RepairShoprCustomer | null>(null);
  const [portalAccount, setPortalAccount] = useState<CustomerAccount | null>(null);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    fetch('/api/auth/check')
      .then(res => {
        if (!res.ok) router.push('/admin/login');
      })
      .catch(() => router.push('/admin/login'));
  }, [router]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchCustomers(searchQuery);
      } else {
        setCustomers([]);
        setHasSearched(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search customers
  const searchCustomers = async (query: string) => {
    setSearching(true);
    setHasSearched(true);
    setError(null);

    try {
      const response = await fetch(`/api/repairshopr/customers?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (err) {
      setError('Failed to search customers');
      console.error(err);
      setCustomers([]);
    } finally {
      setSearching(false);
    }
  };

  // Select a customer and load their portal account
  const selectCustomer = async (customer: RepairShoprCustomer) => {
    setSelectedCustomer(customer);
    setPortalAccount(null);
    setLoadingAccount(true);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordSuccess(null);
    setPasswordError(null);

    try {
      const response = await fetch(`/api/admin/customer-accounts?customer_id=${customer.id}`);
      if (!response.ok) throw new Error('Failed to fetch account');

      const data = await response.json();
      setPortalAccount(data.account);
    } catch (err) {
      console.error('Failed to load portal account:', err);
    } finally {
      setLoadingAccount(false);
    }
  };

  // Save password (create or update)
  const handleSavePassword = async () => {
    if (!selectedCustomer) return;

    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setSavingPassword(true);

    try {
      const response = await fetch('/api/admin/customer-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedCustomer.email,
          password: newPassword,
          repairshopr_customer_id: selectedCustomer.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save password');
      }

      const data = await response.json();
      setPortalAccount(data.account);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(data.action === 'created' ? 'Portal account created!' : 'Password updated!');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to save password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
        <p className="mt-1 text-gray-500">Search customers and manage portal access</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Panel - Search & List */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          {/* Search Bar */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Search Customers
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            {searchQuery.length > 0 && searchQuery.length < 2 && (
              <p className="mt-2 text-sm text-gray-500">
                Type at least 2 characters to search
              </p>
            )}
          </div>

          {/* Loading State */}
          {searching && (
            <div className="mb-6 flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
              <span className="ml-3 text-gray-600">Searching...</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Results */}
          {!searching && hasSearched && searchQuery.length >= 2 && (
            <div className="space-y-2">
              {customers.length > 0 ? (
                <>
                  <p className="text-sm font-medium text-gray-700">
                    Found {customers.length} customer{customers.length !== 1 ? 's' : ''}
                  </p>
                  <div className="max-h-96 space-y-2 overflow-y-auto">
                    {customers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => selectCustomer(customer)}
                        className={`w-full rounded-lg border p-4 text-left transition-colors ${
                          selectedCustomer?.id === customer.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {customer.fullname || customer.firstname + ' ' + customer.lastname}
                            </p>
                            {customer.email && (
                              <p className="text-sm text-gray-500 truncate">{customer.email}</p>
                            )}
                            {customer.phone && (
                              <p className="text-sm text-gray-500 truncate">{customer.phone}</p>
                            )}
                            {customer.business_name && (
                              <p className="text-xs text-blue-600 truncate">{customer.business_name}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                  <p className="text-gray-600">No customers found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}

          {/* Initial State */}
          {!searching && !hasSearched && (
            <p className="py-8 text-center text-gray-500">
              Search for customers to get started
            </p>
          )}
        </div>

        {/* Right Panel - Customer Details */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          {!selectedCustomer ? (
            <div className="flex h-full items-center justify-center py-12">
              <div className="text-center">
                <User className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-gray-500">Select a customer to view details</p>
              </div>
            </div>
          ) : (
            <div>
              {/* Customer Info Header */}
              <div className="mb-6 border-b border-gray-200 pb-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                    <User className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedCustomer.fullname}
                    </h2>
                    <p className="text-sm text-gray-500">ID: {selectedCustomer.id}</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mb-6 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Contact Information
                </h3>

                {selectedCustomer.email && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                )}

                {selectedCustomer.phone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                )}

                {selectedCustomer.mobile && selectedCustomer.mobile !== selectedCustomer.phone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{selectedCustomer.mobile} (mobile)</span>
                  </div>
                )}

                {selectedCustomer.business_name && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span>{selectedCustomer.business_name}</span>
                  </div>
                )}

                {selectedCustomer.address && (
                  <div className="flex items-start gap-3 text-gray-600">
                    <div className="mt-0.5 h-4 w-4" />
                    <span className="text-sm">
                      {selectedCustomer.address}
                      {selectedCustomer.city && `, ${selectedCustomer.city}`}
                      {selectedCustomer.state && `, ${selectedCustomer.state}`}
                      {selectedCustomer.zip && ` ${selectedCustomer.zip}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Portal Access Section */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Key className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Customer Portal Access</h3>
                </div>

                {loadingAccount ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading account info...</span>
                  </div>
                ) : (
                  <>
                    {/* Account Status */}
                    <div className="mb-4">
                      {portalAccount ? (
                        <div className="flex items-center gap-2 text-green-700">
                          <Check className="h-4 w-4" />
                          <span className="text-sm">
                            Portal account active (created {new Date(portalAccount.created_at).toLocaleDateString()})
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-700">
                          <X className="h-4 w-4" />
                          <span className="text-sm">No portal account - create one below</span>
                        </div>
                      )}
                    </div>

                    {/* Password Form */}
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          {portalAccount ? 'New Password' : 'Set Password'}
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 8 characters"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      {passwordError && (
                        <p className="text-sm text-red-600">{passwordError}</p>
                      )}

                      {passwordSuccess && (
                        <p className="text-sm text-green-600">{passwordSuccess}</p>
                      )}

                      <button
                        onClick={handleSavePassword}
                        disabled={savingPassword || !newPassword || !confirmPassword}
                        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingPassword ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </span>
                        ) : portalAccount ? (
                          'Update Password'
                        ) : (
                          'Create Portal Account'
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
