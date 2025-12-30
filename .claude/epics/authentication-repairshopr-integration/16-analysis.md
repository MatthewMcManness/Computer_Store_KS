---
issue: 16
title: Create Server-Side Session Store
analyzed: 2025-11-28T23:00:00Z
estimated_hours: 4
parallelization_factor: 1.5
---

# Parallel Work Analysis: Issue #16

## Overview
Create a secure server-side session store that keeps API tokens encrypted and never exposes them to the browser. Uses file-based JSON storage with AES-256-GCM encryption. Sessions stored in `.sessions/` directory with auto-cleanup of expired sessions.

## Parallel Streams

### Stream A: Core Session Store Implementation
**Scope**: Create the main session store with encryption and CRUD operations
**Files**:
- `src/lib/session-store.ts`
**Agent Type**: typescript-expert
**Can Start**: immediately
**Estimated Hours**: 2.5
**Dependencies**: none

**Work Items**:
1. Define Session interface with all required fields
2. Implement encryption/decryption using AES-256-GCM with crypto module
3. Implement `createSession(userData, apiToken)` - generates UUID, encrypts, saves to file
4. Implement `getSession(sessionId)` - reads file, decrypts, validates expiry
5. Implement `deleteSession(sessionId)` - removes session file
6. Implement `cleanExpiredSessions()` - scans directory, removes expired
7. Auto-create `.sessions/` directory if not exists
8. Validate SESSION_SECRET is 32 bytes

### Stream B: Environment & Gitignore Configuration
**Scope**: Configure environment and ensure sessions directory is ignored
**Files**:
- `.env.example`
- `.gitignore`
**Agent Type**: documentation-specialist
**Can Start**: immediately
**Estimated Hours**: 0.5
**Dependencies**: none

**Work Items**:
1. Add SESSION_SECRET to .env.example with generation instructions
2. Add `.sessions/` to .gitignore

### Stream C: Unit Tests
**Scope**: Create comprehensive unit tests for session store
**Files**:
- `src/lib/session-store.test.ts`
**Agent Type**: test-automator
**Can Start**: after Stream A completes
**Estimated Hours**: 1
**Dependencies**: Stream A

**Work Items**:
1. Test createSession creates encrypted file
2. Test getSession decrypts and returns data
3. Test getSession returns null for expired session
4. Test deleteSession removes file
5. Test cleanExpiredSessions removes only expired
6. Test error handling for missing SESSION_SECRET
7. Test error handling for invalid session ID

## Coordination Points

### Shared Files
- `.env.example` - Stream B adds SESSION_SECRET

### Sequential Requirements
1. Core session store (Stream A) must complete before tests (Stream C)
2. Environment config (Stream B) can run in parallel with Stream A

## Conflict Risk Assessment
- **Low Risk**: All streams work on different files

## Parallelization Strategy

**Recommended Approach**: hybrid

Launch Streams A & B simultaneously. Start Stream C when Stream A completes.

```
Timeline:
├─ Stream A (Core Store):  ████████████████████ (2.5h)
├─ Stream B (Config):      ████ (0.5h)
└─ Stream C (Tests):                      ████████ (1h, after A)
```

## Expected Timeline

With parallel execution:
- Wall time: 3.5 hours (A + C sequentially)
- Total work: 4 hours
- Efficiency gain: 12.5% (B runs during A)

Without parallel execution:
- Wall time: 4 hours

## Notes

- **Security Critical**: This handles API token encryption - must be done correctly
- **SESSION_SECRET**: Must be exactly 32 bytes for AES-256
- **File-based storage**: Simple but sufficient for <10 concurrent users
- **Future upgrade path**: Can swap file storage for Redis without API changes
