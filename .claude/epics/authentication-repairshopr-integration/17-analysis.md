---
issue: 17
title: Update Auth Library for RepairShopr Integration
analyzed: 2025-11-28T23:15:00Z
estimated_hours: 4
parallelization_factor: 1.3
---

# Parallel Work Analysis: Issue #17

## Overview
Modify `src/lib/auth.ts` to integrate RepairShopr authentication alongside existing password-based auth. Implement dual-mode support via `AUTH_MODE` environment variable, integrating the RepairShopr API client (#15) and session store (#16).

## Parallel Streams

### Stream A: Core Auth Library Update
**Scope**: Update auth.ts to integrate RepairShopr client and session store
**Files**:
- `src/lib/auth.ts`
**Agent Type**: typescript-expert
**Can Start**: immediately
**Estimated Hours**: 2.5
**Dependencies**: none (builds on #15, #16 which are complete)

**Work Items**:
1. Import RepairShoprClient from `./repairshopr`
2. Import session store functions from `./session-store`
3. Add UserSession interface
4. Implement `getAuthMode()` - returns 'repairshopr' | 'legacy'
5. Implement `authenticateWithRepairShopr(email, password)`:
   - Call RepairShoprClient.signIn()
   - Call RepairShoprClient.getMe() to get role
   - Create session with session store
   - Set cookie with session ID
6. Update `createSession()` to accept UserSession and store via session store
7. Update `isAuthenticated()` to validate against session store
8. Implement `getCurrentUser()` - get user info from session (without apiToken)
9. Update `destroySession()` to delete from session store
10. Maintain backward compatibility with legacy mode

### Stream B: Environment Configuration
**Scope**: Add AUTH_MODE and related env vars
**Files**:
- `.env.example`
**Agent Type**: documentation-specialist
**Can Start**: immediately
**Estimated Hours**: 0.5
**Dependencies**: none

**Work Items**:
1. Add AUTH_MODE to .env.example (default: repairshopr)
2. Add LEGACY_ADMIN_PASSWORD for fallback mode

### Stream C: Unit Tests
**Scope**: Test both auth modes
**Files**:
- `src/lib/auth.test.ts`
**Agent Type**: test-automator
**Can Start**: after Stream A completes
**Estimated Hours**: 1
**Dependencies**: Stream A

**Work Items**:
1. Test authenticateWithRepairShopr with valid credentials (mocked)
2. Test authenticateWithRepairShopr with invalid credentials
3. Test getCurrentUser returns user data
4. Test isAuthenticated with valid/invalid session
5. Test destroySession clears session
6. Test legacy mode still works
7. Test dual-mode switching via AUTH_MODE

## Coordination Points

### Shared Files
- `.env.example` - Stream B adds AUTH_MODE

### Sequential Requirements
1. Core auth update (Stream A) must complete before tests (Stream C)
2. Stream B can run in parallel with Stream A

## Conflict Risk Assessment
- **Low Risk**: Streams work on different files
- **Note**: Stream A modifies existing auth.ts - careful to maintain backward compatibility

## Parallelization Strategy

**Recommended Approach**: hybrid

Launch Streams A & B simultaneously. Start Stream C when Stream A completes.

```
Timeline:
├─ Stream A (Auth Library): ████████████████████ (2.5h)
├─ Stream B (Env Config):   ████ (0.5h)
└─ Stream C (Tests):                      ████████ (1h, after A)
```

## Expected Timeline

With parallel execution:
- Wall time: 3.5 hours
- Total work: 4 hours
- Efficiency gain: 12.5%

Without parallel execution:
- Wall time: 4 hours

## Notes

- **Backward Compatibility**: Must not break existing login flow
- **Dual-Mode**: AUTH_MODE allows gradual rollout
- **Role Mapping**: RepairShopr roles need to map to admin/employee/limited
- **Testing**: Need to mock both RepairShopr API and session store for unit tests
- **Dependencies**: Uses outputs from #15 (repairshopr.ts) and #16 (session-store.ts)
