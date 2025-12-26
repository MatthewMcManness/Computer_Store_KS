---
name: phase-1-foundation
description: Foundation phase establishing Supabase Auth, API integrations, and payment infrastructure
status: backlog
created: 2025-12-26T21:45:24Z
priority: critical
target: Q1 2026
---

# PRD: Phase 1 - Foundation

## Executive Summary

Phase 1 establishes the core infrastructure for The Computer Store's unified platform. The primary focus is migrating from RepairShopr-based authentication to a 100% Supabase Auth system, enabling a unified login experience for both employees and customers. Secondary objectives include NinjaOne API integration for RMM capabilities.

**Key Outcome:** A secure, scalable authentication foundation that supports both the Employee Portal (Phase 2-3) and Customer Portal (Phase 4), with RMM connectivity.

> **Note: Payment Integration On Hold**
> Stripe integration is deferred pending evaluation of US Bank payment services. The code infrastructure will be prepared but not connected to a live account. This allows quick activation once a payment provider decision is made.

---

## Problem Statement

### Current State
- **Fragmented Authentication:** Employee auth uses RepairShopr API, customer auth uses a custom Supabase table with bcrypt passwords
- **No Self-Service Auth Features:** Password reset and email verification require manual intervention
- **Limited Payment Options:** No integrated online payment processing for protection plans or invoices
- **Disconnected RMM:** NinjaOne data not accessible from the unified portal
- **Dual Maintenance Burden:** Two separate auth systems require duplicate security efforts

### Why This Matters Now
- **Holton Launch (Q1 2026):** New location needs a working customer portal from day one
- **Customer Portal Blocked:** Cannot build Phase 4 (Customer Portal) without unified auth
- **Security Risk:** Custom auth code lacks battle-tested security features (MFA, rate limiting, JWT refresh)
- **Efficiency Loss:** Employees must switch between RepairShopr and NinjaOne for device information

---

## User Stories

### Primary User Story: Employee Login
**As an** employee at The Computer Store
**I want** to log into the unified portal with my work email
**So that** I can access all tools (tickets, customers, devices) in one place

**Acceptance Criteria:**
- [ ] Employee can log in with email/password via Supabase Auth
- [ ] Employee's RepairShopr user ID is linked to their Supabase account
- [ ] Employee role (admin/technician/receptionist) is stored and enforced
- [ ] Failed login attempts are rate-limited
- [ ] Session persists across browser refreshes

### Primary User Story: Customer Self-Registration
**As a** customer of The Computer Store
**I want** to create an account on the customer portal myself
**So that** I can track my repairs and view my invoices online

**Acceptance Criteria:**
- [ ] Customer can register with email/password on website
- [ ] Email verification is required before full access
- [ ] Account is linked to RepairShopr customer record (if exists)
- [ ] New RepairShopr customer is created if none exists
- [ ] Customer receives welcome email with next steps

### Primary User Story: Intake Account Creation
**As an** employee creating a ticket for a customer
**I want** the intake wizard to check if the customer has a portal account
**So that** every customer with a ticket has portal access

**Acceptance Criteria:**
- [ ] Intake wizard checks if customer has existing portal account
- [ ] If no account exists, employee MUST create one during intake
- [ ] Account creation is a required step (cannot skip)
- [ ] Password setup email is sent to customer
- [ ] Account is linked to RepairShopr customer record

### Secondary User Story: Employee Onboarding
**As an** admin
**I want** to create employee accounts and send them setup links
**So that** new employees can securely set up their own passwords

**Acceptance Criteria:**
- [ ] Admin can create employee account with email and role
- [ ] Employee receives email with password setup link
- [ ] Password setup link expires after 24 hours
- [ ] Employee sets their own password via the link
- [ ] Account is linked to RepairShopr user record

### Secondary User Story: Password Reset
**As a** user who forgot my password
**I want** to reset it via email
**So that** I can regain access to my account without calling support

