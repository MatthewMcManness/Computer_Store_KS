import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createAuthAdminClient, createUserProfile } from '@/lib/supabase-auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/customers/portal-account
 * Check if a customer has a portal account by RepairShopr customer ID
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const repairshoprCustomerId = searchParams.get('repairshopr_customer_id');

  if (!repairshoprCustomerId) {
    return NextResponse.json(
      { error: 'RepairShopr customer ID required' },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, full_name, role, repairshopr_customer_id, created_at')
      .eq('repairshopr_customer_id', parseInt(repairshoprCustomerId, 10))
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[API] Portal account fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch account' }, { status: 500 });
    }

    return NextResponse.json({
      hasAccount: !!data,
      profile: data || null,
    });
  } catch (error) {
    console.error('[API] Portal account check error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/customers/portal-account
 * Create a portal account for an existing RepairShopr customer
 * Sends an invite email for password setup
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const authClient = createAuthAdminClient();
  if (!authClient || !supabaseAdmin) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { repairshoprCustomerId, email, fullName } = body;

  if (!repairshoprCustomerId || !email) {
    return NextResponse.json(
      { error: 'RepairShopr customer ID and email are required' },
      { status: 400 }
    );
  }

  try {
    // Check if account already exists for this customer
    const { data: existingByCustomerId } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email')
      .eq('repairshopr_customer_id', repairshoprCustomerId)
      .single();

    if (existingByCustomerId) {
      return NextResponse.json(
        { error: 'Portal account already exists for this customer' },
        { status: 409 }
      );
    }

    // Check if email is already in use by another account
    const { data: existingByEmail } = await supabaseAdmin
      .from('user_profiles')
      .select('id, repairshopr_customer_id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingByEmail) {
      return NextResponse.json(
        { error: 'Email already in use by another account' },
        { status: 409 }
      );
    }

    // Create Supabase Auth user via invite
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const { data: inviteData, error: inviteError } = await authClient.auth.admin.inviteUserByEmail(
      email.toLowerCase(),
      {
        redirectTo: `${appUrl}/auth/accept-invite`,
        data: {
          role: 'customer',
          full_name: fullName,
          repairshopr_customer_id: repairshoprCustomerId,
        },
      }
    );

    if (inviteError) {
      console.error('[API] Invite error:', inviteError);

      // Handle specific error cases
      if (inviteError.message.includes('already been registered')) {
        return NextResponse.json(
          { error: 'Email already registered in auth system' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: `Failed to send invite: ${inviteError.message}` },
        { status: 500 }
      );
    }

    if (!inviteData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create user profile
    const profile = await createUserProfile(
      inviteData.user.id,
      email.toLowerCase(),
      'customer',
      {
        fullName,
        repairshoprCustomerId,
      }
    );

    if (!profile) {
      console.error('[API] Failed to create user profile');
      // Attempt to clean up the auth user
      await authClient.auth.admin.deleteUser(inviteData.user.id);
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    console.log('[API] Portal account created:', {
      userId: inviteData.user.id,
      email: email.toLowerCase(),
      repairshoprCustomerId,
    });

    return NextResponse.json(
      {
        success: true,
        profile,
        message: 'Portal account created. Invite email sent.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Portal account creation error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
