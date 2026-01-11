import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  createAuthAdminClient,
  deleteUser,
  updateUserProfile,
  LegacyUserRole,
} from '@/lib/supabase-auth';
import {
  ALL_EMPLOYEE_ROLES,
  isBusinessRole,
} from '@/types/roles';
import { canManageEmployees } from '@/lib/role-helpers';

export const dynamic = 'force-dynamic';

/**
 * Validate roles array for employee update.
 * Must have at least one business role (or be lead_developer).
 *
 * @param roles - Array of role strings to validate
 * @returns Object with valid flag and error message
 */
function validateRoles(roles: string[]): { valid: boolean; error?: string } {
  if (!Array.isArray(roles) || roles.length === 0) {
    return { valid: false, error: 'At least one role is required' };
  }

  // Check all roles are valid employee roles
  const invalidRoles = roles.filter(r => !ALL_EMPLOYEE_ROLES.includes(r as any));
  if (invalidRoles.length > 0) {
    return {
      valid: false,
      error: `Invalid roles: ${invalidRoles.join(', ')}. Valid roles are: ${ALL_EMPLOYEE_ROLES.join(', ')}`,
    };
  }

  // Must have at least one business role OR be lead_developer
  const hasBusinessRole = roles.some(r => isBusinessRole(r));
  const isLeadDev = roles.includes('lead_developer');

  if (!hasBusinessRole && !isLeadDev) {
    return {
      valid: false,
      error: 'Must have at least one business role (receptionist, technician, lead_technician, manager, or owner) unless assigning lead_developer',
    };
  }

  // Check for duplicate business roles (only one allowed)
  const businessRolesFound = roles.filter(r => isBusinessRole(r));
  if (businessRolesFound.length > 1) {
    return {
      valid: false,
      error: 'Only one business role can be assigned. Use add-on roles for additional permissions.',
    };
  }

  return { valid: true };
}

/**
 * Map new roles array to legacy single role for backward compatibility.
 * Priority: owner > lead_developer > manager > lead_technician > technician > receptionist
 *
 * @param roles - Array of roles
 * @returns Legacy role string
 */
function rolesArrayToLegacyRole(roles: string[]): LegacyUserRole {
  if (roles.includes('owner') || roles.includes('lead_developer') || roles.includes('manager')) {
    return 'admin';
  }
  if (roles.includes('lead_technician') || roles.includes('technician')) {
    return 'technician';
  }
  if (roles.includes('receptionist')) {
    return 'receptionist';
  }
  return 'receptionist'; // Default fallback
}

