/**
 * Tests for role-based middleware
 * Issue #21: Add Role-Based Middleware
 */

import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { NextRequest } from 'next/server';

// Import the middleware
import { middleware } from './middleware';

// Helper to create mock requests
function createMockRequest(
  pathname: string,
  options: {
    sessionCookie?: string;
    roleCookie?: string;
  } = {}
): NextRequest {
  const url = new URL(pathname, 'http://localhost:3000');
  const request = new NextRequest(url);

  // Mock cookies
  if (options.sessionCookie !== undefined) {
    request.cookies.set('admin_session', options.sessionCookie);
  }
  if (options.roleCookie !== undefined) {
    request.cookies.set('user_role', options.roleCookie);
  }

  return request;
}

describe('Role-Based Middleware', () => {
  describe('unauthenticated access', () => {
    test('redirects to login when no session cookie', () => {
      const request = createMockRequest('/admin');
      const response = middleware(request);

      expect(response.status).toBe(307); // Redirect
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/admin/login'
      );
    });

    test('redirects to login for gallery route without session', () => {
      const request = createMockRequest('/admin/gallery');
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/admin/login'
      );
    });

    test('allows access to login page without session', () => {
      const request = createMockRequest('/admin/login');
      const response = middleware(request);

      expect(response.status).toBe(200);
    });
  });

  describe('authenticated admin role', () => {
    test('admin can access dashboard', () => {
      const request = createMockRequest('/admin', {
        sessionCookie: 'valid-session',
        roleCookie: 'admin',
      });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    test('admin can access gallery', () => {
      const request = createMockRequest('/admin/gallery', {
        sessionCookie: 'valid-session',
        roleCookie: 'admin',
      });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    test('admin can access gallery new', () => {
      const request = createMockRequest('/admin/gallery/new', {
        sessionCookie: 'valid-session',
        roleCookie: 'admin',
      });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    test('admin can access settings', () => {
      const request = createMockRequest('/admin/settings', {
        sessionCookie: 'valid-session',
        roleCookie: 'admin',
      });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });
  });

  describe('authenticated employee role', () => {
    test('employee can access dashboard', () => {
      const request = createMockRequest('/admin', {
        sessionCookie: 'valid-session',
        roleCookie: 'employee',
      });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    test('employee can access gallery', () => {
      const request = createMockRequest('/admin/gallery', {
        sessionCookie: 'valid-session',
        roleCookie: 'employee',
      });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    test('employee can access gallery new', () => {
      const request = createMockRequest('/admin/gallery/new', {
        sessionCookie: 'valid-session',
        roleCookie: 'employee',
      });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    test('employee cannot access settings', () => {
      const request = createMockRequest('/admin/settings', {
        sessionCookie: 'valid-session',
        roleCookie: 'employee',
      });
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/admin');
      expect(response.headers.get('location')).toContain('error=unauthorized');
    });
  });

  describe('authenticated limited role', () => {
    test('limited can access dashboard', () => {
      const request = createMockRequest('/admin', {
        sessionCookie: 'valid-session',
        roleCookie: 'limited',
      });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    test('limited cannot access gallery', () => {
      const request = createMockRequest('/admin/gallery', {
        sessionCookie: 'valid-session',
        roleCookie: 'limited',
      });
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('error=unauthorized');
    });

    test('limited cannot access gallery new', () => {
      const request = createMockRequest('/admin/gallery/new', {
        sessionCookie: 'valid-session',
        roleCookie: 'limited',
      });
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('error=unauthorized');
    });

    test('limited cannot access settings', () => {
      const request = createMockRequest('/admin/settings', {
        sessionCookie: 'valid-session',
        roleCookie: 'limited',
      });
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('error=unauthorized');
    });
  });

  describe('backward compatibility (no role cookie)', () => {
    test('session without role cookie defaults to admin access', () => {
      const request = createMockRequest('/admin/settings', {
        sessionCookie: 'valid-session',
        // No role cookie
      });
      const response = middleware(request);

      // Should be allowed (defaults to admin)
      expect(response.status).toBe(200);
    });

    test('session without role cookie can access all routes', () => {
      const request = createMockRequest('/admin/gallery', {
        sessionCookie: 'valid-session',
      });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });
  });

  describe('invalid role handling', () => {
    test('invalid role cookie defaults to admin', () => {
      const request = createMockRequest('/admin/settings', {
        sessionCookie: 'valid-session',
        roleCookie: 'invalid_role',
      });
      const response = middleware(request);

      // Should be allowed (invalid role defaults to admin)
      expect(response.status).toBe(200);
    });
  });

  describe('login page redirection', () => {
    test('redirects away from login if already authenticated', () => {
      const request = createMockRequest('/admin/login', {
        sessionCookie: 'valid-session',
        roleCookie: 'admin',
      });
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/admin'
      );
    });
  });

  describe('non-admin routes', () => {
    test('allows public routes without authentication', () => {
      const request = createMockRequest('/');
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    test('allows gallery public route', () => {
      const request = createMockRequest('/gallery');
      const response = middleware(request);

      expect(response.status).toBe(200);
    });
  });
});
