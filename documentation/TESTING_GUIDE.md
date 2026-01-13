# Testing Guide - Computer Store KS

This document provides comprehensive documentation for the testing setup in the Computer Store KS project.

---

## 1. Testing Overview

### Testing Framework
- **Framework:** Bun Test (built-in test runner with `bun:test`)
- **Language:** TypeScript
- **Pattern:** Unit tests with mocking, integration tests with real services

### Test File Locations

| Location | Purpose |
|----------|---------|
| `src/lib/*.test.ts` | Unit tests for library utilities |
| `src/__tests__/*.test.ts` | Integration tests |
| `src/middleware.test.ts` | Middleware tests (root of src/) |

### Test Naming Conventions

- **File naming:** `{module}.test.ts` (co-located with source)
- **Test structure:** `describe()` blocks for grouping, `test()` for individual cases
- **Naming pattern:** Descriptive names that explain the behavior being tested

```typescript
describe('ModuleName', () => {
  describe('functionName', () => {
    test('returns expected result when given valid input', () => {
      // test implementation
    });
  });
});
```

---

## 2. Test Files

### Unit Tests (src/lib/*.test.ts)

#### auth.test.ts
**Purpose:** Tests authentication library with both RepairShopr and legacy modes.

**Coverage areas:**
- `getAuthMode()` - Auth mode detection
- `verifyPassword()` - Password verification (legacy mode)
- `authenticateWithRepairShopr()` - RepairShopr authentication
- `isAuthenticated()` - Session validation
- `getCurrentUser()` - User retrieval
- `destroySession()` - Session cleanup
- `createSession()` - Session creation
- `getSessionToken()` - Token retrieval
- `checkAuthFromRequest()` - Request-based auth checking
- `verifyBearerToken()` - Bearer token validation

**Key features tested:**
- Dual-mode authentication support (RepairShopr + legacy)
- Role mapping (admin, employee, limited)
- Session management with encrypted storage
- Cookie handling

#### repairshopr.test.ts
**Purpose:** Tests the RepairShopr API client with mocked responses.

**Coverage areas:**
- `RepairShoprClient` constructor
- `signIn()` - User authentication
- `getMe()` - User info retrieval
- Error handling (401, 403, 404, 422, 429, 500)
- Rate limiting
- `createRepairShoprClient()` factory function
- `RepairShoprAPIError` class

**Key features tested:**
- API response parsing
- Input validation
- Error code mapping
- Rate limit tracking
- Network error handling

#### session-store.test.ts
**Purpose:** Tests encrypted file-based session storage.

**Coverage areas:**
- `createSession()` - Session file creation
- `getSession()` - Session retrieval and decryption
- `deleteSession()` - Session removal
- `cleanExpiredSessions()` - Expired session cleanup
- `getSessionSafe()` - Safe session retrieval (no API token)

**Key features tested:**
- AES-256-GCM encryption
- Session ID generation (UUID format)
- Expiry handling
- Path traversal prevention
- Environment variable validation

#### spam-detection.test.ts
**Purpose:** Tests spam detection and prevention module.

**Coverage areas:**
- `analyzeContent()` - Content scoring
- `validateTiming()` - Submission timing validation
- `checkHoneypots()` - Honeypot field detection
- `calculateSpamScoreSync()` - Overall spam scoring
- `isGibberish()` - Gibberish text detection
- `validateName()` - Name validation
- `SPAM_THRESHOLDS` - Threshold constants

**Key features tested:**
- Legitimate vs spam text differentiation
- Bot detection via user agents
- Fast submission penalties
- Gibberish detection algorithms
- Real-world spam examples

### Integration Tests (src/__tests__/)

#### auth-integration.test.ts
**Purpose:** End-to-end authentication tests with real RepairShopr API.

**Prerequisites:**
```bash
export TEST_REPAIRSHOPR_EMAIL=user@example.com
export TEST_REPAIRSHOPR_PASSWORD=password
export REPAIRSHOPR_SUBDOMAIN=yoursubdomain
```

**Coverage areas:**
- Sign in with valid/invalid credentials
- User info retrieval
- Role mapping verification

**Note:** These tests are automatically skipped if credentials are not set.

### Middleware Tests (src/middleware.test.ts)

**Purpose:** Tests role-based middleware for admin routes.

**Coverage areas:**
- Unauthenticated access handling
- Admin role permissions
- Employee role permissions
- Limited role permissions
- Backward compatibility (no role cookie)
- Invalid role handling
- Login page redirection
- Public route access

