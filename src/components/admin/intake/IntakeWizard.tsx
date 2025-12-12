'use client';

import { useReducer, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { RepairShoprCustomer, RepairShoprAsset, RepairShoprTicket } from '@/lib/repairshopr';
import { CustomerSearchStep } from './CustomerSearchStep';
import { CustomerFormStep } from './CustomerFormStep';
import { DeviceStep } from './DeviceStep';
import { TicketStep } from './TicketStep';
import { SuccessStep } from './SuccessStep';
import { PasswordSetupModal } from './PasswordSetupModal';

// =============================================================================
// Types
// =============================================================================

interface IntakeState {
  step: number;
  customer: RepairShoprCustomer | null;
  isNewCustomer: boolean;
  customerType: 'individual' | 'business' | null;
  device: RepairShoprAsset | null;
  isNewDevice: boolean;
  ticketDescription: string;
  createdTicket: RepairShoprTicket | null;
  hasPortalAccount: boolean;
}

type IntakeAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'JUMP_TO_STEP'; step: number }
  | { type: 'SET_CUSTOMER'; customer: RepairShoprCustomer; isNew: boolean; customerType?: 'individual' | 'business' }
  | { type: 'SET_DEVICE'; device: RepairShoprAsset; isNew: boolean }
  | { type: 'SET_TICKET_DESCRIPTION'; description: string }
  | { type: 'SET_CREATED_TICKET'; ticket: RepairShoprTicket }
  | { type: 'SET_PORTAL_ACCOUNT'; hasAccount: boolean }
  | { type: 'CONTINUE_WITH_CUSTOMER' }
  | { type: 'RESET' };

// =============================================================================
// Reducer
// =============================================================================

const initialState: IntakeState = {
  step: 1,
  customer: null,
  isNewCustomer: false,
  customerType: null,
  device: null,
  isNewDevice: false,
  ticketDescription: '',
  createdTicket: null,
  hasPortalAccount: false,
};

