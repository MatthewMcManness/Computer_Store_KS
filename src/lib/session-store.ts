import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, readdirSync } from 'fs';
import { join } from 'path';

// Session interface with all required fields
export interface Session {
  id: string;           // UUID
  userId: number;       // RepairShopr user ID
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'limited';
  apiToken: string;     // Encrypted RepairShopr API token
  createdAt: number;    // Unix timestamp
  expiresAt: number;    // Unix timestamp
}

// Stored format includes IV for decryption
interface StoredSession {
  iv: string;           // Hex-encoded IV
  encrypted: string;    // Hex-encoded encrypted data
  authTag: string;      // Hex-encoded auth tag for GCM
}

// Session directory path
const SESSIONS_DIR = join(process.cwd(), '.sessions');

// Session expiry: 8 hours
const SESSION_EXPIRY_MS = 8 * 60 * 60 * 1000;

// Encryption algorithm
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Validate SESSION_SECRET is exactly 32 bytes
 * @throws Error if SESSION_SECRET is missing or invalid
 */
function getSessionSecret(): Buffer {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is required');
  }

  const secretBuffer = Buffer.from(secret, 'utf-8');

  if (secretBuffer.length !== 32) {
    throw new Error(`SESSION_SECRET must be exactly 32 bytes, got ${secretBuffer.length} bytes`);
  }

  return secretBuffer;
}

/**
 * Ensure the sessions directory exists
 */
function ensureSessionsDir(): void {
  if (!existsSync(SESSIONS_DIR)) {
    mkdirSync(SESSIONS_DIR, { recursive: true });
  }
}

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  const bytes = randomBytes(16);
  // Set version to 4 and variant bits
  // TypeScript strict null checks: bytes from randomBytes(16) always has indices 0-15
  const byte6 = bytes[6]!;
  const byte8 = bytes[8]!;
  bytes[6] = (byte6 & 0x0f) | 0x40; // Version 4
  bytes[8] = (byte8 & 0x3f) | 0x80; // Variant

  const hex = bytes.toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}

/**
 * Encrypt session data using AES-256-GCM
 */
function encryptSession(session: Session): StoredSession {
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

  return {
    iv: iv.toString('hex'),
    encrypted: encrypted.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

/**
 * Decrypt session data using AES-256-GCM
 */
function decryptSession(stored: StoredSession): Session {
  const secret = getSessionSecret();
  const iv = Buffer.from(stored.iv, 'hex');
  const encrypted = Buffer.from(stored.encrypted, 'hex');
  const authTag = Buffer.from(stored.authTag, 'hex');

  const decipher = createDecipheriv(ALGORITHM, secret, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString('utf-8'));
}

/**
 * Get session file path
 */
function getSessionPath(sessionId: string): string {
  // Sanitize session ID to prevent path traversal
  const sanitizedId = sessionId.replace(/[^a-zA-Z0-9-]/g, '');
  return join(SESSIONS_DIR, `${sanitizedId}.json`);
}

/**
 * User data for creating a session
 */
export interface CreateSessionData {
  userId: number;
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'limited';
}

/**
 * Create a new session with encrypted API token
 * @param userData User information from RepairShopr
 * @param apiToken The RepairShopr API token (will be encrypted)
 * @returns The session ID
 */
export function createSession(userData: CreateSessionData, apiToken: string): string {
  ensureSessionsDir();

  const now = Date.now();
  const session: Session = {
    id: generateUUID(),
    userId: userData.userId,
    email: userData.email,
    name: userData.name,
    role: userData.role,
    apiToken: apiToken,
    createdAt: now,
    expiresAt: now + SESSION_EXPIRY_MS,
  };

  const encrypted = encryptSession(session);
  const sessionPath = getSessionPath(session.id);

  writeFileSync(sessionPath, JSON.stringify(encrypted, null, 2), 'utf-8');

  return session.id;
}

/**
 * Get a session by ID
 * @param sessionId The session ID
 * @returns The session data or null if not found/expired
 */
export function getSession(sessionId: string): Session | null {
  ensureSessionsDir();

  const sessionPath = getSessionPath(sessionId);

  if (!existsSync(sessionPath)) {
    return null;
  }

  try {
    const stored: StoredSession = JSON.parse(readFileSync(sessionPath, 'utf-8'));
    const session = decryptSession(stored);

    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      // Auto-delete expired session
      deleteSession(sessionId);
      return null;
    }

    return session;
  } catch (error) {
    // If decryption fails or file is corrupted, remove the session
    try {
      unlinkSync(sessionPath);
    } catch {
      // Ignore deletion errors
    }
    return null;
  }
}

/**
 * Delete a session
 * @param sessionId The session ID to delete
 * @returns true if deleted, false if not found
 */
export function deleteSession(sessionId: string): boolean {
  const sessionPath = getSessionPath(sessionId);

  if (!existsSync(sessionPath)) {
    return false;
  }

  try {
    unlinkSync(sessionPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clean up all expired sessions
 * @returns Number of sessions deleted
 */
export function cleanExpiredSessions(): number {
  ensureSessionsDir();

  let deletedCount = 0;

  try {
    const files = readdirSync(SESSIONS_DIR);

    for (const file of files) {
      if (!file.endsWith('.json')) {
        continue;
      }

      const sessionId = file.replace('.json', '');
      const sessionPath = getSessionPath(sessionId);

      try {
        const stored: StoredSession = JSON.parse(readFileSync(sessionPath, 'utf-8'));
        const session = decryptSession(stored);

        if (Date.now() > session.expiresAt) {
          unlinkSync(sessionPath);
          deletedCount++;
        }
      } catch {
        // If we can't read/decrypt, delete the corrupted file
        try {
          unlinkSync(sessionPath);
          deletedCount++;
        } catch {
          // Ignore deletion errors
        }
      }
    }
  } catch {
    // Ignore directory read errors
  }

  return deletedCount;
}

/**
 * Get session without exposing the API token (safe for client responses)
 * @param sessionId The session ID
 * @returns Session data without apiToken, or null if not found
 */
export function getSessionSafe(sessionId: string): Omit<Session, 'apiToken'> | null {
  const session = getSession(sessionId);

  if (!session) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { apiToken, ...safeSession } = session;
  return safeSession;
}
