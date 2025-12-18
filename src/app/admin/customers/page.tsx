'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  User,
  Mail,
  Phone,
  Building,
  Key,
  Check,
  X,
  Loader2,
  Edit2,
  Sparkles,
  MapPin,
  Monitor,
  Ticket,
  Receipt,
  CreditCard,
  Calendar,
  DollarSign,
  ChevronRight,
  FileText,
} from 'lucide-react';
import type { RepairShoprCustomer, RepairShoprAsset, RepairShoprTicket, RepairShoprInvoice, RepairShoprPayment } from '@/lib/repairshopr';

// Extended customer type with silver plan status from API
interface CustomerWithSilverStatus extends RepairShoprCustomer {
  is_silver_plan?: boolean;
}

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
  is_silver_plan: boolean;
}

type TabType = 'assets' | 'tickets' | 'invoices' | 'payments';

export default function CustomersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<CustomerWithSilverStatus[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithSilverStatus | null>(null);
  const [portalAccount, setPortalAccount] = useState<CustomerAccount | null>(null);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('assets');
  const [assets, setAssets] = useState<RepairShoprAsset[]>([]);
  const [tickets, setTickets] = useState<RepairShoprTicket[]>([]);
  const [invoices, setInvoices] = useState<RepairShoprInvoice[]>([]);
  const [payments, setPayments] = useState<RepairShoprPayment[]>([]);
  const [loadingTabData, setLoadingTabData] = useState(false);

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
    is_silver_plan: false,
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [silverPlanStatus, setSilverPlanStatus] = useState<boolean>(false);
  const [loadingSilverPlan, setLoadingSilverPlan] = useState(false);

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

  // Load tab data for the selected customer
  const loadTabData = useCallback(async (customerId: number, tab: TabType) => {
    setLoadingTabData(true);
    try {
      let endpoint = '';
      switch (tab) {
        case 'assets':
          endpoint = `/api/repairshopr/customers/${customerId}/assets`;
          break;
        case 'tickets':
          endpoint = `/api/repairshopr/customers/${customerId}/tickets`;
          break;
        case 'invoices':
          endpoint = `/api/repairshopr/customers/${customerId}/invoices`;
          break;
        case 'payments':
          endpoint = `/api/repairshopr/customers/${customerId}/payments`;
          break;
      }

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`Failed to load ${tab}`);

      const data = await response.json();

      switch (tab) {
        case 'assets':
          setAssets(data.assets || []);
          break;
        case 'tickets':
          setTickets(data.tickets || []);
          break;
        case 'invoices':
          setInvoices(data.invoices || []);
          break;
        case 'payments':
          setPayments(data.payments || []);
          break;
      }
    } catch (err) {
      console.error(`Failed to load ${tab}:`, err);
    } finally {
      setLoadingTabData(false);
    }
  }, []);

  // Load tab data when tab changes or customer changes
  useEffect(() => {
    if (selectedCustomer) {
      loadTabData(selectedCustomer.id, activeTab);
    }
  }, [selectedCustomer, activeTab, loadTabData]);

  // Select a customer and load their portal account + silver plan status
  const selectCustomer = async (customer: CustomerWithSilverStatus) => {
    setSelectedCustomer(customer);
    setPortalAccount(null);
    setLoadingAccount(true);
    setSilverPlanStatus(customer.is_silver_plan ?? false);
    setLoadingSilverPlan(true);
    setActiveTab('assets');
    // Clear previous tab data
    setAssets([]);
    setTickets([]);
    setInvoices([]);
    setPayments([]);

    try {
      // Fetch portal account and verify silver plan from DB in parallel
      const [accountRes, silverPlanRes] = await Promise.all([
        fetch(`/api/admin/customer-accounts?customer_id=${customer.id}`),
        fetch(`/api/admin/silver-plan?customer_id=${customer.id}`)
      ]);

      if (accountRes.ok) {
        const accountData = await accountRes.json();
        setPortalAccount(accountData.account);
      }

      if (silverPlanRes.ok) {
        const silverPlanData = await silverPlanRes.json();
        setSilverPlanStatus(silverPlanData.is_silver_plan ?? customer.is_silver_plan ?? false);
      }
    } catch (err) {
      console.error('Failed to load customer data:', err);
    } finally {
      setLoadingAccount(false);
      setLoadingSilverPlan(false);
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
      is_silver_plan: silverPlanStatus,
    });
    setEditError(null);
    setShowEditModal(true);
  };

  // Handle edit form input change
  const handleEditInputChange = (field: keyof EditFormData, value: string | boolean) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  // Save customer edits
  const handleSaveEdit = async () => {
    if (!selectedCustomer) return;

    setSavingEdit(true);
    setEditError(null);

    try {
      const { is_silver_plan, ...otherFields } = editFormData;

      const updateData: Partial<Omit<EditFormData, 'is_silver_plan'>> = {};
      for (const [key, value] of Object.entries(otherFields)) {
        const originalValue = selectedCustomer[key as keyof RepairShoprCustomer] || '';
        if (value !== originalValue) {
          updateData[key as keyof Omit<EditFormData, 'is_silver_plan'>] = value as string;
        }
      }

      if (Object.keys(updateData).length > 0) {
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
        setSelectedCustomer(data.customer);
        setCustomers(prev =>
          prev.map(c => (c.id === data.customer.id ? data.customer : c))
        );
      }

      if (is_silver_plan !== silverPlanStatus) {
        const silverPlanRes = await fetch('/api/admin/silver-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: selectedCustomer.id,
            is_silver_plan: is_silver_plan,
          }),
        });

        if (!silverPlanRes.ok) {
          throw new Error('Failed to update silver plan status');
        }

        setSilverPlanStatus(is_silver_plan);
      }

      setShowEditModal(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update customer');
    } finally {
      setSavingEdit(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'resolved':
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'customer reply':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
      case 'waiting on customer':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount?: string) => {
    if (!amount) return '$0.00';
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'assets', label: 'Assets', icon: Monitor },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'payments', label: 'Payments', icon: CreditCard },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
        <p className="text-gray-600 dark:text-gray-400">Search and manage customer information</p>
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

        {/* Search Panel - Full Width at Top */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Search Customers
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Name, email, phone, business..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="mt-4">
            {searching ? (
              <div className="py-4 text-center text-gray-500 dark:text-gray-400">Searching...</div>
            ) : !hasSearched ? (
              <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                Enter at least 2 characters to search
              </div>
            ) : customers.length === 0 ? (
              <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                No customers found
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {customers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => selectCustomer(customer)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
                      selectedCustomer?.id === customer.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                    } ${customer.is_silver_plan ? 'silver-plan-card' : ''}`}
                  >
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {customer.fullname || `${customer.firstname} ${customer.lastname}`}
                    </span>
                    {customer.is_silver_plan && (
                      <span className="silver-plan-badge inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold">
                        <Sparkles className="h-3 w-3" />
                      </span>
                    )}
                    {customer.email && (
                      <span className="max-w-[150px] truncate text-sm text-gray-600 dark:text-gray-400">
                        {customer.email}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Customer Info Panel */}
          <div className="lg:col-span-1">
            <div className={`rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900 ${selectedCustomer && silverPlanStatus ? 'silver-plan-card' : ''}`}>
              {!selectedCustomer ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <User className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                  <p className="mt-2 text-center text-gray-500 dark:text-gray-400">
                    Select a customer to view info
                  </p>
                </div>
              ) : (
                <div>
                  {/* Customer Header */}
                  <div className="mb-4 border-b border-gray-200 pb-4 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                          <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate font-bold text-gray-900 dark:text-white">
                              {selectedCustomer.fullname ||
                                `${selectedCustomer.firstname} ${selectedCustomer.lastname}`}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {selectedCustomer.id}</p>
                            {loadingSilverPlan ? (
                              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                            ) : silverPlanStatus && (
                              <span className="silver-plan-badge inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold">
                                <Sparkles className="h-3 w-3" />
                                Silver Plan
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={openEditModal}
                        className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700"
                        title="Edit Customer"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mb-4 space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Contact Information
                    </h4>

                    {selectedCustomer.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{selectedCustomer.email}</span>
                      </div>
                    )}

                    {selectedCustomer.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedCustomer.phone}</span>
                      </div>
                    )}

                    {selectedCustomer.mobile && selectedCustomer.mobile !== selectedCustomer.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedCustomer.mobile} (mobile)</span>
                      </div>
                    )}

                    {selectedCustomer.business_name && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{selectedCustomer.business_name}</span>
                      </div>
                    )}

                    {selectedCustomer.address && (
                      <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                        <span>
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
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Portal Access</span>
                      {loadingAccount ? (
                        <Loader2 className="ml-auto h-4 w-4 animate-spin text-gray-400" />
                      ) : portalAccount ? (
                        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-400">
                          <Check className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
                          <X className="h-3 w-3" />
                          No Password
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customer Details Panel with Tabs */}
          <div className="lg:col-span-2">
            {!selectedCustomer ? (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
                <User className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                <p className="mt-4 text-gray-500 dark:text-gray-400">
                  Select a customer to view details
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Tabs */}
                <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex -mb-px">
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                              activeTab === tab.id
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {loadingTabData ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      <>
                        {/* Assets Tab */}
                        {activeTab === 'assets' && (
                          <div>
                            {assets.length === 0 ? (
                              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Monitor className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-2" />
                                No assets found for this customer
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {assets.map((asset) => (
                                  <div
                                    key={asset.id}
                                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                                  >
                                    <div className="flex items-center gap-3">
                                      <Monitor className="h-5 w-5 text-gray-400" />
                                      <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                          {asset.name}
                                        </p>
                                        {asset.asset_type_name && (
                                          <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {asset.asset_type_name}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Tickets Tab */}
                        {activeTab === 'tickets' && (
                          <div>
                            {tickets.length === 0 ? (
                              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Ticket className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-2" />
                                No tickets found for this customer
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {tickets.map((ticket) => (
                                  <div
                                    key={ticket.id}
                                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                                    onClick={() => router.push(`/admin/tickets?id=${ticket.id}`)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <Ticket className="h-5 w-5 text-gray-400" />
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-gray-900 dark:text-white">
                                            #{ticket.number}
                                          </span>
                                          <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(ticket.status)}`}
                                          >
                                            {ticket.status || 'Unknown'}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-md">
                                          {ticket.subject}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                      <Calendar className="h-4 w-4" />
                                      {formatDate(ticket.created_at)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Invoices Tab */}
                        {activeTab === 'invoices' && (
                          <div>
                            {invoices.length === 0 ? (
                              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Receipt className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-2" />
                                No invoices found for this customer
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {invoices.map((invoice) => (
                                  <div
                                    key={invoice.id}
                                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                                  >
                                    <div className="flex items-center gap-3">
                                      <FileText className="h-5 w-5 text-gray-400" />
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-gray-900 dark:text-white">
                                            Invoice #{invoice.number}
                                          </span>
                                          {invoice.is_paid ? (
                                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-400">
                                              Paid
                                            </span>
                                          ) : parseFloat(invoice.balance_due || '0') > 0 ? (
                                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/50 dark:text-red-400">
                                              Due
                                            </span>
                                          ) : (
                                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                              {invoice.status || 'Unknown'}
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                          {formatDate(invoice.date)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium text-gray-900 dark:text-white">
                                        {formatCurrency(invoice.total)}
                                      </p>
                                      {parseFloat(invoice.balance_due || '0') > 0 && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                          Due: {formatCurrency(invoice.balance_due)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Payments Tab */}
                        {activeTab === 'payments' && (
                          <div>
                            {payments.length === 0 ? (
                              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <CreditCard className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-2" />
                                No payments found for this customer
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {payments.map((payment) => (
                                  <div
                                    key={payment.id}
                                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                                  >
                                    <div className="flex items-center gap-3">
                                      <DollarSign className="h-5 w-5 text-green-500" />
                                      <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                          Payment #{payment.id}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                          {payment.payment_method && (
                                            <span>{payment.payment_method}</span>
                                          )}
                                          {payment.reference && (
                                            <>
                                              <span>•</span>
                                              <span>Ref: {payment.reference}</span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium text-green-600 dark:text-green-400">
                                        {formatCurrency(payment.amount)}
                                      </p>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {formatDate(payment.applied_at || payment.created_at)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
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

                {/* Silver Plan Toggle */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Silver Plan Member
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Enable to show silver plan badge and styling
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleEditInputChange('is_silver_plan', !editFormData.is_silver_plan)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                        editFormData.is_silver_plan ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          editFormData.is_silver_plan ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
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
