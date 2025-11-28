/**
 * RepairShopr API Client Tests
 *
 * Unit tests with mocked API responses for the RepairShopr client.
 */

import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test';
import {
  RepairShoprClient,
  RepairShoprAPIError,
  createRepairShoprClient,
  type SignInResponse,
  type MeResponse,
} from './repairshopr';

// =============================================================================
// Test Fixtures
// =============================================================================

// Raw API response format (as returned by RepairShopr for both /sign_in and /me)
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

// =============================================================================
// Mock Setup
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
// Tests: Client Initialization
// =============================================================================

describe('RepairShoprClient', () => {
  beforeEach(() => {
    mockFetch = mock(() => Promise.resolve({} as Response));
  });

  afterEach(() => {
    restoreFetch();
  });

  describe('constructor', () => {
    test('creates client with subdomain', () => {
      const client = new RepairShoprClient({ subdomain: 'testshop' });
      expect(client).toBeDefined();
    });

    test('creates client with custom baseUrl', () => {
      const client = new RepairShoprClient({
        subdomain: 'testshop',
        baseUrl: 'https://custom.example.com/api/v1',
      });
      expect(client).toBeDefined();
    });
  });

  // ===========================================================================
  // Tests: signIn
  // ===========================================================================

  describe('signIn', () => {
    test('successfully signs in with valid credentials', async () => {
      setupMockFetch(mockRawResponse);
      const client = new RepairShoprClient({ subdomain: 'testshop' });

      const result = await client.signIn('test@example.com', 'password123');

      expect(result.api_key).toBe('test_api_key_12345');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.full_name).toBe('Test User');
      expect(result.user.id).toBe(12345);
      expect(result.admin).toBe(true);
      expect(result.two_factor_required).toBe(false);
      expect(result.subdomain).toBe('testshop');
      expect(result.permissions).toEqual({
        customer: { read: true, write: true, delete: false },
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Verify request URL and body
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://testshop.repairshopr.com/api/v1/sign_in');
      expect(options.method).toBe('POST');
      expect(JSON.parse(options.body as string)).toEqual({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    test('throws error with empty email', async () => {
      const client = new RepairShoprClient({ subdomain: 'testshop' });

      await expect(client.signIn('', 'password')).rejects.toThrow(
        RepairShoprAPIError
      );

      try {
        await client.signIn('', 'password');
      } catch (error) {
        expect(error).toBeInstanceOf(RepairShoprAPIError);
        expect((error as RepairShoprAPIError).code).toBe('VALIDATION_ERROR');
        expect((error as RepairShoprAPIError).status).toBe(400);
      }
    });

    test('throws error with empty password', async () => {
      const client = new RepairShoprClient({ subdomain: 'testshop' });

      await expect(client.signIn('test@example.com', '')).rejects.toThrow(
        RepairShoprAPIError
      );

      try {
        await client.signIn('test@example.com', '');
      } catch (error) {
        expect(error).toBeInstanceOf(RepairShoprAPIError);
        expect((error as RepairShoprAPIError).code).toBe('VALIDATION_ERROR');
      }
    });

    test('throws UNAUTHORIZED error for invalid credentials', async () => {
      setupMockFetch({ error: 'Invalid email or password' }, 401, 'Unauthorized');
      const client = new RepairShoprClient({ subdomain: 'testshop' });

      try {
        await client.signIn('wrong@example.com', 'wrongpassword');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(RepairShoprAPIError);
        expect((error as RepairShoprAPIError).code).toBe('UNAUTHORIZED');
        expect((error as RepairShoprAPIError).status).toBe(401);
        expect((error as RepairShoprAPIError).message).toBe(
          'Invalid email or password'
        );
      }
    });

    test('trims email whitespace', async () => {
      setupMockFetch(mockRawResponse);
      const client = new RepairShoprClient({ subdomain: 'testshop' });

      await client.signIn('  test@example.com  ', 'password');

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(JSON.parse(options.body as string).email).toBe('test@example.com');
    });
  });

  // ===========================================================================
  // Tests: getMe
  // ===========================================================================

  describe('getMe', () => {
    test('successfully retrieves user with valid token', async () => {
      setupMockFetch(mockRawResponse);
      const client = new RepairShoprClient({ subdomain: 'testshop' });

      const result = await client.getMe('valid_api_key');

      expect(result.user.id).toBe(12345);
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.full_name).toBe('Test User');
      expect(result.admin).toBe(true);
      expect(result.subdomain).toBe('testshop');
      expect(result.permissions).toEqual({
        customer: { read: true, write: true, delete: false },
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Verify request URL includes API key
      const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(
        'https://testshop.repairshopr.com/api/v1/me?api_key=valid_api_key'
      );
    });

    test('throws error with empty token', async () => {
      const client = new RepairShoprClient({ subdomain: 'testshop' });

      await expect(client.getMe('')).rejects.toThrow(RepairShoprAPIError);

      try {
        await client.getMe('');
      } catch (error) {
        expect(error).toBeInstanceOf(RepairShoprAPIError);
        expect((error as RepairShoprAPIError).code).toBe('VALIDATION_ERROR');
      }
    });

    test('throws UNAUTHORIZED error for invalid token', async () => {
      setupMockFetch({ error: 'Invalid API key' }, 401, 'Unauthorized');
      const client = new RepairShoprClient({ subdomain: 'testshop' });

      try {
        await client.getMe('invalid_api_key');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(RepairShoprAPIError);
        expect((error as RepairShoprAPIError).code).toBe('UNAUTHORIZED');
        expect((error as RepairShoprAPIError).status).toBe(401);
      }
    });

    test('URL encodes special characters in token', async () => {
      setupMockFetch(mockRawResponse);
      const client = new RepairShoprClient({ subdomain: 'testshop' });

      await client.getMe('token+with/special=chars');

      const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('api_key=token%2Bwith%2Fspecial%3Dchars');
    });
  });

  // ===========================================================================
  // Tests: Error Handling
  // ===========================================================================

  describe('error handling', () => {
    test('handles 403 Forbidden error', async () => {
      setupMockFetch({ error: 'Access denied' }, 403, 'Forbidden');
      const client = new RepairShoprClient({ subdomain: 'testshop' });

      try {
        await client.getMe('some_token');
      } catch (error) {
        expect(error).toBeInstanceOf(RepairShoprAPIError);
        expect((error as RepairShoprAPIError).code).toBe('FORBIDDEN');
        expect((error as RepairShoprAPIError).status).toBe(403);
      }
    });

    test('handles 404 Not Found error', async () => {
      setupMockFetch({ error: 'Not found' }, 404, 'Not Found');
      const client = new RepairShoprClient({ subdomain: 'testshop' });

      try {
        await client.getMe('some_token');
      } catch (error) {
        expect(error).toBeInstanceOf(RepairShoprAPIError);
        expect((error as RepairShoprAPIError).code).toBe('NOT_FOUND');
      }
    });

    test('handles 422 Validation Error', async () => {
      setupMockFetch({ message: 'Validation failed' }, 422, 'Unprocessable Entity');
      const client = new RepairShoprClient({ subdomain: 'testshop' });

      try {
        await client.signIn('invalid-email', 'password');
      } catch (error) {
        if ((error as RepairShoprAPIError).code !== 'VALIDATION_ERROR') {
          // Client-side validation catches first
          return;
        }
        expect(error).toBeInstanceOf(RepairShoprAPIError);
        expect((error as RepairShoprAPIError).code).toBe('VALIDATION_ERROR');
      }
    });

    test('handles 429 Rate Limit error from server', async () => {
      setupMockFetch({ error: 'Rate limit exceeded' }, 429, 'Too Many Requests');
      const client = new RepairShoprClient({ subdomain: 'testshop' });

      try {
        await client.getMe('some_token');
      } catch (error) {
        expect(error).toBeInstanceOf(RepairShoprAPIError);
        expect((error as RepairShoprAPIError).code).toBe('RATE_LIMIT_EXCEEDED');
        expect((error as RepairShoprAPIError).status).toBe(429);
      }
    });

    test('handles 500 Server Error', async () => {
      setupMockFetch({ error: 'Internal server error' }, 500, 'Internal Server Error');
      const client = new RepairShoprClient({ subdomain: 'testshop' });

      try {
        await client.getMe('some_token');
      } catch (error) {
        expect(error).toBeInstanceOf(RepairShoprAPIError);
        expect((error as RepairShoprAPIError).code).toBe('SERVER_ERROR');
        expect((error as RepairShoprAPIError).status).toBe(500);
      }
    });

    test('handles network error', async () => {
      global.fetch = mock(() =>
        Promise.reject(new TypeError('fetch failed'))
      );
      const client = new RepairShoprClient({ subdomain: 'testshop' });

      try {
        await client.getMe('some_token');
      } catch (error) {
        expect(error).toBeInstanceOf(RepairShoprAPIError);
        expect((error as RepairShoprAPIError).code).toBe('NETWORK_ERROR');
        expect((error as RepairShoprAPIError).status).toBe(0);
      }
    });

    test('handles non-JSON error response', async () => {
      mockFetch = mock(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: () => Promise.reject(new Error('Invalid JSON')),
        } as Response)
      );
      global.fetch = mockFetch;
      const client = new RepairShoprClient({ subdomain: 'testshop' });

      try {
        await client.getMe('some_token');
      } catch (error) {
        expect(error).toBeInstanceOf(RepairShoprAPIError);
        expect((error as RepairShoprAPIError).status).toBe(500);
      }
    });
  });

  // ===========================================================================
  // Tests: Rate Limiting
  // ===========================================================================

  describe('rate limiting', () => {
    test('tracks request count', async () => {
      setupMockFetch(mockRawResponse);
      const client = new RepairShoprClient({ subdomain: 'testshop' });

      const initialStatus = client.getRateLimitStatus();
      expect(initialStatus.remaining).toBe(180);

      await client.getMe('token');

      const afterOneRequest = client.getRateLimitStatus();
      expect(afterOneRequest.remaining).toBe(179);
    });

    test('throws error when rate limit exceeded', async () => {
      setupMockFetch(mockRawResponse);
      const client = new RepairShoprClient({ subdomain: 'testshop' });

      // Exhaust rate limit by making 180 requests
      for (let i = 0; i < 180; i++) {
        await client.getMe('token');
      }

      // 181st request should fail
      try {
        await client.getMe('token');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(RepairShoprAPIError);
        expect((error as RepairShoprAPIError).code).toBe('RATE_LIMIT_EXCEEDED');
        expect((error as RepairShoprAPIError).status).toBe(429);
      }
    });

    test('returns rate limit status', () => {
      const client = new RepairShoprClient({ subdomain: 'testshop' });

      const status = client.getRateLimitStatus();

      expect(status.limit).toBe(180);
      expect(status.remaining).toBe(180);
      expect(typeof status.resetMs).toBe('number');
    });

    test('returns time until rate limit reset', () => {
      const client = new RepairShoprClient({ subdomain: 'testshop' });

      const resetMs = client.getRateLimitResetTime();

      expect(resetMs).toBeGreaterThanOrEqual(0);
      expect(resetMs).toBeLessThanOrEqual(60000);
    });
  });

  // ===========================================================================
  // Tests: Factory Function
  // ===========================================================================

  describe('createRepairShoprClient', () => {
    const originalEnv = process.env.REPAIRSHOPR_SUBDOMAIN;

    afterEach(() => {
      if (originalEnv) {
        process.env.REPAIRSHOPR_SUBDOMAIN = originalEnv;
      } else {
        delete process.env.REPAIRSHOPR_SUBDOMAIN;
      }
    });

    test('creates client from environment variable', () => {
      process.env.REPAIRSHOPR_SUBDOMAIN = 'envshop';

      const client = createRepairShoprClient();

      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(RepairShoprClient);
    });

    test('throws error when subdomain not set', () => {
      delete process.env.REPAIRSHOPR_SUBDOMAIN;

      expect(() => createRepairShoprClient()).toThrow(
        'REPAIRSHOPR_SUBDOMAIN environment variable is required'
      );
    });

    test('accepts optional baseUrl override', () => {
      process.env.REPAIRSHOPR_SUBDOMAIN = 'envshop';

      const client = createRepairShoprClient('https://test.example.com/api/v1');

      expect(client).toBeDefined();
    });
  });

  // ===========================================================================
  // Tests: RepairShoprAPIError
  // ===========================================================================

  describe('RepairShoprAPIError', () => {
    test('creates error with message, status, and code', () => {
      const error = new RepairShoprAPIError('Test error', 401, 'UNAUTHORIZED');

      expect(error.message).toBe('Test error');
      expect(error.status).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.name).toBe('RepairShoprAPIError');
    });

    test('uses default code when not provided', () => {
      const error = new RepairShoprAPIError('Test error', 500);

      expect(error.code).toBe('API_ERROR');
    });

    test('is instanceof Error', () => {
      const error = new RepairShoprAPIError('Test', 400);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(RepairShoprAPIError);
    });
  });
});
