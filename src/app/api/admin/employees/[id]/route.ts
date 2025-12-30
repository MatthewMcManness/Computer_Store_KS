import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  createAuthAdminClient,
  deleteUser,
  updateUserProfile,
  UserRole,
  isEmployeeRole,
} from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/employees/[id]
 * Get a single employee profile
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
 * Update employee profile (role change)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
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

  const { role, full_name, repairshopr_user_id } = body;

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

    // Check role change validation
    if (role && role !== targetEmployee.role) {
      // Validate role is an employee role
      if (!isEmployeeRole(role as UserRole)) {
        return NextResponse.json(
          { error: 'Invalid role. Must be admin, technician, or receptionist' },
          { status: 400 }
        );
      }

      // Get current user's profile to compare IDs
      const { data: currentUserProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', user.email)
        .single();

      // Prevent self-demotion from admin
      if (currentUserProfile && currentUserProfile.id === id && targetEmployee.role === 'admin' && role !== 'admin') {
        return NextResponse.json(
          { error: 'You cannot demote yourself from admin role' },
          { status: 400 }
        );
      }

      // Ensure at least one admin remains if demoting an admin
      if (targetEmployee.role === 'admin' && role !== 'admin') {
        const { data: admins, error: adminError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('role', 'admin');

        if (adminError) {
          console.error('[API] Admin count error:', adminError);
          return NextResponse.json({ error: 'Failed to verify admin count' }, { status: 500 });
        }

        if (!admins || admins.length <= 1) {
          return NextResponse.json(
            { error: 'Cannot demote the last admin. At least one admin must exist.' },
            { status: 400 }
          );
        }
      }
    }

    // Build update object
    const updates: Partial<{
      role: UserRole;
      full_name: string | null;
      repairshopr_user_id: number | null;
    }> = {};

    if (role) updates.role = role as UserRole;
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
 * Delete an employee (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
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

    // Ensure at least one admin remains if deleting an admin
    if (targetEmployee.role === 'admin') {
      const { data: admins, error: adminError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('role', 'admin');

      if (adminError) {
        console.error('[API] Admin count error:', adminError);
        return NextResponse.json({ error: 'Failed to verify admin count' }, { status: 500 });
      }

      if (!admins || admins.length <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last admin. At least one admin must exist.' },
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