**Acceptance Criteria:**
- [ ] Password reset flow works for both employees and customers
- [ ] Reset link expires after 1 hour
- [ ] User is notified of successful password change
- [ ] Old sessions are invalidated after password change

### Secondary User Story: Admin MFA
**As an** admin user
**I want** to enable two-factor authentication
**So that** my account is protected even if my password is compromised

**Acceptance Criteria:**
- [ ] MFA can be enabled via authenticator app (TOTP)
- [ ] Backup codes are provided during setup
- [ ] MFA is required for admin-level operations
- [ ] Admin can disable MFA with re-authentication

### Secondary User Story: Online Payment (ON HOLD)
> **Status:** Deferred pending US Bank evaluation vs Stripe

**As a** customer
**I want** to pay my invoice online
**So that** I don't have to call or visit the store

**Acceptance Criteria:** (will be finalized when provider is selected)
- [ ] Customer can pay via credit/debit card
- [ ] Payment is recorded in RepairShopr
- [ ] Customer receives email receipt
- [ ] Invoice is marked as paid automatically

---

## Success Criteria

### Must Have (P0)
- [ ] All users authenticate via Supabase Auth (no RepairShopr auth)
- [ ] User profiles link Supabase Auth ID to RepairShopr ID
- [ ] Role-based access control (admin, technician, receptionist, customer)
- [ ] Protected routes enforce authentication
- [ ] Session management with secure JWT handling
- [ ] Password reset via email

### Should Have (P1)
- [ ] Email verification for new accounts
- [ ] MFA option for admin accounts
- [ ] NinjaOne API wrapper for device data
- [ ] View switching for employees (admin→tech→reception, tech→reception)

### Nice to Have (P2)
- [ ] Social login (Google) for customers
- [ ] Biometric login on mobile
- [ ] Login analytics and anomaly detection
- [ ] NinjaOne remote access from portal

### On Hold (Pending Payment Provider Decision)
- [ ] Payment integration infrastructure (Stripe or US Bank)
- [ ] Online payment processing for invoices
- [ ] In-store POS terminal integration
- [ ] Protection plan subscription billing

### Metrics
- **User Impact:** 100% of users on unified auth system
- **Security Impact:** Zero custom auth code in production
- **Business Impact:** Foundation ready for payment integration when provider is selected
- **Technical Impact:** Single auth codebase to maintain

---

## Functional Requirements

### FR-1: Supabase Auth Configuration
- Enable email/password provider in Supabase dashboard
- Configure email templates for verification, password reset, and magic link
- Set up custom SMTP for branded emails (via Resend)
- Configure session expiration (8 hours for employees, 30 days for customers)

### FR-2: User Profiles Table
Create `user_profiles` table linking Supabase Auth to business systems:

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'technician', 'receptionist', 'customer')),
  repairshopr_user_id INTEGER,      -- For employees
  repairshopr_customer_id INTEGER,  -- For customers
  protection_plan_tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);
