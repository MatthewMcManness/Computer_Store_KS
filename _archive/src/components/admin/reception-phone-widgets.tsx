'use client';

import { useState } from 'react';
import { MissedCallsWidget } from './missed-calls-widget';
import { ClickToCallDialog } from './click-to-call-dialog';

interface ReceptionPhoneWidgetsProps {
  /**
   * Currently selected location slug from the location selector.
   * null means "All Locations" is selected.
   */
  selectedLocation: string | null;
}

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
 * NOTE: These widgets only display for the Topeka location since that's
 * the only store using Cytracom phones currently. When selectedLocation
 * is null (all locations) or 'topeka', widgets are shown. Otherwise hidden.
 *
 * @param selectedLocation - Currently selected location slug (null = all locations)
 *
 * @functions_called MissedCallsWidget, ClickToCallDialog
 * @called_by AdminDashboardPage
 *
 * @version 1.0.0 - 2026-01-19T23:30:00Z - Initial implementation
 * @version 1.1.0 - 2026-01-22T18:00:00Z - Added Topeka-only location filtering
 */
export function ReceptionPhoneWidgets({ selectedLocation }: ReceptionPhoneWidgetsProps) {
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

  // Only show Cytracom widgets for Topeka location (or when "All Locations" is selected)
  // Holton doesn't use Cytracom phone system
  const showCytracomWidgets = selectedLocation === null || selectedLocation === 'topeka';

  if (!showCytracomWidgets) {
    return null;
  }

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
