'use client';

import { useReducer } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { RepairShoprCustomer, RepairShoprAsset, RepairShoprTicket } from '@/lib/repairshopr';
import { CustomerSearchStep } from './CustomerSearchStep';
import { CustomerFormStep } from './CustomerFormStep';
import { DeviceStep } from './DeviceStep';
import { TicketStep } from './TicketStep';
import { SuccessStep } from './SuccessStep';

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
}

type IntakeAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'JUMP_TO_STEP'; step: number }
  | { type: 'SET_CUSTOMER'; customer: RepairShoprCustomer; isNew: boolean; customerType?: 'individual' | 'business' }
  | { type: 'SET_DEVICE'; device: RepairShoprAsset; isNew: boolean }
  | { type: 'SET_TICKET_DESCRIPTION'; description: string }
  | { type: 'SET_CREATED_TICKET'; ticket: RepairShoprTicket }
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

  const handleNext = () => {
    dispatch({ type: 'NEXT_STEP' });
  };

  const handleBack = () => {
    dispatch({ type: 'PREV_STEP' });
  };

  const handleNewIntake = () => {
    dispatch({ type: 'RESET' });
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

  const handleTicketCreated = (ticket: RepairShoprTicket) => {
    dispatch({ type: 'SET_CREATED_TICKET', ticket });
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
                className="mt-6 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-medium text-white hover:from-purple-700 hover:to-indigo-700"
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
            portalAccountCreated={state.isNewCustomer}
            onNewIntake={handleNewIntake}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((stepNumber) => (
            <div key={stepNumber} className="flex flex-1 items-center">
              <div className="relative flex flex-col items-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg font-bold transition-colors ${
                    stepNumber === state.step
                      ? 'border-purple-600 bg-purple-600 text-white'
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
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-medium text-white hover:from-purple-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
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
