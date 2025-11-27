import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_MAX_AGE = 8 * 60 * 60; // 8 hours in seconds

// Simple session token (in production, use JWT or proper session management)
function generateSessionToken(): string {
  return Buffer.from(`${Date.now()}-${Math.random().toString(36)}`).toString('base64');
}

// Verify password
export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

// Create session
export async function createSession(): Promise<string> {
  const token = generateSessionToken();
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  return token;
}

// Destroy session
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Check if user is authenticated (for server components)
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  return !!session?.value;
}

// Get session token (for API routes)
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  return session?.value || null;
}

// Middleware helper to check auth from request
export function checkAuthFromRequest(request: NextRequest): boolean {
  const session = request.cookies.get(SESSION_COOKIE_NAME);
  return !!session?.value;
}

// Verify Bearer token (for API routes that use Authorization header)
export function verifyBearerToken(authHeader: string | null): boolean {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7);
  return token === ADMIN_PASSWORD;
}
