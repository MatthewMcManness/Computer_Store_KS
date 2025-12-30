import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  createAuthAdminClient,
  inviteUser,
  UserRole,
  isEmployeeRole,
} from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/employees
 * List all employee profiles (role != 'customer')
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
 * POST /api/admin/employees
 * Create a new employee using Supabase invite
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { email, full_name, role, repairshopr_user_id } = body;

  // Validate required fields
  if (!email || !full_name || !role) {
    return NextResponse.json(
      { error: 'Email, full name, and role are required' },
      { status: 400 }
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  // Validate role is an employee role
  if (!isEmployeeRole(role as UserRole)) {
    return NextResponse.json(
      { error: 'Invalid role. Must be admin, technician, or receptionist' },
      { status: 400 }
    );
  }

  try {
    // Use the inviteUser function from supabase-auth.ts
    const { error } = await inviteUser(email, role as UserRole, {
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
