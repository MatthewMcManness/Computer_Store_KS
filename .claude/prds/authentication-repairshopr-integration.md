---
name: authentication-repairshopr-integration
description: SSO authentication using RepairShopr credentials for internal tools and customer portal
status: backlog
created: 2025-11-28T18:15:21Z
---

# PRD: RepairShopr Authentication Integration

## Executive Summary

Integrate RepairShopr's authentication system as the single sign-on (SSO) provider for Computer Store KS's internal tools (gallery manager, flyer maker) and future customer portal. This eliminates the need for employees to manage separate credentials and enables a phased rollout of RepairShopr-powered features including ticket management, inventory sync, and customer self-service.

**Value Proposition:**
- Single login for employees across RepairShopr and internal tools
- Foundation for custom UI/workflows built on RepairShopr data
- Customer self-service portal for repair status tracking
- Automated inventory sync between gallery and RepairShopr

## Problem Statement

### Current State
- Employees must log into RepairShopr separately from internal tools (gallery manager, flyer maker)
- Internal tools use a simple shared password (`ADMIN_PASSWORD` environment variable)
- No role-based access control - all authenticated users have the same permissions
- Procedure changes require verbal communication and training
- Customers must call the store to check repair status
- Gallery/inventory management is disconnected from RepairShopr inventory

### Why This Matters Now
- Operational inefficiency from dual logins and manual processes
- Security risk from shared password authentication
- Customer experience suffers from lack of self-service options
- Missed opportunity to leverage RepairShopr's comprehensive API

## User Stories

### Employee Authentication (Phase 1 - Priority)

**US-1: Employee SSO Login**
> As an employee, I want to log into internal tools using my RepairShopr credentials so that I don't have to remember multiple passwords.

Acceptance Criteria:
- [ ] Login form accepts RepairShopr email and password
- [ ] Successful login creates a secure session
- [ ] Failed login shows clear error message
- [ ] Session persists for 8 hours (matching current behavior)
- [ ] Logout clears session and redirects to login

**US-2: Role-Based Access**
> As the store owner, I want employees to have access based on their RepairShopr role so that reception staff can't access administrative features.

Acceptance Criteria:
- [ ] Owner account has full admin access
- [ ] Employee accounts have standard access (gallery, flyer maker)
- [ ] Reception account has limited access (view-only where appropriate)
- [ ] Unauthorized access attempts show "Access Denied" message

**US-3: Session Security**
> As an employee, I want my session to be secure so that customer data is protected.

Acceptance Criteria:
- [ ] Session tokens are HttpOnly, Secure, and SameSite
- [ ] Sessions expire after 8 hours of inactivity
- [ ] Concurrent session detection (optional: warn on multiple logins)
- [ ] API tokens are never exposed to the browser

### Customer Authentication (Phase 2 - Future)

**US-4: Customer Login**
> As a customer, I want to log in using my email so that I can check my repair status without calling.

Acceptance Criteria:
- [ ] Customer can log in with email (magic link or password)
- [ ] Customer sees only their own tickets and invoices
- [ ] Customer cannot access employee/admin features
- [ ] Clear separation between customer and employee portals

**US-5: Repair Status Tracking**
> As a customer, I want to see my repair status so that I know when to pick up my device.

Acceptance Criteria:
- [ ] Customer dashboard shows active tickets
- [ ] Ticket status is clearly displayed (Received, Diagnosing, Waiting for Parts, Repairing, Ready for Pickup)
- [ ] Estimated completion date shown when available
- [ ] Email/SMS notifications for status changes (future)

## Requirements

### Functional Requirements

#### FR-1: Authentication Service
- Implement RepairShopr API authentication using `POST /sign_in` endpoint
- Store API token securely server-side (never expose to client)
- Implement `/api/v1/me` lookup to get user details and role
- Create session management with secure cookies

#### FR-2: Login Flow
- Replace current password-based login with RepairShopr credentials
- Display RepairShopr subdomain configuration (or hardcode for single-tenant)
- Handle authentication errors gracefully (invalid credentials, network errors, rate limits)
- Implement logout functionality that clears local session

