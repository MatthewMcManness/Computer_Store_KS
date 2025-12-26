---
name: phase-1-foundation
status: backlog
created: 2025-12-26T22:06:59Z
progress: 0%
prd: .claude/prds/phase-1-foundation.md
github: [Will be updated when synced to GitHub]
---

# Epic: Phase 1 - Foundation

## Overview

Migrate from fragmented authentication (RepairShopr API + custom bcrypt) to unified Supabase Auth for all users. This establishes the security foundation for the Employee Portal (Phase 2-3) and Customer Portal (Phase 4).

**Key Deliverables:**
- 100% Supabase Auth for employees and customers
- Role-based access control (admin, technician, receptionist, customer)
- NinjaOne API integration for device data
- Payment integration infrastructure (ON HOLD - pending provider decision)

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth Provider | Supabase Auth | Built-in email verification, password reset, MFA, rate limiting. Eliminates custom security code. |
| Session Storage | httpOnly cookies | SSR-compatible, secure against XSS |
| Role Storage | `user_profiles` table | Links Supabase Auth ID to RepairShopr IDs and roles |
| Email Provider | Resend (existing) | Already configured, branded templates |
| NinjaOne Caching | 5-min TTL | Balance freshness vs API rate limits |

## Technical Approach

### Database Layer
- Create `user_profiles` table linking `auth.users.id` to RepairShopr IDs
- Enable RLS with policies for self-read/update
- Add `device_mappings` table for NinjaOne integration

### Auth Library (`src/lib/supabase-auth.ts`)
- Wrap Supabase Auth client with typed helpers
- Handle session refresh in middleware
- Role-checking utilities for route protection

### Middleware (`src/middleware.ts`)
- Replace custom session cookie logic with Supabase session
- Route protection based on role from `user_profiles`
- Redirect unauthenticated users to login

### Auth Pages
- `/login` - Unified login for all users
- `/register` - Customer self-registration
- `/reset-password` - Password reset flow
- `/admin/employees` - Employee onboarding (admin only)

### Existing Code Updates
- Update intake wizard with account check/creation step
- Remove RepairShopr auth dependency from `src/lib/auth.ts`
- Deprecate `src/lib/session-cookie.ts`

## Implementation Strategy

**Phase 1A: Auth Infrastructure (Tasks 1-4)**
- Database schema, auth library, middleware, pages
- Can test with new accounts before migration

**Phase 1B: Integration (Tasks 5-7)**
- Employee onboarding, intake wizard update, NinjaOne wrapper
- Extends existing functionality

**Phase 1C: Migration (Tasks 8-9)**
- Migrate existing users, validate and cleanup
- Cutover to new auth system

## Task Breakdown Preview

- [ ] **Task 1: Database Schema** - Create `user_profiles` table with RLS policies and `device_mappings` table
- [ ] **Task 2: Supabase Auth Configuration** - Enable email/password, configure email templates via Resend, set session expiration
- [ ] **Task 3: Auth Library & Middleware** - Create `supabase-auth.ts` helpers, update middleware for Supabase sessions and role-based routing
- [ ] **Task 4: Auth Pages** - Build login, register, and password reset pages using Supabase Auth
- [ ] **Task 5: Employee Onboarding** - Admin UI to create employee accounts with role selection and password setup email
- [ ] **Task 6: Intake Wizard Update** - Add account check step, require portal account creation during intake
- [ ] **Task 7: NinjaOne API Wrapper** - Create typed wrapper with caching for device data
- [ ] **Task 8: User Migration Script** - Migrate existing `customer_accounts` and employees to Supabase Auth
- [ ] **Task 9: Validation & Cleanup** - Test all flows, archive old tables, remove deprecated code

**Total: 9 tasks**

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Supabase Project | Ready | Existing project at `aybsfgscsxquhoqxvxxi.supabase.co` |
| Resend Domain | Ready | Already verified for `computerstoreks.com` |
| NinjaOne API | Ready | Full API access confirmed |
| RepairShopr API | Ready | Existing integration works |
| Payment Provider | ON HOLD | Awaiting US Bank vs Stripe decision |

## Success Criteria (Technical)

| Criteria | Target | Validation |
|----------|--------|------------|
| Login response time | < 500ms (p95) | Measure in Supabase dashboard |
| Session validation | < 50ms | Middleware timing logs |
| Zero custom auth code | 100% Supabase | Code review |
| All roles enforced | 4 roles working | Manual test matrix |
| Password reset works | < 5 min end-to-end | User flow test |
| MFA available for admin | TOTP enabled | Admin can enroll |

## Estimated Effort

| Task Category | Effort | Notes |
|---------------|--------|-------|
| Database & Config | 2-3 hours | Straightforward Supabase setup |
| Auth Library & Middleware | 4-6 hours | Core complexity here |
| Auth Pages | 3-4 hours | Leverage Supabase UI patterns |
| Employee Onboarding | 3-4 hours | New admin feature |
| Intake Wizard Update | 2-3 hours | Modify existing wizard |
| NinjaOne Integration | 4-6 hours | New API wrapper |
| Migration & Cleanup | 4-6 hours | Careful data migration |

**Total Estimated: 22-32 hours** (1-2 weeks at 20-30 hrs/week)

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Migration breaks existing sessions | Run in parallel, force re-login on cutover date |
| NinjaOne rate limits | Implement caching, respect API limits |
| Email deliverability | Use existing Resend config, test templates |
| Role confusion during transition | Clear communication, training toggle for demos |

## Open Questions (from PRD)

1. **Existing Sessions:** Recommend force logout on migration day - clean cutover
2. **Customer Migration:** Recommend auto-migration with password reset email - better UX than re-registration
