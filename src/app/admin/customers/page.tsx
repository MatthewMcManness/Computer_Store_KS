'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Building,
  Loader2,
  Edit2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Sparkles,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';
import type { RepairShoprCustomer } from '@/lib/repairshopr';

// Protection plan tier type
type ProtectionPlanTier = 'eset' | 'bronze' | 'silver' | 'silver-plus' | 'gold' | null;

// Extended customer type with protection plan status
interface CustomerWithPlanStatus extends RepairShoprCustomer {
  plan_tier?: ProtectionPlanTier;
}

interface AddCustomerFormData {
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
  password: string;
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

const CUSTOMERS_PER_PAGE = 50;

export default function CustomersListPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerWithPlanStatus[]>([]);
  const [customerPlans, setCustomerPlans] = useState<Map<number, ProtectionPlanTier>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  // Add customer modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState<AddCustomerFormData>({
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
    password: '',
  });
  const [savingAdd, setSavingAdd] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [showAddPassword, setShowAddPassword] = useState(false);

  // Edit customer modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerWithPlanStatus | null>(null);
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

  // Check authentication and admin status
  useEffect(() => {
    fetch('/api/auth/check')
      .then(res => {
        if (!res.ok) {
          router.push('/admin/login');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data?.user?.role === 'admin') {
          setIsAdmin(true);
        }
      })
      .catch(() => router.push('/admin/login'));
  }, [router]);

  // Load customers
  const loadCustomers = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/repairshopr/customers?page=${page}&per_page=${CUSTOMERS_PER_PAGE}`);
      if (!response.ok) throw new Error('Failed to load customers');

      const data = await response.json();
      setCustomers(data.customers || []);
      setTotalCustomers(data.meta?.total_entries || data.customers?.length || 0);

      // Load protection plans for all customers
      const customerIds = (data.customers || []).map((c: CustomerWithPlanStatus) => c.id);
      if (customerIds.length > 0) {
        loadCustomerPlans(customerIds);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load protection plans for customers
  const loadCustomerPlans = async (customerIds: number[]) => {
    try {
      const plansMap = new Map<number, ProtectionPlanTier>();

      // Fetch plans for each customer in parallel (batch of 10)
      const batchSize = 10;
      for (let i = 0; i < customerIds.length; i += batchSize) {
        const batch = customerIds.slice(i, i + batchSize);
        const results = await Promise.all(
          batch.map(async (customerId) => {
            try {
              const res = await fetch(`/api/admin/asset-plans?customer_id=${customerId}&summary=true`);
              if (res.ok) {
                const data = await res.json();
                const summary = data.summary;
                if (summary?.plan_tiers && summary.plan_tiers.length > 0) {
                  const tierHierarchy: Record<string, number> = {
                    'silver-plus': 3,
                    'silver': 2,
                    'eset': 1,
                  };
                  let highestTier: ProtectionPlanTier = null;
                  for (const tier of summary.plan_tiers) {
                    if (tier && (!highestTier || tierHierarchy[tier] > tierHierarchy[highestTier])) {
                      highestTier = tier as ProtectionPlanTier;
                    }
                  }
                  return { customerId, tier: highestTier };
                }
              }
              return { customerId, tier: null };
            } catch {
              return { customerId, tier: null };
            }
          })
        );

        for (const result of results) {
          if (result.tier) {
            plansMap.set(result.customerId, result.tier);
          }
        }
      }

      setCustomerPlans(plansMap);
    } catch (err) {
      console.error('Failed to load customer plans:', err);
    }
  };

  // Load customers on mount and page change
  useEffect(() => {
    loadCustomers(currentPage);
  }, [currentPage, loadCustomers]);

  // Open add customer modal
  const openAddModal = () => {
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
      business_name: '',
      password: '',
    });
    setAddError(null);
    setShowAddModal(true);
  };

  // Handle add form input change
  const handleAddInputChange = (field: keyof AddCustomerFormData, value: string) => {
    setAddFormData(prev => ({ ...prev, [field]: value }));
  };

  // Create new customer
  const handleAddCustomer = async () => {
    if (!addFormData.firstname.trim() || !addFormData.lastname.trim() || !addFormData.email.trim()) {
      setAddError('First name, last name, and email are required');
      return;
    }

    if (!addFormData.password.trim()) {
      setAddError('Portal password is required');
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
      const newCustomer = data.customer as CustomerWithPlanStatus;

      // Navigate to the new customer's details page
      setShowAddModal(false);
      router.push(`/admin/customers/${newCustomer.id}`);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to create customer');
    } finally {
      setSavingAdd(false);
    }
  };

  // Open edit modal
  const openEditModal = (customer: CustomerWithPlanStatus, e: React.MouseEvent) => {
    e.stopPropagation();
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

      if (Object.keys(updateData).length > 0) {
        const response = await fetch(`/api/repairshopr/customers/${editingCustomer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update customer');
        }

        const data = await response.json();
        // Update the customer in the list
        setCustomers(prev =>
          prev.map(c => (c.id === data.customer.id ? data.customer : c))
        );
      }

      setShowEditModal(false);
      setEditingCustomer(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update customer');
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete customer
  const handleDeleteCustomer = async (customer: CustomerWithPlanStatus, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm(`Are you sure you want to delete ${customer.firstname} ${customer.lastname}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/repairshopr/customers/${customer.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete customer');
      }

      // Remove from list
      setCustomers(prev => prev.filter(c => c.id !== customer.id));
      setTotalCustomers(prev => prev - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete customer');
    }
  };

  // Navigate to customer details
  const navigateToCustomer = (customerId: number) => {
    router.push(`/admin/customers/${customerId}`);
  };

  // Get plan badge display
  const getPlanBadge = (tier: ProtectionPlanTier) => {
    if (!tier) return null;
    switch (tier) {
      case 'silver-plus':
        return (
          <span className="silver-plus-plan-badge inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold">
            <Sparkles className="h-3 w-3" />
            Silver+
          </span>
        );
      case 'silver':
        return (
          <span className="silver-plan-badge inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold">
            <Sparkles className="h-3 w-3" />
            Silver
          </span>
        );
      case 'eset':
        return (
          <span className="eset-plan-badge inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold">
            ESET
          </span>
        );
      default:
        return null;
    }
  };

  // Get card class based on plan tier
  const getCardClass = (tier: ProtectionPlanTier) => {
    switch (tier) {
      case 'eset':
        return 'eset-plan-card';
      case 'silver':
        return 'silver-plan-card';
      case 'silver-plus':
        return 'silver-plus-plan-card';
      default:
        return '';
    }
  };

  const totalPages = Math.ceil(totalCustomers / CUSTOMERS_PER_PAGE);

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {totalCustomers > 0 ? `${totalCustomers} customers total` : 'Manage customer information'}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 font-medium underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : customers.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
          <User className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">No customers found</p>
        </div>
      ) : (
        <>
          {/* Customer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {customers.map((customer) => {
              const planTier = customerPlans.get(customer.id) || null;
              return (
                <div
                  key={customer.id}
                  onClick={() => navigateToCustomer(customer.id)}
                  className={`rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 hover:shadow-md transition-shadow cursor-pointer ${getCardClass(planTier)}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 flex-shrink-0">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {customer.fullname || `${customer.firstname || ''} ${customer.lastname || ''}`.trim() || 'Unknown'}
                          </h3>
                          {getPlanBadge(planTier)}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ID: {customer.id}</p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => openEditModal(customer, e)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:bg-gray-800"
                        title="Edit customer"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={(e) => handleDeleteCustomer(customer, e)}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-lg dark:text-red-400 dark:hover:bg-red-900/30"
                          title="Delete customer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="mt-3 space-y-1">
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                    {customer.business_name && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Building className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{customer.business_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((currentPage - 1) * CUSTOMERS_PER_PAGE) + 1} - {Math.min(currentPage * CUSTOMERS_PER_PAGE, totalCustomers)} of {totalCustomers}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Customer</h2>
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
              {/* Name Fields */}
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
                    placeholder="John"
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
                    placeholder="Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={addFormData.email}
                  onChange={(e) => handleAddInputChange('email', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="john.doe@example.com"
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
                    value={addFormData.phone}
                    onChange={(e) => handleAddInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mobile
                  </label>
                  <input
                    type="tel"
                    value={addFormData.mobile}
                    onChange={(e) => handleAddInputChange('mobile', e.target.value)}
                    placeholder="(555) 987-6543"
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
                  value={addFormData.business_name}
                  onChange={(e) => handleAddInputChange('business_name', e.target.value)}
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
                  value={addFormData.address}
                  onChange={(e) => handleAddInputChange('address', e.target.value)}
                  placeholder="123 Main St"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={addFormData.address_2}
                  onChange={(e) => handleAddInputChange('address_2', e.target.value)}
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
                    value={addFormData.city}
                    onChange={(e) => handleAddInputChange('city', e.target.value)}
                    placeholder="Topeka"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    State
                  </label>
                  <input
                    type="text"
                    value={addFormData.state}
                    onChange={(e) => handleAddInputChange('state', e.target.value)}
                    placeholder="KS"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={addFormData.zip}
                    onChange={(e) => handleAddInputChange('zip', e.target.value)}
                    placeholder="66604"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Portal Password */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Portal Password <span className="text-red-500">*</span>
                  </label>
                  <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                    Password for customer portal access
                  </p>
                  <div className="relative">
                    <input
                      type={showAddPassword ? 'text' : 'password'}
                      value={addFormData.password}
                      onChange={(e) => handleAddInputChange('password', e.target.value)}
                      placeholder="Enter portal password"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddPassword(!showAddPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showAddPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
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
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {savingAdd && <Loader2 className="h-4 w-4 animate-spin" />}
                {savingAdd ? 'Creating...' : 'Create Customer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Customer</h2>
              <button
                onClick={() => { setShowEditModal(false); setEditingCustomer(null); }}
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
                onClick={() => { setShowEditModal(false); setEditingCustomer(null); }}
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
