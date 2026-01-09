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
  Plus,
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Save,
} from 'lucide-react';
import type { RepairShoprCustomer, RepairShoprAsset, RepairShoprTicket, RepairShoprInvoice, RepairShoprPayment } from '@/lib/repairshopr';

// Protection plan tier type
type ProtectionPlanTier = 'eset' | 'silver' | 'silver-plus' | null;
type EsetStatus = 'protected' | 'expired' | 'unprotected' | null;

// Asset protection plan from API
interface AssetProtectionPlan {
  id: string;
  repairshopr_asset_id: number;
  repairshopr_customer_id: number;
  plan_tier: ProtectionPlanTier;
  eset_status: EsetStatus;
  eset_expiry: string | null;
  created_at: string;
  updated_at: string;
}

// Extended asset with protection plan
interface AssetWithPlan extends RepairShoprAsset {
  protection_plan?: AssetProtectionPlan | null;
}

// Extended customer type with protection plan status from API
interface CustomerWithPlanStatus extends RepairShoprCustomer {
  is_silver_plan?: boolean;
  plan_tier?: ProtectionPlanTier;
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
  plan_tier: ProtectionPlanTier;
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

type TabType = 'assets' | 'tickets' | 'invoices' | 'payments';

export default function CustomersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<CustomerWithPlanStatus[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithPlanStatus | null>(null);
  const [portalAccount, setPortalAccount] = useState<CustomerAccount | null>(null);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('assets');
  const [assets, setAssets] = useState<AssetWithPlan[]>([]);
  const [tickets, setTickets] = useState<RepairShoprTicket[]>([]);
  const [invoices, setInvoices] = useState<RepairShoprInvoice[]>([]);
  const [payments, setPayments] = useState<RepairShoprPayment[]>([]);
  const [loadingTabData, setLoadingTabData] = useState(false);

  // Asset management state
  const [editingAssetId, setEditingAssetId] = useState<number | null>(null);
  const [editingAssetPlan, setEditingAssetPlan] = useState<ProtectionPlanTier>(null);
  const [editingAssetEset, setEditingAssetEset] = useState<EsetStatus>(null);
  const [savingAsset, setSavingAsset] = useState(false);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetType, setNewAssetType] = useState('');
  const [addingAsset, setAddingAsset] = useState(false);

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
    plan_tier: null,
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [planTier, setPlanTier] = useState<ProtectionPlanTier>(null);
  const [loadingPlanTier, setLoadingPlanTier] = useState(false);

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
      if (tab === 'assets') {
        // Fetch assets and their protection plans in parallel
        const [assetsRes, plansRes] = await Promise.all([
          fetch(`/api/repairshopr/customers/${customerId}/assets`),
          fetch(`/api/admin/asset-plans?customer_id=${customerId}`)
        ]);

        if (!assetsRes.ok) throw new Error('Failed to load assets');

        const assetsData = await assetsRes.json();
        const plansData = plansRes.ok ? await plansRes.json() : { plans: [] };

        // Merge protection plans into assets
        const plansMap = new Map<number, AssetProtectionPlan>();
        for (const plan of (plansData.plans || [])) {
          plansMap.set(plan.repairshopr_asset_id, plan);
        }

        const assetsWithPlans: AssetWithPlan[] = (assetsData.assets || []).map((asset: RepairShoprAsset) => ({
          ...asset,
          protection_plan: plansMap.get(asset.id) || null
        }));

        setAssets(assetsWithPlans);
      } else {
        let endpoint = '';
        switch (tab) {
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

  // Start editing an asset's protection plan
  const startEditingAsset = (asset: AssetWithPlan) => {
    setEditingAssetId(asset.id);
    setEditingAssetPlan(asset.protection_plan?.plan_tier ?? null);
    setEditingAssetEset(asset.protection_plan?.eset_status ?? null);
  };

  // Cancel editing an asset
  const cancelEditingAsset = () => {
    setEditingAssetId(null);
    setEditingAssetPlan(null);
    setEditingAssetEset(null);
  };

  // Helper function to update plan tier from asset summary
  const updatePlanTierFromAssets = async (customerId: number) => {
    try {
      const summaryRes = await fetch(`/api/admin/asset-plans?customer_id=${customerId}&summary=true`);
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        const summary = summaryData.summary;

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
          setPlanTier(highestTier);
        } else {
          setPlanTier(null);
        }
      }
    } catch (err) {
      console.error('Failed to update plan tier:', err);
    }
  };

