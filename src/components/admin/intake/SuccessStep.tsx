'use client';

import type { RepairShoprCustomer, RepairShoprAsset, RepairShoprTicket } from '@/lib/repairshopr';
import { isSilverPlanCustomer } from '@/lib/repairshopr';
import { CheckCircle2, User, Laptop, FileText, ShieldCheck, X, Plus, Sparkles } from 'lucide-react';

interface SuccessStepProps {
  customer: RepairShoprCustomer;
  device: RepairShoprAsset;
  ticket: RepairShoprTicket;
  portalAccountCreated: boolean;
  onNewIntake: () => void;
  onAddAnotherDevice: () => void;
}

export function SuccessStep({
  customer,
  device,
  ticket,
  portalAccountCreated,
  onNewIntake,
  onAddAnotherDevice,
}: SuccessStepProps) {
  // Get first 100 characters of issue for preview
  const issuePreview = ticket.subject.length > 100
    ? `${ticket.subject.substring(0, 100)}...`
    : ticket.subject;

  return (
    <div className="rounded-lg bg-white dark:bg-gray-900 p-8 shadow-sm">
      {/* Success Header */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="mb-2 text-3xl font-bold text-green-600 dark:text-green-400">
          Ticket Created!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Customer intake completed successfully
        </p>
      </div>

      {/* Ticket Number Display */}
      <div className="mb-8 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 p-6 text-center">
        <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Ticket Number</p>
        <p className="text-4xl font-bold text-gray-900 dark:text-white">#{ticket.number}</p>
      </div>

      {/* Summary Details */}
      <div className="mb-8 space-y-4">
        {/* Customer */}
        <div className={`flex items-start gap-4 rounded-lg bg-gray-50 dark:bg-gray-800 p-4 ${isSilverPlanCustomer(customer) ? 'silver-plan-card' : ''}`}>
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer</p>
              {isSilverPlanCustomer(customer) && (
                <span className="silver-plan-badge inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold">
                  <Sparkles className="h-3 w-3" />
                  Silver Plan
                </span>
              )}
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{customer.fullname}</p>
            {customer.email && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{customer.email}</p>
            )}
          </div>
        </div>

        {/* Device */}
        <div className="flex items-start gap-4 rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50">
            <Laptop className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Device</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{device.name}</p>
            {device.asset_type_name && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{device.asset_type_name}</p>
            )}
          </div>
        </div>

        {/* Issue */}
        <div className="flex items-start gap-4 rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Issue</p>
            <p className="text-base text-gray-900 dark:text-white">{issuePreview}</p>
          </div>
        </div>
      </div>

      {/* Portal Account Status */}
      <div className="mb-8 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className={`h-6 w-6 ${portalAccountCreated ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`} />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Customer Portal Account</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {portalAccountCreated
                  ? 'Active and ready to use'
                  : 'Not configured'}
              </p>
            </div>
          </div>
          {portalAccountCreated ? (
            <span className="rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-sm font-medium text-green-700 dark:text-green-400">
              Active
            </span>
          ) : (
            <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-sm font-medium text-gray-600 dark:text-gray-400">
              Inactive
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={onAddAnotherDevice}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-3 font-medium text-white shadow-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Add Another Device for {customer.firstname || customer.fullname?.split(' ')[0] || 'Customer'}
        </button>
        <button
          onClick={onNewIntake}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-8 py-3 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <X className="h-5 w-5" />
          Start New Intake
        </button>
      </div>
    </div>
  );
}
