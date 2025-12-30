---
issue: 21
title: Add Role-Based Middleware
analyzed: 2025-11-29T00:30:00Z
estimated_hours: 3
parallelization_factor: 1.0
---

# Parallel Work Analysis: Issue #21

## Overview
Enhance the existing middleware to support role-based access control. Since middleware runs on Edge runtime and cannot access the file-based session store directly (no Node.js fs module), we need to store the user role in a separate cookie that middleware can read.

## Technical Challenge

The session store uses Node.js `fs` module for file-based storage. Edge middleware cannot use `fs`. Solutions:

1. **Role Cookie**: Store role in a separate cookie alongside session ID
2. **JWT**: Encode role in a JWT token
3. **API Call**: Make internal API call to verify role (adds latency)

**Chosen Approach**: Role cookie - simple, fast, and sufficient for this use case. The role cookie is signed to prevent tampering.

## Parallel Streams

### Stream A: Auth Library Update
**Scope**: Add role cookie setting alongside session cookie
**Files**:
- `src/lib/auth.ts`
**Agent Type**: typescript-expert
**Can Start**: immediately
**Estimated Hours**: 1
**Dependencies**: none

**Work Items**:
1. Add ROLE_COOKIE_NAME constant
2. Update authenticateWithRepairShopr() to set role cookie
3. Update createSession() to set role cookie
4. Update destroySession() to delete role cookie
5. Role cookie should be httpOnly, secure, same settings as session

### Stream B: Middleware Update
**Scope**: Add role-based route protection
**Files**:
- `src/middleware.ts`
**Agent Type**: typescript-expert
**Can Start**: immediately (works with role cookie)
**Estimated Hours**: 1.5
**Dependencies**: Coordinates with Stream A on cookie name

**Work Items**:
1. Define route permission matrix
2. Read role from role cookie
3. Check role against route permissions
4. Return redirect to /admin?error=unauthorized if denied
5. Log unauthorized access attempts
6. Support legacy mode (no role cookie = admin role)

### Stream C: Unit Tests
**Scope**: Test middleware role checks
**Files**:
- `src/middleware.test.ts`
**Agent Type**: test-automator
**Can Start**: after Streams A & B complete
**Estimated Hours**: 0.5
**Dependencies**: Streams A & B

**Work Items**:
1. Test admin can access all routes
2. Test employee cannot access /admin/settings
3. Test limited cannot access /admin/gallery
4. Test unauthorized redirects correctly
5. Test legacy mode (no role = admin)

## Coordination Points

### Shared Configuration
- Cookie name: `user_role` - must match between auth.ts and middleware.ts

### Sequential Requirements
1. Stream A & B can run in parallel (share cookie name constant)
2. Stream C after A & B

## Conflict Risk Assessment
- **Low Risk**: Different files, only shared cookie name

## Parallelization Strategy

**Recommended Approach**: parallel for A & B, then C

```
Timeline:
├─ Stream A (Auth Update):    ████████ (1h)
├─ Stream B (Middleware):     ████████████ (1.5h)
└─ Stream C (Tests):                       ████ (0.5h, after A&B)
```

## Expected Timeline

- Wall time: 2 hours (A&B parallel, then C)
- Total work: 3 hours
- Efficiency gain: 33%

## Notes

- **Security**: Role cookie should be tamper-resistant but doesn't need encryption (role is not sensitive, just needs to be verified)
- **Legacy Mode**: If no role cookie present but session exists, assume admin role (backward compatibility)
- **Route Matrix**: Start simple, can expand later
- **Performance**: Cookie read is O(1), no I/O needed
