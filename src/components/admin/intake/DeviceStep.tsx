'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { RepairShoprCustomer, RepairShoprAsset } from '@/lib/repairshopr';

// =============================================================================
// Types
// =============================================================================

interface DeviceStepProps {
  customer: RepairShoprCustomer;
  onSelectDevice: (device: RepairShoprAsset) => void;
  onBack: () => void;
}

interface DeviceType {
  value: string;
  label: string;
  icon: string;
}

const deviceTypes: DeviceType[] = [
  { value: 'Desktop', label: 'Desktop', icon: '🖥️' },
  { value: 'Laptop', label: 'Laptop', icon: '💻' },
];

// =============================================================================
// Brand and Model Data
// =============================================================================

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
  'Dell': [
    'Inspiron',
    'XPS',
    'Latitude',
    'Vostro',
    'Precision',
    'Alienware',
    'G Series',
  ],
  'HP': [
    'Pavilion',
    'Envy',
    'Spectre',
    'EliteBook',
    'ProBook',
    'ZBook',
    'OMEN',
    'Victus',
    'OmniBook',
  ],
  'Lenovo': [
    'ThinkPad',
    'IdeaPad',
    'Yoga',
    'Legion',
    'LOQ',
    'ThinkBook',
  ],
  'ASUS': [
    'ZenBook',
    'VivoBook',
    'ROG',
    'TUF Gaming',
    'ExpertBook',
    'ProArt StudioBook',
  ],
  'Acer': [
    'Aspire',
    'Swift',
    'Predator Helios',
    'Nitro',
    'TravelMate',
    'Chromebook',
  ],
  'MSI': [
    'Stealth',
    'Raider',
    'Titan',
    'Creator',
    'Prestige',
    'Modern',
    'Crosshair',
    'Vector',
    'Katana',
    'Thin',
  ],
  'Samsung': [
    'Galaxy Book',
    'Galaxy Book Pro',
    'Galaxy Book Pro 360',
    'Galaxy Book Ultra',
    'Galaxy Book Odyssey',
  ],
  'Microsoft': [
    'Surface Laptop',
    'Surface Pro',
    'Surface Go',
    'Surface Laptop Go',
    'Surface Laptop Studio',
  ],
  'Toshiba/Dynabook': [
    'Portégé',
    'Tecra',
    'Satellite Pro',
  ],
  'Custom Build': [],
};

// Desktop models by brand
const desktopModels: Record<Brand, string[]> = {
  'Dell': [
    'OptiPlex',
    'Precision',
    'Inspiron Desktop',
    'XPS Desktop',
    'Alienware Aurora',
    'Vostro Desktop',
    'G Series Desktop',
  ],
  'HP': [
    'Pavilion Desktop',
    'Envy Desktop',
    'EliteDesk',
    'ProDesk',
    'OMEN Desktop',
    'Victus Desktop',
    'OmniDesk',
    'Z Workstation',
  ],
  'Lenovo': [
    'ThinkCentre',
    'IdeaCentre',
    'Legion Tower',
    'ThinkStation',
    'LOQ Tower',
  ],
  'ASUS': [
    'ROG Desktop',
    'TUF Gaming Desktop',
    'ProArt Desktop',
    'ExpertCenter',
  ],
  'Acer': [
    'Aspire Desktop',
    'Predator Orion',
    'Nitro Desktop',
    'Veriton',
  ],
  'MSI': [
    'Trident',
    'MEG Aegis',
    'MAG Infinite',
    'Codex',
  ],
  'Samsung': [],
  'Microsoft': [
    'Surface Studio',
  ],
  'Toshiba/Dynabook': [],
  'Custom Build': [],
};

// =============================================================================
// Component
// =============================================================================

