---
name: authentication-repairshopr-integration
status: backlog
created: 2025-11-28T18:32:37Z
progress: 0%
prd: .claude/prds/authentication-repairshopr-integration.md
github: https://github.com/MatthewMcManness/Computer_Store_KS/issues/14
---

# Epic: RepairShopr Authentication Integration

## Overview

Replace the current shared-password authentication system with RepairShopr SSO. The existing auth infrastructure (session cookies, middleware, login UI) is well-structured and can be adapted with minimal changes. The core work is:

1. Create a RepairShopr API client
2. Modify login to authenticate via RepairShopr's `/sign_in` endpoint
3. Store user info + API token in an encrypted session
4. Add role-based access control

## Architecture Decisions

### 1. Session Storage: Enhanced Cookie + Server-Side Token Store
**Decision**: Store session ID in cookie, keep API tokens in a server-side store (file-based JSON for simplicity, upgradeable to Redis later).

**Rationale**:
- API tokens must never reach the browser
- Current cookie-based sessions already work
- File-based store is simple and sufficient for <10 concurrent users
- Easy to upgrade to Redis/database later if needed

### 2. Authentication Flow: Direct API Token Exchange
**Decision**: Exchange credentials for API token via RepairShopr `/sign_in`, validate with `/me`.

**Rationale**:
- RepairShopr doesn't offer OAuth, so direct exchange is the only option
- The `/me` endpoint provides user role information needed for RBAC

### 3. Role Mapping: Simple 3-Tier System
**Decision**: Map RepairShopr roles to `admin` | `employee` | `limited`.

**Rationale**:
- Matches the PRD requirements (owner, employee, reception)
- Simple to implement and extend
- RepairShopr user data includes role information

### 4. Backward Compatibility: Dual-Mode During Migration
**Decision**: Support both old password auth and new RepairShopr auth via environment flag.

**Rationale**:
- Zero-downtime migration
- Rollback capability if issues arise
- Can test with subset of users first

## Technical Approach

### Files to Modify

| File | Change |
|------|--------|
| `src/lib/auth.ts` | Replace password check with RepairShopr auth |
| `src/lib/repairshopr.ts` | **NEW**: API client for RepairShopr |
| `src/lib/session-store.ts` | **NEW**: Server-side session/token storage |
| `src/app/api/auth/login/route.ts` | Accept email+password, call RepairShopr |
| `src/app/api/auth/check/route.ts` | Return user info including role |
| `src/app/admin/login/page.tsx` | Add email field to login form |
| `src/middleware.ts` | Add role-based route protection |
| `.env.example` | Add RepairShopr config vars |

### Data Flow

```
Login Request (email, password)
    │
    ▼
POST /api/auth/login
    │
    ├─► repairshopr.signIn(email, password)
    │       └─► POST https://{subdomain}.repairshopr.com/api/v1/sign_in
    │
    ├─► repairshopr.getMe(apiToken)
    │       └─► GET /api/v1/me (get user details + role)
    │
    ├─► sessionStore.create({ userId, email, role, apiToken })
    │       └─► Store encrypted in server-side JSON file
    │
    └─► Set session cookie (session ID only, no sensitive data)
```

### Session Structure

```typescript
// Server-side session (stored encrypted)
interface Session {
  id: string;
  userId: number;
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'limited';
  apiToken: string;  // RepairShopr API token
  createdAt: number;
  expiresAt: number;
}

// Cookie contains only session ID
// Browser never sees apiToken or role details
```

### Role-Based Access

```typescript
// Route protection matrix
const routePermissions = {
  '/admin': ['admin', 'employee', 'limited'],  // Dashboard access
  '/admin/gallery': ['admin', 'employee'],      // Gallery management
  '/admin/settings': ['admin'],                  // Admin-only settings
};
```

## Implementation Strategy

### Phase 1: Core Authentication (This Epic)
1. Build RepairShopr client and test connectivity
2. Implement secure session store
3. Update login flow
4. Update UI
5. Add basic role support to middleware
6. Test with all employee accounts

