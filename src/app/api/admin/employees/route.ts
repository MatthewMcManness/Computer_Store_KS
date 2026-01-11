import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  createAuthAdminClient,
  inviteUser,
} from '@/lib/supabase-auth';
import {
  BUSINESS_ROLES,
  ADD_ON_ROLES,
  ALL_EMPLOYEE_ROLES,
  isBusinessRole,
  isAddOnRole,
} from '@/types/roles';
import { canManageEmployees } from '@/lib/role-helpers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/employees
 * List all employee profiles (role != 'customer')
 *
 * @returns List of employee profiles
 *
 * @functions_called getCurrentUser, createAuthAdminClient
 * @called_by EmployeesPage
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAuthAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .neq('role', 'customer')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[API] Employee list error:', error);
      return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
    }

    return NextResponse.json({ employees: data || [] });
  } catch (error) {
    console.error('[API] Employee list error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * Validate roles array for employee creation/update.
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

  // If lead_developer without business role, that's OK (superuser)
  // But check for duplicate business roles (only one allowed)
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
 * POST /api/admin/employees
 * Create a new employee using Supabase invite
 *
 * Accepts either:
 * - `roles`: string[] (new multi-role system)
 * - `role`: string (legacy single-role, converted to array)
 *
 * @param request - Request with email, full_name, roles, and optional repairshopr_user_id
 * @returns Created employee profile
 *
 * @functions_called getCurrentUser, validateRoles, inviteUser, createAuthAdminClient
 * @called_by NewEmployeePage
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-01-11T00:00:00Z - Updated for multi-role support
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  // Check permission using new role system with legacy fallback
  const userRoles = user?.roles || (user?.role ? [user.role] : []);
  const hasPermission = canManageEmployees(userRoles) || user?.role === 'admin';

  if (!user || !hasPermission) {
    return NextResponse.json({ error: 'Unauthorized - Management access required' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { email, full_name, roles, role, repairshopr_user_id } = body;

  // Handle both new roles array and legacy single role
  let rolesArray: string[];
  if (roles && Array.isArray(roles)) {
    rolesArray = roles;
  } else if (role) {
    // Legacy single role - convert to array
    rolesArray = [role];
  } else {
    return NextResponse.json(
      { error: 'Roles are required (either roles array or single role)' },
      { status: 400 }
    );
  }

  // Validate required fields
  if (!email || !full_name) {
    return NextResponse.json(
      { error: 'Email and full name are required' },
      { status: 400 }
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  // Validate roles
  const rolesValidation = validateRoles(rolesArray);
  if (!rolesValidation.valid) {
    return NextResponse.json({ error: rolesValidation.error }, { status: 400 });
  }

  try {
    // Use the inviteUser function from supabase-auth.ts
    // Pass the roles array - inviteUser and createUserProfile handle it
    const { error } = await inviteUser(email, rolesArray as any, {
      fullName: full_name,
      repairshoprUserId: repairshopr_user_id ? parseInt(repairshopr_user_id, 10) : undefined,
    });

    if (error) {
      console.error('[API] Employee invite error:', error);

      // Check for specific error messages
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'A user with this email already exists' },
          { status: 409 }
        );
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch the created profile
    const supabase = createAuthAdminClient();
    if (supabase) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      return NextResponse.json(
        {
          message: 'Employee invited successfully. They will receive an email to set their password.',
          employee: profile
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { message: 'Employee invited successfully. They will receive an email to set their password.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Employee create error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
