#!/usr/bin/env npx ts-node
/**
 * User Migration Rollback Script
 *
 * Rolls back user migration by removing Supabase Auth users and user_profiles
 * that were created during migration.
 *
 * CAUTION: This is a destructive operation. Users will need to re-register.
 *
 * Usage:
 *   npx ts-node scripts/migrate-users-rollback.ts [--dry-run] [--confirm]
 *
 * Options:
 *   --dry-run    Preview changes without making any modifications
 *   --confirm    Required to actually perform the rollback (safety check)
 *   --verbose    Enable verbose logging
 *
 * Environment Variables Required:
 *   - NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
 *   - SUPABASE_SERVICE_ROLE_KEY: Supabase service role key
 *
 * Issue: #57 (Phase 1 Foundation - User Migration Script)
 * Created: 2025-12-29
 */

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

// =============================================================================
// Configuration
// =============================================================================

interface RollbackConfig {
  dryRun: boolean;
  confirm: boolean;
  verbose: boolean;
}

interface RollbackStats {
  usersFound: number;
  authUsersDeleted: number;
  profilesDeleted: number;
  failed: number;
}

// =============================================================================
// Global State
// =============================================================================

let config: RollbackConfig;
let supabase: SupabaseClient;
const stats: RollbackStats = {
  usersFound: 0,
  authUsersDeleted: 0,
  profilesDeleted: 0,
  failed: 0,
};

// =============================================================================
// Supabase Client Initialization
// =============================================================================

function initializeSupabase(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// =============================================================================
// Find Migrated Users
// =============================================================================

async function findMigratedUsers(): Promise<User[]> {
  console.log('Searching for migrated users...\n');

  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw new Error(`Failed to list users: ${error.message}`);
  }

  // Filter users that have migrated_at in their metadata
  const migratedUsers = data.users.filter((user) => {
    const metadata = user.user_metadata;
    return metadata && metadata.migrated_at;
  });

  stats.usersFound = migratedUsers.length;
  return migratedUsers;
}

// =============================================================================
// Rollback Single User
// =============================================================================

async function rollbackUser(user: User): Promise<boolean> {
  const email = user.email || 'unknown';
  const metadata = user.user_metadata || {};

  if (config.verbose) {
    console.log(`Processing: ${email}`);
    console.log(`  Role: ${metadata.role || 'unknown'}`);
    console.log(`  Migrated at: ${metadata.migrated_at || 'unknown'}`);
  }

  if (config.dryRun) {
    console.log(`[DRY-RUN] Would delete user: ${email}`);
    stats.authUsersDeleted++;
    stats.profilesDeleted++;
    return true;
  }

  try {
    // Delete user_profile first (has FK to auth.users)
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', user.id);

    if (profileError) {
      console.error(`  Failed to delete profile for ${email}: ${profileError.message}`);
      // Continue to try deleting auth user anyway
    } else {
      stats.profilesDeleted++;
      if (config.verbose) {
        console.log(`  Deleted profile for ${email}`);
      }
    }

    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(user.id);

    if (authError) {
      console.error(`  Failed to delete auth user ${email}: ${authError.message}`);
      stats.failed++;
      return false;
    }

    stats.authUsersDeleted++;
    console.log(`Deleted: ${email}`);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`  Exception rolling back ${email}: ${errorMessage}`);
    stats.failed++;
    return false;
  }
}

// =============================================================================
// Main Rollback Function
// =============================================================================

async function runRollback(): Promise<void> {
  console.log('\n========================================');
  console.log('  User Migration ROLLBACK Script');
  console.log('  Computer Store KS - Issue #57');
  console.log('========================================\n');

  if (config.dryRun) {
    console.log('>>> DRY RUN MODE - No changes will be made <<<\n');
  }

  if (!config.confirm && !config.dryRun) {
    console.error('ERROR: You must use --confirm flag to actually perform rollback.');
    console.error('       Use --dry-run first to preview changes.\n');
    process.exit(1);
  }

  // Find migrated users
  const migratedUsers = await findMigratedUsers();

  if (migratedUsers.length === 0) {
    console.log('No migrated users found. Nothing to roll back.\n');
    return;
  }

  console.log(`Found ${migratedUsers.length} migrated user(s):\n`);

  for (const user of migratedUsers) {
    const metadata = user.user_metadata || {};
    console.log(`  - ${user.email} (${metadata.role || 'unknown role'})`);
  }

  console.log('');

  if (!config.dryRun) {
    console.log('Starting rollback in 3 seconds...\n');
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  // Rollback each user
  for (const user of migratedUsers) {
    await rollbackUser(user);
  }

  // Print summary
  printSummary();
}

// =============================================================================
// Summary Output
// =============================================================================

function printSummary(): void {
  console.log('\n========================================');
  console.log('  Rollback Summary');
  console.log('========================================\n');

  if (config.dryRun) {
    console.log('>>> DRY RUN - No actual changes were made <<<\n');
  }

  console.log(`Users found:       ${stats.usersFound}`);
  console.log(`Auth users deleted: ${stats.authUsersDeleted}`);
  console.log(`Profiles deleted:   ${stats.profilesDeleted}`);
  console.log(`Failed:             ${stats.failed}`);

  console.log('\n========================================\n');

  if (stats.failed > 0) {
    process.exit(1);
  }
}

// =============================================================================
// CLI Entry Point
// =============================================================================

function parseArgs(): RollbackConfig {
  const args = process.argv.slice(2);

  return {
    dryRun: args.includes('--dry-run'),
    confirm: args.includes('--confirm'),
    verbose: args.includes('--verbose'),
  };
}

async function main(): Promise<void> {
  // Parse command line arguments
  config = parseArgs();

  // Initialize Supabase client
  try {
    supabase = initializeSupabase();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`ERROR: Failed to initialize Supabase: ${errorMessage}`);
    process.exit(1);
  }

  // Run rollback
  try {
    await runRollback();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`ERROR: Rollback failed: ${errorMessage}`);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}
