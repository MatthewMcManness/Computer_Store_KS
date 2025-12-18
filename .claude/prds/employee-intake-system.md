---
name: employee-intake-system
description: Streamlined employee interface for creating customers, devices, and tickets via RepairShopr API
status: backlog
created: 2025-12-12T19:18:14Z
---

# PRD: Employee Intake System

## Executive Summary

A streamlined intake interface on the Computer Store KS website that guides employees through a consistent workflow for creating customers, devices, and tickets. The system syncs all data to RepairShopr via API, ensuring standardized data entry across all employees while providing a simpler, more focused interface than the full RepairShopr UI.

**Value Proposition:**
- Fool-proof intake process with guided steps
- Consistent data collection across all employees
- Faster check-in with simplified, focused interface
- Customer portal password setup integrated into intake
- Works on counter tablet/kiosk

## Problem Statement

### Current State
- Employees use RepairShopr directly for intake, which has many fields and options
- Inconsistent data entry (some employees skip fields, use different formats)
- No standardized workflow - each employee does it differently
- Customer portal passwords must be set up separately
- Training new employees on RepairShopr intake takes time

### Why This Matters
- Inconsistent records make searching and reporting difficult
- Missed information leads to follow-up calls to customers
- Slower intake process during busy periods
- Customer portal adoption is low because password setup is forgotten

## User Stories

### US-1: Customer Search
> As an employee, I want to search for existing customers so I can avoid creating duplicates.

Acceptance Criteria:
- [ ] Search by name, email, or phone number
- [ ] Display matching results with key info (name, email, phone)
- [ ] Show "Create New Customer" option if no match found
- [ ] Select existing customer to proceed to device step

### US-2: Create Individual Customer
> As an employee, I want to create a new individual customer with required information.

Acceptance Criteria:
- [ ] Required fields: First name, Last name, Email, Phone
- [ ] Optional fields: Address (street, city, state, zip)
- [ ] Password setup field (required for new customers)
- [ ] Validation ensures email format and phone format
- [ ] Customer created in RepairShopr via API
- [ ] Proceed to device step after creation

### US-3: Create Business Customer
> As an employee, I want to create a customer contact linked to a business account.

Acceptance Criteria:
- [ ] Search for existing business/company
- [ ] Create new business if not found (business name, address, phone)
- [ ] Create contact linked to business (name, email, phone, password)
- [ ] Business contacts share company billing info
- [ ] Proceed to device step after creation

### US-4: Device Selection/Creation
> As an employee, I want to select an existing device or create a new one for the customer.

Acceptance Criteria:
- [ ] Show customer's existing devices (if any)
- [ ] Option to select existing device for repeat repair
- [ ] Create new device with: Brand, Type (dropdown), Model
- [ ] Device types: Desktop, Laptop, Tablet, Phone, Other
- [ ] Device linked to customer in RepairShopr
- [ ] Proceed to ticket step after selection/creation

### US-5: Create Ticket
> As an employee, I want to create a ticket capturing what the customer reports.

Acceptance Criteria:
- [ ] Pre-filled: Customer name, Device info
- [ ] Text area for "Customer states:" (issue description)
- [ ] Ticket created in RepairShopr linked to customer and device
- [ ] Success confirmation with ticket number
- [ ] Option to print intake receipt (future)

### US-6: Password Setup for Existing Customer
> As an employee, I want to set up a portal password for existing customers who don't have one.

Acceptance Criteria:
- [ ] System checks if customer has portal account in Supabase
- [ ] If no account, show password setup field during intake
- [ ] If account exists, skip password step
- [ ] Customer portal account created in Supabase (linked to RepairShopr customer ID)

## Requirements

### Functional Requirements

#### FR-1: Customer Search
- Search RepairShopr customers via API (`GET /customers`)
- Search by: name (partial match), email (exact), phone (partial)
- Return top 10 matches sorted by relevance
- Display: name, email, phone, company (if linked)

#### FR-2: Customer Creation
- Create customer via RepairShopr API (`POST /customers`)
- Individual customers: firstname, lastname, email, phone, address fields
- Business contacts: link to business_id
- Business creation: business_name, address, phone
- Create customer portal account in Supabase (email, hashed password, repairshopr_customer_id)

#### FR-3: Device Management
- Fetch customer devices via API (`GET /customers/{id}/assets` or similar)
- Create device via API (`POST /assets`)
- Required fields: asset_type, name (brand + model)
- Link device to customer

