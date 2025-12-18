'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, Mail, Phone, Building, Key, Check, X, Loader2, Edit2 } from 'lucide-react';
import type { RepairShoprCustomer } from '@/lib/repairshopr';

interface CustomerAccount {
  id: string;
  email: string;
  repairshopr_customer_id: number;
  created_at: string;
  updated_at: string;
}

interface EditFormData {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  mobile: string;
  address: string;
  address_2: string;
  city: string;
  state: string;
  zip: string;
  business_name: string;
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

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    mobile: '',
    address: '',
    address_2: '',
    city: '',
    state: '',
    zip: '',
    business_name: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

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

  // Open edit modal with current customer data
  const openEditModal = () => {
    if (!selectedCustomer) return;

    setEditFormData({
      firstname: selectedCustomer.firstname || '',
      lastname: selectedCustomer.lastname || '',
      email: selectedCustomer.email || '',
      phone: selectedCustomer.phone || '',
      mobile: selectedCustomer.mobile || '',
      address: selectedCustomer.address || '',
      address_2: selectedCustomer.address_2 || '',
      city: selectedCustomer.city || '',
      state: selectedCustomer.state || '',
      zip: selectedCustomer.zip || '',
      business_name: selectedCustomer.business_name || '',
    });
    setEditError(null);
    setShowEditModal(true);
  };

  // Handle edit form input change
  const handleEditInputChange = (field: keyof EditFormData, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  // Save customer edits
  const handleSaveEdit = async () => {
    if (!selectedCustomer) return;

    setSavingEdit(true);
    setEditError(null);

    try {
      // Only send fields that have changed
      const updateData: Partial<EditFormData> = {};
      for (const [key, value] of Object.entries(editFormData)) {
        const originalValue = selectedCustomer[key as keyof RepairShoprCustomer] || '';
        if (value !== originalValue) {
          updateData[key as keyof EditFormData] = value;
        }
      }

      if (Object.keys(updateData).length === 0) {
        setShowEditModal(false);
        return;
      }

      const response = await fetch(`/api/repairshopr/customers/${selectedCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update customer');
      }

      const data = await response.json();

      // Update selected customer with new data
      setSelectedCustomer(data.customer);

      // Update customer in list
      setCustomers(prev =>
        prev.map(c => (c.id === data.customer.id ? data.customer : c))
      );

      setShowEditModal(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update customer');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customer Management</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">Search customers and manage their information</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Panel - Search & List */}
        <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm">
          {/* Search Bar */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search Customers
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            {searchQuery.length > 0 && searchQuery.length < 2 && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Type at least 2 characters to search
              </p>
            )}
          </div>

          {/* Loading State */}
          {searching && (
            <div className="mb-6 flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">Searching...</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/50 p-3 text-sm text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {/* Results */}
          {!searching && hasSearched && searchQuery.length >= 2 && (
            <div className="space-y-2">
              {customers.length > 0 ? (
                <>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Found {customers.length} customer{customers.length !== 1 ? 's' : ''}
                  </p>
                  <div className="max-h-96 space-y-2 overflow-y-auto">
                    {customers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => selectCustomer(customer)}
                        className={`w-full rounded-lg border p-4 text-left transition-colors ${
                          selectedCustomer?.id === customer.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/30'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                            <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {customer.fullname || customer.firstname + ' ' + customer.lastname}
                            </p>
                            {customer.email && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{customer.email}</p>
                            )}
                            {customer.phone && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{customer.phone}</p>
                            )}
                            {customer.business_name && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 truncate">{customer.business_name}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400">No customers found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}

          {/* Initial State */}
          {!searching && !hasSearched && (
            <p className="py-8 text-center text-gray-500 dark:text-gray-400">
              Search for customers to get started
            </p>
          )}
        </div>

        {/* Right Panel - Customer Details */}
        <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm">
          {!selectedCustomer ? (
            <div className="flex h-full items-center justify-center py-12">
              <div className="text-center">
                <User className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                <p className="mt-2 text-gray-500 dark:text-gray-400">Select a customer to view details</p>
              </div>
            </div>
          ) : (
            <div>
              {/* Customer Info Header */}
              <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                      <User className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedCustomer.fullname}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ID: {selectedCustomer.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={openEditModal}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mb-6 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Contact Information
                </h3>

                {selectedCustomer.email && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                )}

                {selectedCustomer.phone && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                )}

                {selectedCustomer.mobile && selectedCustomer.mobile !== selectedCustomer.phone && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{selectedCustomer.mobile} (mobile)</span>
                  </div>
                )}

                {selectedCustomer.business_name && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span>{selectedCustomer.business_name}</span>
                  </div>
                )}

                {selectedCustomer.address && (
                  <div className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                    <div className="mt-0.5 h-4 w-4" />
                    <span className="text-sm">
                      {selectedCustomer.address}
                      {selectedCustomer.address_2 && `, ${selectedCustomer.address_2}`}
                      {selectedCustomer.city && `, ${selectedCustomer.city}`}
                      {selectedCustomer.state && `, ${selectedCustomer.state}`}
                      {selectedCustomer.zip && ` ${selectedCustomer.zip}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Portal Access Status */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Customer Portal</h3>
                  {loadingAccount ? (
                    <Loader2 className="ml-auto h-4 w-4 animate-spin text-gray-400" />
                  ) : portalAccount ? (
                    <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/50 px-3 py-1 text-sm font-medium text-green-700 dark:text-green-300">
                      <Check className="h-3.5 w-3.5" />
                      Password Set
                    </span>
                  ) : (
                    <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900/50 px-3 py-1 text-sm font-medium text-amber-700 dark:text-amber-300">
                      <X className="h-3.5 w-3.5" />
                      No Password
                    </span>
                  )}
                </div>
                {portalAccount && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Account created {new Date(portalAccount.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Customer</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {editError && (
              <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/50 p-3 text-sm text-red-800 dark:text-red-200">
                {editError}
              </div>
            )}

            <div className="space-y-4">
              {/* Name Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.firstname}
                    onChange={(e) => handleEditInputChange('firstname', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.lastname}
                    onChange={(e) => handleEditInputChange('lastname', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => handleEditInputChange('email', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Phone Numbers */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => handleEditInputChange('phone', e.target.value)}
                    placeholder="Main phone number"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mobile
                  </label>
                  <input
                    type="tel"
                    value={editFormData.mobile}
                    onChange={(e) => handleEditInputChange('mobile', e.target.value)}
                    placeholder="Mobile phone number"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Business Name */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Business Name
                </label>
                <input
                  type="text"
                  value={editFormData.business_name}
                  onChange={(e) => handleEditInputChange('business_name', e.target.value)}
                  placeholder="Optional business name"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Address */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address
                </label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => handleEditInputChange('address', e.target.value)}
                  placeholder="Street address"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={editFormData.address_2}
                  onChange={(e) => handleEditInputChange('address_2', e.target.value)}
                  placeholder="Apt, suite, unit, etc."
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* City, State, Zip */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    City
                  </label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => handleEditInputChange('city', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    State
                  </label>
                  <input
                    type="text"
                    value={editFormData.state}
                    onChange={(e) => handleEditInputChange('state', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={editFormData.zip}
                    onChange={(e) => handleEditInputChange('zip', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={savingEdit}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {savingEdit && <Loader2 className="h-4 w-4 animate-spin" />}
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
