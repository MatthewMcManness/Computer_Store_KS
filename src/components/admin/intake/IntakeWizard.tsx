'use client';

import { useReducer, useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Mail, Loader2 } from 'lucide-react';
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

type PortalAccountStatus = 'unknown' | 'checking' | 'active' | 'creating' | 'created' | 'none';

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
  portalAccountStatus: PortalAccountStatus;
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
  | { type: 'SET_PORTAL_ACCOUNT_STATUS'; status: PortalAccountStatus }
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
  portalAccountStatus: 'unknown',
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
    case 'SET_PORTAL_ACCOUNT_STATUS':
      return {
        ...state,
        portalAccountStatus: action.status,
        hasPortalAccount: action.status === 'active' || action.status === 'created',
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
  const [portalAccountEmail, setPortalAccountEmail] = useState('');
  const [portalAccountError, setPortalAccountError] = useState<string | null>(null);

  const handleNext = () => {
    dispatch({ type: 'NEXT_STEP' });
  };

  const handleBack = () => {
    dispatch({ type: 'PREV_STEP' });
  };

  const handleNewIntake = () => {
    dispatch({ type: 'RESET' });
    setShowPasswordModal(false);
    setPortalAccountEmail('');
    setPortalAccountError(null);
  };

  // Check if customer has a portal account in user_profiles
  const checkPortalAccount = async (customerId: number): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_PORTAL_ACCOUNT_STATUS', status: 'checking' });
      const response = await fetch(
        `/api/customers/portal-account?repairshopr_customer_id=${customerId}`
      );
      const data = await response.json();

      if (data.hasAccount) {
        dispatch({ type: 'SET_PORTAL_ACCOUNT_STATUS', status: 'active' });
        return true;
      } else {
        dispatch({ type: 'SET_PORTAL_ACCOUNT_STATUS', status: 'none' });
        return false;
      }
    } catch (error) {
      console.error('[Intake] Error checking portal account:', error);
      dispatch({ type: 'SET_PORTAL_ACCOUNT_STATUS', status: 'none' });
      return false;
    }
  };

  // Create portal account for customer
  const createPortalAccount = async (customer: RepairShoprCustomer, email: string) => {
    setPortalAccountError(null);
    dispatch({ type: 'SET_PORTAL_ACCOUNT_STATUS', status: 'creating' });

    try {
      const response = await fetch('/api/customers/portal-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repairshoprCustomerId: customer.id,
          email: email,
          fullName: customer.fullname,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal account');
      }

      dispatch({ type: 'SET_PORTAL_ACCOUNT_STATUS', status: 'created' });
      return true;
    } catch (error) {
      console.error('[Intake] Error creating portal account:', error);
      setPortalAccountError(
        error instanceof Error ? error.message : 'Failed to create portal account'
      );
      dispatch({ type: 'SET_PORTAL_ACCOUNT_STATUS', status: 'none' });
      return false;
    }
  };

  const handleSelectCustomer = async (customer: RepairShoprCustomer, skipToDevice: boolean) => {
    dispatch({ type: 'SET_CUSTOMER', customer, isNew: false });
    // Pre-fill email for portal account creation
    setPortalAccountEmail(customer.email || '');
    setPortalAccountError(null);

    // Check for existing portal account
    await checkPortalAccount(customer.id);

    if (skipToDevice) {
      // Skip step 2 (customer details) and go directly to step 3 (device selection)
      dispatch({ type: 'JUMP_TO_STEP', step: 3 });
    } else {
      dispatch({ type: 'NEXT_STEP' });
    }
  };

  const handleCreateNew = () => {
    dispatch({ type: 'SET_CUSTOMER', customer: {} as RepairShoprCustomer, isNew: true });
    dispatch({ type: 'NEXT_STEP' });
  };

  const handleSelectDevice = (device: RepairShoprAsset) => {
    dispatch({ type: 'SET_DEVICE', device, isNew: false });
    dispatch({ type: 'NEXT_STEP' });
  };

  const handleCustomerCreated = async (customer: RepairShoprCustomer) => {
    dispatch({ type: 'SET_CUSTOMER', customer, isNew: true });
    // Pre-fill email for portal account creation
    setPortalAccountEmail(customer.email || '');
    setPortalAccountError(null);
    // New customers won't have a portal account yet, set status to 'none'
    dispatch({ type: 'SET_PORTAL_ACCOUNT_STATUS', status: 'none' });
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

  // Render portal account status badge
  const renderPortalAccountBadge = () => {
    switch (state.portalAccountStatus) {
      case 'checking':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking...
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-sm font-medium text-green-700 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
            Portal Account Active
          </span>
        );
      case 'creating':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-sm font-medium text-amber-700 dark:text-amber-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating Portal Account...
          </span>
        );
      case 'created':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-sm font-medium text-green-700 dark:text-green-400">
            <Mail className="h-4 w-4" />
            Portal Account Created - Email Sent
          </span>
        );
      case 'none':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-sm font-medium text-red-700 dark:text-red-400">
            No Portal Account
          </span>
        );
      default:
        return null;
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
        return (
          <CustomerFormStep
            onCustomerCreated={handleCustomerCreated}
            onBack={handleBack}
          />
        );
      case 3:
        if (!state.customer) {
          return (
            <div className="rounded-lg bg-white dark:bg-gray-900 p-8 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Step 3: Select Device
              </h2>
              <p className="text-red-600 dark:text-red-400">
                Error: No customer selected. Please go back and select a customer.
              </p>
            </div>
          );
        }
        return (
          <>
            {/* Portal Account Status Section */}
            <div className="mb-6 rounded-lg bg-white dark:bg-gray-900 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Customer Portal Account
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {state.customer.fullname} - {state.customer.email || 'No email'}
                  </p>
                </div>
                {renderPortalAccountBadge()}
              </div>

              {/* Inline Account Creation Form */}
              {state.portalAccountStatus === 'none' && (
                <div className="mt-4 rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4">
                  <p className="mb-3 text-sm font-medium text-amber-800 dark:text-amber-300">
                    Portal account required to continue. Create one now:
                  </p>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label htmlFor="portal-email" className="sr-only">
                        Email address
                      </label>
                      <input
                        type="email"
                        id="portal-email"
                        value={portalAccountEmail}
                        onChange={(e) => setPortalAccountEmail(e.target.value)}
                        placeholder="Email address"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <button
                      onClick={() =>
                        state.customer && createPortalAccount(state.customer, portalAccountEmail)
                      }
                      disabled={!portalAccountEmail || !portalAccountEmail.includes('@')}
                      className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Create Portal Account
                    </button>
                  </div>
                  {portalAccountError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {portalAccountError}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Device Selection - Only show if portal account exists */}
            {(state.portalAccountStatus === 'active' || state.portalAccountStatus === 'created') && (
              <DeviceStep
                customer={state.customer}
                onSelectDevice={handleSelectDevice}
                onBack={handleBack}
              />
            )}

            {/* Show message if still checking */}
            {state.portalAccountStatus === 'checking' && (
              <div className="rounded-lg bg-white dark:bg-gray-900 p-8 shadow-sm">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Checking portal account status...
                  </span>
                </div>
              </div>
            )}

            {/* Show message if creating */}
            {state.portalAccountStatus === 'creating' && (
              <div className="rounded-lg bg-white dark:bg-gray-900 p-8 shadow-sm">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Creating portal account...
                  </span>
                </div>
              </div>
            )}

            {/* Show placeholder message if no portal account */}
            {state.portalAccountStatus === 'none' && (
              <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Please create a portal account above to continue with device selection.
                </p>
              </div>
            )}
          </>
        );
      case 4:
        if (!state.customer || !state.device) {
          return (
            <div className="rounded-lg bg-white dark:bg-gray-900 p-8 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Step 4: Ticket Information
              </h2>
              <p className="text-red-600 dark:text-red-400">
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
            <div className="rounded-lg bg-white dark:bg-gray-900 p-8 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">
                Error
              </h2>
              <p className="text-red-600 dark:text-red-400">
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
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/50 dark:bg-gray-950/70">
          <div className="rounded-lg bg-white dark:bg-gray-900 p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span className="text-gray-700 dark:text-gray-300">Checking portal account...</span>
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
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {stepNumber}
                </div>
                <div className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400">
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
                    stepNumber < state.step ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
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
            className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 px-6 py-3 font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 border border-gray-200 dark:border-gray-700"
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
