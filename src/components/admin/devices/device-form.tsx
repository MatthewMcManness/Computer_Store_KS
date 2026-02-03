'use client';

import { useState, useEffect } from 'react';
import {
  Monitor,
  Laptop,
  Server,
  Loader2,
  Save,
  X,
  Shield,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { Device, DeviceProtectionTier, CreateDeviceInput, UpdateDeviceInput } from '@/lib/devices';

/**
 * Props for the DeviceForm component.
 */
interface DeviceFormProps {
  /** Existing device for edit mode (null for create mode) */
  device?: Device | null;
  /** Customer ID to pre-fill */
  customerId?: number;
  /** Callback when form is submitted successfully */
  onSuccess?: (device: Device) => void;
  /** Callback when form is cancelled */
  onCancel?: () => void;
  /** Whether the form is in a modal */
  isModal?: boolean;
}

/**
 * Device types available for selection.
 */
const deviceTypes = [
  { value: 'Desktop', label: 'Desktop', icon: Monitor },
  { value: 'Laptop', label: 'Laptop', icon: Laptop },
  { value: 'Server', label: 'Server', icon: Server },
] as const;

/**
 * Protection tier options.
 */
const protectionTiers: {
  value: DeviceProtectionTier;
  label: string;
  description: string;
  icon: typeof Shield;
  color: string;
}[] = [
  {
    value: null,
    label: 'None',
    description: 'No monitoring',
    icon: Shield,
    color: 'gray',
  },
  {
    value: 'eset',
    label: 'ESET',
    description: 'Antivirus protection',
    icon: Shield,
    color: 'green',
  },
  {
    value: 'silver',
    label: 'Silver',
    description: 'NinjaOne RMM',
    icon: ShieldCheck,
    color: 'slate',
  },
  {
    value: 'silver-plus',
    label: 'Silver+',
    description: 'RMM + Priority',
    icon: Sparkles,
    color: 'amber',
  },
];

/**
 * Common device brands.
 */
const brands = [
  'Dell',
  'HP',
  'Lenovo',
  'ASUS',
  'Acer',
  'MSI',
  'Samsung',
  'Microsoft',
  'Apple',
  'Toshiba/Dynabook',
  'Custom Build',
  'Other',
] as const;

/**
 * Form for creating or editing a device.
 *
 * @param props - Component properties
 * @returns JSX element
 *
 * @example
 * // Create mode
 * <DeviceForm customerId={123} onSuccess={(device) => console.log(device)} />
 *
 * // Edit mode
 * <DeviceForm device={existingDevice} onSuccess={(device) => console.log(device)} />
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export function DeviceForm({
  device,
  customerId,
  onSuccess,
  onCancel,
  isModal = false,
}: DeviceFormProps) {
  const isEdit = !!device;

  // Form state
  const [name, setName] = useState(device?.name || '');
  const [deviceType, setDeviceType] = useState(device?.device_type || 'Desktop');
  const [serialNumber, setSerialNumber] = useState(device?.serial_number || '');
  const [manufacturer, setManufacturer] = useState(device?.manufacturer || '');
  const [model, setModel] = useState(device?.model || '');
  const [os, setOs] = useState(device?.os || '');
  const [protectionTier, setProtectionTier] = useState<DeviceProtectionTier>(
    device?.protection_tier || null
  );
  const [notes, setNotes] = useState(device?.notes || '');

  // Form status
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when device changes
  useEffect(() => {
    if (device) {
      setName(device.name || '');
      setDeviceType(device.device_type || 'Desktop');
      setSerialNumber(device.serial_number || '');
      setManufacturer(device.manufacturer || '');
      setModel(device.model || '');
      setOs(device.os || '');
      setProtectionTier(device.protection_tier || null);
      setNotes(device.notes || '');
    }
  }, [device]);

  /**
   * Handle form submission.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    console.log('[DeviceForm] handleSubmit called, customerId:', customerId);

    // Validate required fields
    if (!name.trim()) {
      setError('Device name is required');
      return;
    }

    setSaving(true);

    try {
      const url = isEdit ? `/api/devices/${device.id}` : '/api/devices';
      const method = isEdit ? 'PATCH' : 'POST';

      const body: CreateDeviceInput | UpdateDeviceInput = {
        name: name.trim(),
        device_type: deviceType,
        serial_number: serialNumber.trim() || undefined,
        manufacturer: manufacturer || undefined,
        model: model.trim() || undefined,
        os: os.trim() || undefined,
        protection_tier: protectionTier,
        notes: notes.trim() || undefined,
      };

      // Only include customer_id in create mode
      if (!isEdit && customerId) {
        (body as CreateDeviceInput).customer_id = customerId;
      }

      console.log('[DeviceForm] Submitting to', url, 'with body:', JSON.stringify(body));

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      console.log('[DeviceForm] Response status:', response.status);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.error('[DeviceForm] Error response:', data);
        throw new Error(data.error || `Failed to ${isEdit ? 'update' : 'create'} device`);
      }

      const data = await response.json();
      console.log('[DeviceForm] Success, device:', data.device);
      onSuccess?.(data.device);
    } catch (err) {
      console.error('[DeviceForm] Caught error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Get button color class for protection tier selection.
   */
  const getTierButtonClass = (tier: DeviceProtectionTier, selected: boolean) => {
    if (!selected) {
      return 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800';
    }

    switch (tier) {
      case 'eset':
        return 'border-green-500 bg-green-50 dark:bg-green-900/30 ring-2 ring-green-500/20';
      case 'silver':
        return 'border-slate-500 bg-slate-50 dark:bg-slate-900/30 ring-2 ring-slate-500/20';
      case 'silver-plus':
        return 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 ring-2 ring-amber-500/20';
      default:
        return 'border-gray-500 bg-gray-50 dark:bg-gray-900/30 ring-2 ring-gray-500/20';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Device Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Device Type *
        </label>
        <div className="flex gap-2">
          {deviceTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = deviceType === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setDeviceType(type.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Device Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Device Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Dell Latitude 5520"
          required
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Manufacturer and Model */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Manufacturer
          </label>
          <select
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Select manufacturer...</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Model
          </label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g., Latitude 5520"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Serial Number and OS */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Serial Number
          </label>
          <input
            type="text"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            placeholder="e.g., ABC123XYZ"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Operating System
          </label>
          <input
            type="text"
            value={os}
            onChange={(e) => setOs(e.target.value)}
            placeholder="e.g., Windows 11 Pro"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Protection Tier */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Protection Plan
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {protectionTiers.map((tier) => {
            const Icon = tier.icon;
            const isSelected = protectionTier === tier.value;
            return (
              <button
                key={tier.value ?? 'none'}
                type="button"
                onClick={() => setProtectionTier(tier.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${getTierButtonClass(
                  tier.value,
                  isSelected
                )}`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium text-sm">{tier.label}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {tier.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Additional notes about this device..."
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
        />
      </div>

      {/* Form Actions */}
      <div className={`flex gap-3 ${isModal ? 'justify-end' : ''}`}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isEdit ? 'Saving...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isEdit ? 'Save Changes' : 'Create Device'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/**
 * Modal wrapper for the DeviceForm.
 */
interface DeviceFormModalProps extends DeviceFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeviceFormModal({
  isOpen,
  onClose,
  device,
  customerId,
  onSuccess,
}: DeviceFormModalProps) {
  if (!isOpen) return null;

  const handleSuccess = (newDevice: Device) => {
    onSuccess?.(newDevice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {device ? 'Edit Device' : 'Add New Device'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <DeviceForm
          device={device}
          customerId={customerId}
          onSuccess={handleSuccess}
          onCancel={onClose}
          isModal
        />
      </div>
    </div>
  );
}

export default DeviceForm;
