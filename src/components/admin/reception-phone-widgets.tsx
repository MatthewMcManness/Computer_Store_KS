'use client';

import { useState } from 'react';
import { MissedCallsWidget } from './missed-calls-widget';
import { ClickToCallDialog } from './click-to-call-dialog';

interface CallDialogState {
  isOpen: boolean;
  phoneNumber: string;
  customerName?: string;
  customerId?: number;
  context?: string;
}

/**
 * Wrapper component for phone system widgets on the Reception Dashboard.
 *
 * Manages state for:
 * - Missed calls widget
 * - Click-to-call dialog
 *
 * @functions_called MissedCallsWidget, ClickToCallDialog
 * @called_by AdminDashboardPage
 *
 * @version 1.0.0 - 2026-01-19T23:30:00Z - Initial implementation
 */
export function ReceptionPhoneWidgets() {
  const [callDialog, setCallDialog] = useState<CallDialogState>({
    isOpen: false,
    phoneNumber: '',
  });

  const handleClickToCall = ({
    phoneNumber,
    callerName,
    customerId,
    context,
  }: {
    phoneNumber: string;
    callerName?: string;
    customerId?: number;
    context?: string;
  }) => {
    setCallDialog({
      isOpen: true,
      phoneNumber,
      customerName: callerName,
      customerId,
      context,
    });
  };

  const handleCloseDialog = () => {
    setCallDialog({
      isOpen: false,
      phoneNumber: '',
    });
  };

  return (
    <>
      {/* Missed Calls Widget */}
      <MissedCallsWidget onClickToCall={handleClickToCall} />

      {/* Click-to-Call Dialog */}
      <ClickToCallDialog
        isOpen={callDialog.isOpen}
        onClose={handleCloseDialog}
        phoneNumber={callDialog.phoneNumber}
        customerName={callDialog.customerName}
        customerId={callDialog.customerId}
        context={callDialog.context}
      />
    </>
  );
}
