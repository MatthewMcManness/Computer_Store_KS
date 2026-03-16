'use client';

import { useState, useEffect } from 'react';
import { Phone, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface Extension {
  extension: string;
  name: string;
  type: string;
  status: string;
}

interface ClickToCallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  customerName?: string;
  customerId?: number;
  context?: string;
}

/**
 * Dialog for initiating click-to-call through Cytracom.
 *
 * Features:
 * - Select extension to call from
 * - Shows call status (initiating, ringing, connected, failed)
 * - Logs call to Supabase with employee info
 *
 * @param isOpen - Whether dialog is visible
 * @param onClose - Callback to close dialog
 * @param phoneNumber - Number to call
 * @param customerName - Optional customer name for logging
 * @param customerId - Optional RepairShopr customer ID
 * @param context - Optional context like ticket number
 *
 * @functions_called fetch
 * @called_by ReceptionDashboard, CustomerDetailPage, TicketDetailPage
 *
 * @version 1.0.0 - 2026-01-19T23:00:00Z - Initial implementation
 */
export function ClickToCallDialog({
  isOpen,
  onClose,
  phoneNumber,
  customerName,
  customerId,
  context,
}: ClickToCallDialogProps) {
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [selectedExtension, setSelectedExtension] = useState<string>('');
  const [isLoadingExtensions, setIsLoadingExtensions] = useState(true);
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'success' | 'error'>('idle');
  const [callMessage, setCallMessage] = useState<string>('');

  // Fetch extensions when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchExtensions();
      setCallStatus('idle');
      setCallMessage('');
    }
  }, [isOpen]);

  const fetchExtensions = async () => {
    setIsLoadingExtensions(true);
    try {
      const response = await fetch('/api/cytracom/extensions');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch extensions');
      }

      setExtensions(data.extensions || []);
      // Auto-select first extension if available
      if (data.extensions?.length > 0 && !selectedExtension) {
        setSelectedExtension(data.extensions[0].extension);
      }
    } catch (err) {
      console.error('Failed to fetch extensions:', err);
    } finally {
      setIsLoadingExtensions(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  };

  const handleCall = async () => {
    if (!selectedExtension || !phoneNumber) return;

    setIsCallInProgress(true);
    setCallStatus('calling');
    setCallMessage('Initiating call...');

    try {
      const response = await fetch('/api/cytracom/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toNumber: phoneNumber,
          fromExtension: selectedExtension,
          customerId,
          customerName,
          context,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to initiate call');
      }

      setCallStatus('success');
      setCallMessage(data.message || 'Call initiated! Your phone will ring first.');

      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      setCallStatus('error');
      setCallMessage(err instanceof Error ? err.message : 'Failed to initiate call');
    } finally {
      setIsCallInProgress(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={callStatus !== 'calling' ? onClose : undefined}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50">
              <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Click to Call</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Call {formatPhoneNumber(phoneNumber)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={callStatus === 'calling'}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Customer Info */}
        {customerName && (
          <div className="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Customer</p>
            <p className="font-medium text-gray-900 dark:text-white">{customerName}</p>
            {context && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{context}</p>
            )}
          </div>
        )}

        {/* Extension Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Call from extension
          </label>
          {isLoadingExtensions ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {extensions.map((ext) => (
                <button
                  key={ext.extension}
                  onClick={() => setSelectedExtension(ext.extension)}
                  disabled={callStatus === 'calling'}
                  className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                    selectedExtension === ext.extension
                      ? 'border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900/30'
                      : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-bold text-gray-900 dark:text-white">
                      {ext.extension}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">{ext.name}</span>
                  </div>
                  {selectedExtension === ext.extension && (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Message */}
        {callStatus !== 'idle' && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-lg p-3 ${
              callStatus === 'calling'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : callStatus === 'success'
                ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {callStatus === 'calling' && <Loader2 className="h-5 w-5 animate-spin" />}
            {callStatus === 'success' && <CheckCircle className="h-5 w-5" />}
            {callStatus === 'error' && <AlertCircle className="h-5 w-5" />}
            <span>{callMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={callStatus === 'calling'}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCall}
            disabled={!selectedExtension || isCallInProgress || callStatus === 'success'}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            {isCallInProgress ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Calling...</span>
              </>
            ) : (
              <>
                <Phone className="h-5 w-5" />
                <span>Call Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
