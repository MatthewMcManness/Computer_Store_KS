---
issue: 18
title: Update Login API Route
analyzed: 2025-11-28T23:30:00Z
estimated_hours: 2.5
parallelization_factor: 1.2
---

# Parallel Work Analysis: Issue #18

## Overview
Update the login API endpoint (`src/app/api/auth/login/route.ts`) to accept email and password, authenticate via RepairShopr in repairshopr mode, and create a secure session. Maintain backward compatibility for legacy password-only mode.

## Parallel Streams

### Stream A: Login API Route Update
**Scope**: Update login route with dual-mode authentication
**Files**:
- `src/app/api/auth/login/route.ts`
**Agent Type**: typescript-expert
**Can Start**: immediately
**Estimated Hours**: 1.5
**Dependencies**: none (uses auth.ts from #17)

**Work Items**:
1. Import getAuthMode, authenticateWithRepairShopr from auth.ts
2. Update request body to accept { email?, password }
3. Add rate limiting (in-memory store, 5 attempts per 15 min per IP)
4. Implement dual-mode logic:
   - repairshopr mode: require email, call authenticateWithRepairShopr
   - legacy mode: use existing verifyPassword flow
5. Return user info on success: { email, name, role }
6. Return appropriate error codes: INVALID_CREDENTIALS, RATE_LIMITED, SERVICE_UNAVAILABLE
7. Add audit logging (no sensitive data)
8. Handle RepairShopr unavailability gracefully

### Stream B: API Tests
**Scope**: Create tests for login API route
**Files**:
- `src/app/api/auth/login/route.test.ts`
**Agent Type**: test-automator
**Can Start**: after Stream A completes
**Estimated Hours**: 1
**Dependencies**: Stream A

**Work Items**:
1. Test successful login in repairshopr mode
2. Test successful login in legacy mode
3. Test invalid credentials returns 401
4. Test missing email in repairshopr mode returns 400
5. Test rate limiting returns 429
6. Test service unavailable returns 503
7. Mock auth functions for isolated testing

## Coordination Points

### Shared Files
None - single file update with separate test file

### Sequential Requirements
1. Login route (Stream A) must complete before tests (Stream B)

## Conflict Risk Assessment
- **Low Risk**: Single file update, tests in separate file

## Parallelization Strategy

**Recommended Approach**: sequential

This is a small, focused task. Stream A completes, then Stream B.

```
Timeline:
├─ Stream A (Login Route): ████████████ (1.5h)
└─ Stream B (Tests):                 ████████ (1h, after A)
```

## Expected Timeline

- Wall time: 2.5 hours
- Total work: 2.5 hours
- Parallelization not beneficial for this task size

## Notes

- **Rate Limiting**: Simple in-memory store sufficient for now
- **Audit Logging**: Log email and success/failure, never log passwords
- **Error Messages**: Be specific enough to help users, vague enough to not aid attackers
- **Backward Compatibility**: Legacy mode must still work with password-only
