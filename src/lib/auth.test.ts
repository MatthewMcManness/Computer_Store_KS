/**
 * Auth Library Tests
 *
 * Unit tests for the authentication library with both RepairShopr and legacy modes.
 * Tests cover dual-mode support, session management, and error handling.
 */

import { describe, test, expect, mock, beforeEach, afterEach, afterAll } from 'bun:test';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

// Mock next/headers before importing auth module
const mockCookies = {
  get: mock(() => undefined as { value: string } | undefined),
  set: mock(() => {}),
  delete: mock(() => {}),
};

// Mock the cookies function
mock.module('next/headers', () => ({
  cookies: () => Promise.resolve(mockCookies),
}));

// Import after mocking
import {
  getAuthMode,
  verifyPassword,
  authenticateWithRepairShopr,
  createSession,
  destroySession,
  isAuthenticated,
  getCurrentUser,
  getSessionToken,
  checkAuthFromRequest,
  verifyBearerToken,
  type UserSession,
  type AuthResult,
} from './auth';

import { RepairShoprAPIError } from './repairshopr';

// =============================================================================
// Test Fixtures
// =============================================================================

const SESSIONS_DIR = join(process.cwd(), '.sessions');

const mockUser: UserSession = {
  userId: 12345,
  supabaseUserId: 'test-uuid-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin',
  userType: 'employee',
};

// Mock RepairShopr API responses
const mockSignInResponse = {
  api_key: 'test_api_key_12345',
  user: {
    id: 12345,
    email: 'test@example.com',
    full_name: 'Test User',
    admin: true,
  },
  admin: true,
  two_factor_required: false,
  subdomain: 'testshop',
  permissions: {
    customer: { read: true, write: true, delete: false },
  },
};

const mockMeResponse = {
  user: {
    id: 12345,
    email: 'test@example.com',
    full_name: 'Test User',
    admin: true,
  },
  admin: true,
  subdomain: 'testshop',
  permissions: {
    customer: { read: true, write: true, delete: false },
  },
};

// =============================================================================
// Environment Setup
// =============================================================================

const originalEnv = { ...process.env };

function resetEnv() {
  // Reset to original values
  process.env.AUTH_MODE = originalEnv.AUTH_MODE;
  process.env.ADMIN_PASSWORD = originalEnv.ADMIN_PASSWORD;
  process.env.LEGACY_ADMIN_PASSWORD = originalEnv.LEGACY_ADMIN_PASSWORD;
  process.env.REPAIRSHOPR_SUBDOMAIN = originalEnv.REPAIRSHOPR_SUBDOMAIN;
  process.env.SESSION_SECRET = originalEnv.SESSION_SECRET;
}

function setupRepairShoprMode() {
  process.env.AUTH_MODE = 'repairshopr';
  process.env.REPAIRSHOPR_SUBDOMAIN = 'testshop';
  process.env.SESSION_SECRET = '12345678901234567890123456789012';
}

function setupLegacyMode() {
  process.env.AUTH_MODE = 'legacy';
  process.env.ADMIN_PASSWORD = 'test_admin_password';
  process.env.LEGACY_ADMIN_PASSWORD = 'test_legacy_password';
}

// =============================================================================
// Mock Setup for RepairShopr Client
// =============================================================================

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

// =============================================================================
// Tests: getAuthMode
// =============================================================================

describe('getAuthMode', () => {
  afterEach(() => {
    resetEnv();
  });

  test('returns "repairshopr" by default', () => {
    delete process.env.AUTH_MODE;
    expect(getAuthMode()).toBe('repairshopr');
  });

  test('returns "repairshopr" when AUTH_MODE=repairshopr', () => {
    process.env.AUTH_MODE = 'repairshopr';
    expect(getAuthMode()).toBe('repairshopr');
  });

  test('returns "legacy" when AUTH_MODE=legacy', () => {
    process.env.AUTH_MODE = 'legacy';
    expect(getAuthMode()).toBe('legacy');
  });

  test('returns "repairshopr" for invalid AUTH_MODE value', () => {
    process.env.AUTH_MODE = 'invalid';
    expect(getAuthMode()).toBe('repairshopr');
  });
});

// =============================================================================
// Tests: verifyPassword (Legacy Mode)
// =============================================================================

