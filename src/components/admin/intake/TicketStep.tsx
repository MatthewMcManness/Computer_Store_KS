'use client';

import { useState } from 'react';
import type { RepairShoprCustomer, RepairShoprAsset, RepairShoprTicket } from '@/lib/repairshopr';
import { AlertCircle } from 'lucide-react';

interface TicketStepProps {
  customer: RepairShoprCustomer;
  device: RepairShoprAsset;
  onTicketCreated: (ticket: RepairShoprTicket) => void;
  onBack: () => void;
}

export function TicketStep({ customer, device, onTicketCreated, onBack }: TicketStepProps) {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation
  const isValid = description.trim().length >= 10;

  const handleSubmit = async () => {
    if (!isValid) {
      setError('Description must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/repairshopr/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer.id,
          asset_id: device.id,
          subject: `Customer states: ${description.substring(0, 50)}${description.length > 50 ? '...' : ''}`,
          problem_type: 'Repair',
          comment_body: `Customer states: ${description}`,
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

      onTicketCreated(data.ticket);
    } catch (err) {
      console.error('Failed to create ticket:', err);
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-8 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Step 4: Ticket Information
      </h2>

      {/* Summary Header */}
      <div className="mb-6 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Customer</p>
            <p className="text-lg font-semibold text-gray-900">{customer.fullname}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600">Device</p>
            <p className="text-lg font-semibold text-gray-900">{device.name}</p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-lg bg-red-50 p-4 text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Issue Description Form */}
      <div className="mb-6">
        <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">
          Customer states:
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (error) setError(null);
          }}
          className="min-h-[200px] w-full rounded-lg border border-gray-300 p-4 text-base focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          placeholder="Describe the issue or repair request in detail..."
          disabled={isSubmitting}
        />
        <p className="mt-2 text-sm text-gray-500">
          {description.trim().length < 10 ? (
            <span className="text-red-600">
              At least 10 characters required ({description.trim().length}/10)
            </span>
          ) : (
            <span className="text-green-600">
              {description.trim().length} characters
            </span>
          )}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="rounded-lg bg-white px-6 py-3 font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>

        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-medium text-white hover:from-purple-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Creating Ticket...' : 'Create Ticket'}
        </button>
      </div>
    </div>
  );
}
