'use client';

import { useState } from 'react';
import type { RepairShoprCustomer, RepairShoprAsset, RepairShoprTicket } from '@/lib/repairshopr';
import { AlertCircle, Wrench, Cable, Check } from 'lucide-react';

// =============================================================================
// Types
// =============================================================================

interface TicketStepProps {
  customer: RepairShoprCustomer;
  device: RepairShoprAsset;
  onTicketCreated: (ticket: RepairShoprTicket, customer: RepairShoprCustomer) => void | Promise<void>;
  onBack: () => void;
}

interface Service {
  id: string;
  name: string;
  description: string;
}

// =============================================================================
// Service Definitions
// =============================================================================

/**
 * List of services available for selection during intake.
 * These are repair/service-oriented offerings.
 *
 * @version 1.0.0 - 2026-01-13T00:00:00Z - Initial implementation
 */
const AVAILABLE_SERVICES: Service[] = [
  {
    id: 'diagnostics',
    name: 'Diagnostics',
    description: 'Troubleshoot and identify issues',
  },
  {
    id: 'virus_removal',
    name: 'Virus & Malware Removal',
    description: 'Remove viruses, malware, spyware',
  },
  {
    id: 'data_transfer',
    name: 'Data Transfer',
    description: 'Move files and settings to new device',
  },
  {
    id: 'drive_clone',
    name: 'Drive Clone',
    description: 'Clone entire drive to new drive',
  },
  {
    id: 'windows_installation',
    name: 'Windows 11 Installation',
    description: 'Fresh Windows 11 installation',
  },
  {
    id: 'linux_installation',
    name: 'Linux Installation',
    description: 'Linux OS installation',
  },
  {
    id: 'other_os_installation',
    name: 'Other OS Installation',
    description: 'Other operating system installation',
  },
  {
    id: 'install_office',
    name: 'Install Office',
    description: 'Microsoft Office installation',
  },
  {
    id: 'hardware_upgrades',
    name: 'Hardware Upgrades',
    description: 'RAM, SSD, graphics card, etc.',
  },
  {
    id: 'debloat',
    name: 'Windows Debloat',
    description: 'Remove bloatware, optimize Windows',
  },
  {
    id: 'antivirus',
    name: 'Antivirus & Protection',
    description: 'Install antivirus software',
  },
  {
    id: 'eset',
    name: 'ESET',
    description: 'ESET antivirus installation',
  },
  {
    id: 'silver_plan',
    name: 'Silver Plan',
    description: 'Silver protection plan signup',
  },
  {
    id: 'silver_plus',
    name: 'Silver+',
    description: 'Silver+ protection plan signup',
  },
  {
    id: 'screen_repair',
    name: 'Screen Repair/Replacement',
    description: 'Laptop screen repair or replacement',
  },
  {
    id: 'keyboard_repair',
    name: 'Keyboard Repair/Replacement',
    description: 'Keyboard repair or replacement',
  },
  {
    id: 'battery_replacement',
    name: 'Battery Replacement',
    description: 'Laptop battery replacement',
  },
  {
    id: 'cleaning',
    name: 'Cleaning & Maintenance',
    description: 'Internal cleaning, thermal paste',
  },
];

// =============================================================================
// Component
// =============================================================================

/**
 * Ticket creation step in the intake wizard.
 *
 * Allows staff to:
 * - Enter customer's issue description
 * - Select services to be provided (checkboxes)
 * - Indicate if power cord was left with the device
 *
 * @param customer - The customer this ticket is for
 * @param device - The device/asset being serviced
 * @param onTicketCreated - Callback when ticket is successfully created
 * @param onBack - Callback to go back to previous step
 *
 * @functions_called handleSubmit, formatServicesForTicket
 * @called_by IntakeWizard
 *
 * @version 1.0.0 - 2026-01-13T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-01-13T00:00:00Z - Added services checkboxes and power cord tracking
 */