#### FR-3: Authorization Middleware
- Create middleware to check authentication on protected routes
- Implement role-based access control based on RepairShopr user data
- Return 401 for unauthenticated requests, 403 for unauthorized

#### FR-4: API Proxy Layer
- Create server-side proxy for RepairShopr API calls
- Attach stored API token to proxied requests
- Handle rate limiting (180 requests/minute)
- Cache frequently-accessed data where appropriate

#### FR-5: Backward Compatibility
- Maintain existing Bearer token authentication for API routes during transition
- Provide migration path from current auth to new system

### Non-Functional Requirements

#### NFR-1: Security
- **Token Storage**: API tokens stored server-side only (environment variable or encrypted database)
- **Session Security**: HttpOnly, Secure, SameSite=Strict cookies
- **HTTPS Only**: All authentication endpoints require HTTPS
- **Rate Limiting**: Implement local rate limiting in addition to RepairShopr's limits
- **Audit Logging**: Log authentication events (login, logout, failed attempts)
- **No Credential Storage**: Never store RepairShopr passwords; only session tokens

#### NFR-2: Performance
- Login response time < 2 seconds
- Session validation < 100ms (cached)
- API proxy requests add < 200ms overhead
- Graceful degradation if RepairShopr API is unavailable

#### NFR-3: Reliability
- Handle RepairShopr API downtime gracefully
- Implement retry logic with exponential backoff
- Provide clear error messages for all failure modes
- Session persistence survives server restarts

#### NFR-4: Scalability
- Support multiple concurrent users (all employees + customers)
- Efficient token caching to minimize RepairShopr API calls
- Stateless session validation where possible

## Technical Design

### Authentication Flow

```
┌─────────┐     ┌─────────────┐     ┌─────────────────┐
│ Browser │     │ Next.js API │     │ RepairShopr API │
└────┬────┘     └──────┬──────┘     └────────┬────────┘
     │                 │                      │
     │ POST /api/auth/login                   │
     │ {email, password}                      │
     │────────────────>│                      │
     │                 │                      │
     │                 │ POST /sign_in        │
     │                 │ {email, password}    │
     │                 │─────────────────────>│
     │                 │                      │
     │                 │   {api_key, user}    │
     │                 │<─────────────────────│
     │                 │                      │
     │                 │ Store api_key        │
     │                 │ server-side          │
     │                 │                      │
     │  Set-Cookie:    │                      │
     │  session_token  │                      │
     │<────────────────│                      │
     │                 │                      │
```

### RepairShopr API Integration

**Base URL**: `https://{subdomain}.repairshopr.com/api/v1`

**Key Endpoints**:
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/sign_in` | POST | Authenticate user, get API token |
| `/me` | GET | Get current user info and role |
| `/tickets` | GET/POST | Manage repair tickets |
| `/customers` | GET/POST | Customer management |
| `/products` | GET | Inventory/products |
| `/invoices` | GET | Invoice history |

**Rate Limit**: 180 requests/minute per IP

### Data Model

```typescript
interface RepairShoprUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'limited';  // Map from RepairShopr roles
}

interface Session {
  id: string;
  userId: number;
  email: string;
  role: string;
  apiToken: string;  // Encrypted, server-side only
  createdAt: Date;
  expiresAt: Date;
}
```

### Configuration

```env
# RepairShopr Configuration
REPAIRSHOPR_SUBDOMAIN=computerstoreks
REPAIRSHOPR_API_URL=https://computerstoreks.repairshopr.com/api/v1

# Session Configuration
SESSION_SECRET=<random-32-byte-string>
SESSION_MAX_AGE=28800  # 8 hours in seconds