  // Save asset protection plan
  const saveAssetPlan = async (assetId: number) => {
    if (!selectedCustomer) return;

    setSavingAsset(true);
    try {
      const response = await fetch('/api/admin/asset-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_id: assetId,
          customer_id: selectedCustomer.id,
          plan_tier: editingAssetPlan,
          eset_status: editingAssetEset,
        }),
      });

      if (!response.ok) throw new Error('Failed to save asset plan');

      // Reload assets to get updated data
      await loadTabData(selectedCustomer.id, 'assets');

      // Update the card styling based on new highest tier
      await updatePlanTierFromAssets(selectedCustomer.id);

      cancelEditingAsset();
    } catch (err) {
      console.error('Failed to save asset plan:', err);
    } finally {
      setSavingAsset(false);
    }
  };

  // Delete an asset (from RepairShopr)
  const deleteAsset = async (assetId: number) => {
    if (!selectedCustomer) return;
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      const response = await fetch(`/api/repairshopr/assets/${assetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete asset');
      }

      // Also delete the protection plan record
      await fetch(`/api/admin/asset-plans?asset_id=${assetId}&customer_id=${selectedCustomer.id}`, {
        method: 'DELETE',
      });

      // Reload assets
      await loadTabData(selectedCustomer.id, 'assets');

      // Update the card styling based on remaining plans
      await updatePlanTierFromAssets(selectedCustomer.id);
    } catch (err) {
      console.error('Failed to delete asset:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete asset');
    }
  };

  // Add a new asset
  const addAsset = async () => {
    if (!selectedCustomer || !newAssetName.trim()) return;

    setAddingAsset(true);
    try {
      const response = await fetch('/api/repairshopr/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAssetName.trim(),
          customer_id: selectedCustomer.id,
          asset_type_name: newAssetType.trim() || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to add asset');

      // Reload assets
      await loadTabData(selectedCustomer.id, 'assets');
      setShowAddAsset(false);
      setNewAssetName('');
      setNewAssetType('');
    } catch (err) {
      console.error('Failed to add asset:', err);
    } finally {
      setAddingAsset(false);
    }
  };

  // Get plan tier display info
  const getPlanTierDisplay = (tier: ProtectionPlanTier) => {
    switch (tier) {
      case 'eset':
        return { label: 'ESET', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
      case 'silver':
        return { label: 'Silver', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' };
      case 'silver-plus':
        return { label: 'Silver+', className: 'bg-gradient-to-r from-gray-200 to-amber-100 text-gray-800 dark:from-gray-700 dark:to-amber-900/30 dark:text-gray-200' };
      default:
        return null;
    }
  };

  // Get ESET status display info
  const getEsetDisplay = (status: EsetStatus) => {
    switch (status) {
      case 'protected':
        return { label: 'ESET Protected', icon: ShieldCheck, className: 'text-green-600 dark:text-green-400' };
      case 'expired':
        return { label: 'ESET Expired', icon: ShieldAlert, className: 'text-red-600 dark:text-red-400' };
      case 'unprotected':
        return { label: 'No ESET', icon: Shield, className: 'text-gray-400 dark:text-gray-500' };
      default:
        return null;
    }
  };

  // Select a customer and load their portal account + protection plan status (from assets)
  const selectCustomer = async (customer: CustomerWithPlanStatus) => {
    setSelectedCustomer(customer);
    setPortalAccount(null);
    setLoadingAccount(true);
    setPlanTier(null);
    setLoadingPlanTier(true);
    setActiveTab('assets');
    // Clear previous tab data
    setAssets([]);
    setTickets([]);
    setInvoices([]);
    setPayments([]);

    try {
      // Fetch portal account and asset protection summary in parallel
      const [accountRes, summaryRes] = await Promise.all([
        fetch(`/api/admin/customer-accounts?customer_id=${customer.id}`),
        fetch(`/api/admin/asset-plans?customer_id=${customer.id}&summary=true`)
      ]);

      if (accountRes.ok) {
        const accountData = await accountRes.json();
        setPortalAccount(accountData.account);
      }

      // Derive highest plan tier from assets
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        const summary = summaryData.summary;

        if (summary?.plan_tiers && summary.plan_tiers.length > 0) {
          // Get highest tier from assets
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
          setPlanTier(highestTier);
        }
      }
    } catch (err) {
      console.error('Failed to load customer data:', err);
    } finally {
      setLoadingAccount(false);
      setLoadingPlanTier(false);
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
      plan_tier: planTier,
    });
    setEditError(null);
    setShowEditModal(true);
  };

  // Handle edit form input change
  const handleEditInputChange = (field: keyof EditFormData, value: string | boolean | ProtectionPlanTier) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

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
    // Validate required fields
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

      // Add to customer list and select
      setCustomers(prev => [newCustomer, ...prev]);
      selectCustomer(newCustomer);
      setShowAddModal(false);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to create customer');
    } finally {
      setSavingAdd(false);
    }
  };

  // Save customer edits
  const handleSaveEdit = async () => {
    if (!selectedCustomer) return;

    setSavingEdit(true);
    setEditError(null);

    try {
      const { plan_tier: newPlanTier, ...otherFields } = editFormData;

      const updateData: Partial<Omit<EditFormData, 'plan_tier'>> = {};
      for (const [key, value] of Object.entries(otherFields)) {
        const originalValue = selectedCustomer[key as keyof RepairShoprCustomer] || '';
        if (value !== originalValue) {
          updateData[key as keyof Omit<EditFormData, 'plan_tier'>] = value as string;
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

      if (newPlanTier !== planTier) {
        const planRes = await fetch('/api/admin/silver-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: selectedCustomer.id,
            plan_tier: newPlanTier,
          }),
        });

        if (!planRes.ok) {
          throw new Error('Failed to update protection plan');
        }

        setPlanTier(newPlanTier);
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

  // Helper function to get plan tier display info
  const getPlanDisplay = (tier: ProtectionPlanTier) => {
    switch (tier) {
      case 'bronze':
        return { label: 'Bronze', className: 'bronze-plan-badge' };
      case 'silver':
        return { label: 'Silver', className: 'silver-plan-badge' };
      case 'silver-plus':
        return { label: 'Silver Plus', className: 'silver-plus-plan-badge' };
      case 'gold':
        return { label: 'Gold', className: 'gold-plan-badge' };
      default:
        return null;
    }
  };

  // Helper function to get card class based on plan tier
  const getPlanCardClass = (tier: ProtectionPlanTier) => {
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

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">Search and manage customer information</p>
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
                {customers.map((customer) => {
                  const customerPlanClass = customer.plan_tier ? getPlanCardClass(customer.plan_tier) : (customer.is_silver_plan ? 'silver-plan-card' : '');
                  const customerPlanDisplay = customer.plan_tier ? getPlanDisplay(customer.plan_tier) : (customer.is_silver_plan ? { label: 'Silver', className: 'silver-plan-badge' } : null);
                  return (
                    <button
                      key={customer.id}
                      onClick={() => selectCustomer(customer)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
                        selectedCustomer?.id === customer.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                      } ${customerPlanClass}`}
                    >
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {customer.fullname || `${customer.firstname} ${customer.lastname}`}
                      </span>
                      {customerPlanDisplay && (
                        <span className={`${customerPlanDisplay.className} inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold`}>
                          <Sparkles className="h-3 w-3" />
                          {customerPlanDisplay.label}
                        </span>
                      )}
                      {customer.email && (
                        <span className="max-w-[150px] truncate text-sm text-gray-600 dark:text-gray-400">
                          {customer.email}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Customer Info Panel */}
          <div className="lg:col-span-1">
            <div className={`rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900 ${selectedCustomer ? getPlanCardClass(planTier) : ''}`}>
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
                            {loadingPlanTier ? (
                              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                            ) : getPlanDisplay(planTier) && (
                              <span className={`${getPlanDisplay(planTier)!.className} inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold`}>
                                <Sparkles className="h-3 w-3" />
                                {getPlanDisplay(planTier)!.label} Plan
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
                    <nav className="flex -mb-px overflow-x-auto">
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                              activeTab === tab.id
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
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
                          <div className="space-y-3">
                            {assets.length === 0 && !showAddAsset ? (
                              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Monitor className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-2" />
                                No assets found for this customer
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {assets.map((asset) => {
                                  const isEditing = editingAssetId === asset.id;
                                  const planDisplay = getPlanTierDisplay(asset.protection_plan?.plan_tier ?? null);
                                  const esetDisplay = getEsetDisplay(asset.protection_plan?.eset_status ?? null);

                                  return (
                                    <div
                                      key={asset.id}
                                      className={`rounded-lg border p-4 ${
                                        isEditing
                                          ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                                          : 'border-gray-200 dark:border-gray-700'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                          <Monitor className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                                {asset.name}
                                              </p>
                                              {planDisplay && (
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${planDisplay.className}`}>
                                                  {planDisplay.label}
                                                </span>
                                              )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                                              {asset.asset_type_name && (
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                  {asset.asset_type_name}
                                                </span>
                                              )}
                                              {esetDisplay && (
                                                <span className={`inline-flex items-center gap-1 text-xs ${esetDisplay.className}`}>
                                                  <esetDisplay.icon className="h-3.5 w-3.5" />
                                                  {esetDisplay.label}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          {isEditing ? (
                                            <>
                                              <button
                                                onClick={() => saveAssetPlan(asset.id)}
                                                disabled={savingAsset}
                                                className="p-1.5 text-green-600 hover:bg-green-100 rounded dark:text-green-400 dark:hover:bg-green-900/30"
                                                title="Save"
                                              >
                                                {savingAsset ? (
                                                  <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                  <Save className="h-4 w-4" />
                                                )}
                                              </button>
                                              <button
                                                onClick={cancelEditingAsset}
                                                disabled={savingAsset}
                                                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded dark:text-gray-400 dark:hover:bg-gray-700"
                                                title="Cancel"
                                              >
                                                <X className="h-4 w-4" />
                                              </button>
                                            </>
                                          ) : (
                                            <>
                                              <button
                                                onClick={() => startEditingAsset(asset)}
                                                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded dark:text-gray-400 dark:hover:bg-gray-700"
                                                title="Edit protection plan"
                                              >
                                                <Edit2 className="h-4 w-4" />
                                              </button>
                                              <button
                                                onClick={() => deleteAsset(asset.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-100 rounded dark:text-red-400 dark:hover:bg-red-900/30"
                                                title="Delete asset"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      </div>

                                      {/* Edit form */}
                                      {isEditing && (
                                        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800 space-y-4">
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                              Protection Plan
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                              <button
                                                type="button"
                                                onClick={() => setEditingAssetPlan(null)}
                                                className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                                  editingAssetPlan === null
                                                    ? 'bg-gray-600 text-white ring-2 ring-gray-400 ring-offset-2 dark:ring-offset-gray-900'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                                }`}
                                              >
                                                None
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => setEditingAssetPlan('eset' as ProtectionPlanTier)}
                                                className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                                  editingAssetPlan === 'eset'
                                                    ? 'bg-green-600 text-white ring-2 ring-green-400 ring-offset-2 dark:ring-offset-gray-900'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                                }`}
                                              >
                                                ESET
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => setEditingAssetPlan('silver')}
                                                className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                                  editingAssetPlan === 'silver'
                                                    ? 'bg-slate-500 text-white ring-2 ring-slate-400 ring-offset-2 dark:ring-offset-gray-900'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                                }`}
                                              >
                                                Silver
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => setEditingAssetPlan('silver-plus')}
                                                className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                                  editingAssetPlan === 'silver-plus'
                                                    ? 'bg-gradient-to-r from-slate-500 to-amber-500 text-white ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-gray-900'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                                }`}
                                              >
                                                Silver Plus
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Add new asset section */}
                            {showAddAsset ? (
                              <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-800/50">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                      Asset Name *
                                    </label>
                                    <input
                                      type="text"
                                      value={newAssetName}
                                      onChange={(e) => setNewAssetName(e.target.value)}
                                      placeholder="e.g., Dell Laptop"
                                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                      Asset Type
                                    </label>
                                    <input
                                      type="text"
                                      value={newAssetType}
                                      onChange={(e) => setNewAssetType(e.target.value)}
                                      placeholder="e.g., Laptop, Desktop"
                                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => {
                                      setShowAddAsset(false);
                                      setNewAssetName('');
                                      setNewAssetType('');
                                    }}
                                    disabled={addingAsset}
                                    className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={addAsset}
                                    disabled={addingAsset || !newAssetName.trim()}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                  >
                                    {addingAsset ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Plus className="h-4 w-4" />
                                    )}
                                    Add Asset
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setShowAddAsset(true)}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                              >
                                <Plus className="h-5 w-5" />
                                Add New Asset
                              </button>
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
    </div>
  );
}
