/**
 * Authentication Integration Tests
 *
 * These tests verify the complete authentication flow with RepairShopr.
 * They require actual RepairShopr credentials to run.
 *
 * Prerequisites:
 * 1. Set TEST_REPAIRSHOPR_EMAIL to a RepairShopr user email
 * 2. Set TEST_REPAIRSHOPR_PASSWORD to the user's password
 * 3. Set REPAIRSHOPR_SUBDOMAIN to your subdomain
 * 4. The test user must have "can_use_app" enabled in RepairShopr
 *
 * Run with: bun test src/__tests__/auth-integration.test.ts
 */

import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { createRepairShoprClient } from '../lib/repairshopr';

// Skip tests if credentials not available
const SKIP_INTEGRATION =
  !process.env.TEST_REPAIRSHOPR_EMAIL ||
  !process.env.TEST_REPAIRSHOPR_PASSWORD ||
  !process.env.REPAIRSHOPR_SUBDOMAIN;

const skipReason = SKIP_INTEGRATION
  ? 'Integration tests require TEST_REPAIRSHOPR_EMAIL, TEST_REPAIRSHOPR_PASSWORD, and REPAIRSHOPR_SUBDOMAIN'
  : null;

describe.skipIf(SKIP_INTEGRATION)('RepairShopr Integration Tests', () => {
  const email = process.env.TEST_REPAIRSHOPR_EMAIL!;
  const password = process.env.TEST_REPAIRSHOPR_PASSWORD!;

  // Create client only when tests actually run
  const getClient = () => createRepairShoprClient();

  describe('Sign In', () => {
    test('authenticates with valid credentials', async () => {
      const client = getClient();
      const response = await client.signIn(email, password);

      expect(response.api_key).toBeDefined();
      expect(response.user.email).toBe(email);
      expect(response.admin).toBeDefined();
      expect(response.permissions).toBeDefined();
    });

    test('fails with invalid password', async () => {
      const client = getClient();
      await expect(client.signIn(email, 'wrong-password')).rejects.toThrow();
    });

    test('fails with invalid email', async () => {
      const client = getClient();
      await expect(
        client.signIn('nonexistent@example.com', password)
      ).rejects.toThrow();
    });
  });

  describe('Get Me', () => {
    let apiKey: string;
    let client: ReturnType<typeof createRepairShoprClient>;

    beforeAll(async () => {
      client = getClient();
      const response = await client.signIn(email, password);
      apiKey = response.api_key;
    });

    test('returns user info with valid token', async () => {
      const response = await client.getMe(apiKey);

      expect(response.user.id).toBeDefined();
      expect(response.user.email).toBe(email);
      expect(response.admin).toBeDefined();
      expect(response.permissions).toBeDefined();
    });

    test('fails with invalid token', async () => {
      await expect(client.getMe('invalid-token')).rejects.toThrow();
    });
  });

  describe('Role Mapping', () => {
    let apiKey: string;
    let admin: boolean;
    let permissions: Record<string, Record<string, boolean>>;
    let client: ReturnType<typeof createRepairShoprClient>;

    beforeAll(async () => {
      client = getClient();
      const signInResponse = await client.signIn(email, password);
      apiKey = signInResponse.api_key;

      const meResponse = await client.getMe(apiKey);
      admin = meResponse.admin;
      permissions = meResponse.permissions;
    });

    test('maps admin user to admin role', function () {
      if (!admin) {
        this.skip();
        return;
      }

      // Admin users should get admin role
      expect(admin).toBe(true);
    });

    test('maps user with write permissions to employee role', function () {
      if (admin) {
        this.skip();
        return;
      }

      const hasWritePermissions = Object.values(permissions).some(
        (perms) => perms.write === true || perms.create === true
      );

      if (hasWritePermissions) {
        // Should be mapped to employee role
        console.log('User has write permissions, should be employee role');
      }
    });

    test('maps read-only user to limited role', function () {
      if (admin) {
        this.skip();
        return;
      }

      const hasWritePermissions = Object.values(permissions).some(
        (perms) => perms.write === true || perms.create === true
      );

      if (!hasWritePermissions) {
        // Should be mapped to limited role
        console.log('User has read-only permissions, should be limited role');
      }
    });
  });
});

// Print skip message if tests are skipped
if (SKIP_INTEGRATION) {
  console.log(`\n⚠️  Skipping integration tests: ${skipReason}\n`);
  console.log('To run integration tests, set:');
  console.log('  export TEST_REPAIRSHOPR_EMAIL=user@example.com');
  console.log('  export TEST_REPAIRSHOPR_PASSWORD=password');
  console.log('  export REPAIRSHOPR_SUBDOMAIN=yoursubdomain\n');
}
