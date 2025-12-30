---
name: employee-intake-system
status: backlog
created: 2025-12-12T19:35:56Z
updated: 2025-12-12T19:50:21Z
progress: 0%
prd: .claude/prds/employee-intake-system.md
github: https://github.com/MatthewMcManness/Computer_Store_KS/issues/40
---

# Epic: Employee Intake System

## Overview

Build a guided intake wizard at `/admin/intake` that walks employees through a 4-step process: search/create customer → set password (if needed) → select/create device → create ticket. All data syncs to RepairShopr via server-side API proxy routes.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **API Layer** | Server-side proxy routes | Keep RepairShopr API token secure, handle errors centrally |
| **UI Pattern** | Single-page wizard with steps | Simpler than multi-page, maintains state easily |
| **State Management** | React useState/useReducer | No need for global state, wizard is self-contained |
| **Authentication** | Existing admin auth | Reuse `src/lib/auth.ts`, no new auth system needed |
| **Customer Accounts** | Supabase | Store portal credentials separately, link to RepairShopr customer ID |
| **Styling** | Tailwind (admin pattern) | Consistent with existing admin pages |

## Technical Approach

### Frontend Components

Single wizard page with step components:
- `IntakeWizard` - Main container with step state
- `CustomerSearchStep` - Search existing or create new
- `CustomerFormStep` - Create individual or business customer (includes password)
- `DeviceStep` - Select existing or create new device
- `TicketStep` - Enter issue description, submit
- `SuccessStep` - Show ticket number, reset for next intake

### Backend Services

RepairShopr API proxy routes under `/api/repairshopr/`:
- `GET /api/repairshopr/customers?q=` - Search customers
- `POST /api/repairshopr/customers` - Create customer in RepairShopr
- `GET /api/repairshopr/customers/[id]/assets` - Get customer devices
- `POST /api/repairshopr/assets` - Create device
- `POST /api/repairshopr/tickets` - Create ticket

Supabase customer accounts:
- `customer_accounts` table: email, password_hash, repairshopr_customer_id
- Check if customer has portal account during intake
- Create portal account when setting up password

Shared libraries:
- `src/lib/repairshopr.ts` - RepairShopr API client
- `src/lib/supabase.ts` - Existing Supabase client (reuse)

### Data Flow

```
[Wizard UI] → [API Route] → [RepairShopr Client] → [RepairShopr API]
                  ↓                                  (customer data, tickets, devices)
            [Validation]
                  ↓
            [Supabase Client] → [Supabase]
                                 (portal credentials)
```

### Authentication Architecture

Single login flow with cascading auth check:
1. **Try RepairShopr first** → If success, user is employee → admin access
2. **Try Supabase second** → If success, user is customer → portal access
3. **Both fail** → Invalid credentials error

## Implementation Strategy

**Phase 1: Foundation**
- Create RepairShopr client library with typed API methods
- Build API proxy routes with error handling

**Phase 2: UI**
- Build wizard container and step components
- Implement form validation and error display

**Phase 3: Integration**
- Connect UI to API routes
- Test full flow end-to-end

## Task Breakdown Preview

- [ ] **Task 1: Supabase Schema & Auth Update** - Create `customer_accounts` table, update auth to check RepairShopr then Supabase
- [ ] **Task 2: RepairShopr API Client** - Create `src/lib/repairshopr.ts` with typed methods for customers, assets, tickets
- [ ] **Task 3: API Proxy Routes** - Build `/api/repairshopr/*` routes for search, create customer, assets, tickets
- [ ] **Task 4: Intake Wizard Page** - Create `/admin/intake/page.tsx` with step state management
- [ ] **Task 5: Customer Search Step** - Search form, results list, "create new" option
- [ ] **Task 6: Customer Form Step** - Individual/business toggle, all fields, password setup (Supabase account)
- [ ] **Task 7: Device Step** - Show existing devices, create new device form
- [ ] **Task 8: Ticket Step & Success** - Issue description, submit, success confirmation with ticket #

## Dependencies

### External
- RepairShopr API access (already configured in env)
- API endpoints: `/customers`, `/tickets`, `/assets` (need to verify asset endpoint)
- Supabase (already configured for blog/gallery)

### Internal
- Existing admin authentication (`src/lib/auth.ts`)
- Existing Supabase client (`src/lib/supabase.ts`)
- Existing admin layout and styling patterns

### Pre-work Needed
- Confirm exact asset/device API endpoint structure in RepairShopr

## Success Criteria (Technical)

- [ ] All API calls complete in < 2 seconds
- [ ] Form validation prevents invalid submissions
- [ ] API errors display user-friendly messages
- [ ] Works on tablet viewport (768px+)
- [ ] Wizard state persists through step navigation
- [ ] No RepairShopr API token exposed to client

## Estimated Effort

| Task | Complexity |
|------|------------|
| Supabase Schema & Auth Update | Medium |
| RepairShopr API Client | Medium |
| API Proxy Routes | Medium |
| Intake Wizard Page | Low |
| Customer Search Step | Medium |
| Customer Form Step | Medium |
| Device Step | Low |
| Ticket Step & Success | Low |

**Total: 8 tasks** - Can be completed incrementally, each task is independently testable.

## Tasks Created

| Issue | Name | Parallel | Depends On | Size |
|-------|------|----------|------------|------|
| #41 | Supabase Schema & Auth Update | ✅ | - | M |
| #42 | RepairShopr API Client | ✅ | - | M |
| #43 | API Proxy Routes | ❌ | #42 | M |
| #44 | Intake Wizard Page | ✅ | - | S |
| #45 | Customer Search Step | ❌ | #43, #44 | M |
| #46 | Customer Form Step | ❌ | #43, #44 | L |
| #47 | Device Step | ❌ | #43, #44 | S |
| #48 | Ticket Step & Success | ❌ | #43, #44 | S |

**Summary:**
- Total tasks: 8
- Parallel tasks (can start immediately): 3 (#41, #42, #44)
- Sequential tasks: 5
- Estimated total effort: 24-35 hours

**Dependency Graph:**
```
#41 (Supabase) ──────────────────────────┐
                                         ├──→ #46 (Customer Form)
#42 (API Client) ──→ #43 (API Routes) ──┼──→ #45 (Customer Search)
                                         ├──→ #47 (Device Step)
#44 (Wizard Page) ──────────────────────┼──→ #48 (Ticket & Success)
```