export function DeviceStep({ customer, onSelectDevice, onBack }: DeviceStepProps) {
  const [devices, setDevices] = useState<RepairShoprAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [deviceType, setDeviceType] = useState<'Desktop' | 'Laptop'>('Desktop');
  const [brand, setBrand] = useState<Brand | ''>('');
  const [model, setModel] = useState('');

  // Get available models based on device type and brand
  const getAvailableModels = (): string[] => {
    if (!brand || brand === 'Custom Build') return [];
    const models = deviceType === 'Laptop' ? laptopModels : desktopModels;
    return models[brand] || [];
  };

  // Reset model when brand or device type changes
  const handleBrandChange = (newBrand: Brand | '') => {
    setBrand(newBrand);
    setModel(''); // Reset model when brand changes
  };

  const handleDeviceTypeChange = (newType: 'Desktop' | 'Laptop') => {
    setDeviceType(newType);
    setModel(''); // Reset model when device type changes
  };

  const isCustomBuild = brand === 'Custom Build';

  // Load customer's existing devices
  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/repairshopr/customers/${customer.id}/assets`);
        if (!response.ok) {
          throw new Error('Failed to fetch devices');
        }
        const data = await response.json();
        setDevices(data.assets || []);
      } catch (err) {
        console.error('Error fetching devices:', err);
        setError('Failed to load devices');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [customer.id]);

  // Get device type icon
  const getDeviceIcon = (assetTypeName?: string | null): string => {
    if (!assetTypeName) return '🔧';
    const deviceType = deviceTypes.find(
      (dt) => dt.value.toLowerCase() === assetTypeName.toLowerCase()
    );
    return deviceType?.icon || '🔧';
  };

  // Handle device selection
  const handleSelectDevice = (device: RepairShoprAsset) => {
    onSelectDevice(device);
  };

  // Handle new device creation
  const handleCreateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreating(true);

    try {
      // Build device name based on brand and model
      let deviceName: string;
      if (isCustomBuild) {
        deviceName = `Custom Build ${deviceType}`;
      } else {
        deviceName = model ? `${brand} ${model}` : brand;
      }

      const response = await fetch('/api/repairshopr/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: deviceName,
          customer_id: customer.id,
          asset_type_name: deviceType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create device');
      }

      const data = await response.json();
      console.log('[DeviceStep] API response:', JSON.stringify(data, null, 2));
      console.log('[DeviceStep] Asset object:', data.asset);
      if (!data.asset) {
        throw new Error('No asset returned from API');
      }
      onSelectDevice(data.asset);
    } catch (err) {
      console.error('Error creating device:', err);
      setError(err instanceof Error ? err.message : 'Failed to create device');
    } finally {
      setCreating(false);
    }
  };

  // Handle cancel new device form
  const handleCancelForm = () => {
    setShowForm(false);
    setDeviceType('Desktop');
    setBrand('');
    setModel('');
    setError(null);
  };

  // Check if form is valid for submission
  const isFormValid = (): boolean => {
    if (!brand) return false;
    if (isCustomBuild) return true; // Custom build doesn't need model
    if (!model) return false;
    return true;
  };

  const availableModels = getAvailableModels();

  return (
    <div className="rounded-lg bg-white dark:bg-gray-900 p-8 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Step 3: Select Device</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Customer: <span className="font-medium text-gray-900 dark:text-white">{customer.fullname}</span>
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/30 p-4 text-sm text-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading devices...</p>
        </div>
      )}

      {/* Existing devices list */}
      {!loading && !showForm && (
        <>
          {devices.length > 0 ? (
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Existing Devices
              </h3>
              <div className="space-y-2">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:hover:border-blue-600 dark:hover:bg-blue-900/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {getDeviceIcon(device.asset_type_name)}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{device.name}</p>
                        {device.asset_type_name && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {device.asset_type_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectDevice(device)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-6 rounded-lg bg-gray-50 dark:bg-gray-800 p-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">No devices on file</p>
            </div>
          )}

          {/* Add New Device button */}
          <button
            onClick={() => setShowForm(true)}
            className="w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400"
          >
            + Add New Device
          </button>

          {/* Back button */}
          <div className="mt-6 flex items-center">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 px-6 py-3 font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            >
              <ChevronLeft className="h-5 w-5" />
              Back
            </button>
          </div>
        </>
      )}

      {/* New device form */}
      {showForm && (
        <form onSubmit={handleCreateDevice} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Device</h3>

          {/* Device Type */}
          <div>
            <label htmlFor="deviceType" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Device Type <span className="text-red-500">*</span>
            </label>
            <select
              id="deviceType"
              value={deviceType}
              onChange={(e) => handleDeviceTypeChange(e.target.value as 'Desktop' | 'Laptop')}
              required
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {deviceTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label htmlFor="brand" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Brand <span className="text-red-500">*</span>
            </label>
            <select
              id="brand"
              value={brand}
              onChange={(e) => handleBrandChange(e.target.value as Brand | '')}
              required
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a brand...</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Model - only show if brand is selected and not Custom Build */}
          {brand && !isCustomBuild && (
            <div>
              <label htmlFor="model" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Model <span className="text-red-500">*</span>
              </label>
              {availableModels.length > 0 ? (
                <select
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a model...</option>
                  {availableModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 px-4 py-2 text-sm text-amber-800 dark:text-amber-300">
                  No {deviceType.toLowerCase()} models available for {brand}.
                  Please select a different brand or device type.
                </p>
              )}
            </div>
          )}

          {/* Custom Build notice */}
          {isCustomBuild && (
            <div className="rounded-lg border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/30 px-4 py-3 text-sm text-green-800 dark:text-green-300">
              Custom Build selected - no model needed.
            </div>
          )}

          {/* Form buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancelForm}
              disabled={creating}
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || !isFormValid()}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? 'Adding...' : 'Add Device'}
            </button>
          </div>

          {/* Back to previous step */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onBack}
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 px-6 py-3 font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 border border-gray-200 dark:border-gray-700"
            >
              <ChevronLeft className="h-5 w-5" />
              Back to Previous Step
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
