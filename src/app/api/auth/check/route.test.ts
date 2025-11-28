/**
 * Tests for auth check API route
 * Issue #19: Update Auth Check API Route
 */

import { describe, test, expect, mock, beforeEach } from 'bun:test';
import type { UserSession } from '@/lib/auth';

// Mock the auth module
const mockGetCurrentUser = mock<() => Promise<UserSession | null>>(() =>
  Promise.resolve(null)
);

mock.module('@/lib/auth', () => ({
  getCurrentUser: mockGetCurrentUser,
}));

// Import after mocking
import { GET } from './route';

describe('Auth Check API Route', () => {
  beforeEach(() => {
    mockGetCurrentUser.mockReset();
  });

  describe('authenticated user', () => {
    test('returns authenticated true with user info', async () => {
      mockGetCurrentUser.mockResolvedValue({
        userId: 123,
        email: 'user@example.com',
        name: 'Test User',
        role: 'admin',
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.authenticated).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe('user@example.com');
      expect(data.user.name).toBe('Test User');
      expect(data.user.role).toBe('admin');
    });

    test('returns employee role correctly', async () => {
      mockGetCurrentUser.mockResolvedValue({
        userId: 456,
        email: 'employee@example.com',
        name: 'Employee User',
        role: 'employee',
      });

      const response = await GET();
      const data = await response.json();

      expect(data.authenticated).toBe(true);
      expect(data.user.role).toBe('employee');
    });

    test('returns limited role correctly', async () => {
      mockGetCurrentUser.mockResolvedValue({
        userId: 789,
        email: 'limited@example.com',
        name: 'Limited User',
        role: 'limited',
      });

      const response = await GET();
      const data = await response.json();

      expect(data.authenticated).toBe(true);
      expect(data.user.role).toBe('limited');
    });

    test('does not expose userId in response', async () => {
      mockGetCurrentUser.mockResolvedValue({
        userId: 123,
        email: 'user@example.com',
        name: 'Test User',
        role: 'admin',
      });

      const response = await GET();
      const data = await response.json();

      // User object should only have email, name, role
      expect(data.user.userId).toBeUndefined();
      expect(Object.keys(data.user)).toEqual(['email', 'name', 'role']);
    });

    test('does not expose sensitive data like API token', async () => {
      mockGetCurrentUser.mockResolvedValue({
        userId: 123,
        email: 'user@example.com',
        name: 'Test User',
        role: 'admin',
        // These would be in the session but should not be exposed
        apiToken: 'secret-token',
        sessionId: 'session-123',
      });

      const response = await GET();
      const data = await response.json();

      // Should not have any sensitive fields
      expect(data.user.apiToken).toBeUndefined();
      expect(data.user.sessionId).toBeUndefined();
      expect(data.apiToken).toBeUndefined();
      expect(data.sessionId).toBeUndefined();
    });
  });

  describe('unauthenticated user', () => {
    test('returns authenticated false when no user', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.authenticated).toBe(false);
      expect(data.user).toBeUndefined();
    });

    test('does not include error field on normal unauthenticated response', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(data.error).toBeUndefined();
    });
  });

  describe('error handling', () => {
    test('returns 500 with authenticated false on error', async () => {
      mockGetCurrentUser.mockRejectedValue(new Error('Session store error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.authenticated).toBe(false);
      expect(data.error).toBe('Auth check failed');
    });

    test('handles unexpected errors gracefully', async () => {
      mockGetCurrentUser.mockRejectedValue('String error');

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.authenticated).toBe(false);
    });
  });
});