```

### FR-3: Authentication Flows

**Customer Self-Registration:**
1. Customer visits `/register` page
2. Enters email and password
3. Supabase sends verification email
4. Customer clicks verification link
5. System checks for existing RepairShopr customer by email
6. If exists → link accounts; if not → create RepairShopr customer
7. Create user_profile with role='customer'
8. Redirect to customer portal

**Employee Onboarding (Admin-initiated):**
1. Admin navigates to employee management
2. Admin enters employee email and selects role (admin/technician/receptionist)
3. Admin enters RepairShopr user ID to link
4. System creates Supabase Auth user with temporary password
5. Supabase sends "Set your password" email
6. Employee clicks link and sets password (link expires in 24 hours)
7. Create user_profile with role and repairshopr_user_id
8. Employee can now log in

**Login Flow:**
1. User enters email/password
2. Supabase Auth validates credentials
3. Load user_profile from database
4. Set session cookies
5. Redirect based on role:
   - Admin → Admin dashboard (can switch to Technician/Reception views)
   - Technician → Technician dashboard (can switch to Reception view)
   - Receptionist → Reception dashboard
   - Customer → Customer portal

**Password Reset:**
1. User requests reset via email
2. Supabase sends reset link (expires in 1 hour)
3. User clicks link and sets new password
4. All existing sessions are invalidated
5. User must log in with new password

### FR-3.5: Intake Wizard Account Requirement
The existing intake wizard must be updated to require customer portal accounts:

1. **Account Check Step:** After selecting/creating customer, check if portal account exists
2. **Required Creation:** If no account exists, display account creation form (cannot skip)
3. **Minimal Fields:** Email (pre-filled from RepairShopr) + generate temporary password
4. **Email Notification:** Send "Set your password" email to customer
5. **Continue Intake:** After account creation, continue with device/ticket creation
6. **Visual Indicator:** Show account status (existing/new) throughout intake

### FR-4: Session Management
- Use Supabase Auth session (JWT + refresh token)
- Store session in httpOnly cookies for SSR
- Implement session refresh before expiration
- Handle session invalidation on password change

### FR-5: Role-Based Access Control

**Employee Roles (additive hierarchy - each level includes all capabilities below it):**

| Level | Role | Capabilities |
|-------|------|--------------|
| 1 | **Receptionist** | Intake, customer check-in, checkout, invoices (in-store items), ticket notes, customer communications (messaging/calling), basic ticket status |
| 2 | **Technician** | *All Receptionist capabilities* + repairs, diagnostics, technical ticket updates, device management |
| 3 | **Admin** | *All Technician capabilities* + employee management, inventory management (descriptions, pricing, ordering), system settings |

**Customer Role:**
- **Customer:** Access to customer portal only. Cannot access any employee features.

**View Switching:**
Higher-level roles can "step down" to lower views for training, coverage, or context:
| Role | Available Views |
|------|----------------|
| Admin | Admin, Technician, Reception |
| Technician | Technician, Reception |
| Receptionist | Reception only |
| Customer | Customer Portal only |

### FR-6: NinjaOne API Integration
Create typed API wrapper (`src/lib/ninjaone.ts`):
- Authenticate with NinjaOne API
- Fetch devices by customer email or name
- Get device details (OS, hardware, status)
- Map NinjaOne devices to RepairShopr assets
- Cache responses with TTL (5 minutes for lists, 1 minute for details)

### FR-7: Payment Integration (ON HOLD)
> **Status:** Deferred pending US Bank evaluation. Prepare infrastructure but do not connect to live accounts.

**If Stripe is selected:**
- Configure Stripe API keys in environment (test mode only for now)
- Create webhook endpoint skeleton for payment events
- Stub payment intent creation for invoices
- Document Stripe Terminal hardware requirements

**If US Bank is selected:**
- Research US Bank merchant services API
- Evaluate integration requirements
- Document hardware requirements

**Deliverable for Phase 1:** Payment abstraction layer that can support either provider

---

## Non-Functional Requirements

### NFR-1: Security
- All passwords hashed with bcrypt (Supabase default)
- JWT tokens signed with RS256
- Rate limiting: 5 login attempts per 15 minutes per IP
- Session tokens rotated on privilege escalation
- All auth endpoints over HTTPS only
- OWASP Top 10 compliance

### NFR-2: Performance
- Login response time < 500ms (p95)
- Session validation < 50ms (cached)
- NinjaOne API responses cached for 5 minutes
- Stripe payment intent creation < 1s

### NFR-3: Reliability
- Auth system uptime > 99.9% (Supabase SLA)
- Graceful degradation if NinjaOne API is unavailable
- Payment retries with exponential backoff
- Session recovery after network interruption

### NFR-4: Scalability
- Support 50+ concurrent employee sessions
- Support 500+ customer accounts
- NinjaOne API rate limits respected (check docs)
- Stripe API rate limits respected (100 requests/second)

### NFR-5: Compliance
- PCI DSS compliance via Stripe (no card data stored locally)
- Password policy enforced (minimum 12 characters)
- Audit log for authentication events
- Data retention per GDPR requirements

---

## Technical Architecture

### Authentication Flow
```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser/Client                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js Middleware                         │
│  - Check Supabase session                                       │
│  - Redirect unauthenticated users                               │
│  - Enforce role-based access                                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Supabase Auth                             │
│  - Email/password authentication                                │
│  - JWT session management                                       │
│  - Password reset, email verification                           │
│  - MFA (TOTP)                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    user_profiles Table                          │
│  - Links auth.users.id to RepairShopr IDs                       │
│  - Stores role and protection plan tier                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
┌──────────────────────┐     ┌──────────────────────┐
│    RepairShopr API   │     │     NinjaOne API     │
│  - Customer data     │     │  - Device data       │
│  - Ticket data       │     │  - Remote access     │
│  - Invoice data      │     │  - Hardware health   │
└──────────────────────┘     └──────────────────────┘
```

### File Changes Required

**New Files:**
- `src/lib/supabase-auth.ts` - Supabase Auth client and helpers
- `src/lib/ninjaone.ts` - NinjaOne API wrapper
- `src/lib/stripe.ts` - Stripe client and payment helpers
- `src/app/api/webhooks/stripe/route.ts` - Stripe webhook handler
- `src/app/(auth)/login/page.tsx` - New login page using Supabase Auth
- `src/app/(auth)/register/page.tsx` - Customer registration page
- `src/app/(auth)/reset-password/page.tsx` - Password reset page
- `docs/database/user-profiles-schema.sql` - User profiles schema

**Modified Files:**
- `src/middleware.ts` - Use Supabase session instead of custom cookies
- `src/lib/auth.ts` - Replace RepairShopr auth with Supabase Auth
- `src/app/admin/login/page.tsx` - Update to use Supabase Auth
- `src/components/admin/intake/IntakeWizard.tsx` - Update account creation flow
- `.env.example` - Add Stripe and NinjaOne env vars

**Deprecated Files:**
- `src/lib/session-cookie.ts` - Replace with Supabase session management
- Custom bcrypt password handling - Supabase handles this

---

## Database Schema Changes

### New Tables

**user_profiles**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK, references auth.users(id) |
| email | TEXT | Unique, user's email |
| full_name | TEXT | Display name |
| role | TEXT | 'admin', 'technician', 'receptionist', 'customer' |
| repairshopr_user_id | INTEGER | For employees (nullable) |
| repairshopr_customer_id | INTEGER | For customers (nullable) |
| protection_plan_tier | TEXT | 'bronze', 'silver', 'gold' (nullable) |
| created_at | TIMESTAMPTZ | Record creation time |
| updated_at | TIMESTAMPTZ | Last update time |

**device_mappings** (for NinjaOne integration)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| repairshopr_asset_id | INTEGER | Asset ID in RepairShopr |
| ninjaone_device_id | TEXT | Device ID in NinjaOne |
| last_synced | TIMESTAMPTZ | Last sync time |

### Migration from Existing Tables

The existing `customer_accounts` table will be migrated:
1. Create Supabase Auth users for each customer_accounts row
2. Create user_profiles linking to the auth users
3. Preserve repairshopr_customer_id mappings
4. Archive customer_accounts table (don't delete yet)

---

## API Endpoints

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login with email/password |
| POST | /api/auth/logout | Logout and clear session |
| POST | /api/auth/register | Register new customer account |
| POST | /api/auth/reset-password | Request password reset |
| POST | /api/auth/verify-email | Verify email address |
| GET | /api/auth/session | Get current session info |
| POST | /api/auth/refresh | Refresh session token |

### Stripe Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/payments/create-intent | Create payment intent for invoice |
| POST | /api/payments/create-subscription | Create protection plan subscription |
| POST | /api/webhooks/stripe | Handle Stripe webhook events |
| GET | /api/payments/methods | Get customer's saved payment methods |

### NinjaOne Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/ninjaone/devices | List all devices |
| GET | /api/ninjaone/devices/[id] | Get device details |
| GET | /api/ninjaone/devices/customer/[email] | Get devices by customer |
| POST | /api/ninjaone/devices/[id]/remote | Initiate remote session |

---

## Constraints & Assumptions

### Technical Constraints
- **Stack:** Next.js 14, TypeScript, Supabase, Tailwind CSS
- **Hosting:** Render (free tier with UptimeRobot keepalive)
- **Database:** Supabase PostgreSQL (free tier)
- **Email:** Resend for transactional emails
- **Node.js:** Version 22.x (matches Render)

### Business Constraints
- **Timeline:** Complete by Q1 2026 (Holton launch)
- **Budget:** Minimize paid services, leverage free tiers
- **Resources:** Solo developer (Matthew), 20-30 hours/week

### Assumptions
- Supabase Auth is reliable and feature-complete
- NinjaOne provides API access for our subscription level
- Stripe Terminal hardware can be ordered and received in time
- Existing RepairShopr data is accurate and consistent

### Dependencies
- Supabase project must be configured before starting
- Stripe account must be verified and active
- NinjaOne API credentials must be obtained
- Resend domain verification for custom email

---

## Out of Scope

**Explicitly NOT included in Phase 1:**
- Customer Portal UI (Phase 4)
- PC Builder (Phase 5)
- Social Media Automation (Phase 6)
- Ticket Kanban dashboard (Phase 2)
- Invoice creation/editing (Phase 2)
- Quote system (Phase 2)
- POS functionality beyond basic Stripe Terminal (Phase 2)
- NinjaOne remote access UI (Phase 3)

**Future Considerations:**
- Social login (Google, Apple)
- SMS-based 2FA
- Biometric authentication
- Login analytics dashboard
- Fraud detection

---

## Open Questions

### Resolved

1. **NinjaOne API Access:** ✅ **ANSWERED** - Full API access available
2. **Payment Provider Decision:** ✅ **ANSWERED** - On hold pending US Bank evaluation
3. **Employee Onboarding:** ✅ **ANSWERED** - Admin creates account → sends password setup link via email
4. **Customer Account Creation:** ✅ **ANSWERED** - Two paths:
   - **Self-registration:** Customers can create accounts themselves through the website
   - **Intake requirement:** During ticket intake, check if customer has portal account. If not, employee MUST create one as part of the intake process.

### Still Open

1. **Existing Sessions:** How to handle existing logged-in users during migration? Force logout?
2. **Customer Migration:** Should existing customer_accounts be auto-migrated or require re-registration?

---

## References

### Internal Documents
- [Master Development Roadmap](/documentation/master_development_roadmap.html)
- [Stripe Integration Plan](/documentation/stripe_integration_plan.html)
- [Unified Technician Portal](/documentation/unified_technician_portal.html)

### External Documentation
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Stripe Payments Documentation](https://stripe.com/docs/payments)
- [NinjaOne API Documentation](https://app.ninjarmm.com/apidocs/)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

### Existing PRDs
- [Authentication RepairShopr Integration](.claude/prds/authentication-repairshopr-integration.md) - Previous auth approach (to be superseded)
- [Employee Intake System](.claude/prds/employee-intake-system.md) - Related intake wizard

---

## Appendix: Migration Checklist

### Pre-Migration
- [ ] Backup existing customer_accounts table
- [ ] Document all current RepairShopr user IDs
- [ ] Test Supabase Auth in development environment
- [ ] Prepare email templates in Resend

### Migration Steps
1. [ ] Deploy new auth code to development branch
2. [ ] Create Supabase Auth users for existing employees
3. [ ] Create user_profiles for each employee
4. [ ] Test employee login flow
5. [ ] Create Supabase Auth users for existing customers
6. [ ] Create user_profiles for each customer
7. [ ] Test customer registration flow
8. [ ] Deploy to production
9. [ ] Invalidate old sessions
10. [ ] Archive customer_accounts table

### Post-Migration
- [ ] Monitor login success rates
- [ ] Check for authentication errors in logs
- [ ] Verify password reset flow works
- [ ] Confirm email verification flow works
- [ ] Test MFA enrollment for admins