/**
 * GET /api/admin/employees/[id]
 * Get a single employee profile
 *
 * @param request - Next.js request
 * @param params - Route params containing employee id
 * @returns Employee profile
 *
 * @functions_called getCurrentUser, createAuthAdminClient
 * @called_by EmployeesPage (edit modal)
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAuthAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .neq('role', 'customer')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
      }
      console.error('[API] Employee fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch employee' }, { status: 500 });
    }

    return NextResponse.json({ employee: data });
  } catch (error) {
    console.error('[API] Employee fetch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/employees/[id]
 * Update employee profile (roles, name, RepairShopr ID)
 *
 * Accepts either:
 * - `roles`: string[] (new multi-role system)
 * - `role`: string (legacy single-role, converted to array)
 *
 * @param request - Request with updated fields (roles, full_name, repairshopr_user_id)
 * @param params - Route params containing employee id
 * @returns Updated employee profile
 *
 * @functions_called getCurrentUser, createAuthAdminClient, validateRoles, updateUserProfile
 * @called_by EmployeesPage (edit modal)
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-01-11T00:00:00Z - Updated for multi-role support
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  // Check permission using new role system with legacy fallback
  const userRoles = user?.roles || (user?.role ? [user.role] : []);
  const hasPermission = canManageEmployees(userRoles) || user?.role === 'admin';

  if (!user || !hasPermission) {
    return NextResponse.json({ error: 'Unauthorized - Management access required' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAuthAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { roles, role, full_name, repairshopr_user_id } = body;

  try {
    // Get the employee being updated
    const { data: targetEmployee, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .neq('role', 'customer')
      .single();

    if (fetchError || !targetEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Build update object
    const updates: Partial<{
      role: LegacyUserRole;
      roles: string[];
      full_name: string | null;
      repairshopr_user_id: number | null;
    }> = {};

    // Handle roles update (new array or legacy single role)
    let newRolesArray: string[] | undefined;
    if (roles && Array.isArray(roles)) {
      newRolesArray = roles;
    } else if (role) {
      // Legacy single role - convert to array
      newRolesArray = [role];
    }

    if (newRolesArray) {
      // Validate new roles
      const rolesValidation = validateRoles(newRolesArray);
      if (!rolesValidation.valid) {
        return NextResponse.json({ error: rolesValidation.error }, { status: 400 });
      }

      // Get current user's profile to compare IDs
      const { data: currentUserProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', user.email)
        .single();

      // Get current roles from target employee
      const currentRoles = targetEmployee.roles && Array.isArray(targetEmployee.roles) && targetEmployee.roles.length > 0
        ? targetEmployee.roles
        : [targetEmployee.role];

      // Check if this is a demotion from management roles
      const currentIsManagement = canManageEmployees(currentRoles);
      const newIsManagement = canManageEmployees(newRolesArray);

      // Prevent self-demotion from management
      if (currentUserProfile && currentUserProfile.id === id && currentIsManagement && !newIsManagement) {
        return NextResponse.json(
          { error: 'You cannot demote yourself from management roles' },
          { status: 400 }
        );
      }

      // Ensure at least one management-level user remains if demoting a manager
      if (currentIsManagement && !newIsManagement) {
        const { data: managers, error: managerError } = await supabase
          .from('user_profiles')
          .select('id, roles, role')
          .neq('role', 'customer');

        if (managerError) {
          console.error('[API] Manager count error:', managerError);
          return NextResponse.json({ error: 'Failed to verify manager count' }, { status: 500 });
        }

        // Count current managers (including this one)
        const managerCount = (managers || []).filter(m => {
          const mRoles = m.roles && Array.isArray(m.roles) && m.roles.length > 0
            ? m.roles
            : [m.role];
          return canManageEmployees(mRoles);
        }).length;

        if (managerCount <= 1) {
          return NextResponse.json(
            { error: 'Cannot demote the last manager. At least one manager/owner/lead_developer must exist.' },
            { status: 400 }
          );
        }
      }

      updates.roles = newRolesArray;
      updates.role = rolesArrayToLegacyRole(newRolesArray); // Keep legacy field in sync
    }

    if (full_name !== undefined) updates.full_name = full_name;
    if (repairshopr_user_id !== undefined) {
      updates.repairshopr_user_id = repairshopr_user_id ? parseInt(repairshopr_user_id, 10) : null;
    }

    // Update the profile
    const updatedProfile = await updateUserProfile(id, updates);

    if (!updatedProfile) {
      return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
    }

    return NextResponse.json({ employee: updatedProfile });
  } catch (error) {
    console.error('[API] Employee update error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/employees/[id]
 * Delete an employee (management only)
 *
 * @param request - Next.js request
 * @param params - Route params containing employee id
 * @returns Success message
 *
 * @functions_called getCurrentUser, createAuthAdminClient, deleteUser, canManageEmployees
 * @called_by EmployeesPage (delete button)
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-01-11T00:00:00Z - Updated for multi-role permission checking
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  // Check permission using new role system with legacy fallback
  const userRoles = user?.roles || (user?.role ? [user.role] : []);
  const hasPermission = canManageEmployees(userRoles) || user?.role === 'admin';

  if (!user || !hasPermission) {
    return NextResponse.json({ error: 'Unauthorized - Management access required' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAuthAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    // Get the employee being deleted
    const { data: targetEmployee, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .neq('role', 'customer')
      .single();

    if (fetchError || !targetEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Get current user's profile to compare IDs
    const { data: currentUserProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', user.email)
      .single();

    // Prevent self-deletion
    if (currentUserProfile && currentUserProfile.id === id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    // Get target employee's roles
    const targetRoles = targetEmployee.roles && Array.isArray(targetEmployee.roles) && targetEmployee.roles.length > 0
      ? targetEmployee.roles
      : [targetEmployee.role];

    // Ensure at least one manager remains if deleting a manager
    if (canManageEmployees(targetRoles)) {
      const { data: managers, error: managerError } = await supabase
        .from('user_profiles')
        .select('id, roles, role')
        .neq('role', 'customer');

      if (managerError) {
        console.error('[API] Manager count error:', managerError);
        return NextResponse.json({ error: 'Failed to verify manager count' }, { status: 500 });
      }

      // Count current managers
      const managerCount = (managers || []).filter(m => {
        const mRoles = m.roles && Array.isArray(m.roles) && m.roles.length > 0
          ? m.roles
          : [m.role];
        return canManageEmployees(mRoles);
      }).length;

      if (managerCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last manager. At least one manager/owner/lead_developer must exist.' },
          { status: 400 }
        );
      }
    }

    // Delete the user from Supabase Auth (this will cascade to user_profiles via trigger/FK)
    const { error: deleteError } = await deleteUser(id);

    if (deleteError) {
      console.error('[API] User deletion error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('[API] Employee delete error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