# Optional: Fallback admin password during migration
LEGACY_ADMIN_PASSWORD=<current-password>
```

## Success Criteria

### Phase 1: Employee Authentication (MVP)
- [ ] 100% of employees can log in with RepairShopr credentials
- [ ] Zero password-related support requests
- [ ] No unauthorized access incidents
- [ ] Login success rate > 99%
- [ ] Average login time < 3 seconds

### Phase 2: Role-Based Access
- [ ] Owner has admin-only features (user management, settings)
- [ ] Employees have standard feature access
- [ ] Reception has appropriate limited access
- [ ] Zero privilege escalation vulnerabilities

### Phase 3: Customer Portal (Future)
- [ ] 50% reduction in "status check" phone calls within 3 months
- [ ] Customer satisfaction score > 4/5 for self-service
- [ ] < 1% of customers need phone support for portal issues

## Constraints & Assumptions

### Constraints
- RepairShopr API rate limit: 180 requests/minute
- RepairShopr does not provide OAuth/OIDC (must use email/password + API token)
- Customer authentication may require different approach (magic links or customer portal tokens)
- Must maintain existing functionality during migration

### Assumptions
- All employees have active RepairShopr accounts with valid credentials
- RepairShopr `/sign_in` endpoint returns API token suitable for subsequent requests
- RepairShopr user roles map cleanly to our access levels
- Store subdomain is consistent: `computerstoreks.repairshopr.com`

### Technical Assumptions
- Next.js API routes can securely store and proxy API tokens
- RepairShopr API is stable and maintains backward compatibility
- Session storage (cookies) is sufficient; no need for external session store

## Out of Scope

### Phase 1 (This PRD)
- Customer authentication (separate PRD)
- Multi-factor authentication (MFA)
- Password reset flow (handled by RepairShopr directly)
- User management/provisioning (use RepairShopr admin)
- Offline authentication
- Mobile app authentication

### Future Phases
- Full ticket management UI
- Inventory sync with gallery
- Invoice/payment processing
- Customer notifications (email/SMS)
- Custom workflow builder

## Dependencies

### External Dependencies
- **RepairShopr API**: Primary authentication provider
  - API stability and availability
  - `/sign_in` endpoint functionality
  - Rate limit headroom
- **RepairShopr Account**: Valid subscription with API access enabled

### Internal Dependencies
- **Existing Auth System**: Migration from current `src/lib/auth.ts`
- **Protected Routes**: Update middleware to use new auth
- **Admin UI**: Update login page component

### Team Dependencies
- Store owner to provide/confirm RepairShopr subdomain
- Test credentials for development/staging
- Employee communication about login change

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| RepairShopr API downtime | High | Low | Implement graceful degradation, optional offline mode |
| Rate limit exceeded | Medium | Medium | Implement caching, request queuing |
| Employee credential issues | Medium | Medium | Provide clear error messages, link to RepairShopr password reset |
| Security vulnerability | High | Low | Security review, penetration testing, audit logging |
| Breaking changes to RepairShopr API | Medium | Low | Version pinning, monitoring API changelog |

## Implementation Phases

### Phase 1: Core Authentication (MVP)
1. Set up RepairShopr API client
2. Implement `/api/auth/login` with RepairShopr `/sign_in`
3. Create secure session management
4. Update login UI
5. Implement logout
6. Update middleware for session validation
7. Test with all employee accounts

### Phase 2: Role-Based Access
1. Map RepairShopr roles to internal permissions
2. Implement authorization middleware
3. Add role checks to protected features
4. Create admin-only sections

### Phase 3: API Proxy Foundation
1. Create generic RepairShopr API proxy
2. Implement caching layer
3. Add rate limiting protection
4. Build foundation for future features

## Appendix

### RepairShopr API Documentation
- Official Docs: https://api-docs.repairshopr.com/
- Swagger JSON: https://api-docs.repairshopr.com/swagger.json
- Help Center: https://repair.uservoice.com/knowledgebase/articles/376312-repairshopr-rest-api-build-custom-extensions-app

### Current Auth Implementation
- Location: `src/lib/auth.ts`
- Method: Environment variable password + cookie session
- Session Duration: 8 hours

### Related PRDs
- (Future) Customer Portal PRD
- (Future) Ticket Management UI PRD
- (Future) Inventory Sync PRD
