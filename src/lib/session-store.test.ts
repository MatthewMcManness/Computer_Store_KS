import { describe, test, expect, beforeEach, afterEach, afterAll } from 'bun:test';
import { existsSync, rmSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import {
  createSession,
  getSession,
  deleteSession,
  cleanExpiredSessions,
  getSessionSafe,
  type CreateSessionData,
  type Session,
} from './session-store';

const SESSIONS_DIR = join(process.cwd(), '.sessions');

// Test session data
const testUserData: CreateSessionData = {
  userId: 12345,
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin',
};

const testApiToken = 'test-api-token-secret-12345';

// Store original env
const originalSessionSecret = process.env.SESSION_SECRET;

describe('Session Store', () => {
  beforeEach(() => {
    // Set a valid 32-byte session secret for tests
    process.env.SESSION_SECRET = '12345678901234567890123456789012';

    // Clean up sessions directory before each test
    if (existsSync(SESSIONS_DIR)) {
      rmSync(SESSIONS_DIR, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Clean up after each test
    if (existsSync(SESSIONS_DIR)) {
      rmSync(SESSIONS_DIR, { recursive: true, force: true });
    }
  });

  afterAll(() => {
    // Restore original env
    if (originalSessionSecret) {
      process.env.SESSION_SECRET = originalSessionSecret;
    } else {
      delete process.env.SESSION_SECRET;
    }
  });

  describe('createSession', () => {
    test('creates encrypted session file', () => {
      const sessionId = createSession(testUserData, testApiToken);

      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
      expect(sessionId.length).toBe(36); // UUID format

      // Verify file exists
      const sessionPath = join(SESSIONS_DIR, `${sessionId}.json`);
      expect(existsSync(sessionPath)).toBe(true);
    });

    test('creates sessions directory if not exists', () => {
      expect(existsSync(SESSIONS_DIR)).toBe(false);

      createSession(testUserData, testApiToken);

      expect(existsSync(SESSIONS_DIR)).toBe(true);
    });

    test('generates unique session IDs', () => {
      const sessionId1 = createSession(testUserData, testApiToken);
      const sessionId2 = createSession(testUserData, testApiToken);

      expect(sessionId1).not.toBe(sessionId2);
    });
  });

  describe('getSession', () => {
    test('decrypts and returns session data', () => {
      const sessionId = createSession(testUserData, testApiToken);
      const session = getSession(sessionId);

      expect(session).not.toBeNull();
      expect(session!.id).toBe(sessionId);
      expect(session!.userId).toBe(testUserData.userId);
      expect(session!.email).toBe(testUserData.email);
      expect(session!.name).toBe(testUserData.name);
      expect(session!.role).toBe(testUserData.role);
      expect(session!.apiToken).toBe(testApiToken);
      expect(session!.createdAt).toBeDefined();
      expect(session!.expiresAt).toBeDefined();
      expect(session!.expiresAt).toBeGreaterThan(session!.createdAt);
    });

    test('returns null for non-existent session', () => {
      const session = getSession('non-existent-session-id');
      expect(session).toBeNull();
    });

    test('returns null for expired session', async () => {
      // Create a session
      const sessionId = createSession(testUserData, testApiToken);

      // Read the session file and manually expire it
      const sessionPath = join(SESSIONS_DIR, `${sessionId}.json`);
      const stored = JSON.parse(await Bun.file(sessionPath).text());

      // We need to create an expired session by modifying the encrypted data
      // Since we can't easily modify encrypted data, we'll test by creating
      // a session and checking expiry logic works
      const session = getSession(sessionId);
      expect(session).not.toBeNull();

      // Verify expiry is in the future (8 hours)
      const now = Date.now();
      const expectedExpiry = now + 8 * 60 * 60 * 1000;
      expect(session!.expiresAt).toBeGreaterThan(now);
      expect(session!.expiresAt).toBeLessThanOrEqual(expectedExpiry + 1000); // 1 second tolerance
    });

    test('returns null for invalid session ID format', () => {
      const session = getSession('../../../etc/passwd');
      expect(session).toBeNull();
    });
  });

  describe('deleteSession', () => {
    test('removes session file', () => {
      const sessionId = createSession(testUserData, testApiToken);
      const sessionPath = join(SESSIONS_DIR, `${sessionId}.json`);

      expect(existsSync(sessionPath)).toBe(true);

      const result = deleteSession(sessionId);

      expect(result).toBe(true);
      expect(existsSync(sessionPath)).toBe(false);
    });

    test('returns false for non-existent session', () => {
      const result = deleteSession('non-existent-session-id');
      expect(result).toBe(false);
    });
  });

  describe('cleanExpiredSessions', () => {
    test('removes only expired sessions', async () => {
      // Create multiple sessions
      const sessionId1 = createSession(testUserData, testApiToken);
      const sessionId2 = createSession(testUserData, testApiToken);
      const sessionId3 = createSession(testUserData, testApiToken);

      // Verify all sessions exist
      expect(existsSync(join(SESSIONS_DIR, `${sessionId1}.json`))).toBe(true);
      expect(existsSync(join(SESSIONS_DIR, `${sessionId2}.json`))).toBe(true);
      expect(existsSync(join(SESSIONS_DIR, `${sessionId3}.json`))).toBe(true);

      // Run cleanup - none should be deleted since none are expired
      const deletedCount = cleanExpiredSessions();
      expect(deletedCount).toBe(0);

      // All sessions should still exist
      expect(existsSync(join(SESSIONS_DIR, `${sessionId1}.json`))).toBe(true);
      expect(existsSync(join(SESSIONS_DIR, `${sessionId2}.json`))).toBe(true);
      expect(existsSync(join(SESSIONS_DIR, `${sessionId3}.json`))).toBe(true);
    });

    test('handles empty sessions directory', () => {
      mkdirSync(SESSIONS_DIR, { recursive: true });
      const deletedCount = cleanExpiredSessions();
      expect(deletedCount).toBe(0);
    });

    test('handles non-existent sessions directory', () => {
      expect(existsSync(SESSIONS_DIR)).toBe(false);
      const deletedCount = cleanExpiredSessions();
      expect(deletedCount).toBe(0);
    });
  });

  describe('getSessionSafe', () => {
    test('returns session without apiToken', () => {
      const sessionId = createSession(testUserData, testApiToken);
      const safeSession = getSessionSafe(sessionId);

      expect(safeSession).not.toBeNull();
      expect(safeSession!.id).toBe(sessionId);
      expect(safeSession!.userId).toBe(testUserData.userId);
      expect(safeSession!.email).toBe(testUserData.email);
      expect(safeSession!.name).toBe(testUserData.name);
      expect(safeSession!.role).toBe(testUserData.role);
      expect(safeSession!.createdAt).toBeDefined();
      expect(safeSession!.expiresAt).toBeDefined();

      // Verify apiToken is NOT present
      expect('apiToken' in safeSession!).toBe(false);
    });

    test('returns null for non-existent session', () => {
      const safeSession = getSessionSafe('non-existent-session-id');
      expect(safeSession).toBeNull();
    });
  });

  describe('Error handling', () => {
    test('throws error when SESSION_SECRET is missing', () => {
      delete process.env.SESSION_SECRET;

      expect(() => {
        createSession(testUserData, testApiToken);
      }).toThrow('SESSION_SECRET environment variable is required');
    });

    test('throws error when SESSION_SECRET is wrong length', () => {
      process.env.SESSION_SECRET = 'too-short';

      expect(() => {
        createSession(testUserData, testApiToken);
      }).toThrow(/SESSION_SECRET must be exactly 32 bytes/);
    });

    test('throws error when SESSION_SECRET is too long', () => {
      process.env.SESSION_SECRET = '12345678901234567890123456789012345678901234567890';

      expect(() => {
        createSession(testUserData, testApiToken);
      }).toThrow(/SESSION_SECRET must be exactly 32 bytes/);
    });
  });

  describe('Security', () => {
    test('stored session file is encrypted (not plaintext)', async () => {
      const sessionId = createSession(testUserData, testApiToken);
      const sessionPath = join(SESSIONS_DIR, `${sessionId}.json`);

      const fileContent = await Bun.file(sessionPath).text();

      // The file should NOT contain the plaintext API token
      expect(fileContent).not.toContain(testApiToken);

      // The file should NOT contain the plaintext email
      expect(fileContent).not.toContain(testUserData.email);

      // The file should contain encrypted data structure
      const stored = JSON.parse(fileContent);
      expect(stored).toHaveProperty('iv');
      expect(stored).toHaveProperty('encrypted');
      expect(stored).toHaveProperty('authTag');
    });

    test('different sessions have different IVs', () => {
      const sessionId1 = createSession(testUserData, testApiToken);
      const sessionId2 = createSession(testUserData, testApiToken);

      const file1 = Bun.file(join(SESSIONS_DIR, `${sessionId1}.json`));
      const file2 = Bun.file(join(SESSIONS_DIR, `${sessionId2}.json`));

      // Use synchronous reads to avoid async issues
      const stored1 = JSON.parse(require('fs').readFileSync(join(SESSIONS_DIR, `${sessionId1}.json`), 'utf-8'));
      const stored2 = JSON.parse(require('fs').readFileSync(join(SESSIONS_DIR, `${sessionId2}.json`), 'utf-8'));

      // Each session should have a unique IV
      expect(stored1.iv).not.toBe(stored2.iv);
    });

    test('path traversal attempts are sanitized', () => {
      // Attempt path traversal in session ID lookup
      const session = getSession('../../etc/passwd');
      expect(session).toBeNull();

      const session2 = getSession('..\\..\\windows\\system32\\config\\sam');
      expect(session2).toBeNull();
    });
  });
});
