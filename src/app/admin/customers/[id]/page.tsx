'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
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
  FileText,
  Plus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Save,
  ArrowLeft,
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

type TabType = 'assets' | 'tickets' | 'invoices' | 'payments';

// =============================================================================
// Brand and Model Data (shared with DeviceStep)
// =============================================================================

const deviceTypes = [
  { value: 'Desktop', label: 'Desktop', icon: '🖥️' },
  { value: 'Laptop', label: 'Laptop', icon: '💻' },
] as const;

const brands = [
  'Dell',
  'HP',
  'Lenovo',
  'ASUS',
  'Acer',
  'MSI',
  'Samsung',
  'Microsoft',
  'Toshiba/Dynabook',
  'Custom Build',
] as const;

type Brand = typeof brands[number];

// Laptop models by brand
const laptopModels: Record<Brand, string[]> = {
  'Dell': ['Inspiron', 'XPS', 'Latitude', 'Vostro', 'Precision', 'Alienware', 'G Series'],
  'HP': ['Pavilion', 'Envy', 'Spectre', 'EliteBook', 'ProBook', 'ZBook', 'OMEN', 'Victus', 'OmniBook'],
  'Lenovo': ['ThinkPad', 'IdeaPad', 'Yoga', 'Legion', 'LOQ', 'ThinkBook'],
  'ASUS': ['ZenBook', 'VivoBook', 'ROG', 'TUF Gaming', 'ExpertBook', 'ProArt StudioBook'],
  'Acer': ['Aspire', 'Swift', 'Predator Helios', 'Nitro', 'TravelMate', 'Chromebook'],
  'MSI': ['Stealth', 'Raider', 'Titan', 'Creator', 'Prestige', 'Modern', 'Crosshair', 'Vector', 'Katana', 'Thin'],
  'Samsung': ['Galaxy Book', 'Galaxy Book Pro', 'Galaxy Book Pro 360', 'Galaxy Book Ultra', 'Galaxy Book Odyssey'],
  'Microsoft': ['Surface Laptop', 'Surface Pro', 'Surface Go', 'Surface Laptop Go', 'Surface Laptop Studio'],
  'Toshiba/Dynabook': ['Portégé', 'Tecra', 'Satellite Pro'],
  'Custom Build': [],
};

// Desktop models by brand
const desktopModels: Record<Brand, string[]> = {
  'Dell': ['OptiPlex', 'Precision', 'Inspiron Desktop', 'XPS Desktop', 'Alienware Aurora', 'Vostro Desktop', 'G Series Desktop'],
  'HP': ['Pavilion Desktop', 'Envy Desktop', 'EliteDesk', 'ProDesk', 'OMEN Desktop', 'Victus Desktop', 'OmniDesk', 'Z Workstation'],
  'Lenovo': ['ThinkCentre', 'IdeaCentre', 'Legion Tower', 'ThinkStation', 'LOQ Tower'],
  'ASUS': ['ROG Desktop', 'TUF Gaming Desktop', 'ProArt Desktop', 'ExpertCenter'],
  'Acer': ['Aspire Desktop', 'Predator Orion', 'Nitro Desktop', 'Veriton'],
  'MSI': ['Trident', 'MEG Aegis', 'MAG Infinite', 'Codex'],
  'Samsung': [],
  'Microsoft': ['Surface Studio'],
  'Toshiba/Dynabook': [],
  'Custom Build': [],
};