function intakeReducer(state: IntakeState, action: IntakeAction): IntakeState {
  switch (action.type) {
    case 'NEXT_STEP':
      return { ...state, step: Math.min(state.step + 1, 5) };
    case 'PREV_STEP':
      return { ...state, step: Math.max(state.step - 1, 1) };
    case 'JUMP_TO_STEP':
      return { ...state, step: action.step };
    case 'SET_CUSTOMER':
      return {
        ...state,
        customer: action.customer,
        isNewCustomer: action.isNew,
        customerType: action.customerType || state.customerType,
      };
    case 'SET_DEVICE':
      return {
        ...state,
        device: action.device,
        isNewDevice: action.isNew,
      };
    case 'SET_TICKET_DESCRIPTION':
      return {
        ...state,
        ticketDescription: action.description,
      };
    case 'SET_CREATED_TICKET':
      return {
        ...state,
        createdTicket: action.ticket,
      };
    case 'SET_PORTAL_ACCOUNT':
      return {
        ...state,
        hasPortalAccount: action.hasAccount,
      };
    case 'CONTINUE_WITH_CUSTOMER':
      // Keep customer selected, clear device/ticket, go to device step
      return {
        ...state,
        step: 3,
        device: null,
        isNewDevice: false,
        ticketDescription: '',
        createdTicket: null,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// =============================================================================
// Component
// =============================================================================

export function IntakeWizard() {
  const [state, dispatch] = useReducer(intakeReducer, initialState);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [checkingPortalAccount, setCheckingPortalAccount] = useState(false);
  const [countdown, setCountdown] = useState(4);

  // Auto-advance from success step after 4 seconds
  useEffect(() => {
    if (state.step === 5 && state.createdTicket) {
      setCountdown(4);
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      const timeout = setTimeout(() => {
        dispatch({ type: 'CONTINUE_WITH_CUSTOMER' });
      }, 4000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [state.step, state.createdTicket]);

  const handleNext = () => {
    dispatch({ type: 'NEXT_STEP' });
  };

  const handleBack = () => {
    dispatch({ type: 'PREV_STEP' });
  };

  const handleNewIntake = () => {
    dispatch({ type: 'RESET' });
    setShowPasswordModal(false);
  };

  const handleSelectCustomer = (customer: RepairShoprCustomer, skipToDevice: boolean) => {
    dispatch({ type: 'SET_CUSTOMER', customer, isNew: false });
    if (skipToDevice) {
      // Skip step 2 (customer details) and go directly to step 3 (device selection)
      dispatch({ type: 'JUMP_TO_STEP', step: 3 });
    } else {
      dispatch({ type: 'NEXT_STEP' });
    }
  };

  const handleCreateNew = (type: 'individual' | 'business') => {
    dispatch({ type: 'SET_CUSTOMER', customer: {} as RepairShoprCustomer, isNew: true, customerType: type });
    dispatch({ type: 'NEXT_STEP' });
  };

  const handleSelectDevice = (device: RepairShoprAsset) => {
    dispatch({ type: 'SET_DEVICE', device, isNew: false });
    dispatch({ type: 'NEXT_STEP' });
  };

  const handleCustomerCreated = (customer: RepairShoprCustomer) => {
    dispatch({ type: 'SET_CUSTOMER', customer, isNew: true });
    dispatch({ type: 'NEXT_STEP' });
  };

  // Check if customer has a password saved in Supabase
  const checkForSavedPassword = async (customerId: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/customer-accounts?customer_id=${customerId}`);
      const data = await response.json();

      // If there's an account with data, they have a password saved
      if (data.account && data.account.id) {
        console.log('[Intake] Customer has saved password:', customerId);
        return true;
      }

      console.log('[Intake] Customer has NO saved password:', customerId);
      return false;
    } catch (error) {
      console.error('[Intake] Error checking for saved password:', error);
      // On error, assume no password (show the modal)
      return false;
    }
  };

  const handleTicketCreated = async (ticket: RepairShoprTicket, customer: RepairShoprCustomer) => {
    console.log('[Intake] handleTicketCreated called!');

    try {
      dispatch({ type: 'SET_CREATED_TICKET', ticket });

      // Check if customer has a password saved in our database
      console.log('[Intake] Ticket created for customer:', customer?.id, customer?.fullname, customer?.email);

      if (!customer) {
        console.error('[Intake] No customer provided!');
        dispatch({ type: 'NEXT_STEP' });
        return;
      }

      setCheckingPortalAccount(true);
      console.log('[Intake] Checking for saved password...');

      const hasPassword = await checkForSavedPassword(customer.id);
      console.log('[Intake] Password check result:', hasPassword);

      dispatch({ type: 'SET_PORTAL_ACCOUNT', hasAccount: hasPassword });
      setCheckingPortalAccount(false);

      console.log('[Intake] Customer email:', customer.email, 'hasPassword:', hasPassword);

      if (!hasPassword && customer.email) {
        // No password saved and customer has email - show password setup modal
        console.log('[Intake] Showing password modal');
        setShowPasswordModal(true);
      } else if (!hasPassword && !customer.email) {
        // No password and no email - can't create account, skip to success
        console.log('[Intake] No email, skipping password modal');
        dispatch({ type: 'NEXT_STEP' });
      } else {
        // Customer already has password saved, go to success
        console.log('[Intake] Password exists, going to success');
        dispatch({ type: 'NEXT_STEP' });
      }
    } catch (error) {
      console.error('[Intake] Error in handleTicketCreated:', error);
      dispatch({ type: 'NEXT_STEP' });
    }
  };

  const handlePasswordCreated = () => {
    dispatch({ type: 'SET_PORTAL_ACCOUNT', hasAccount: true });
    setShowPasswordModal(false);
    // Go to success step briefly, then auto-reset
    dispatch({ type: 'NEXT_STEP' });
  };

  const handleSkipPassword = () => {
    setShowPasswordModal(false);
    // Go to success step
    dispatch({ type: 'NEXT_STEP' });
  };

  // Step validation logic
  const canProceed = (): boolean => {
    switch (state.step) {
      case 1: // Customer search - need to select a customer
        return state.customer !== null;
      case 2: // Customer form - only shown if new customer
        return !state.isNewCustomer || state.customer !== null;
      case 3: // Device - need to select a device
        return state.device !== null;
      case 4: // Ticket - need a description
        return state.ticketDescription.trim().length > 0;
      case 5: // Success - already complete
        return true;
      default:
        return false;
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (state.step) {
      case 1:
        return (
          <CustomerSearchStep
            onSelectCustomer={handleSelectCustomer}
            onCreateNew={handleCreateNew}
          />
        );
      case 2:
        // Only show customer form if creating a new customer
        if (!state.isNewCustomer) {
          // Skip this step for existing customers
          handleNext();
          return null;
        }
        if (!state.customerType) {
          return (
            <div className="rounded-lg bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Step 2: Customer Details
              </h2>
              <p className="text-red-600">
                Error: No customer type selected. Please go back and select individual or business.
              </p>
            </div>
          );
        }
        return (
          <CustomerFormStep
            customerType={state.customerType}
            onCustomerCreated={handleCustomerCreated}
            onBack={handleBack}
          />
        );
      case 3:
        if (!state.customer) {
          return (
            <div className="rounded-lg bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Step 3: Select Device
              </h2>
              <p className="text-red-600">
                Error: No customer selected. Please go back and select a customer.
              </p>
            </div>
          );
        }
        return (
          <DeviceStep
            customer={state.customer}
            onSelectDevice={handleSelectDevice}
            onBack={handleBack}
          />
        );
      case 4:
        if (!state.customer || !state.device) {
          return (
            <div className="rounded-lg bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Step 4: Ticket Information
              </h2>
              <p className="text-red-600">
                Error: Customer and device are required. Please go back and complete previous steps.
              </p>
            </div>
          );
        }
        return (
          <TicketStep
            customer={state.customer}
            device={state.device}
            onTicketCreated={handleTicketCreated}
            onBack={handleBack}
          />
        );
      case 5:
        if (!state.customer || !state.device || !state.createdTicket) {
          return (
            <div className="rounded-lg bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-red-600">
                Error
              </h2>
              <p className="text-red-600">
                Missing required data. Please start a new intake.
              </p>
              <button
                onClick={handleNewIntake}
                className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
              >
                Start New Intake
              </button>
            </div>
          );
        }
        return (
          <SuccessStep
            customer={state.customer}
            device={state.device}
            ticket={state.createdTicket}
            portalAccountCreated={state.hasPortalAccount}
            countdown={countdown}
            onNewIntake={handleNewIntake}
            onAddAnotherDevice={() => dispatch({ type: 'CONTINUE_WITH_CUSTOMER' })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Password Setup Modal */}
      {showPasswordModal && state.customer && (
        <PasswordSetupModal
          customer={state.customer}
          onPasswordCreated={handlePasswordCreated}
          onSkip={handleSkipPassword}
        />
      )}

      {/* Loading overlay when checking portal account */}
      {checkingPortalAccount && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/50">
          <div className="rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span className="text-gray-700">Checking portal account...</span>
            </div>
          </div>
        </div>
      )}

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((stepNumber) => (
            <div key={stepNumber} className="flex flex-1 items-center">
              <div className="relative flex flex-col items-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg font-bold transition-colors ${
                    stepNumber === state.step
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : stepNumber < state.step
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-gray-300 bg-white text-gray-500'
                  }`}
                >
                  {stepNumber}
                </div>
                <div className="mt-2 text-xs font-medium text-gray-600">
                  {stepNumber === 1 && 'Customer'}
                  {stepNumber === 2 && 'Details'}
                  {stepNumber === 3 && 'Device'}
                  {stepNumber === 4 && 'Ticket'}
                  {stepNumber === 5 && 'Complete'}
                </div>
              </div>
              {stepNumber < 5 && (
                <div
                  className={`mx-2 h-1 flex-1 transition-colors ${
                    stepNumber < state.step ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm font-medium text-gray-600">
            Step {state.step} of 5
          </p>
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">{renderStepContent()}</div>

      {/* Navigation Buttons - Hide on steps that have their own navigation */}
      {state.step !== 2 && state.step !== 3 && state.step !== 4 && state.step !== 5 && (
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={state.step === 1}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
            Back
          </button>

          {state.step < 5 && (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