**Test scenarios:**
- Route access by role (admin, employee, limited)
- Redirect behavior for unauthorized access
- Authentication state detection

---

## 3. Running Tests

### Commands

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run tests with coverage
bun test --coverage

# Run specific test file
bun test src/lib/auth.test.ts

# Run tests matching pattern
bun test spam

# Run only failing tests
bun test --only-failures

# Run with verbose dot output
bun test --dots

# Update snapshots
bun test --update-snapshots

# Run tests with timeout (ms)
bun test --timeout=10000

# Exit on first failure
bun test --bail

# Run tests matching name pattern
bun test --test-name-pattern="authenticates"
```

### Configuration

Bun's test runner does not require a separate configuration file. Configuration is handled through:

1. **Command-line flags** - As shown above
2. **Environment variables** - Set in `.env` or exported

#### Required Environment Variables for Tests

```bash
# Session encryption (32 bytes)
SESSION_SECRET=12345678901234567890123456789012

# RepairShopr configuration
REPAIRSHOPR_SUBDOMAIN=testshop
AUTH_MODE=repairshopr  # or 'legacy'

# For integration tests only
TEST_REPAIRSHOPR_EMAIL=user@example.com
TEST_REPAIRSHOPR_PASSWORD=password
```

#### Test Environment Setup

Tests manage their own environment by:
1. Storing original values before modification
2. Setting test-specific values
3. Restoring original values in `afterEach`/`afterAll`

```typescript
const originalEnv = { ...process.env };

function resetEnv() {
  process.env.AUTH_MODE = originalEnv.AUTH_MODE;
  // ... restore other values
}

afterEach(() => {
  resetEnv();
});
```

---

## 4. Test Patterns

### Mocking

#### Mocking External Services (fetch)

```typescript
const originalFetch = global.fetch;
let mockFetch: ReturnType<typeof mock>;

function setupMockFetch(
  response: unknown,
  status: number = 200,
  statusText: string = 'OK'
) {
  mockFetch = mock(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      statusText,
      json: () => Promise.resolve(response),
    } as Response)
  );
  global.fetch = mockFetch;
}

function restoreFetch() {
  global.fetch = originalFetch;
}

// Usage
beforeEach(() => {
  setupMockFetch(mockRawResponse);
});

afterEach(() => {
  restoreFetch();
});
```

#### Mocking Next.js Cookies

```typescript
const mockCookies = {
  get: mock(() => undefined as { value: string } | undefined),
  set: mock(() => {}),
  delete: mock(() => {}),
};

mock.module('next/headers', () => ({
  cookies: () => Promise.resolve(mockCookies),
}));

// Reset mocks between tests
beforeEach(() => {
  mockCookies.get.mockReset();
  mockCookies.set.mockReset();
  mockCookies.delete.mockReset();
});
```

#### Mocking Headers Class

```typescript
class MockHeaders extends Headers {
  private map: Map<string, string>;

  constructor(init: Record<string, string> = {}) {
    super();
    this.map = new Map(Object.entries(init));
  }

  override get(name: string): string | null {
    return this.map.get(name.toLowerCase()) || null;
  }
}

// Usage
const headers = new MockHeaders({
  'user-agent': 'Mozilla/5.0...',
  'accept-language': 'en-US,en;q=0.9',
});
```

### Fixtures

#### Test Data Fixtures

```typescript
// User session fixture
const mockUser: UserSession = {
  userId: 12345,
  supabaseUserId: 'test-uuid-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin',
  userType: 'employee',
};

// API response fixture
const mockRawResponse = {
  user_token: 'test_api_key_12345',
  user_email: 'test@example.com',
  user_name: 'Test User',
  user_id: 12345,
  admin: true,
  // ... other fields
};
```

#### File System Fixtures

```typescript
const SESSIONS_DIR = join(process.cwd(), '.sessions');

beforeEach(() => {
  // Clean up sessions directory
  if (existsSync(SESSIONS_DIR)) {
    rmSync(SESSIONS_DIR, { recursive: true, force: true });
  }
});

afterEach(() => {
  // Cleanup after test
  if (existsSync(SESSIONS_DIR)) {
    rmSync(SESSIONS_DIR, { recursive: true, force: true });
  }
});
```

### Assertions

#### Common Assertion Patterns

```typescript
// Equality
expect(result.status).toBe(200);
expect(result.user).toEqual({ id: 1, name: 'Test' });