export default function CustomerDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params?.id as string;

  const [customer, setCustomer] = useState<CustomerWithPlanStatus | null>(null);
  const [portalAccount, setPortalAccount] = useState<CustomerAccount | null>(null);
  const [loading, setLoading] = useState(true);
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
  const [newDeviceType, setNewDeviceType] = useState<'Desktop' | 'Laptop'>('Desktop');
  const [newBrand, setNewBrand] = useState<Brand | ''>('');
  const [newModel, setNewModel] = useState('');
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

  // Check authentication
  useEffect(() => {
    fetch('/api/auth/check')
      .then(res => {
        if (!res.ok) router.push('/login');
      })
      .catch(() => router.push('/login'));
  }, [router]);

  // Load customer by ID
  const loadCustomer = useCallback(async () => {
    if (!customerId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/repairshopr/customers/${customerId}`);
      if (!response.ok) throw new Error('Failed to load customer');
      const data = await response.json();

      if (data.customer) {
        setCustomer(data.customer);
        setLoadingAccount(true);
        setLoadingPlanTier(true);

        // Fetch portal account and asset protection summary
        const [accountRes, summaryRes] = await Promise.all([
          fetch(`/api/admin/customer-accounts?customer_id=${data.customer.id}`),
          fetch(`/api/admin/asset-plans?customer_id=${data.customer.id}&summary=true`)
        ]);

        if (accountRes.ok) {
          const accountData = await accountRes.json();
          setPortalAccount(accountData.account);
        }

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
              if (tier && (!highestTier || (tierHierarchy[tier] ?? 0) > (tierHierarchy[highestTier] ?? 0))) {
                highestTier = tier as ProtectionPlanTier;
              }
            }
            setPlanTier(highestTier);
          }
        }

        setLoadingAccount(false);
        setLoadingPlanTier(false);
      } else {
        setError('Customer not found');
      }
    } catch (err) {
      console.error('Failed to load customer:', err);
      setError('Failed to load customer');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  // Load customer on mount
  useEffect(() => {
    loadCustomer();
  }, [loadCustomer]);

  // Load tab data for the customer
  const loadTabData = useCallback(async (custId: number, tab: TabType) => {
    setLoadingTabData(true);
    try {
      if (tab === 'assets') {
        const [assetsRes, plansRes] = await Promise.all([
          fetch(`/api/repairshopr/customers/${custId}/assets`),
          fetch(`/api/admin/asset-plans?customer_id=${custId}`)
        ]);

        if (!assetsRes.ok) throw new Error('Failed to load assets');

        const assetsData = await assetsRes.json();
        const plansData = plansRes.ok ? await plansRes.json() : { plans: [] };

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
            endpoint = `/api/repairshopr/customers/${custId}/tickets`;
            break;
          case 'invoices':
            endpoint = `/api/repairshopr/customers/${custId}/invoices`;
            break;
          case 'payments':
            endpoint = `/api/repairshopr/customers/${custId}/payments`;
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

  // Load tab data when tab changes or customer loads
  useEffect(() => {
    if (customer) {
      loadTabData(customer.id, activeTab);
    }
  }, [customer, activeTab, loadTabData]);

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
  const updatePlanTierFromAssets = async (custId: number) => {
    try {
      const summaryRes = await fetch(`/api/admin/asset-plans?customer_id=${custId}&summary=true`);
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
            if (tier && (!highestTier || (tierHierarchy[tier] ?? 0) > (tierHierarchy[highestTier] ?? 0))) {
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
    if (!customer) return;

    setSavingAsset(true);
    try {
      const response = await fetch('/api/admin/asset-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_id: assetId,
          customer_id: customer.id,
          plan_tier: editingAssetPlan,
          eset_status: editingAssetEset,
        }),
      });

      if (!response.ok) throw new Error('Failed to save asset plan');

      await loadTabData(customer.id, 'assets');
      await updatePlanTierFromAssets(customer.id);
      cancelEditingAsset();
    } catch (err) {
      console.error('Failed to save asset plan:', err);
    } finally {
      setSavingAsset(false);
    }
  };

  // Delete an asset
  const deleteAsset = async (assetId: number) => {
    if (!customer) return;
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      const response = await fetch(`/api/repairshopr/assets/${assetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete asset');
      }

      await fetch(`/api/admin/asset-plans?asset_id=${assetId}&customer_id=${customer.id}`, {
        method: 'DELETE',
      });

      await loadTabData(customer.id, 'assets');
      await updatePlanTierFromAssets(customer.id);
    } catch (err) {
      console.error('Failed to delete asset:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete asset');
    }
  };

  // Get available models based on device type and brand
  const getAvailableModels = (): string[] => {
    if (!newBrand || newBrand === 'Custom Build') return [];
    const models = newDeviceType === 'Laptop' ? laptopModels : desktopModels;
    return models[newBrand] || [];
  };

  // Handle brand change - reset model when brand changes
  const handleBrandChange = (brand: Brand | '') => {
    setNewBrand(brand);
    setNewModel('');
  };

  // Handle device type change - reset model when type changes
  const handleDeviceTypeChange = (type: 'Desktop' | 'Laptop') => {
    setNewDeviceType(type);
    setNewModel('');
  };

  // Add a new asset
  const addAsset = async () => {
    if (!customer || !newBrand) return;

    // Require model selection unless it's a custom build
    if (newBrand !== 'Custom Build' && !newModel) return;

    setAddingAsset(true);
    try {
      // Build device name based on brand and model
      let deviceName: string;
      if (newBrand === 'Custom Build') {
        deviceName = `Custom Build ${newDeviceType}`;
      } else {
        deviceName = newModel ? `${newBrand} ${newModel}` : newBrand;
      }

      const response = await fetch('/api/repairshopr/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: deviceName,
          customer_id: customer.id,
          asset_type_name: newDeviceType,
        }),
      });

      if (!response.ok) throw new Error('Failed to add asset');

      await loadTabData(customer.id, 'assets');
      setShowAddAsset(false);
      setNewDeviceType('Desktop');
      setNewBrand('');
      setNewModel('');
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

  // Open edit modal with current customer data
  const openEditModal = () => {
    if (!customer) return;

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
      plan_tier: planTier,
    });
    setEditError(null);
    setShowEditModal(true);
  };

  // Handle edit form input change
  const handleEditInputChange = (field: keyof EditFormData, value: string | boolean | ProtectionPlanTier) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  // Save customer edits
  const handleSaveEdit = async () => {
    if (!customer) return;

    setSavingEdit(true);
    setEditError(null);

    try {
      const { plan_tier: newPlanTier, ...otherFields } = editFormData;

      const updateData: Partial<Omit<EditFormData, 'plan_tier'>> = {};
      for (const [key, value] of Object.entries(otherFields)) {
        const originalValue = customer[key as keyof RepairShoprCustomer] || '';
        if (value !== originalValue) {
          updateData[key as keyof Omit<EditFormData, 'plan_tier'>] = value as string;
        }
      }

      if (Object.keys(updateData).length > 0) {
        const response = await fetch(`/api/repairshopr/customers/${customer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update customer');
        }

        const data = await response.json();
        setCustomer(data.customer);
      }

      if (newPlanTier !== planTier) {
        const planRes = await fetch('/api/admin/silver-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: customer.id,
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
      case 'eset':
        return { label: 'ESET', className: 'eset-plan-badge' };
      case 'silver':
        return { label: 'Silver', className: 'silver-plan-badge' };
      case 'silver-plus':
        return { label: 'Silver Plus', className: 'silver-plus-plan-badge' };
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-600 dark:text-red-400">{error || 'Customer not found'}</p>
        <button
          onClick={() => router.push('/admin/customers')}
          className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <button
          onClick={() => router.push('/admin/customers')}
          className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Customer Details</h1>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Customer Info Panel */}
        <div className="lg:col-span-1">
          <div className={`rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900 ${getPlanCardClass(planTier)}`}>
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
                        {customer.fullname || `${customer.firstname} ${customer.lastname}`}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">ID: {customer.id}</p>
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

              {customer.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{customer.email}</span>
                </div>
              )}

              {customer.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{customer.phone}</span>
                </div>
              )}

              {customer.mobile && customer.mobile !== customer.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{customer.mobile} (mobile)</span>
                </div>
              )}

              {customer.business_name && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{customer.business_name}</span>
                </div>
              )}

              {customer.address && (
                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                  <span>
                    {customer.address}
                    {customer.address_2 && `, ${customer.address_2}`}
                    {customer.city && `, ${customer.city}`}
                    {customer.state && `, ${customer.state}`}
                    {customer.zip && ` ${customer.zip}`}
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
        </div>

        {/* Customer Details Panel with Tabs */}
        <div className="lg:col-span-2">
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
                              const assetPlanDisplay = getPlanTierDisplay(asset.protection_plan?.plan_tier ?? null);
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
                                          {assetPlanDisplay && (
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${assetPlanDisplay.className}`}>
                                              {assetPlanDisplay.label}
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
                            <div className="space-y-4 mb-4">
                              {/* Device Type Selection */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Device Type *
                                </label>
                                <div className="flex gap-2">
                                  {deviceTypes.map((type) => (
                                    <button
                                      key={type.value}
                                      type="button"
                                      onClick={() => handleDeviceTypeChange(type.value as 'Desktop' | 'Laptop')}
                                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                                        newDeviceType === type.value
                                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                      }`}
                                    >
                                      <span className="text-lg">{type.icon}</span>
                                      <span className="font-medium">{type.label}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Brand Selection */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Brand *
                                </label>
                                <select
                                  value={newBrand}
                                  onChange={(e) => handleBrandChange(e.target.value as Brand | '')}
                                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Select a brand...</option>
                                  {brands.map((brand) => (
                                    <option key={brand} value={brand}>
                                      {brand}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Model Selection - Only show if brand is selected and not Custom Build */}
                              {newBrand && newBrand !== 'Custom Build' && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Model *
                                  </label>
                                  <select
                                    value={newModel}
                                    onChange={(e) => setNewModel(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="">Select a model...</option>
                                    {getAvailableModels().map((model) => (
                                      <option key={model} value={model}>
                                        {model}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              {/* Preview of asset name */}
                              {newBrand && (newBrand === 'Custom Build' || newModel) && (
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  Asset will be created as: <span className="font-medium text-gray-900 dark:text-white">
                                    {newBrand === 'Custom Build' ? `Custom Build ${newDeviceType}` : `${newBrand} ${newModel}`}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => {
                                  setShowAddAsset(false);
                                  setNewDeviceType('Desktop');
                                  setNewBrand('');
                                  setNewModel('');
                                }}
                                disabled={addingAsset}
                                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={addAsset}
                                disabled={addingAsset || !newBrand || (newBrand !== 'Custom Build' && !newModel)}
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
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && customer && (
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