export function TicketStep({ customer, device, onTicketCreated, onBack }: TicketStepProps) {
  const [description, setDescription] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [powerCordLeft, setPowerCordLeft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation - require description and at least one service
  const isValid = description.trim().length >= 10 && selectedServices.length > 0;

  // Protection plan service IDs are mutually exclusive
  const PROTECTION_PLAN_IDS = ['eset', 'silver_plan', 'silver_plus'];

  /**
   * Toggle a service selection. Protection plan services (ESET, Silver, Silver+)
   * are mutually exclusive — selecting one deselects the others.
   *
   * @param serviceId - The service ID to toggle
   *
   * @version 1.0.0 - 2026-01-13T00:00:00Z - Initial implementation
   * @version 2.0.0 - 2026-02-02T00:00:00Z - Made protection plans mutually exclusive
   */
  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      }
      // If selecting a protection plan, remove any other protection plan first
      if (PROTECTION_PLAN_IDS.includes(serviceId)) {
        return [...prev.filter((id) => !PROTECTION_PLAN_IDS.includes(id)), serviceId];
      }
      return [...prev, serviceId];
    });
  };

  /**
   * Format selected services for inclusion in ticket.
   *
   * @returns Formatted string of selected services
   */
  const formatServicesForTicket = (): string => {
    const serviceNames = selectedServices
      .map((id) => AVAILABLE_SERVICES.find((s) => s.id === id)?.name)
      .filter(Boolean);
    return serviceNames.join(', ');
  };

  /**
   * Handle form submission and ticket creation.
   */
  const handleSubmit = async () => {
    if (!isValid) {
      if (description.trim().length < 10) {
        setError('Description must be at least 10 characters');
      } else if (selectedServices.length === 0) {
        setError('Please select at least one service');
      }
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Build the comment body with all intake information
      const commentParts = [
        `Customer states: ${description}`,
        '',
        `Services Requested: ${formatServicesForTicket()}`,
        '',
        `Power Cord Left: ${powerCordLeft ? 'YES' : 'NO'}`,
      ];

      const response = await fetch('/api/repairshopr/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer.id,
          asset_id: device.id,
          subject: `Customer states: ${description.substring(0, 50)}${description.length > 50 ? '...' : ''}`,
          problem_type: 'Repair',
          comment_subject: 'Initial Issue Description',
          comment_body: commentParts.join('\n'),
          // Include services and power cord in custom fields if available
          properties: {
            selected_services: selectedServices,
            power_cord_left: powerCordLeft,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create ticket');
      }

      const data = await response.json();

      if (!data.ticket) {
        throw new Error('Invalid response from server');
      }

      // Auto-assign protection plan to asset if one was selected
      const planMap: Record<string, string> = {
        eset: 'eset',
        silver_plan: 'silver',
        silver_plus: 'silver-plus',
      };
      const selectedPlan = selectedServices.find((id) => PROTECTION_PLAN_IDS.includes(id));
      if (selectedPlan && planMap[selectedPlan]) {
        try {
          await fetch('/api/admin/asset-plans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              asset_id: device.id,
              customer_id: customer.id,
              plan_tier: planMap[selectedPlan],
            }),
          });
        } catch (planErr) {
          console.error('[TicketStep] Failed to assign protection plan:', planErr);
        }
      }

      console.log('[TicketStep] Calling onTicketCreated with:', data.ticket?.id, customer?.id);
      onTicketCreated(data.ticket, customer);
    } catch (err) {
      console.error('Failed to create ticket:', err);
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg bg-white dark:bg-gray-900 p-8 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Step 4: Ticket Information
      </h2>

      {/* Summary Header */}
      <div className="mb-6 rounded-lg bg-blue-50 dark:bg-blue-900/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{customer.fullname}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Device</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{device.name}</p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-lg bg-red-50 dark:bg-red-900/30 p-4 text-red-800 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Issue Description Form */}
      <div className="mb-6">
        <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Customer states: <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (error) setError(null);
          }}
          className="min-h-[150px] w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 p-4 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          placeholder="Describe the issue or repair request in detail..."
          disabled={isSubmitting}
        />
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {description.trim().length < 10 ? (
            <span className="text-red-600 dark:text-red-400">
              At least 10 characters required ({description.trim().length}/10)
            </span>
          ) : (
            <span className="text-green-600 dark:text-green-400">
              {description.trim().length} characters
            </span>
          )}
        </p>
      </div>

      {/* Services Selection */}
      <div className="mb-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Services to be Provided <span className="text-red-500">*</span>
          </h3>
        </div>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Select all services that apply to this repair ticket.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AVAILABLE_SERVICES.map((service) => {
            const isSelected = selectedServices.includes(service.id);
            return (
              <label
                key={service.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex-shrink-0 pt-0.5">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleServiceToggle(service.id)}
                  className="sr-only"
                  disabled={isSubmitting}
                />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'}`}>
                    {service.name}
                  </p>
                  <p className={`text-xs ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>
                    {service.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        {selectedServices.length > 0 && (
          <div className="mt-4 rounded-lg bg-blue-100 dark:bg-blue-900/50 p-3">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Selected: {formatServicesForTicket()}
            </p>
          </div>
        )}

        {selectedServices.length === 0 && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            Please select at least one service
          </p>
        )}
      </div>

      {/* Power Cord Checkbox - Separate Section */}
      <div className="mb-6 rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 p-4">
        <label className="flex cursor-pointer items-center gap-3">
          <div className="flex-shrink-0">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded border-2 transition-colors ${
                powerCordLeft
                  ? 'border-amber-500 bg-amber-500 dark:border-amber-400 dark:bg-amber-500'
                  : 'border-amber-400 dark:border-amber-600'
              }`}
            >
              {powerCordLeft && <Check className="h-4 w-4 text-white" />}
            </div>
          </div>
          <input
            type="checkbox"
            checked={powerCordLeft}
            onChange={(e) => setPowerCordLeft(e.target.checked)}
            className="sr-only"
            disabled={isSubmitting}
          />
          <div className="flex items-center gap-2">
            <Cable className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span className="font-medium text-amber-800 dark:text-amber-200">
              Power cord left with device
            </span>
          </div>
        </label>
        <p className="mt-2 ml-9 text-sm text-amber-700 dark:text-amber-300">
          Check this box if the customer left their power cord/charger with the device.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="rounded-lg bg-white dark:bg-gray-800 px-6 py-3 font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 border border-gray-200 dark:border-gray-700"
        >
          Back
        </button>

        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Creating Ticket...' : 'Create Ticket'}
        </button>
      </div>
    </div>
  );
}