// Truthiness
expect(result).toBeDefined();
expect(result).not.toBeNull();
expect(result.success).toBe(true);

// Numbers
expect(result.score).toBeGreaterThan(50);
expect(result.score).toBeLessThan(100);
expect(result.remaining).toBeGreaterThanOrEqual(0);

// Strings
expect(error.message).toContain('not configured');
expect(url).toBe('https://testshop.repairshopr.com/api/v1/sign_in');

// Arrays/Objects
expect(Object.keys(user)).toEqual(['userId', 'email', 'name', 'role']);
expect('apiToken' in safeSession).toBe(false);

// Async/Errors
await expect(client.signIn('', 'password')).rejects.toThrow(RepairShoprAPIError);
expect(error).toBeInstanceOf(RepairShoprAPIError);
expect((error as RepairShoprAPIError).code).toBe('UNAUTHORIZED');

// Mock verification
expect(mockFetch).toHaveBeenCalledTimes(1);
expect(mockCookies.set).toHaveBeenCalled();
```

---

## 5. Coverage

### Current Coverage

Based on the latest test run:
- **Total tests:** 121
- **Passing:** 114
- **Failing:** 7
- **Test files:** 4
- **Expect calls:** 259

### Coverage Goals

| Metric | Target | Current Status |
|--------|--------|----------------|
| Line coverage | > 80% | Partial |
| Branch coverage | > 70% | Partial |
| Function coverage | > 80% | Good |
| Passing rate | 100% | 94.2% |

### Running Coverage Reports

```bash
# Generate text coverage report
bun test --coverage

# Generate LCOV report for CI/CD
bun test --coverage --coverage-reporter=lcov

# Specify coverage output directory
bun test --coverage --coverage-dir=coverage
```

### Known Failing Tests

The middleware tests are currently failing due to the middleware function returning `undefined` instead of response objects. This appears to be an issue with how the tests mock NextRequest/NextResponse.

---

## 6. Writing New Tests

### Test Structure

```typescript
/**
 * {Module Name} Tests
 *
 * Brief description of what this test file covers.
 */

import { describe, test, expect, beforeEach, afterEach, mock } from 'bun:test';
import { functionToTest } from './module';

// =============================================================================
// Test Fixtures
// =============================================================================

const mockData = { /* ... */ };

// =============================================================================
// Mock Setup
// =============================================================================

const originalFetch = global.fetch;
let mockFetch: ReturnType<typeof mock>;

function setupMocks() {
  // Set up mocks
}

function cleanupMocks() {
  // Restore originals
}

// =============================================================================
// Tests: FunctionName
// =============================================================================

describe('FunctionName', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    cleanupMocks();
  });

  test('does expected thing when given valid input', () => {
    const result = functionToTest(validInput);
    expect(result).toBe(expectedValue);
  });

  test('throws error when given invalid input', () => {
    expect(() => functionToTest(invalidInput)).toThrow();
  });
});
```

### Setup/Teardown

```typescript
// Run once before all tests in file
beforeAll(() => {
  // Global setup
});

// Run before each test
beforeEach(() => {
  // Reset mocks, clear state
});

// Run after each test
afterEach(() => {
  // Cleanup, restore mocks
});

// Run once after all tests
afterAll(() => {
  // Final cleanup
});
```

### Best Practices

#### What to Test

- **Public API functions** - Every exported function should have tests
- **Edge cases** - Empty inputs, boundary values, error conditions
- **Error handling** - Verify errors are thrown with correct types/messages
- **Security features** - Encryption, authentication, authorization
- **Business logic** - Spam detection rules, role mapping, etc.

#### What Not to Test

- **Implementation details** - Focus on behavior, not internal structure
- **Third-party libraries** - Trust that they work correctly
- **Trivial code** - Simple getters/setters without logic
- **Type-only exports** - TypeScript interfaces don't need tests

#### Naming Conventions

```typescript
// Good: Describes behavior
test('returns null for non-existent session', () => { });
test('throws error when SESSION_SECRET is missing', () => { });
test('maps admin user to admin role', () => { });

// Bad: Too vague
test('works', () => { });
test('test 1', () => { });
test('error handling', () => { });
```

#### Test Isolation

- Each test should be independent
- Clean up any files or state created
- Reset all mocks between tests
- Don't rely on test execution order

---

## 7. CI/CD Integration

### Running Tests in CI

Tests can be run in any CI/CD pipeline that supports Bun:

```yaml
# Example GitHub Actions workflow
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Run tests
        run: bun test --pass-with-no-tests
        env:
          SESSION_SECRET: ${{ secrets.SESSION_SECRET }}
          REPAIRSHOPR_SUBDOMAIN: testshop
          AUTH_MODE: repairshopr
