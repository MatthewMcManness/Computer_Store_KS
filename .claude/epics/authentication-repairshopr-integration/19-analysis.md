---
issue: 19
title: Update Auth Check API Route
analyzed: 2025-11-29T00:00:00Z
estimated_hours: 1
parallelization_factor: 1.0
---

# Parallel Work Analysis: Issue #19

## Overview
Update the auth check endpoint (`src/app/api/auth/check/route.ts`) to return user information including email, name, and role. This enables the frontend to show role-appropriate UI elements while maintaining security by not exposing sensitive data like API tokens.

## Parallel Streams

### Stream A: Auth Check Route Update
**Scope**: Update auth check route to return user info
**Files**:
- `src/app/api/auth/check/route.ts`
**Agent Type**: typescript-expert
**Can Start**: immediately
**Estimated Hours**: 0.5
**Dependencies**: none (uses getCurrentUser() from auth.ts - Issue #17)

**Work Items**:
1. Import getCurrentUser from auth.ts
2. Update GET handler to call getCurrentUser()
3. Return authenticated: true with user object (email, name, role)
4. Return authenticated: false if no user session
5. Maintain error handling for unexpected failures

### Stream B: Unit Tests
**Scope**: Create tests for auth check route
**Files**:
- `src/app/api/auth/check/route.test.ts`
**Agent Type**: test-automator
**Can Start**: after Stream A completes
**Estimated Hours**: 0.5
**Dependencies**: Stream A

**Work Items**:
1. Test authenticated response includes user info
2. Test unauthenticated response returns authenticated: false
3. Test no sensitive data (API token) is exposed
4. Mock getCurrentUser for isolated testing
5. Test error handling returns 500 with authenticated: false

## Coordination Points

### Shared Files
None - single file update with separate test file

### Sequential Requirements
1. Auth check route (Stream A) must complete before tests (Stream B)

## Conflict Risk Assessment
- **Low Risk**: Single file update, uses existing getCurrentUser() function

## Parallelization Strategy

**Recommended Approach**: sequential

This is a tiny task. Stream A completes, then Stream B.

```
Timeline:
├─ Stream A (Auth Check Route): ████ (0.5h)
└─ Stream B (Tests):            ████ (0.5h, after A)
```

## Expected Timeline

- Wall time: 1 hour
- Total work: 1 hour
- Parallelization not beneficial for this task size

## Notes

- **Security**: Only expose email, name, role - never API token
- **Backward Compatibility**: Response structure changes from `{authenticated: boolean}` to include user object when authenticated
- **Frontend Impact**: Frontend will need to handle the new response structure (Issue #20)
- **Simple Implementation**: Just needs to call getCurrentUser() and format response
