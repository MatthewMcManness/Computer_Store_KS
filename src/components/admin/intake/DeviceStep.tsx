'use client';

import { useState, useEffect } from 'react';
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
  { value: 'Tablet', label: 'Tablet', icon: '📱' },
  { value: 'Phone', label: 'Phone', icon: '📲' },
  { value: 'Other', label: 'Other', icon: '🔧' },
];

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
  const [deviceType, setDeviceType] = useState('Desktop');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');

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
      const response = await fetch('/api/repairshopr/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${brand.trim()} ${model.trim()}`,
          customer_id: customer.id,
          asset_type_name: deviceType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create device');
      }

      const data = await response.json();
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

  return (
    <div className="rounded-lg bg-white p-8 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Step 3: Select Device</h2>
        <p className="mt-2 text-sm text-gray-600">
          Customer: <span className="font-medium text-gray-900">{customer.fullname}</span>
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading devices...</p>
        </div>
      )}

      {/* Existing devices list */}
      {!loading && !showForm && (
        <>
          {devices.length > 0 ? (
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-medium text-gray-700">
                Existing Devices
              </h3>
              <div className="space-y-2">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-purple-300 hover:bg-purple-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {getDeviceIcon(device.asset_type_name)}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{device.name}</p>
                        {device.asset_type_name && (
                          <p className="text-sm text-gray-600">
                            {device.asset_type_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectDevice(device)}
                      className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-indigo-700"
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-6 rounded-lg bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-600">No devices on file</p>
            </div>
          )}

          {/* Add New Device button */}
          <button
            onClick={() => setShowForm(true)}
            className="w-full rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700"
          >
            + Add New Device
          </button>
        </>
      )}

      {/* New device form */}
      {showForm && (
        <form onSubmit={handleCreateDevice} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Add New Device</h3>

          {/* Device Type */}
          <div>
            <label htmlFor="deviceType" className="mb-1 block text-sm font-medium text-gray-700">
              Device Type <span className="text-red-500">*</span>
            </label>
            <select
              id="deviceType"
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            <label htmlFor="brand" className="mb-1 block text-sm font-medium text-gray-700">
              Brand <span className="text-red-500">*</span>
            </label>
            <input
              id="brand"
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g., Dell, HP, Apple"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Model */}
          <div>
            <label htmlFor="model" className="mb-1 block text-sm font-medium text-gray-700">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              id="model"
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g., OptiPlex 7090, MacBook Pro"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Form buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancelForm}
              disabled={creating}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || !brand.trim() || !model.trim()}
              className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 font-medium text-white hover:from-purple-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? 'Adding...' : 'Add Device'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
