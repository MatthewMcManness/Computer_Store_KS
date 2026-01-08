/**
 * Cookie-based Session Store
 *
 * Stores encrypted session data directly in cookies.
 * Works on serverless/ephemeral environments like Render.
 *
 * Security:
 * - Session data is encrypted with AES-256-GCM
 * - API tokens are stored encrypted in httpOnly cookies
 * - Each session has a unique IV
 */

import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

// =============================================================================
// Types
// =============================================================================

export interface SessionData {
  userId: number;
  supabaseUserId: string; // Supabase auth.users UUID (for audit logging)
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'limited';
  userType: 'employee' | 'customer'; // Track whether user authenticated via RepairShopr or Supabase
  apiToken: string; // Deprecated: kept for backwards compatibility, use shared API key instead
  createdAt: number;
  expiresAt: number;
}

export interface SafeSessionData {
  userId: number;
  supabaseUserId: string; // Supabase auth.users UUID (for audit logging)
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'limited';
  userType: 'employee' | 'customer';
  createdAt: number;
  expiresAt: number;
}

export interface CreateSessionInput {
  userId: number;
  supabaseUserId: string; // Supabase auth.users UUID (for audit logging)
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'limited';
  userType: 'employee' | 'customer';
}

// =============================================================================
// Constants
// =============================================================================

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 12 bytes for GCM
const AUTH_TAG_LENGTH = 16;
const SESSION_EXPIRY_MS = 8 * 60 * 60 * 1000; // 8 hours

// =============================================================================
// Encryption Helpers
// =============================================================================

/**
 * Get and validate the session secret
 */
function getSessionSecret(): Buffer {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is required');
  }

  // Support hex-encoded secrets (64 chars = 32 bytes)
  if (secret.length === 64 && /^[0-9a-fA-F]+$/.test(secret)) {
    return Buffer.from(secret, 'hex');
  }

  // Support raw 32-byte secrets
  const secretBuffer = Buffer.from(secret, 'utf-8');

  if (secretBuffer.length !== 32) {
    throw new Error(
      `SESSION_SECRET must be exactly 32 bytes (or 64 hex chars), got ${secretBuffer.length} bytes`
    );
  }

  return secretBuffer;
}

/**
 * Encrypt session data to a base64 string
 */
export function encryptSession(session: SessionData): string {
  const secret = getSessionSecret();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, secret, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const sessionJson = JSON.stringify(session);
  const encrypted = Buffer.concat([
    cipher.update(sessionJson, 'utf-8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Combine: IV (12) + AuthTag (16) + Encrypted data
  const combined = Buffer.concat([iv, authTag, encrypted]);

  return combined.toString('base64');
}

/**
 * Decrypt session data from a base64 string
 */
export function decryptSession(encryptedBase64: string): SessionData | null {
  try {
    const secret = getSessionSecret();
    const combined = Buffer.from(encryptedBase64, 'base64');

    if (combined.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
      return null;
    }

    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, secret, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    const session = JSON.parse(decrypted.toString('utf-8')) as SessionData;

    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      return null;
    }

    return session;
  } catch {
    // Decryption failed - invalid or tampered session
    return null;
  }
}

// =============================================================================
// Session Management
// =============================================================================

/**
 * Create session data for encryption
 */
export function createSessionData(
  input: CreateSessionInput,
  apiToken: string = ''
): SessionData {
  const now = Date.now();
  return {
    userId: input.userId,
    supabaseUserId: input.supabaseUserId,
    email: input.email,
    name: input.name,
    role: input.role,
    userType: input.userType,
    apiToken,
    createdAt: now,
    expiresAt: now + SESSION_EXPIRY_MS,
  };
}

/**
 * Get safe session data (without API token)
 */
export function getSafeSession(session: SessionData): SafeSessionData {
  return {
    userId: session.userId,
    supabaseUserId: session.supabaseUserId || '',
    email: session.email,
    name: session.name,
    role: session.role,
    userType: session.userType,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
  };
}

/**
 * Check if a session is expired
 */
export function isSessionExpired(session: SessionData): boolean {
  return Date.now() > session.expiresAt;
}