```

### Test Scripts

Add to `package.json` (currently not present, but recommended):

```json
{
  "scripts": {
    "test": "bun test",
    "test:watch": "bun test --watch",
    "test:coverage": "bun test --coverage",
    "test:ci": "bun test --pass-with-no-tests --bail"
  }
}
```

### Pre-commit Hooks

Consider adding test execution to pre-commit:

```bash
# .husky/pre-commit
#!/bin/sh
bun test --bail
```

---

## 8. Troubleshooting

### Common Issues and Solutions

#### Test File Not Found

**Problem:** `No tests found` or specific file not running

**Solutions:**
- Ensure file has `.test.ts` or `.test.tsx` extension
- Check file is not in `node_modules` or excluded directories
- Use explicit path: `bun test src/lib/specific.test.ts`

#### Mock Not Working

**Problem:** Mocked function returns real results

**Solutions:**
- Ensure mock is set up BEFORE importing the module that uses it
- Use `mock.module()` for module-level mocks
- Reset mocks in `beforeEach` to ensure clean state

```typescript
// Wrong - import before mock
import { func } from './module';
mock.module('./dep', () => ({}));

// Correct - mock before import
mock.module('./dep', () => ({}));
import { func } from './module';
```

#### Async Test Timeout

**Problem:** Test times out waiting for async operation

**Solutions:**
- Increase timeout: `bun test --timeout=30000`
- Check for missing `await` keywords
- Verify mock promises resolve correctly

#### Environment Variable Issues

**Problem:** Tests fail because env vars are missing

**Solutions:**
- Set required env vars before running tests
- Add fallback values in test setup
- Check if tests properly reset env vars between runs

```bash
# Set for single run
SESSION_SECRET=12345678901234567890123456789012 bun test
```

#### Session/File Cleanup Failures

**Problem:** Tests interfere with each other via leftover files

**Solutions:**
- Always clean up in `afterEach`
- Use unique file names per test when possible
- Use `try/finally` to ensure cleanup runs

```typescript
afterEach(() => {
  try {
    if (existsSync(SESSIONS_DIR)) {
      rmSync(SESSIONS_DIR, { recursive: true, force: true });
    }
  } catch (e) {
    console.warn('Cleanup failed:', e);
  }
});
```

#### Cookie/Header Mock Issues

**Problem:** Next.js `cookies()` or headers not mocking correctly

**Solutions:**
- Mock the module before importing tested code
- Return Promise-wrapped mock objects
- Reset mock return values in `beforeEach`

#### Integration Test Skipping

**Problem:** Integration tests are skipped unexpectedly

**Solutions:**
- Verify all required env vars are set
- Check the skip condition in the test file
- Run with explicit env vars set

```bash
TEST_REPAIRSHOPR_EMAIL=user@example.com \
TEST_REPAIRSHOPR_PASSWORD=password \
REPAIRSHOPR_SUBDOMAIN=yoursubdomain \
bun test src/__tests__/auth-integration.test.ts
```

### Debugging Tests

```bash
# Run single test with verbose output
bun test --test-name-pattern="specific test name"

# Add console.log in tests to inspect values
test('debug test', () => {
  const result = someFunction();
  console.log('Result:', result);
  expect(result).toBeDefined();
});

# Run tests with increased timeout for debugging
bun test --timeout=60000
```

---

## Quick Reference

### File Locations

| Type | Location |
|------|----------|
| Unit tests | `src/lib/*.test.ts` |
| Integration tests | `src/__tests__/*.test.ts` |
| Middleware tests | `src/middleware.test.ts` |

### Test Commands

| Command | Purpose |
|---------|---------|
| `bun test` | Run all tests |
| `bun test --watch` | Watch mode |
| `bun test --coverage` | Generate coverage |
| `bun test path/to/file.test.ts` | Run specific file |
| `bun test --bail` | Stop on first failure |

### Required Environment

| Variable | Purpose | Example |
|----------|---------|---------|
| `SESSION_SECRET` | Session encryption | 32-byte string |
| `REPAIRSHOPR_SUBDOMAIN` | API endpoint | `testshop` |
| `AUTH_MODE` | Auth mode | `repairshopr` or `legacy` |

---

*Last updated: 2026-01-12*
