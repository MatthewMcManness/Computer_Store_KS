# Authentication Flow Test Checklist

## Overview

This document provides a comprehensive test checklist for validating the Phase 1 Foundation auth system, including Supabase Auth integration, role-based access control, and legacy auth fallback.

**Issue:** #58 - Validation & Cleanup
**Date:** 2025-12-29
**Branch:** `epic/phase-1-foundation`

---

## Pre-Test Configuration

Before running tests, ensure:

- [ ] Supabase project is configured with Email provider enabled
- [ ] Resend SMTP is configured in Supabase Dashboard
- [ ] Email templates are copied from `docs/supabase/email-templates/`
- [ ] Environment variables set in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `REPAIRSHOPR_SUBDOMAIN`
  - `SESSION_SECRET`

---

## 1. Customer Registration Flow

### 1.1 Registration Form Validation

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Empty form submission | Shows validation errors | [ ] |
| Invalid email format | Shows "valid email" error | [ ] |
| Password < 12 characters | Shows password requirement error | [ ] |
| Mismatched passwords | Shows "passwords don't match" error | [ ] |
| Terms not accepted | Shows terms agreement error | [ ] |

### 1.2 Successful Registration

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Valid registration data | Submits successfully | [ ] |
| Confirmation email sent | User receives email | [ ] |
| Success message displayed | Shows "Check Your Email" message | [ ] |
| User created in Supabase | Visible in Supabase Auth dashboard | [ ] |
| Profile created | user_profiles row exists | [ ] |
| Default role is 'customer' | user_profiles.role = 'customer' | [ ] |

### 1.3 Email Verification

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Click verification link | Redirects to callback | [ ] |
| Callback processes token | Session established | [ ] |
| Redirect to login | Shows login with verified=true | [ ] |
| Can now sign in | Login works after verification | [ ] |

---

## 2. Customer Login Flow

### 2.1 Login Form Validation

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Empty email | Shows required field error | [ ] |
| Empty password | Shows required field error | [ ] |
| Invalid email format | Client-side validation error | [ ] |

### 2.2 Authentication Attempts

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Wrong email | Shows "Invalid email or password" | [ ] |
| Wrong password | Shows "Invalid email or password" | [ ] |
| Unverified email | Shows verification required message | [ ] |
| Valid credentials | Login succeeds, redirect to /portal | [ ] |

### 2.3 Post-Login Behavior

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Session cookie set | Supabase auth cookies present | [ ] |
| Redirect to portal | Customer goes to /portal | [ ] |
| Return URL respected | returnTo parameter works | [ ] |
| User info available | /api/auth/check returns user data | [ ] |

---

## 3. Employee Login Flow

### 3.1 RepairShopr Authentication

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Valid RepairShopr employee | Login succeeds | [ ] |
| RepairShopr admin user | Gets 'admin' role | [ ] |
| RepairShopr tech user | Gets 'technician' role | [ ] |
| Limited permissions user | Gets 'receptionist' role | [ ] |

### 3.2 Supabase Employee Auth

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Employee created via invite | Can set password | [ ] |
| Employee can login | Supabase auth works | [ ] |
| Role persisted from invite | Correct role assigned | [ ] |

### 3.3 Post-Login Behavior

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Admin redirect | Goes to /admin | [ ] |
| Technician redirect | Goes to /admin | [ ] |
| Receptionist redirect | Goes to /admin | [ ] |
| Legacy cookies set | admin_session, user_role for fallback | [ ] |

---

## 4. Password Reset Flow

### 4.1 Reset Request

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Empty email | Shows validation error | [ ] |
| Invalid email format | Shows validation error | [ ] |
| Non-existent email | Shows success (no enumeration) | [ ] |
| Valid email | Shows success, email sent | [ ] |

### 4.2 Reset Email

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Reset email received | User gets branded email | [ ] |
| Link points to correct URL | Goes to /reset-password/confirm | [ ] |
| Link contains valid token | Token in URL parameters | [ ] |

### 4.3 Password Update

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Click reset link | Opens password form | [ ] |
| New password < 12 chars | Shows validation error | [ ] |
| Mismatched passwords | Shows validation error | [ ] |
| Valid new password | Password updated | [ ] |
| Success message shown | Shows confirmation | [ ] |
| Redirect to login | Auto-redirects after 3 seconds | [ ] |
| Can login with new password | Old password no longer works | [ ] |

---

## 5. Role-Based Access Control

### 5.1 Public Routes