#### FR-4: Ticket Creation
- Create ticket via RepairShopr API (`POST /tickets`)
- Link to customer_id and asset_id
- Set problem_type or subject to "Customer states: {description}"
- Set initial status (e.g., "New" or "Intake")

#### FR-5: Guided Workflow UI
- Step-by-step wizard interface
- Progress indicator (Step 1 of 4, etc.)
- Back button to edit previous steps
- Cannot skip required steps
- Clear error messages for validation failures

#### FR-6: Authentication
- Require employee login (existing admin auth)
- Log which employee created each record (if supported by API)

### Non-Functional Requirements

#### NFR-1: Performance
- Customer search results in < 1 second
- Form submissions complete in < 2 seconds
- Responsive on tablet devices (primary use case)

#### NFR-2: Usability
- Large touch-friendly buttons for tablet use
- Clear visual hierarchy
- Minimal typing required (dropdowns where possible)
- Works offline with queue (future consideration)

#### NFR-3: Reliability
- Handle RepairShopr API errors gracefully
- Show clear error messages
- Allow retry on failure
- No partial data (all-or-nothing creation)

#### NFR-4: Security
- Employee authentication required
- API calls made server-side (tokens not exposed)
- Customer passwords transmitted securely

## Success Criteria

- [ ] 100% of new tickets created through intake system (employee adoption)
- [ ] Zero duplicate customers created (search works effectively)
- [ ] Average intake time < 3 minutes
- [ ] 90%+ of new customers have portal password set up
- [ ] Zero training documentation needed (self-explanatory UI)

## Constraints & Assumptions

### Constraints
- RepairShopr API rate limit: 180 requests/minute
- Must work on tablet browsers (Chrome, Safari)
- Employee must be logged in (existing auth system)

### Assumptions
- RepairShopr API supports all required operations (customer, asset, ticket creation)
- Existing admin authentication is sufficient for employee access
- Device/asset types in RepairShopr match our needs
- Supabase is already configured for portal customer accounts

## Out of Scope

- Customer self-service check-in (separate PRD)
- Customer portal login/status viewing (separate PRD)
- Intake receipt printing (future enhancement)
- Offline mode with sync queue (future enhancement)
- Payment collection at intake
- Appointment scheduling
- Inventory/parts lookup
- Estimate generation

## Dependencies

### External Dependencies
- **RepairShopr API**: Customer, Asset, and Ticket endpoints
  - `POST /customers` - Create customer
  - `GET /customers` - Search customers
  - `POST /tickets` - Create ticket
  - Asset/device endpoints (need to verify exact API)
- **RepairShopr Account**: API access enabled
- **Supabase**: Customer portal accounts table
  - Store customer login credentials (email, hashed password)
  - Link to RepairShopr customer ID for data lookup

### Internal Dependencies
- **Authentication System**: Existing admin login (`src/lib/auth.ts`)
- **Supabase Client**: Existing `src/lib/supabase.ts`
- **UI Components**: May reuse admin UI patterns

## Technical Notes

### Authentication Architecture
The site login supports two user types with a cascading auth check:
1. **Employees** - Authenticate via RepairShopr API (checked first)
2. **Customers** - Authenticate via Supabase `customer_accounts` table (checked if RepairShopr fails)

This allows a single "Login" button in the header to serve both employees (admin access) and customers (portal access).

### Customer Account Storage
- **RepairShopr**: Stores customer profile data (name, email, phone, address, devices, tickets)
- **Supabase**: Stores customer portal credentials (email, password_hash, repairshopr_customer_id)

### RepairShopr API Endpoints (to verify)
- Customers: `GET/POST /api/v1/customers`
- Tickets: `GET/POST /api/v1/tickets`
- Assets: Need to research exact endpoint for devices

### Proposed Routes
- `/admin/intake` - Main intake wizard
- `/api/intake/search-customer` - Proxy for customer search
- `/api/intake/create-customer` - Proxy for customer creation
- `/api/intake/create-device` - Proxy for device creation
- `/api/intake/create-ticket` - Proxy for ticket creation

### UI Flow
```
[Search Customer] → [Create/Select Customer] → [Create/Select Device] → [Create Ticket] → [Success]
      ↓                      ↓
  (no match)           (set password if
      ↓                  missing)
[Create Customer]
```
