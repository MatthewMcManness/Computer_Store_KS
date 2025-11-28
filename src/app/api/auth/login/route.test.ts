/**
 * Login API Route Tests
 *
 * Unit tests for the login API endpoint with dual-mode authentication.
 * Tests cover RepairShopr mode, legacy mode, rate limiting, and error handling.
 */

import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test';
import { NextRequest } from 'next/server';

// =============================================================================
// Mock Setup
// =============================================================================

// Mock auth functions
const mockGetAuthMode = mock(() => 'repairshopr' as 'repairshopr' | 'legacy');
const mockAuthenticateWithRepairShopr = mock(() =>
  Promise.resolve({
    success: true,
    user: {
      userId: 12345,
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin' as const,
    },
  })
);
const mockVerifyPassword = mock(() => true);
const mockCreateSession = mock(() => Promise.resolve('session_token_123'));

// Mock the auth module before importing the route
mock.module('@/lib/auth', () => ({
  getAuthMode: mockGetAuthMode,
  authenticateWithRepairShopr: mockAuthenticateWithRepairShopr,
  verifyPassword: mockVerifyPassword,
  createSession: mockCreateSession,
}));

// Import route after mocking
import { POST } from './route';

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Create a mock NextRequest with the given body and headers
 */
function createMockRequest(
  body: unknown,
  headers: Record<string, string> = {}
): NextRequest {
  const jsonBody = JSON.stringify(body);
  const request = new NextRequest('http://localhost/api/auth/login', {
    method: 'POST',
    body: jsonBody,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
  return request;
}

/**
 * Create a request with a specific IP address
 */
function createMockRequestWithIP(
  body: unknown,
  ip: string
): NextRequest {
  return createMockRequest(body, { 'x-forwarded-for': ip });
}

/**
 * Reset all mocks to their default state
 */
function resetMocks() {
  mockGetAuthMode.mockReset();
  mockAuthenticateWithRepairShopr.mockReset();
  mockVerifyPassword.mockReset();
  mockCreateSession.mockReset();

  // Set default successful returns
  mockGetAuthMode.mockReturnValue('repairshopr');
  mockAuthenticateWithRepairShopr.mockResolvedValue({
    success: true,
    user: {
      userId: 12345,
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin',
    },
  });
  mockVerifyPassword.mockReturnValue(true);
  mockCreateSession.mockResolvedValue('session_token_123');
}

// =============================================================================
// Tests: RepairShopr Mode - Successful Login
// =============================================================================

describe('POST /api/auth/login - RepairShopr Mode', () => {
  beforeEach(() => {
    resetMocks();
    mockGetAuthMode.mockReturnValue('repairshopr');
  });

  test('successful login returns user info', async () => {
    const request = createMockRequestWithIP(
      { email: 'test@example.com', password: 'password123' },
      '192.168.1.100'
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe('test@example.com');
    expect(data.user.name).toBe('Test User');
    expect(data.user.role).toBe('admin');
  });

  test('calls authenticateWithRepairShopr with email and password', async () => {
    const request = createMockRequestWithIP(
      { email: 'user@test.com', password: 'secret123' },
      '192.168.1.101'
    );

    await POST(request);

    expect(mockAuthenticateWithRepairShopr).toHaveBeenCalledWith(
      'user@test.com',
      'secret123'
    );
  });

  test('missing email returns 400', async () => {
    const request = createMockRequestWithIP(
      { password: 'password123' },
      '192.168.1.102'
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Email is required');
  });

  test('missing password returns 400', async () => {
    const request = createMockRequestWithIP(
      { email: 'test@example.com' },
      '192.168.1.103'
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Password is required');
  });
});

// =============================================================================
// Tests: RepairShopr Mode - Invalid Credentials
// =============================================================================

describe('POST /api/auth/login - Invalid Credentials', () => {
  beforeEach(() => {
    resetMocks();
    mockGetAuthMode.mockReturnValue('repairshopr');
  });

  test('invalid credentials returns 401 with INVALID_CREDENTIALS code', async () => {
    mockAuthenticateWithRepairShopr.mockResolvedValue({
      success: false,
      error: 'Invalid email or password',
    });

    const request = createMockRequestWithIP(
      { email: 'wrong@example.com', password: 'wrongpassword' },
      '192.168.1.104'
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid email or password');
    expect(data.code).toBe('INVALID_CREDENTIALS');
  });
});

// =============================================================================
// Tests: RepairShopr Mode - Service Unavailable
// =============================================================================

describe('POST /api/auth/login - Service Unavailable', () => {
  beforeEach(() => {
    resetMocks();
    mockGetAuthMode.mockReturnValue('repairshopr');
  });

  test('network error returns 503 with SERVICE_UNAVAILABLE code', async () => {
    mockAuthenticateWithRepairShopr.mockResolvedValue({
      success: false,
      error: 'Unable to connect to authentication service. Please try again.',
    });

    const request = createMockRequestWithIP(
      { email: 'test@example.com', password: 'password123' },
      '192.168.1.105'
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.success).toBe(false);
    expect(data.code).toBe('SERVICE_UNAVAILABLE');
  });

  test('service not configured returns 503', async () => {
    mockAuthenticateWithRepairShopr.mockResolvedValue({
      success: false,
      error: 'Authentication service is not configured. Please contact support.',
    });

    const request = createMockRequestWithIP(
      { email: 'test@example.com', password: 'password123' },
      '192.168.1.106'
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.code).toBe('SERVICE_UNAVAILABLE');
  });
});

// =============================================================================
// Tests: Legacy Mode
// =============================================================================

describe('POST /api/auth/login - Legacy Mode', () => {
  beforeEach(() => {
    resetMocks();
    mockGetAuthMode.mockReturnValue('legacy');
  });

  test('successful login with correct password', async () => {
    mockVerifyPassword.mockReturnValue(true);

    const request = createMockRequestWithIP(
      { password: 'correct_password' },
      '192.168.1.107'
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Authentication successful');
  });

  test('calls verifyPassword with password', async () => {
    const request = createMockRequestWithIP(
      { password: 'test_password' },
      '192.168.1.108'
    );

    await POST(request);

    expect(mockVerifyPassword).toHaveBeenCalledWith('test_password');
  });

  test('calls createSession on success', async () => {
    mockVerifyPassword.mockReturnValue(true);

    const request = createMockRequestWithIP(
      { password: 'correct_password' },
      '192.168.1.109'
    );

    await POST(request);

    expect(mockCreateSession).toHaveBeenCalled();
  });

  test('invalid password returns 401 with INVALID_CREDENTIALS code', async () => {
    mockVerifyPassword.mockReturnValue(false);

    const request = createMockRequestWithIP(
      { password: 'wrong_password' },
      '192.168.1.110'
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid password');
    expect(data.code).toBe('INVALID_CREDENTIALS');
  });

  test('email is optional in legacy mode', async () => {
    mockVerifyPassword.mockReturnValue(true);

    const request = createMockRequestWithIP(
      { password: 'correct_password' },
      '192.168.1.111'
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});

// =============================================================================
// Tests: Rate Limiting
// =============================================================================

describe('POST /api/auth/login - Rate Limiting', () => {
  beforeEach(() => {
    resetMocks();
    mockGetAuthMode.mockReturnValue('repairshopr');
    mockAuthenticateWithRepairShopr.mockResolvedValue({
      success: false,
      error: 'Invalid email or password',
    });
  });

  test('returns 429 after 5 failed attempts from same IP', async () => {
    const testIP = `rate-limit-test-${Date.now()}`;

    // Make 5 login attempts (uses up the rate limit)
    for (let i = 0; i < 5; i++) {
      const request = createMockRequestWithIP(
        { email: 'test@example.com', password: 'wrong' },
        testIP
      );
      await POST(request);
    }

    // 6th attempt should be rate limited
    const request = createMockRequestWithIP(
      { email: 'test@example.com', password: 'wrong' },
      testIP
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.success).toBe(false);
    expect(data.code).toBe('RATE_LIMITED');
    expect(data.error).toContain('Too many login attempts');
  });

  test('rate limit includes Retry-After header', async () => {
    const testIP = `retry-after-test-${Date.now()}`;

    // Exhaust rate limit
    for (let i = 0; i < 5; i++) {
      const request = createMockRequestWithIP(
        { email: 'test@example.com', password: 'wrong' },
        testIP
      );
      await POST(request);
    }

    // Next attempt should have Retry-After header
    const request = createMockRequestWithIP(
      { email: 'test@example.com', password: 'wrong' },
      testIP
    );

    const response = await POST(request);

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBeDefined();
    expect(Number(response.headers.get('Retry-After'))).toBeGreaterThan(0);
  });

  test('different IPs have separate rate limits', async () => {
    const ip1 = `rate-limit-ip1-${Date.now()}`;
    const ip2 = `rate-limit-ip2-${Date.now()}`;

    // Exhaust rate limit for IP 1
    for (let i = 0; i < 5; i++) {
      const request = createMockRequestWithIP(
        { email: 'test@example.com', password: 'wrong' },
        ip1
      );
      await POST(request);
    }

    // IP 1 should be rate limited
    const requestIP1 = createMockRequestWithIP(
      { email: 'test@example.com', password: 'wrong' },
      ip1
    );
    const responseIP1 = await POST(requestIP1);
    expect(responseIP1.status).toBe(429);

    // IP 2 should still work
    mockAuthenticateWithRepairShopr.mockResolvedValue({
      success: true,
      user: {
        userId: 12345,
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
      },
    });

    const requestIP2 = createMockRequestWithIP(
      { email: 'test@example.com', password: 'correct' },
      ip2
    );
    const responseIP2 = await POST(requestIP2);
    expect(responseIP2.status).toBe(200);
  });
});

// =============================================================================
// Tests: Request Body Parsing Errors
// =============================================================================

describe('POST /api/auth/login - Request Parsing', () => {
  beforeEach(() => {
    resetMocks();
  });

  test('invalid JSON returns 400', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: 'not valid json{',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.1.120',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid request body');
  });

  test('empty body returns 400', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: '',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.1.121',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});

// =============================================================================
// Tests: IP Extraction
// =============================================================================

describe('POST /api/auth/login - IP Extraction', () => {
  beforeEach(() => {
    resetMocks();
    mockGetAuthMode.mockReturnValue('repairshopr');
  });

  test('extracts IP from x-forwarded-for header', async () => {
    const request = createMockRequest(
      { email: 'test@example.com', password: 'password123' },
      { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }
    );

    const response = await POST(request);

    // Request should succeed, IP extracted correctly
    expect(response.status).toBe(200);
  });

  test('extracts IP from x-real-ip header', async () => {
    const request = createMockRequest(
      { email: 'test@example.com', password: 'password123' },
      { 'x-real-ip': '10.0.0.1' }
    );

    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  test('uses unknown for requests without IP headers', async () => {
    const request = createMockRequest(
      { email: 'test@example.com', password: 'password123' },
      {}
    );

    const response = await POST(request);

    // Should still work, just uses 'unknown' as IP
    expect(response.status).toBe(200);
  });
});

// =============================================================================
// Tests: Response Does Not Contain Sensitive Data
// =============================================================================

describe('POST /api/auth/login - Security', () => {
  beforeEach(() => {
    resetMocks();
    mockGetAuthMode.mockReturnValue('repairshopr');
  });

  test('successful response does not contain userId', async () => {
    const request = createMockRequestWithIP(
      { email: 'test@example.com', password: 'password123' },
      '192.168.1.130'
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe('test@example.com');
    expect(data.user.name).toBe('Test User');
    expect(data.user.role).toBe('admin');
    // Verify userId is NOT in the response
    expect(data.user.userId).toBeUndefined();
  });

  test('error responses do not leak internal errors', async () => {
    mockAuthenticateWithRepairShopr.mockRejectedValue(
      new Error('Internal database connection failed')
    );

    const request = createMockRequestWithIP(
      { email: 'test@example.com', password: 'password123' },
      '192.168.1.131'
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Login failed');
    // Should NOT contain internal error message
    expect(data.error).not.toContain('database');
  });
});