### Risk Mitigation
- **Dual-mode auth**: Keep old password auth as fallback via `AUTH_MODE=legacy|repairshopr`
- **Graceful degradation**: Clear error messages if RepairShopr is unreachable
- **Rate limit awareness**: Cache user info to minimize API calls

## Task Breakdown Preview

- [ ] **Task 1**: Create RepairShopr API client (`src/lib/repairshopr.ts`)
- [ ] **Task 2**: Create server-side session store (`src/lib/session-store.ts`)
- [ ] **Task 3**: Update auth library for RepairShopr integration (`src/lib/auth.ts`)
- [ ] **Task 4**: Update login API route (`src/app/api/auth/login/route.ts`)
- [ ] **Task 5**: Update auth check API route (`src/app/api/auth/check/route.ts`)
- [ ] **Task 6**: Update login UI with email field (`src/app/admin/login/page.tsx`)
- [ ] **Task 7**: Add role-based middleware (`src/middleware.ts`)
- [ ] **Task 8**: Add environment configuration and documentation
- [ ] **Task 9**: Integration testing with RepairShopr accounts

## Dependencies

### External
- RepairShopr API access (confirmed available)
- RepairShopr subdomain: needs confirmation from store owner
- Test credentials for development

### Internal
- No blocking dependencies - existing auth system is self-contained
- Current middleware pattern is compatible with enhancements

### Configuration Required
```env
# Required
REPAIRSHOPR_SUBDOMAIN=computerstoreks
SESSION_SECRET=<32-byte-random-string>

# Optional (migration)
AUTH_MODE=repairshopr  # or 'legacy' for old password auth
LEGACY_ADMIN_PASSWORD=<current-password>  # fallback during transition
```

## Success Criteria (Technical)

### Functional
- [ ] Employees can log in with RepairShopr email/password
- [ ] Session persists for 8 hours
- [ ] Logout clears session completely
- [ ] Invalid credentials show clear error
- [ ] Role is correctly identified from RepairShopr

### Security
- [ ] API tokens never sent to browser
- [ ] Sessions are encrypted at rest
- [ ] Cookies are HttpOnly, Secure, SameSite=Lax
- [ ] Failed login attempts are logged

### Performance
- [ ] Login completes in < 3 seconds
- [ ] Session validation < 100ms (no API call needed)
- [ ] Graceful handling of RepairShopr downtime

## Estimated Effort

| Task | Complexity | Estimate |
|------|------------|----------|
| RepairShopr client | Low | Small |
| Session store | Medium | Medium |
| Auth library update | Medium | Medium |
| Login API route | Low | Small |
| Auth check API | Low | Small |
| Login UI update | Low | Small |
| Middleware update | Medium | Medium |
| Config & docs | Low | Small |
| Testing | Medium | Medium |

**Total**: ~9 focused tasks, moderate overall complexity

**Critical Path**: Tasks 1-4 are sequential; Tasks 5-7 can parallelize after Task 3.

## Tasks Created

- [ ] #15 - Create RepairShopr API Client (parallel: false)
- [ ] #16 - Create Server-Side Session Store (parallel: true)
- [ ] #17 - Update Auth Library for RepairShopr Integration (parallel: false, depends: #15, #16)
- [ ] #18 - Update Login API Route (parallel: false, depends: #17)
- [ ] #19 - Update Auth Check API Route (parallel: true, depends: #17)
- [ ] #20 - Update Login UI with Email Field (parallel: true, depends: #18)
- [ ] #21 - Add Role-Based Middleware (parallel: true, depends: #17)
- [ ] #22 - Add Environment Configuration and Documentation (parallel: true, depends: #15, #16)
- [ ] #23 - Integration Testing with RepairShopr Accounts (parallel: false, depends: all)

**Total tasks**: 9
**Parallel tasks**: 5 (#16, #19, #20, #21, #22)
**Sequential tasks**: 4 (#15, #17, #18, #23)
**Estimated total effort**: 22-30 hours