describe('verifyPassword', () => {
  afterEach(() => {
    resetEnv();
  });

  test('returns true for correct LEGACY_ADMIN_PASSWORD', () => {
    process.env.LEGACY_ADMIN_PASSWORD = 'correct_password';
    expect(verifyPassword('correct_password')).toBe(true);
  });

  test('returns true for correct ADMIN_PASSWORD when LEGACY not set', () => {
    delete process.env.LEGACY_ADMIN_PASSWORD;
    process.env.ADMIN_PASSWORD = 'admin_password';
    expect(verifyPassword('admin_password')).toBe(true);
  });

  test('returns false for incorrect password', () => {
    process.env.LEGACY_ADMIN_PASSWORD = 'correct_password';
    expect(verifyPassword('wrong_password')).toBe(false);
  });

  test('uses fallback password when env vars not set', () => {
    delete process.env.LEGACY_ADMIN_PASSWORD;
    delete process.env.ADMIN_PASSWORD;
    expect(verifyPassword('admin123')).toBe(true);
  });
});

// =============================================================================
// Tests: authenticateWithRepairShopr
// =============================================================================

describe('authenticateWithRepairShopr', () => {
  beforeEach(() => {
    setupRepairShoprMode();
    mockCookies.get.mockReset();
    mockCookies.set.mockReset();
    mockCookies.delete.mockReset();

    // Clean up sessions directory
    if (existsSync(SESSIONS_DIR)) {
      rmSync(SESSIONS_DIR, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    restoreFetch();
    resetEnv();

    // Clean up sessions directory
    if (existsSync(SESSIONS_DIR)) {
      rmSync(SESSIONS_DIR, { recursive: true, force: true });
    }
  });

  test('successfully authenticates with valid credentials', async () => {
    // Mock raw API response format
    const mockRawResponse = {
      user_token: 'test_api_key_12345',
      user_email: 'test@example.com',
      user_name: 'Test User',
      user_id: 12345,
      admin: true,
      can_use_app: true,
      two_factor_required: false,
      subdomain: 'testshop',
      default_location: null,
      enable_multi_locations: false,
      locations_allowed: [],
      permissions: {
        customer: { read: true, write: true, delete: false },
      },
      account_id: 5798,
    };

    setupMockFetch(mockRawResponse);

    const result = await authenticateWithRepairShopr('test@example.com', 'password123');

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.user).toBeDefined();
    expect(result.user!.email).toBe('test@example.com');
    expect(result.user!.name).toBe('Test User');
    expect(result.user!.userId).toBe(12345);
    expect(result.user!.role).toBe('admin');

    // Verify cookie was set
    expect(mockCookies.set).toHaveBeenCalled();
  });

  test('maps admin user to admin role', async () => {
    const mockRawResponse = {
      user_token: 'test_api_key_12345',
      user_email: 'admin@example.com',
      user_name: 'Admin User',
      user_id: 12345,
      admin: true,
      can_use_app: true,
      two_factor_required: false,
      subdomain: 'testshop',
      default_location: null,
      enable_multi_locations: false,
      locations_allowed: [],
      permissions: {},
      account_id: 5798,
    };

    setupMockFetch(mockRawResponse);

    const result = await authenticateWithRepairShopr('admin@example.com', 'password');

    expect(result.success).toBe(true);
    expect(result.user!.role).toBe('admin');
  });

  test('maps non-admin user with write permissions to employee role', async () => {
    const mockRawResponse = {
      user_token: 'test_api_key_12345',
      user_email: 'employee@example.com',
      user_name: 'Employee User',
      user_id: 12346,
      admin: false,
      can_use_app: true,
      two_factor_required: false,
      subdomain: 'testshop',
      default_location: null,
      enable_multi_locations: false,
      locations_allowed: [],
      permissions: {
        tickets: { read: true, write: true },
      },
      account_id: 5798,
    };

    setupMockFetch(mockRawResponse);

    const result = await authenticateWithRepairShopr('employee@example.com', 'password');

    expect(result.success).toBe(true);
    expect(result.user!.role).toBe('employee');
  });

  test('maps non-admin user without write permissions to limited role', async () => {
    const mockRawResponse = {
      user_token: 'test_api_key_12345',
      user_email: 'limited@example.com',
      user_name: 'Limited User',
      user_id: 12347,
      admin: false,
      can_use_app: true,
      two_factor_required: false,
      subdomain: 'testshop',
      default_location: null,
      enable_multi_locations: false,
      locations_allowed: [],
      permissions: {
        tickets: { read: true, write: false },
      },
      account_id: 5798,
    };

    setupMockFetch(mockRawResponse);

    const result = await authenticateWithRepairShopr('limited@example.com', 'password');

    expect(result.success).toBe(true);
    expect(result.user!.role).toBe('limited');
  });

  test('returns error for invalid credentials', async () => {
    setupMockFetch({ error: 'Invalid email or password' }, 401, 'Unauthorized');

    const result = await authenticateWithRepairShopr('wrong@example.com', 'wrongpassword');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid email or password');
    expect(result.user).toBeUndefined();
  });

  test('returns error for network failure', async () => {
    global.fetch = mock(() => Promise.reject(new TypeError('fetch failed')));

    const result = await authenticateWithRepairShopr('test@example.com', 'password');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Unable to connect');
  });

  test('returns error when REPAIRSHOPR_SUBDOMAIN is not set', async () => {
    delete process.env.REPAIRSHOPR_SUBDOMAIN;

    const result = await authenticateWithRepairShopr('test@example.com', 'password');

    expect(result.success).toBe(false);
    expect(result.error).toContain('not configured');
  });
});

// =============================================================================
// Tests: isAuthenticated
// =============================================================================

describe('isAuthenticated', () => {
  beforeEach(() => {
    mockCookies.get.mockReset();
    mockCookies.set.mockReset();
    mockCookies.delete.mockReset();
  });

  afterEach(() => {
    resetEnv();

    // Clean up sessions directory
    if (existsSync(SESSIONS_DIR)) {
      rmSync(SESSIONS_DIR, { recursive: true, force: true });
    }
  });

  describe('legacy mode', () => {
    beforeEach(() => {
      setupLegacyMode();
    });

    test('returns true when session cookie exists', async () => {
      mockCookies.get.mockReturnValue({ value: 'some_session_token' });

      const result = await isAuthenticated();

      expect(result).toBe(true);
    });

    test('returns false when no session cookie', async () => {
      mockCookies.get.mockReturnValue(undefined);

      const result = await isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('repairshopr mode', () => {
    beforeEach(() => {
      setupRepairShoprMode();

      // Clean up sessions
      if (existsSync(SESSIONS_DIR)) {
        rmSync(SESSIONS_DIR, { recursive: true, force: true });
      }
    });

    test('returns false when no session cookie', async () => {
      mockCookies.get.mockReturnValue(undefined);

      const result = await isAuthenticated();

      expect(result).toBe(false);
    });

    test('returns false for invalid session ID', async () => {
      mockCookies.get.mockReturnValue({ value: 'invalid-session-id' });

      const result = await isAuthenticated();

      expect(result).toBe(false);
    });

    test('returns true for valid session in store', async () => {
      // Import session store directly to create a valid session
      const { createSession: createStoreSession } = await import('./session-store');

      const sessionId = createStoreSession(
        { userId: 123, email: 'test@test.com', name: 'Test', role: 'admin' },
        'api_token'
      );

      mockCookies.get.mockReturnValue({ value: sessionId });

      const result = await isAuthenticated();

      expect(result).toBe(true);
    });
  });
});

// =============================================================================
// Tests: getCurrentUser
// =============================================================================

describe('getCurrentUser', () => {
  beforeEach(() => {
    mockCookies.get.mockReset();
  });

  afterEach(() => {
    resetEnv();

    if (existsSync(SESSIONS_DIR)) {
      rmSync(SESSIONS_DIR, { recursive: true, force: true });
    }
  });

  describe('legacy mode', () => {
    beforeEach(() => {
      setupLegacyMode();
    });

    test('returns default admin user when authenticated', async () => {
      mockCookies.get.mockReturnValue({ value: 'some_token' });

      const user = await getCurrentUser();

      expect(user).not.toBeNull();
      expect(user!.userId).toBe(0);
      expect(user!.email).toBe('admin@local');
      expect(user!.name).toBe('Administrator');
      expect(user!.role).toBe('admin');
    });

    test('returns null when not authenticated', async () => {
      mockCookies.get.mockReturnValue(undefined);

      const user = await getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('repairshopr mode', () => {
    beforeEach(() => {
      setupRepairShoprMode();

      if (existsSync(SESSIONS_DIR)) {
        rmSync(SESSIONS_DIR, { recursive: true, force: true });
      }
    });

    test('returns user data from session store', async () => {
      const { createSession: createStoreSession } = await import('./session-store');

      const sessionId = createStoreSession(
        { userId: 999, email: 'session@test.com', name: 'Session User', role: 'employee' },
        'api_token'
      );

      mockCookies.get.mockReturnValue({ value: sessionId });

      const user = await getCurrentUser();

      expect(user).not.toBeNull();
      expect(user!.userId).toBe(999);
      expect(user!.email).toBe('session@test.com');
      expect(user!.name).toBe('Session User');
      expect(user!.role).toBe('employee');
    });

    test('returns null for invalid session', async () => {
      mockCookies.get.mockReturnValue({ value: 'invalid-session' });

      const user = await getCurrentUser();

      expect(user).toBeNull();
    });

    test('does not expose API token', async () => {
      const { createSession: createStoreSession } = await import('./session-store');

      const sessionId = createStoreSession(
        { userId: 123, email: 'test@test.com', name: 'Test', role: 'admin' },
        'secret_api_token_should_not_leak'
      );

      mockCookies.get.mockReturnValue({ value: sessionId });

      const user = await getCurrentUser();

      expect(user).not.toBeNull();
      // Verify no apiToken property on returned user
      expect('apiToken' in user!).toBe(false);
      expect(Object.keys(user!)).toEqual(['userId', 'email', 'name', 'role']);
    });
  });
});

// =============================================================================
// Tests: destroySession
// =============================================================================

describe('destroySession', () => {
  beforeEach(() => {
    mockCookies.get.mockReset();
    mockCookies.set.mockReset();
    mockCookies.delete.mockReset();
  });

  afterEach(() => {
    resetEnv();

    if (existsSync(SESSIONS_DIR)) {
      rmSync(SESSIONS_DIR, { recursive: true, force: true });
    }
  });

  describe('legacy mode', () => {
    beforeEach(() => {
      setupLegacyMode();
    });

    test('deletes the session cookie', async () => {
      mockCookies.get.mockReturnValue({ value: 'some_token' });

      await destroySession();

      expect(mockCookies.delete).toHaveBeenCalled();
    });
  });

  describe('repairshopr mode', () => {
    beforeEach(() => {
      setupRepairShoprMode();

      if (existsSync(SESSIONS_DIR)) {
        rmSync(SESSIONS_DIR, { recursive: true, force: true });
      }
    });

    test('deletes session from store and cookie', async () => {
      const { createSession: createStoreSession, getSession } = await import('./session-store');

      const sessionId = createStoreSession(
        { userId: 123, email: 'test@test.com', name: 'Test', role: 'admin' },
        'api_token'
      );

      // Verify session exists
      expect(getSession(sessionId)).not.toBeNull();

      mockCookies.get.mockReturnValue({ value: sessionId });

      await destroySession();

      // Verify session was deleted from store
      expect(getSession(sessionId)).toBeNull();

      // Verify cookie was deleted
      expect(mockCookies.delete).toHaveBeenCalled();
    });

    test('handles non-existent session gracefully', async () => {
      mockCookies.get.mockReturnValue({ value: 'non-existent-session' });

      // Should not throw
      await destroySession();

      expect(mockCookies.delete).toHaveBeenCalled();
    });
  });
});

// =============================================================================
// Tests: createSession
// =============================================================================

describe('createSession', () => {
  beforeEach(() => {
    mockCookies.get.mockReset();
    mockCookies.set.mockReset();
    mockCookies.delete.mockReset();
  });

  afterEach(() => {
    resetEnv();

    if (existsSync(SESSIONS_DIR)) {
      rmSync(SESSIONS_DIR, { recursive: true, force: true });
    }
  });

  describe('legacy mode', () => {
    beforeEach(() => {
      setupLegacyMode();
    });

    test('creates a simple token session', async () => {
      const token = await createSession();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
      expect(mockCookies.set).toHaveBeenCalled();
    });

    test('creates unique tokens', async () => {
      const token1 = await createSession();
      const token2 = await createSession();

      expect(token1).not.toBe(token2);
    });
  });

  describe('repairshopr mode', () => {
    beforeEach(() => {
      setupRepairShoprMode();

      if (existsSync(SESSIONS_DIR)) {
        rmSync(SESSIONS_DIR, { recursive: true, force: true });
      }
    });

    test('creates session in store when user provided', async () => {
      const { getSession } = await import('./session-store');

      const sessionId = await createSession({
        userId: 456,
        supabaseUserId: 'new-uuid-456',
        email: 'new@test.com',
        name: 'New User',
        role: 'employee',
        userType: 'employee',
      });

      expect(sessionId).toBeDefined();
      expect(sessionId.length).toBe(36); // UUID format

      const session = getSession(sessionId);
      expect(session).not.toBeNull();
      expect(session!.userId).toBe(456);
      expect(session!.email).toBe('new@test.com');

      expect(mockCookies.set).toHaveBeenCalled();
    });

    test('creates simple token session when no user provided', async () => {
      const token = await createSession();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(mockCookies.set).toHaveBeenCalled();
    });
  });
});

// =============================================================================
// Tests: getSessionToken
// =============================================================================

describe('getSessionToken', () => {
  beforeEach(() => {
    mockCookies.get.mockReset();
  });

  test('returns token when session cookie exists', async () => {
    mockCookies.get.mockReturnValue({ value: 'test_session_token' });

    const token = await getSessionToken();

    expect(token).toBe('test_session_token');
  });

  test('returns null when no session cookie', async () => {
    mockCookies.get.mockReturnValue(undefined);

    const token = await getSessionToken();

    expect(token).toBeNull();
  });
});

// =============================================================================
// Tests: checkAuthFromRequest
// =============================================================================

describe('checkAuthFromRequest', () => {
  afterEach(() => {
    resetEnv();

    if (existsSync(SESSIONS_DIR)) {
      rmSync(SESSIONS_DIR, { recursive: true, force: true });
    }
  });

  describe('legacy mode', () => {
    beforeEach(() => {
      setupLegacyMode();
    });

    test('returns true when session cookie present', () => {
      const mockRequest = {
        cookies: {
          get: () => ({ value: 'some_token' }),
        },
      } as any;

      const result = checkAuthFromRequest(mockRequest);

      expect(result).toBe(true);
    });

    test('returns false when no session cookie', () => {
      const mockRequest = {
        cookies: {
          get: () => undefined,
        },
      } as any;

      const result = checkAuthFromRequest(mockRequest);

      expect(result).toBe(false);
    });
  });

  describe('repairshopr mode', () => {
    beforeEach(() => {
      setupRepairShoprMode();

      if (existsSync(SESSIONS_DIR)) {
        rmSync(SESSIONS_DIR, { recursive: true, force: true });
      }
    });

    test('returns false for invalid session ID', () => {
      const mockRequest = {
        cookies: {
          get: () => ({ value: 'invalid-session-id' }),
        },
      } as any;

      const result = checkAuthFromRequest(mockRequest);

      expect(result).toBe(false);
    });
  });
});

// =============================================================================
// Tests: verifyBearerToken
// =============================================================================

describe('verifyBearerToken', () => {
  afterEach(() => {
    resetEnv();
  });

  test('returns true for valid bearer token', () => {
    process.env.LEGACY_ADMIN_PASSWORD = 'secret_token';

    const result = verifyBearerToken('Bearer secret_token');

    expect(result).toBe(true);
  });

  test('returns false for invalid bearer token', () => {
    process.env.LEGACY_ADMIN_PASSWORD = 'secret_token';

    const result = verifyBearerToken('Bearer wrong_token');

    expect(result).toBe(false);
  });

  test('returns false for null auth header', () => {
    const result = verifyBearerToken(null);

    expect(result).toBe(false);
  });

  test('returns false for non-Bearer auth header', () => {
    const result = verifyBearerToken('Basic dXNlcjpwYXNz');

    expect(result).toBe(false);
  });

  test('returns false for malformed Bearer header', () => {
    const result = verifyBearerToken('Bearer');

    expect(result).toBe(false);
  });
});

// =============================================================================
// Cleanup
// =============================================================================

afterAll(() => {
  // Final cleanup
  resetEnv();
  restoreFetch();

  if (existsSync(SESSIONS_DIR)) {
    rmSync(SESSIONS_DIR, { recursive: true, force: true });
  }
});