| Route | Auth Required | Status |
|-------|--------------|--------|
| / (homepage) | No | [ ] |
| /about | No | [ ] |
| /contact | No | [ ] |
| /gallery | No | [ ] |
| /services/* | No | [ ] |
| /blog/* | No | [ ] |
| /login | No (redirects if logged in) | [ ] |
| /register | No (redirects if logged in) | [ ] |

### 5.2 Admin Routes (Staff Only)

| Route | Allowed Roles | Status |
|-------|--------------|--------|
| /admin | admin, technician, receptionist | [ ] |
| /admin/customers | admin, technician, receptionist | [ ] |
| /admin/tickets | admin, technician, receptionist | [ ] |
| /admin/intake | admin, technician, receptionist | [ ] |
| /admin/employees | admin, technician, receptionist | [ ] |
| /admin/employees/new | admin only | [ ] |

### 5.3 Customer Portal

| Route | Allowed Roles | Status |
|-------|--------------|--------|
| /portal | customer, admin, technician, receptionist | [ ] |

### 5.4 Access Denied Behavior

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Unauthenticated to /admin | Redirect to /login | [ ] |
| Customer to /admin | Redirect to /portal with error | [ ] |
| Technician to /admin/employees/new | Redirect to /admin with error | [ ] |
| Logged in to /login | Redirect to appropriate dashboard | [ ] |

---

## 6. Session Management

### 6.1 Session Persistence

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Page refresh preserves session | User stays logged in | [ ] |
| Browser close and reopen | Session persists (customer) | [ ] |
| Multiple tabs work | All tabs share session | [ ] |

### 6.2 Session Expiry

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Employee 8-hour timeout | Session expires after 8 hours | [ ] |
| Customer 30-day timeout | Session expires after 30 days | [ ] |
| Expired session redirect | Goes to login on expired | [ ] |

### 6.3 Logout

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Logout clears session | All cookies removed | [ ] |
| Redirect after logout | Goes to homepage or login | [ ] |
| Cannot access protected routes | Redirects to login | [ ] |
| Supabase session invalidated | Session no longer valid | [ ] |

---

## 7. Auth Callback Handling

### 7.1 Email Verification Callback

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Valid verification code | Session created | [ ] |
| Redirect to login | Shows verified message | [ ] |

### 7.2 Password Reset Callback

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Valid recovery code | Session created | [ ] |
| Redirect to confirm page | Can set new password | [ ] |

### 7.3 Magic Link Callback (if implemented)

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Valid magic link | Session created | [ ] |
| Role-based redirect | Goes to correct dashboard | [ ] |

### 7.4 Error Handling

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Invalid code | Redirect with error | [ ] |
| Expired code | Redirect with error | [ ] |
| Missing code | Redirect to login with error | [ ] |

---

## 8. Security Validation

### 8.1 Security Headers

| Header | Expected Value | Status |
|--------|---------------|--------|
| X-Frame-Options | DENY | [ ] |
| X-Content-Type-Options | nosniff | [ ] |
| Referrer-Policy | strict-origin-when-cross-origin | [ ] |
| Permissions-Policy | geolocation=(), microphone=(), camera=(), payment=() | [ ] |
| X-XSS-Protection | 1; mode=block | [ ] |

### 8.2 API Security

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Admin endpoints require admin role | 401 for non-admins | [ ] |
| Employee endpoints require employee | 401 for customers | [ ] |
| No sensitive data in error messages | Generic error messages | [ ] |
| Password not logged | Check server logs | [ ] |

### 8.3 RLS Policies

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| user_profiles RLS enabled | Users can only see own profile | [ ] |
| device_mappings RLS enabled | Users can only see own devices | [ ] |
| Admin can see all profiles | Admin bypasses user RLS | [ ] |

---

## 9. Employee Management (Admin Only)

### 9.1 Employee Listing

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Admin can view employees | List shows all employees | [ ] |
| Non-admin cannot access | 401 Unauthorized | [ ] |
| Shows role for each employee | Role displayed correctly | [ ] |

### 9.2 Employee Invitation

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Admin can invite employee | Invite email sent | [ ] |
| Role selection works | Selected role assigned | [ ] |
| Invalid email rejected | Validation error | [ ] |
| Duplicate email rejected | 409 Conflict | [ ] |

### 9.3 Employee Role Update

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Admin can change roles | Role updated | [ ] |
| Cannot demote self | Error message | [ ] |
| Cannot demote last admin | Error message | [ ] |

### 9.4 Employee Deletion

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Admin can delete employee | User deleted | [ ] |
| Cannot delete self | Error message | [ ] |
| Cannot delete last admin | Error message | [ ] |

---

## 10. Intake Wizard Portal Account

### 10.1 Portal Account Check

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Customer with account | Shows "Portal Access" badge | [ ] |
| Customer without account | Shows prompt to create | [ ] |

### 10.2 Portal Account Creation

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Create account for customer | Invite sent | [ ] |
| Account created in Supabase | Auth user created | [ ] |
| Profile linked to customer | repairshopr_customer_id set | [ ] |

---

## 11. User Migration Script

### 11.1 Migration Preview

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| GET /api/admin/migrate-users | Returns current counts | [ ] |
| Shows configuration status | Supabase/RepairShopr status | [ ] |

### 11.2 Dry Run Migration

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| POST with dryRun=true | No changes made | [ ] |
| Returns what would happen | Log shows planned actions | [ ] |

### 11.3 Actual Migration

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| POST with dryRun=false | Users migrated | [ ] |
| Employees from RepairShopr | Auth users created | [ ] |
| Customers from customer_accounts | Auth users created | [ ] |
| Password reset emails sent | Users get emails | [ ] |

---

## Test Environment Cleanup

After testing:

- [ ] Remove test users from Supabase Auth
- [ ] Remove test profiles from user_profiles
- [ ] Clear test data from customer_accounts
- [ ] Document any issues found

---

## Test Results Summary

| Section | Pass | Fail | Skip |
|---------|------|------|------|
| 1. Customer Registration | | | |
| 2. Customer Login | | | |
| 3. Employee Login | | | |
| 4. Password Reset | | | |
| 5. Role-Based Access | | | |
| 6. Session Management | | | |
| 7. Auth Callback | | | |
| 8. Security | | | |
| 9. Employee Management | | | |
| 10. Intake Wizard | | | |
| 11. User Migration | | | |

**Tested By:** ___________________
**Date:** ___________________
**Build Version:** ___________________

---

## Known Issues

Document any issues discovered during testing:

1. _Issue description, severity, and remediation plan_
2. _..._

