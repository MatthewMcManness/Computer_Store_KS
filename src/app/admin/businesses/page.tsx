'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, User, Mail, Phone, Loader2, Edit2, X, UserPlus, Users, Sparkles } from 'lucide-react';
import type { RepairShoprCustomer } from '@/lib/repairshopr';
import { isSilverPlanCustomer } from '@/lib/repairshopr';

interface Business {
  name: string;
  primaryCustomer: RepairShoprCustomer;
  customerCount: number;
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

export default function BusinessesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [businessCustomers, setBusinessCustomers] = useState<RepairShoprCustomer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<RepairShoprCustomer | null>(null);
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

  // Add customer modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState<EditFormData>({
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
  const [savingAdd, setSavingAdd] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

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
        searchBusinesses(searchQuery);
      } else {
        setBusinesses([]);
        setHasSearched(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load business by customer ID from URL param
  const loadBusinessById = useCallback(async (customerId: string) => {
    try {
      // First fetch the customer to get their business_name
      const customerRes = await fetch(`/api/repairshopr/customers/${customerId}`);
      if (!customerRes.ok) throw new Error('Failed to load customer');
      const customerData = await customerRes.json();

      if (customerData.customer?.business_name) {
        const businessName = customerData.customer.business_name;

        // Create a business object and select it
        const business: Business = {
          name: businessName,
          primaryCustomer: customerData.customer,
          customerCount: 1
        };

        setSelectedBusiness(business);
        setBusinessCustomers([]);
        setLoadingCustomers(true);

        // Load all customers for this business
        const customersRes = await fetch(
          '/api/repairshopr/businesses/customers?business_name=' + encodeURIComponent(businessName)
        );
        if (customersRes.ok) {
          const customersData = await customersRes.json();
          setBusinessCustomers(customersData.customers || []);
        }
        setLoadingCustomers(false);
      }
    } catch (err) {
      console.error('Failed to load business:', err);
      setError('Failed to load business');
    }
  }, []);

  // Handle URL params on mount - load business if ID is in URL
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      loadBusinessById(id);
      // Clear the URL param after loading
      router.replace('/admin/businesses', { scroll: false });
    }
  }, [searchParams, loadBusinessById, router]);

  // Search businesses
  const searchBusinesses = async (query: string) => {
    setSearching(true);
    setHasSearched(true);
    setError(null);

    try {
      const response = await fetch('/api/repairshopr/businesses?q=' + encodeURIComponent(query));
      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setBusinesses(data.businesses || []);
    } catch (err) {
      setError('Failed to search businesses');
      console.error(err);
      setBusinesses([]);
    } finally {
      setSearching(false);
    }
  };

  // Select a business and load its customers
  const selectBusiness = async (business: Business) => {
    setSelectedBusiness(business);
    setBusinessCustomers([]);
    setLoadingCustomers(true);

    try {
      const response = await fetch(
        '/api/repairshopr/businesses/customers?business_name=' + encodeURIComponent(business.name)
      );
      if (!response.ok) throw new Error('Failed to fetch customers');

      const data = await response.json();
      setBusinessCustomers(data.customers || []);
    } catch (err) {
      console.error('Failed to load business customers:', err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Open edit modal for a customer
  const openEditModal = (customer: RepairShoprCustomer) => {
    setEditingCustomer(customer);
    setEditFormData({
      firstname: customer.firstname || '',
      lastname: customer.lastname || '',
      email: customer.email || '',
      phone: customer.phone || '',
      mobile: customer.mobile || '',
      address: customer.address || '',
      address_2: customer.address_2 || '',
      city: customer.city || '',
      state: customer.state || '',
      zip: customer.zip || '',
      business_name: customer.business_name || '',
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
    if (!editingCustomer) return;

    setSavingEdit(true);
    setEditError(null);

    try {
      const updateData: Partial<EditFormData> = {};
      for (const [key, value] of Object.entries(editFormData)) {
        const originalValue = editingCustomer[key as keyof RepairShoprCustomer] || '';
        if (value !== originalValue) {
          updateData[key as keyof EditFormData] = value;
        }
      }

      if (Object.keys(updateData).length === 0) {
        setShowEditModal(false);
        return;
      }

      const response = await fetch('/api/repairshopr/customers/' + editingCustomer.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update customer');
      }

      const data = await response.json();

      // Update customer in list
      setBusinessCustomers(prev =>
        prev.map(c => (c.id === data.customer.id ? data.customer : c))
      );

      // Update selected business if primary customer was edited
      if (selectedBusiness && selectedBusiness.primaryCustomer.id === data.customer.id) {
        setSelectedBusiness({
          ...selectedBusiness,
          name: data.customer.business_name || selectedBusiness.name,
          primaryCustomer: data.customer,
        });
      }

      setShowEditModal(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update customer');
    } finally {
      setSavingEdit(false);
    }
  };

  // Open add customer modal
  const openAddModal = () => {
    if (!selectedBusiness) return;

    setAddFormData({
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
      business_name: selectedBusiness.name,
    });
    setAddError(null);
    setShowAddModal(true);
  };

  // Handle add form input change
  const handleAddInputChange = (field: keyof EditFormData, value: string) => {
    setAddFormData(prev => ({ ...prev, [field]: value }));
  };

  // Create new customer under business
  const handleAddCustomer = async () => {
    if (!selectedBusiness) return;

    if (!addFormData.firstname || !addFormData.lastname || !addFormData.email) {
      setAddError('First name, last name, and email are required');
      return;
    }

    setSavingAdd(true);
    setAddError(null);

    try {
      const response = await fetch('/api/repairshopr/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addFormData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create customer');
      }

      const data = await response.json();

      // Add new customer to list
      setBusinessCustomers(prev => [...prev, data.customer]);

      // Update business customer count
      setSelectedBusiness({
        ...selectedBusiness,
        customerCount: selectedBusiness.customerCount + 1,
      });

      setShowAddModal(false);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to create customer');
    } finally {
      setSavingAdd(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Business Management</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">View and manage business customers</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Panel - Business Info */}
        <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm">
          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/50 p-3 text-sm text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {/* Selected Business or Prompt */}
          {!selectedBusiness ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="mt-4 text-center text-gray-500 dark:text-gray-400">
                Use the search bar above to find a business
              </p>
            </div>
          ) : (
            <div className={`rounded-lg border p-4 ${isSilverPlanCustomer(selectedBusiness.primaryCustomer) ? 'silver-plan-card border-blue-500' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50">
                  <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {selectedBusiness.name}
                    </p>
                    {isSilverPlanCustomer(selectedBusiness.primaryCustomer) && (
                      <span className="silver-plan-badge inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold">
                        <Sparkles className="h-3 w-3" />
                        Silver Plan
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {businessCustomers.length} customer{businessCustomers.length !== 1 ? 's' : ''}
                  </p>
                  {selectedBusiness.primaryCustomer.email && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {selectedBusiness.primaryCustomer.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Business Details */}
        <div className={`rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm ${selectedBusiness && isSilverPlanCustomer(selectedBusiness.primaryCustomer) ? 'silver-plan-card' : ''}`}>
          {!selectedBusiness ? (
            <div className="flex h-full items-center justify-center py-12">
              <div className="text-center">
                <Building2 className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                <p className="mt-2 text-gray-500 dark:text-gray-400">Select a business to view details</p>
              </div>
            </div>
          ) : (
            <div>
              {/* Business Header */}
              <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50">
                      <Building2 className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          {selectedBusiness.name}
                        </h2>
                        {isSilverPlanCustomer(selectedBusiness.primaryCustomer) && (
                          <span className="silver-plan-badge inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold">
                            <Sparkles className="h-3 w-3" />
                            Silver Plan
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedBusiness.customerCount} customer{selectedBusiness.customerCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Customer
                  </button>
                </div>
              </div>

              {/* Customers List */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Customers</h3>
                </div>

                {loadingCustomers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Loading customers...</span>
                  </div>
                ) : businessCustomers.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {businessCustomers.map((customer) => {
                      const isSilver = isSilverPlanCustomer(customer);
                      return (
                      <div
                        key={customer.id}
                        className={`rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${isSilver ? 'silver-plan-card' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                              <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {customer.fullname}
                                </p>
                                {isSilver && (
                                  <span className="silver-plan-badge inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold">
                                    <Sparkles className="h-3 w-3" />
                                    Silver Plan
                                  </span>
                                )}
                              </div>
                              {customer.email && (
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                  <Mail className="h-3.5 w-3.5" />
                                  {customer.email}
                                </div>
                              )}
                              {customer.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                  <Phone className="h-3.5 w-3.5" />
                                  {customer.phone}
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => openEditModal(customer)}
                            className="rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );})}
                  </div>
                ) : (
                  <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No customers found for this business
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Customer Modal */}
      {showEditModal && editingCustomer && (
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                  <input
                    type="text"
                    value={editFormData.firstname}
                    onChange={(e) => handleEditInputChange('firstname', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                  <input
                    type="text"
                    value={editFormData.lastname}
                    onChange={(e) => handleEditInputChange('lastname', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => handleEditInputChange('email', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => handleEditInputChange('phone', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Mobile</label>
                  <input
                    type="tel"
                    value={editFormData.mobile}
                    onChange={(e) => handleEditInputChange('mobile', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Business Name</label>
                <input
                  type="text"
                  value={editFormData.business_name}
                  onChange={(e) => handleEditInputChange('business_name', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => handleEditInputChange('address', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Address Line 2</label>
                <input
                  type="text"
                  value={editFormData.address_2}
                  onChange={(e) => handleEditInputChange('address_2', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => handleEditInputChange('city', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
                  <input
                    type="text"
                    value={editFormData.state}
                    onChange={(e) => handleEditInputChange('state', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">ZIP Code</label>
                  <input
                    type="text"
                    value={editFormData.zip}
                    onChange={(e) => handleEditInputChange('zip', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

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

      {/* Add Customer Modal */}
      {showAddModal && selectedBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Customer</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">to {selectedBusiness.name}</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {addError && (
              <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/50 p-3 text-sm text-red-800 dark:text-red-200">
                {addError}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addFormData.firstname}
                    onChange={(e) => handleAddInputChange('firstname', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addFormData.lastname}
                    onChange={(e) => handleAddInputChange('lastname', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={addFormData.email}
                  onChange={(e) => handleAddInputChange('email', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                  <input
                    type="tel"
                    value={addFormData.phone}
                    onChange={(e) => handleAddInputChange('phone', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Mobile</label>
                  <input
                    type="tel"
                    value={addFormData.mobile}
                    onChange={(e) => handleAddInputChange('mobile', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Business Name</label>
                <input
                  type="text"
                  value={addFormData.business_name}
                  disabled
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-500 dark:text-gray-400"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Pre-filled with the selected business</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={savingAdd}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomer}
                disabled={savingAdd}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {savingAdd && <Loader2 className="h-4 w-4 animate-spin" />}
                {savingAdd ? 'Creating...' : 'Add Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
