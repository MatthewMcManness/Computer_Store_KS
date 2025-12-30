#!/usr/bin/env npx ts-node
/**
 * User Migration Script
 *
 * Migrates existing users from RepairShopr (employees) and customer_accounts table
 * to Supabase Auth with proper user_profiles linkage.
 *
 * Usage:
 *   npx ts-node scripts/migrate-users.ts [--dry-run] [--employees-only] [--customers-only]
 *
 * Options:
 *   --dry-run          Preview changes without making any modifications
 *   --employees-only   Only migrate employees from RepairShopr
 *   --customers-only   Only migrate customers from customer_accounts
 *   --skip-emails      Skip sending password reset emails
 *   --verbose          Enable verbose logging
 *
 * Environment Variables Required:
 *   - REPAIRSHOPR_SUBDOMAIN: RepairShopr account subdomain
 *   - REPAIRSHOPR_API_KEY: RepairShopr API key for fetching employees
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

interface MigrationConfig {
  dryRun: boolean;
  employeesOnly: boolean;
  customersOnly: boolean;
  skipEmails: boolean;
  verbose: boolean;
}

interface MigrationStats {
  employeesProcessed: number;
  employeesCreated: number;
  employeesSkipped: number;
  employeesFailed: number;
  customersProcessed: number;
  customersCreated: number;
  customersSkipped: number;
  customersFailed: number;
  emailsSent: number;
  emailsFailed: number;
}

interface MigrationLogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'employee' | 'customer' | 'system';
  message: string;
  email?: string;
  details?: Record<string, unknown>;
}

interface RepairShoprEmployee {
  id: number;
  email: string;
  full_name: string;
  admin: boolean;
  role?: string;
  permissions?: Record<string, Record<string, boolean>>;
}

interface CustomerAccount {
  id: string;
  email: string;
  repairshopr_customer_id: number;
  first_name?: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'technician' | 'receptionist' | 'customer';
  repairshopr_user_id: number | null;
  repairshopr_customer_id: number | null;
}

// =============================================================================
// Global State
// =============================================================================

const migrationLog: MigrationLogEntry[] = [];
const stats: MigrationStats = {
  employeesProcessed: 0,
  employeesCreated: 0,
  employeesSkipped: 0,
  employeesFailed: 0,
  customersProcessed: 0,
  customersCreated: 0,
  customersSkipped: 0,
  customersFailed: 0,
  emailsSent: 0,
  emailsFailed: 0,
};

let config: MigrationConfig;
let supabase: SupabaseClient;

// =============================================================================
// Logging Utilities
// =============================================================================

function log(
  type: MigrationLogEntry['type'],
  category: MigrationLogEntry['category'],
  message: string,
  email?: string,
  details?: Record<string, unknown>
): void {
  const entry: MigrationLogEntry = {
    timestamp: new Date().toISOString(),
    type,
    category,
    message,
    email,
    details,
  };
  migrationLog.push(entry);

  // Console output based on type
  const prefix = config.dryRun ? '[DRY-RUN] ' : '';
  const categoryLabel = `[${category.toUpperCase()}]`;

  switch (type) {
    case 'error':
      console.error(`${prefix}ERROR ${categoryLabel} ${message}`, email ? `(${email})` : '', details || '');
      break;
    case 'warning':
      console.warn(`${prefix}WARN ${categoryLabel} ${message}`, email ? `(${email})` : '');
      break;
    case 'success':
      console.log(`${prefix}OK ${categoryLabel} ${message}`, email ? `(${email})` : '');
      break;
    case 'info':
      if (config.verbose) {
        console.log(`${prefix}INFO ${categoryLabel} ${message}`, email ? `(${email})` : '');
      }
      break;
  }
}

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
// RepairShopr API Functions
// =============================================================================

async function fetchRepairShoprEmployees(): Promise<RepairShoprEmployee[]> {
  const subdomain = process.env.REPAIRSHOPR_SUBDOMAIN;
  const apiKey = process.env.REPAIRSHOPR_API_KEY;

  if (!subdomain || !apiKey) {
    throw new Error(
      'Missing required environment variables: REPAIRSHOPR_SUBDOMAIN and/or REPAIRSHOPR_API_KEY'
    );
  }

  const baseUrl = `https://${subdomain}.repairshopr.com/api/v1`;

  log('info', 'system', `Fetching employees from RepairShopr (${subdomain})`);

  // RepairShopr /users endpoint returns simplified array: [[id, name], ...]
  const listResponse = await fetch(`${baseUrl}/users?api_key=${encodeURIComponent(apiKey)}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!listResponse.ok) {
    const errorText = await listResponse.text();
    throw new Error(`RepairShopr API error (${listResponse.status}): ${errorText}`);
  }

  const listData = await listResponse.json() as { users?: Array<[number, string]> };
  const userList = listData.users || [];

  log('info', 'system', `Found ${userList.length} employees in RepairShopr, fetching details...`);

  // Fetch detailed info for each user
  const employees: RepairShoprEmployee[] = [];
  for (const [userId, userName] of userList) {
    try {
      const detailResponse = await fetch(
        `${baseUrl}/users/${userId}?api_key=${encodeURIComponent(apiKey)}`,
        {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        }
      );

      if (!detailResponse.ok) {
        log('warning', 'employee', `Failed to fetch details for user ${userId} (${userName})`);
        continue;
      }

      const detailData = await detailResponse.json() as {
        user?: {
          id: number;
          email?: string;
          full_name: string;
          'admin?'?: boolean;
          group?: string;
        };
      };

      if (detailData.user && detailData.user.email) {
        employees.push({
          id: detailData.user.id,
          email: detailData.user.email,
          full_name: detailData.user.full_name,
          admin: detailData.user['admin?'] || false,
          role: detailData.user.group,
        });
        log('info', 'system', `  - ${detailData.user.full_name} (${detailData.user.email})`);
      } else {
        log('warning', 'employee', `User ${userId} (${userName}) has no email, skipping`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log('warning', 'employee', `Error fetching user ${userId}: ${errorMessage}`);
    }
  }

  log('info', 'system', `Loaded ${employees.length} employees with valid emails`);

  return employees;
}

// =============================================================================
// Customer Account Functions
// =============================================================================

async function fetchCustomerAccounts(): Promise<CustomerAccount[]> {
  log('info', 'system', 'Fetching customer accounts from Supabase');

  const { data, error } = await supabase
    .from('customer_accounts')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch customer accounts: ${error.message}`);
  }

  const accounts = (data || []) as CustomerAccount[];
  log('info', 'system', `Found ${accounts.length} customer accounts`);

  return accounts;
}

// =============================================================================
// User Profile Functions
// =============================================================================

async function checkExistingProfile(email: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found
    log('warning', 'system', `Error checking existing profile: ${error.message}`, email);
  }

  return data as UserProfile | null;
}

async function checkExistingAuthUser(email: string): Promise<User | null> {
  // List users and filter by email (Supabase admin API)
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    log('warning', 'system', `Error listing auth users: ${error.message}`);
    return null;
  }

  const user = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  return user || null;
}

// =============================================================================
// Role Mapping
// =============================================================================

// Emails that should always be admins on the website
const ADMIN_EMAILS = [
  'matthewmcmanness@gmail.com',
  'owner@computerstoreks.com',
];

function mapRepairShoprRoleToSupabase(
  employee: RepairShoprEmployee
): 'admin' | 'technician' | 'receptionist' {
  // Check hardcoded admin list first
  if (ADMIN_EMAILS.includes(employee.email.toLowerCase())) {
    return 'admin';
  }

  // Admin users in RepairShopr are admins
  if (employee.admin) {
    return 'admin';
  }

  // Check explicit role field if available
  if (employee.role) {
    const roleLower = employee.role.toLowerCase();
    if (roleLower.includes('admin')) return 'admin';
    if (roleLower.includes('tech')) return 'technician';
    if (roleLower.includes('reception') || roleLower.includes('front')) return 'receptionist';
  }

  // Check permissions for write access (technician) vs read-only (receptionist)
  if (employee.permissions) {
    const hasWritePermissions = Object.values(employee.permissions).some(
      (perms) => perms.write === true || perms.create === true
    );
    if (hasWritePermissions) {
      return 'technician';
    }
  }

  // Default to receptionist for employees without clear role
  return 'receptionist';
}

// =============================================================================
// Password Generation
// =============================================================================

function generateTemporaryPassword(): string {
  // Generate a secure random password (users will reset this)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 24; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// =============================================================================
// Employee Migration
// =============================================================================

async function migrateEmployee(employee: RepairShoprEmployee): Promise<boolean> {
  stats.employeesProcessed++;
  const email = employee.email.toLowerCase();

  log('info', 'employee', `Processing employee: ${employee.full_name}`, email);

  // Check if user already exists in Supabase Auth
  const existingAuthUser = await checkExistingAuthUser(email);
  if (existingAuthUser) {
    log('info', 'employee', 'User already exists in Supabase Auth, checking profile', email);

    // Ensure profile exists
    const existingProfile = await checkExistingProfile(email);
    if (existingProfile) {
      log('info', 'employee', 'Profile already exists, skipping', email);
      stats.employeesSkipped++;
      return true;
    }

    // Create profile for existing auth user
    if (!config.dryRun) {
      const role = mapRepairShoprRoleToSupabase(employee);
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: existingAuthUser.id,
          email: email,
          full_name: employee.full_name,
          role: role,
          repairshopr_user_id: employee.id,
        });

      if (profileError) {
        log('error', 'employee', `Failed to create profile: ${profileError.message}`, email);
        stats.employeesFailed++;
        return false;
      }
    }

    log('success', 'employee', 'Created profile for existing auth user', email);
    stats.employeesCreated++;
    return true;
  }

  // Check if profile exists without auth user (shouldn't happen normally)
  const existingProfile = await checkExistingProfile(email);
  if (existingProfile) {
    log('warning', 'employee', 'Profile exists but no auth user, skipping (manual intervention needed)', email);
    stats.employeesSkipped++;
    return true;
  }

  // Create new Supabase Auth user
  const role = mapRepairShoprRoleToSupabase(employee);
  const tempPassword = generateTemporaryPassword();

  if (config.dryRun) {
    log('success', 'employee', `Would create user with role: ${role}`, email, {
      repairshopr_user_id: employee.id,
      full_name: employee.full_name,
    });
    stats.employeesCreated++;
    return true;
  }

  try {
    // Create auth user with temporary password
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: employee.full_name,
        role: role,
        repairshopr_user_id: employee.id,
        migrated_at: new Date().toISOString(),
      },
    });

    if (authError) {
      log('error', 'employee', `Failed to create auth user: ${authError.message}`, email);
      stats.employeesFailed++;
      return false;
    }

    if (!authData.user) {
      log('error', 'employee', 'Auth user creation returned no user', email);
      stats.employeesFailed++;
      return false;
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: employee.full_name,
        role: role,
        repairshopr_user_id: employee.id,
      });

    if (profileError) {
      log('error', 'employee', `Failed to create profile (auth user created): ${profileError.message}`, email);
      // Don't fail completely - auth user was created
      stats.employeesCreated++;

      // Try to send password reset anyway
      if (!config.skipEmails) {
        await sendPasswordResetEmail(email);
      }
      return true;
    }

    log('success', 'employee', `Created auth user and profile with role: ${role}`, email);
    stats.employeesCreated++;

    // Send password reset email
    if (!config.skipEmails) {
      await sendPasswordResetEmail(email);
    }

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'employee', `Exception during migration: ${errorMessage}`, email);
    stats.employeesFailed++;
    return false;
  }
}

// =============================================================================
// Customer Migration
// =============================================================================

async function migrateCustomer(account: CustomerAccount): Promise<boolean> {
  stats.customersProcessed++;
  const email = account.email.toLowerCase();

  log('info', 'customer', `Processing customer: ${account.first_name || email}`, email);

  // Check if user already exists in Supabase Auth
  const existingAuthUser = await checkExistingAuthUser(email);
  if (existingAuthUser) {
    log('info', 'customer', 'User already exists in Supabase Auth, checking profile', email);

    // Ensure profile exists with correct repairshopr_customer_id
    const existingProfile = await checkExistingProfile(email);
    if (existingProfile) {
      // Verify repairshopr_customer_id is set correctly
      if (existingProfile.repairshopr_customer_id !== account.repairshopr_customer_id) {
        if (!config.dryRun) {
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ repairshopr_customer_id: account.repairshopr_customer_id })
            .eq('id', existingProfile.id);

          if (updateError) {
            log('warning', 'customer', `Failed to update repairshopr_customer_id: ${updateError.message}`, email);
          } else {
            log('success', 'customer', 'Updated repairshopr_customer_id on existing profile', email);
          }
        } else {
          log('info', 'customer', 'Would update repairshopr_customer_id on existing profile', email);
        }
      }
      log('info', 'customer', 'Profile already exists, skipping', email);
      stats.customersSkipped++;
      return true;
    }

    // Create profile for existing auth user
    if (!config.dryRun) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: existingAuthUser.id,
          email: email,
          full_name: account.first_name || null,
          role: 'customer',
          repairshopr_customer_id: account.repairshopr_customer_id,
        });

      if (profileError) {
        log('error', 'customer', `Failed to create profile: ${profileError.message}`, email);
        stats.customersFailed++;
        return false;
      }
    }

    log('success', 'customer', 'Created profile for existing auth user', email);
    stats.customersCreated++;
    return true;
  }

  // Check if profile exists without auth user
  const existingProfile = await checkExistingProfile(email);
  if (existingProfile) {
    log('warning', 'customer', 'Profile exists but no auth user, skipping (manual intervention needed)', email);
    stats.customersSkipped++;
    return true;
  }

  // Create new Supabase Auth user
  const tempPassword = generateTemporaryPassword();

  if (config.dryRun) {
    log('success', 'customer', 'Would create customer user', email, {
      repairshopr_customer_id: account.repairshopr_customer_id,
      first_name: account.first_name,
    });
    stats.customersCreated++;
    return true;
  }

  try {
    // Create auth user with temporary password
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: account.first_name,
        role: 'customer',
        repairshopr_customer_id: account.repairshopr_customer_id,
        migrated_at: new Date().toISOString(),
        migrated_from: 'customer_accounts',
      },
    });

    if (authError) {
      log('error', 'customer', `Failed to create auth user: ${authError.message}`, email);
      stats.customersFailed++;
      return false;
    }

    if (!authData.user) {
      log('error', 'customer', 'Auth user creation returned no user', email);
      stats.customersFailed++;
      return false;
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: account.first_name || null,
        role: 'customer',
        repairshopr_customer_id: account.repairshopr_customer_id,
      });

    if (profileError) {
      log('error', 'customer', `Failed to create profile (auth user created): ${profileError.message}`, email);
      // Don't fail completely - auth user was created
      stats.customersCreated++;

      // Try to send password reset anyway
      if (!config.skipEmails) {
        await sendPasswordResetEmail(email);
      }
      return true;
    }

    log('success', 'customer', 'Created auth user and profile', email);
    stats.customersCreated++;

    // Send password reset email
    if (!config.skipEmails) {
      await sendPasswordResetEmail(email);
    }

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'customer', `Exception during migration: ${errorMessage}`, email);
    stats.customersFailed++;
    return false;
  }
}

// =============================================================================
// Password Reset Email
// =============================================================================

async function sendPasswordResetEmail(email: string): Promise<boolean> {
  if (config.dryRun) {
    log('info', 'system', 'Would send password reset email', email);
    return true;
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/auth/reset-password`,
    });

    if (error) {
      log('warning', 'system', `Failed to send password reset email: ${error.message}`, email);
      stats.emailsFailed++;
      return false;
    }

    log('success', 'system', 'Password reset email sent', email);
    stats.emailsSent++;
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log('warning', 'system', `Exception sending password reset email: ${errorMessage}`, email);
    stats.emailsFailed++;
    return false;
  }
}

// =============================================================================
// Main Migration Function
// =============================================================================

async function runMigration(): Promise<void> {
  console.log('\n========================================');
  console.log('  User Migration Script');
  console.log('  Computer Store KS - Issue #57');
  console.log('========================================\n');

  if (config.dryRun) {
    console.log('>>> DRY RUN MODE - No changes will be made <<<\n');
  }

  // Migrate employees
  if (!config.customersOnly) {
    console.log('\n--- Migrating Employees from RepairShopr ---\n');

    try {
      const employees = await fetchRepairShoprEmployees();

      for (const employee of employees) {
        await migrateEmployee(employee);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log('error', 'system', `Failed to fetch/migrate employees: ${errorMessage}`);
    }
  }

  // Migrate customers
  if (!config.employeesOnly) {
    console.log('\n--- Migrating Customers from customer_accounts ---\n');

    try {
      const accounts = await fetchCustomerAccounts();

      for (const account of accounts) {
        await migrateCustomer(account);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log('error', 'system', `Failed to fetch/migrate customers: ${errorMessage}`);
    }
  }

  // Print summary
  printSummary();
}

// =============================================================================
// Summary Output
// =============================================================================

function printSummary(): void {
  console.log('\n========================================');
  console.log('  Migration Summary');
  console.log('========================================\n');

  if (config.dryRun) {
    console.log('>>> DRY RUN - No actual changes were made <<<\n');
  }

  console.log('Employees:');
  console.log(`  Processed: ${stats.employeesProcessed}`);
  console.log(`  Created:   ${stats.employeesCreated}`);
  console.log(`  Skipped:   ${stats.employeesSkipped}`);
  console.log(`  Failed:    ${stats.employeesFailed}`);

  console.log('\nCustomers:');
  console.log(`  Processed: ${stats.customersProcessed}`);
  console.log(`  Created:   ${stats.customersCreated}`);
  console.log(`  Skipped:   ${stats.customersSkipped}`);
  console.log(`  Failed:    ${stats.customersFailed}`);

  if (!config.skipEmails && !config.dryRun) {
    console.log('\nEmails:');
    console.log(`  Sent:      ${stats.emailsSent}`);
    console.log(`  Failed:    ${stats.emailsFailed}`);
  }

  // Count errors and warnings
  const errors = migrationLog.filter((l) => l.type === 'error');
  const warnings = migrationLog.filter((l) => l.type === 'warning');

  if (errors.length > 0) {
    console.log(`\nErrors (${errors.length}):`);
    for (const error of errors) {
      console.log(`  - ${error.message}${error.email ? ` (${error.email})` : ''}`);
    }
  }

  if (warnings.length > 0) {
    console.log(`\nWarnings (${warnings.length}):`);
    for (const warning of warnings) {
      console.log(`  - ${warning.message}${warning.email ? ` (${warning.email})` : ''}`);
    }
  }

  console.log('\n========================================\n');

  // Exit with error code if there were failures
  if (stats.employeesFailed > 0 || stats.customersFailed > 0) {
    process.exit(1);
  }
}

// =============================================================================
// CLI Entry Point
// =============================================================================

function parseArgs(): MigrationConfig {
  const args = process.argv.slice(2);

  return {
    dryRun: args.includes('--dry-run'),
    employeesOnly: args.includes('--employees-only'),
    customersOnly: args.includes('--customers-only'),
    skipEmails: args.includes('--skip-emails'),
    verbose: args.includes('--verbose'),
  };
}

async function main(): Promise<void> {
  // Parse command line arguments
  config = parseArgs();

  // Initialize Supabase client
  try {
    supabase = initializeSupabase();
    log('info', 'system', 'Supabase client initialized');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`ERROR: Failed to initialize Supabase: ${errorMessage}`);
    process.exit(1);
  }

  // Run migration
  try {
    await runMigration();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`ERROR: Migration failed: ${errorMessage}`);
    process.exit(1);
  }
}

// Export for API route usage
export type { MigrationConfig, MigrationStats, MigrationLogEntry };
export {
  migrateEmployee,
  migrateCustomer,
  fetchRepairShoprEmployees,
  fetchCustomerAccounts,
  checkExistingProfile,
  checkExistingAuthUser,
  initializeSupabase,
  generateTemporaryPassword,
  mapRepairShoprRoleToSupabase,
  stats as migrationStats,
  migrationLog,
};

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}
