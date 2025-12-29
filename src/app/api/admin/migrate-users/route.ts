/**
 * User Migration API Route
 *
 * Admin-only endpoint to trigger user migration from RepairShopr and
 * customer_accounts to Supabase Auth.
 *
 * POST /api/admin/migrate-users
 *   Body: {
 *     dryRun?: boolean,       // Preview changes without making modifications
 *     employeesOnly?: boolean, // Only migrate employees
 *     customersOnly?: boolean, // Only migrate customers
 *     skipEmails?: boolean     // Skip sending password reset emails
 *   }
 *
 * Returns migration status, statistics, and detailed log.
 *
 * Issue: #57 (Phase 1 Foundation - User Migration Script)
 * Created: 2025-12-29
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// =============================================================================
// Types
// =============================================================================

interface MigrationConfig {
  dryRun: boolean;
  employeesOnly: boolean;
  customersOnly: boolean;
  skipEmails: boolean;
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
// Migration State (per-request)
// =============================================================================

class MigrationRunner {
  private log: MigrationLogEntry[] = [];
  private stats: MigrationStats = {
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
  private config: MigrationConfig;
  private supabase: SupabaseClient;

  constructor(config: MigrationConfig, supabase: SupabaseClient) {
    this.config = config;
    this.supabase = supabase;
  }

  // Logging
  private addLog(
    type: MigrationLogEntry['type'],
    category: MigrationLogEntry['category'],
    message: string,
    email?: string,
    details?: Record<string, unknown>
  ): void {
    this.log.push({
      timestamp: new Date().toISOString(),
      type,
      category,
      message,
      email,
      details,
    });
  }

  // Generate temporary password
  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 24; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Map RepairShopr role to Supabase role
  private mapRepairShoprRole(
    employee: RepairShoprEmployee
  ): 'admin' | 'technician' | 'receptionist' {
    if (employee.admin) return 'admin';

    if (employee.role) {
      const roleLower = employee.role.toLowerCase();
      if (roleLower.includes('admin')) return 'admin';
      if (roleLower.includes('tech')) return 'technician';
      if (roleLower.includes('reception') || roleLower.includes('front')) return 'receptionist';
    }

    if (employee.permissions) {
      const hasWritePermissions = Object.values(employee.permissions).some(
        (perms) => perms.write === true || perms.create === true
      );
      if (hasWritePermissions) return 'technician';
    }

    return 'receptionist';
  }

  // Check existing profile
  private async checkExistingProfile(email: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      this.addLog('warning', 'system', `Error checking profile: ${error.message}`, email);
    }

    return data as UserProfile | null;
  }

  // Check existing auth user
  private async checkExistingAuthUser(email: string): Promise<User | null> {
    const { data, error } = await this.supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error) {
      this.addLog('warning', 'system', `Error listing auth users: ${error.message}`);
      return null;
    }

    return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) || null;
  }

  // Fetch employees from RepairShopr
  private async fetchRepairShoprEmployees(): Promise<RepairShoprEmployee[]> {
    const subdomain = process.env.REPAIRSHOPR_SUBDOMAIN;
    const apiKey = process.env.REPAIRSHOPR_API_KEY;

    if (!subdomain || !apiKey) {
      throw new Error('Missing REPAIRSHOPR_SUBDOMAIN or REPAIRSHOPR_API_KEY');
    }

    const baseUrl = `https://${subdomain}.repairshopr.com/api/v1`;
    const response = await fetch(`${baseUrl}/users?api_key=${encodeURIComponent(apiKey)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`RepairShopr API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as { users?: RepairShoprEmployee[] };
    return data.users || [];
  }

  // Fetch customer accounts
  private async fetchCustomerAccounts(): Promise<CustomerAccount[]> {
    const { data, error } = await this.supabase
      .from('customer_accounts')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch customer accounts: ${error.message}`);
    }

    return (data || []) as CustomerAccount[];
  }

  // Send password reset email
  private async sendPasswordResetEmail(email: string): Promise<boolean> {
    if (this.config.dryRun) {
      this.addLog('info', 'system', 'Would send password reset email', email);
      return true;
    }

    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${appUrl}/auth/reset-password`,
      });

      if (error) {
        this.addLog('warning', 'system', `Failed to send reset email: ${error.message}`, email);
        this.stats.emailsFailed++;
        return false;
      }

      this.addLog('success', 'system', 'Password reset email sent', email);
      this.stats.emailsSent++;
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.addLog('warning', 'system', `Exception sending email: ${errorMessage}`, email);
      this.stats.emailsFailed++;
      return false;
    }
  }

  // Migrate single employee
  private async migrateEmployee(employee: RepairShoprEmployee): Promise<boolean> {
    this.stats.employeesProcessed++;
    const email = employee.email.toLowerCase();

    this.addLog('info', 'employee', `Processing: ${employee.full_name}`, email);

    // Check existing auth user
    const existingAuthUser = await this.checkExistingAuthUser(email);
    if (existingAuthUser) {
      const existingProfile = await this.checkExistingProfile(email);
      if (existingProfile) {
        this.addLog('info', 'employee', 'Already exists, skipping', email);
        this.stats.employeesSkipped++;
        return true;
      }

      // Create profile for existing auth user
      if (!this.config.dryRun) {
        const role = this.mapRepairShoprRole(employee);
        const { error } = await this.supabase.from('user_profiles').insert({
          id: existingAuthUser.id,
          email: email,
          full_name: employee.full_name,
          role: role,
          repairshopr_user_id: employee.id,
        });

        if (error) {
          this.addLog('error', 'employee', `Failed to create profile: ${error.message}`, email);
          this.stats.employeesFailed++;
          return false;
        }
      }

      this.addLog('success', 'employee', 'Created profile for existing auth user', email);
      this.stats.employeesCreated++;
      return true;
    }

    // Check existing profile without auth user
    const existingProfile = await this.checkExistingProfile(email);
    if (existingProfile) {
      this.addLog('warning', 'employee', 'Profile exists but no auth user, skipping', email);
      this.stats.employeesSkipped++;
      return true;
    }

    // Create new user
    const role = this.mapRepairShoprRole(employee);
    const tempPassword = this.generateTemporaryPassword();

    if (this.config.dryRun) {
      this.addLog('success', 'employee', `Would create user with role: ${role}`, email, {
        repairshopr_user_id: employee.id,
      });
      this.stats.employeesCreated++;
      return true;
    }

    try {
      const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: employee.full_name,
          role: role,
          repairshopr_user_id: employee.id,
          migrated_at: new Date().toISOString(),
        },
      });

      if (authError) {
        this.addLog('error', 'employee', `Failed to create auth user: ${authError.message}`, email);
        this.stats.employeesFailed++;
        return false;
      }

      if (!authData.user) {
        this.addLog('error', 'employee', 'Auth user creation returned no user', email);
        this.stats.employeesFailed++;
        return false;
      }

      const { error: profileError } = await this.supabase.from('user_profiles').insert({
        id: authData.user.id,
        email: email,
        full_name: employee.full_name,
        role: role,
        repairshopr_user_id: employee.id,
      });

      if (profileError) {
        this.addLog('error', 'employee', `Failed to create profile: ${profileError.message}`, email);
        this.stats.employeesCreated++;
        if (!this.config.skipEmails) await this.sendPasswordResetEmail(email);
        return true;
      }

      this.addLog('success', 'employee', `Created with role: ${role}`, email);
      this.stats.employeesCreated++;

      if (!this.config.skipEmails) await this.sendPasswordResetEmail(email);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.addLog('error', 'employee', `Exception: ${errorMessage}`, email);
      this.stats.employeesFailed++;
      return false;
    }
  }

  // Migrate single customer
  private async migrateCustomer(account: CustomerAccount): Promise<boolean> {
    this.stats.customersProcessed++;
    const email = account.email.toLowerCase();

    this.addLog('info', 'customer', `Processing: ${account.first_name || email}`, email);

    // Check existing auth user
    const existingAuthUser = await this.checkExistingAuthUser(email);
    if (existingAuthUser) {
      const existingProfile = await this.checkExistingProfile(email);
      if (existingProfile) {
        // Update repairshopr_customer_id if needed
        if (existingProfile.repairshopr_customer_id !== account.repairshopr_customer_id) {
          if (!this.config.dryRun) {
            await this.supabase
              .from('user_profiles')
              .update({ repairshopr_customer_id: account.repairshopr_customer_id })
              .eq('id', existingProfile.id);
          }
          this.addLog('success', 'customer', 'Updated repairshopr_customer_id', email);
        }
        this.addLog('info', 'customer', 'Already exists, skipping', email);
        this.stats.customersSkipped++;
        return true;
      }

      // Create profile for existing auth user
      if (!this.config.dryRun) {
        const { error } = await this.supabase.from('user_profiles').insert({
          id: existingAuthUser.id,
          email: email,
          full_name: account.first_name || null,
          role: 'customer',
          repairshopr_customer_id: account.repairshopr_customer_id,
        });

        if (error) {
          this.addLog('error', 'customer', `Failed to create profile: ${error.message}`, email);
          this.stats.customersFailed++;
          return false;
        }
      }

      this.addLog('success', 'customer', 'Created profile for existing auth user', email);
      this.stats.customersCreated++;
      return true;
    }

    // Check existing profile without auth user
    const existingProfile = await this.checkExistingProfile(email);
    if (existingProfile) {
      this.addLog('warning', 'customer', 'Profile exists but no auth user, skipping', email);
      this.stats.customersSkipped++;
      return true;
    }

    // Create new user
    const tempPassword = this.generateTemporaryPassword();

    if (this.config.dryRun) {
      this.addLog('success', 'customer', 'Would create customer user', email, {
        repairshopr_customer_id: account.repairshopr_customer_id,
      });
      this.stats.customersCreated++;
      return true;
    }

    try {
      const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: account.first_name,
          role: 'customer',
          repairshopr_customer_id: account.repairshopr_customer_id,
          migrated_at: new Date().toISOString(),
          migrated_from: 'customer_accounts',
        },
      });

      if (authError) {
        this.addLog('error', 'customer', `Failed to create auth user: ${authError.message}`, email);
        this.stats.customersFailed++;
        return false;
      }

      if (!authData.user) {
        this.addLog('error', 'customer', 'Auth user creation returned no user', email);
        this.stats.customersFailed++;
        return false;
      }

      const { error: profileError } = await this.supabase.from('user_profiles').insert({
        id: authData.user.id,
        email: email,
        full_name: account.first_name || null,
        role: 'customer',
        repairshopr_customer_id: account.repairshopr_customer_id,
      });

      if (profileError) {
        this.addLog('error', 'customer', `Failed to create profile: ${profileError.message}`, email);
        this.stats.customersCreated++;
        if (!this.config.skipEmails) await this.sendPasswordResetEmail(email);
        return true;
      }

      this.addLog('success', 'customer', 'Created customer user', email);
      this.stats.customersCreated++;

      if (!this.config.skipEmails) await this.sendPasswordResetEmail(email);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.addLog('error', 'customer', `Exception: ${errorMessage}`, email);
      this.stats.customersFailed++;
      return false;
    }
  }

  // Run migration
  async run(): Promise<{ stats: MigrationStats; log: MigrationLogEntry[] }> {
    this.addLog('info', 'system', 'Starting migration', undefined, {
      dryRun: this.config.dryRun,
      employeesOnly: this.config.employeesOnly,
      customersOnly: this.config.customersOnly,
      skipEmails: this.config.skipEmails,
    });

    // Migrate employees
    if (!this.config.customersOnly) {
      try {
        this.addLog('info', 'system', 'Fetching employees from RepairShopr');
        const employees = await this.fetchRepairShoprEmployees();
        this.addLog('info', 'system', `Found ${employees.length} employees`);

        for (const employee of employees) {
          await this.migrateEmployee(employee);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.addLog('error', 'system', `Failed to fetch/migrate employees: ${errorMessage}`);
      }
    }

    // Migrate customers
    if (!this.config.employeesOnly) {
      try {
        this.addLog('info', 'system', 'Fetching customer accounts');
        const accounts = await this.fetchCustomerAccounts();
        this.addLog('info', 'system', `Found ${accounts.length} customer accounts`);

        for (const account of accounts) {
          await this.migrateCustomer(account);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.addLog('error', 'system', `Failed to fetch/migrate customers: ${errorMessage}`);
      }
    }

    this.addLog('info', 'system', 'Migration complete');

    return {
      stats: this.stats,
      log: this.log,
    };
  }
}

// =============================================================================
// POST /api/admin/migrate-users
// =============================================================================

export async function POST(request: NextRequest) {
  // Check authentication and admin role
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  // Parse request body
  let body: Partial<MigrationConfig>;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const config: MigrationConfig = {
    dryRun: body.dryRun === true,
    employeesOnly: body.employeesOnly === true,
    customersOnly: body.customersOnly === true,
    skipEmails: body.skipEmails === true,
  };

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Server configuration error: Supabase not configured' },
      { status: 503 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Run migration
  try {
    const runner = new MigrationRunner(config, supabase);
    const result = await runner.run();

    // Determine status based on results
    const hasErrors = result.stats.employeesFailed > 0 || result.stats.customersFailed > 0;
    const hasCreated = result.stats.employeesCreated > 0 || result.stats.customersCreated > 0;

    return NextResponse.json({
      success: !hasErrors,
      dryRun: config.dryRun,
      message: config.dryRun
        ? 'Dry run complete - no changes made'
        : hasErrors
        ? 'Migration completed with errors'
        : hasCreated
        ? 'Migration completed successfully'
        : 'No users to migrate',
      stats: result.stats,
      log: result.log,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[MIGRATE-USERS] Migration failed:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: `Migration failed: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET /api/admin/migrate-users (status/preview)
// =============================================================================

export async function GET() {
  // Check authentication and admin role
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Server configuration error: Supabase not configured' },
      { status: 503 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Get counts for preview
    const [profilesResult, authUsersResult, customerAccountsResult] = await Promise.all([
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
      supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      supabase.from('customer_accounts').select('*', { count: 'exact', head: true }),
    ]);

    // Check RepairShopr configuration
    const hasRepairShoprConfig = !!(
      process.env.REPAIRSHOPR_SUBDOMAIN && process.env.REPAIRSHOPR_API_KEY
    );

    return NextResponse.json({
      ready: true,
      configuration: {
        supabaseConfigured: true,
        repairShoprConfigured: hasRepairShoprConfig,
      },
      current: {
        authUsers: authUsersResult.data?.users.length || 0,
        userProfiles: profilesResult.count || 0,
        customerAccounts: customerAccountsResult.count || 0,
      },
      message: hasRepairShoprConfig
        ? 'Ready to migrate. Use POST with dryRun=true to preview changes.'
        : 'RepairShopr not configured. Only customer migration available.',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[MIGRATE-USERS] Status check failed:', errorMessage);

    return NextResponse.json(
      {
        ready: false,
        error: `Status check failed: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
