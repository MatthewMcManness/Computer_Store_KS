import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin, createFreshAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/customer-accounts
 * Get customer account by RepairShopr customer ID
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
  const customerId = searchParams.get('customer_id');

  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('customer_accounts')
      .select('id, email, repairshopr_customer_id, first_name, created_at, updated_at')
      .eq('repairshopr_customer_id', parseInt(customerId, 10))
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[API] Customer account fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch account' }, { status: 500 });
    }

    return NextResponse.json({ account: data || null });
  } catch (error) {
    console.error('[API] Customer account error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/customer-accounts
 * Create or update customer portal account
 *
 * This creates/updates BOTH:
 * 1. A Supabase Auth user (for authentication)
 * 2. A user_profiles entry (for role/customer linking)
 *
 * @version 1.0.0 - Initial implementation with bcrypt
 * @version 2.0.0 - 2026-01-14T00:00:00Z - Switched to Supabase Auth for authentication
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { email, password, repairshopr_customer_id, first_name } = body;

  if (!email || !password || !repairshopr_customer_id) {
    return NextResponse.json(
      { error: 'Email, password, and customer ID are required' },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 }
    );
  }

  const normalizedEmail = email.toLowerCase();

  try {
    // Get a fresh admin client for auth operations
    const authClient = createFreshAdminClient();
    if (!authClient) {
      return NextResponse.json({ error: 'Auth not configured' }, { status: 503 });
    }

    // Try to create the user first - this is the most common case for new accounts
    console.log(`[API] Attempting to create Supabase Auth user for: ${normalizedEmail}`);
    const { data: newAuthUser, error: createAuthError } = await authClient.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true, // Auto-confirm email for admin-created accounts
      user_metadata: {
        full_name: first_name || normalizedEmail.split('@')[0],
      },
    });

    if (createAuthError) {
      console.log(`[API] Create user error: ${createAuthError.message}`);

      // Check if user already exists
      if (createAuthError.message?.includes('already') || createAuthError.message?.includes('exists') || createAuthError.message?.includes('registered')) {
        console.log('[API] User already exists, attempting to find and update...');

        // Find the existing user by looking up user_profiles or by paginated search
        const { data: existingProfile } = await supabaseAdmin
          .from('user_profiles')
          .select('id')
          .eq('email', normalizedEmail)
          .single();

        if (existingProfile?.id) {
          console.log(`[API] Found existing profile with ID: ${existingProfile.id}`);
          // Update the existing user's password
          const { error: updateAuthError } = await authClient.auth.admin.updateUserById(
            existingProfile.id,
            { password }
          );

          if (updateAuthError) {
            console.error('[API] Failed to update existing user password:', updateAuthError);
            return NextResponse.json({ error: 'Failed to update account password' }, { status: 500 });
          }

          // Update user_profiles with current customer ID
          await supabaseAdmin
            .from('user_profiles')
            .update({
              full_name: first_name || normalizedEmail.split('@')[0],
              repairshopr_customer_id,
            })
            .eq('id', existingProfile.id);

          // Update or create customer_accounts entry
          const { data: existingAccount } = await supabaseAdmin
            .from('customer_accounts')
            .select('id')
            .eq('repairshopr_customer_id', repairshopr_customer_id)
            .single();

          if (existingAccount) {
            await supabaseAdmin
              .from('customer_accounts')
              .update({ email: normalizedEmail, first_name: first_name || null })
              .eq('repairshopr_customer_id', repairshopr_customer_id);
          } else {
            await supabaseAdmin
              .from('customer_accounts')
              .upsert({ email: normalizedEmail, repairshopr_customer_id, first_name: first_name || null },
                { onConflict: 'email' });
          }

          console.log('[API] Successfully updated existing account');
          return NextResponse.json({
            account: {
              id: existingProfile.id,
              email: normalizedEmail,
              repairshopr_customer_id,
              first_name: first_name || null,
            },
            action: 'updated',
          });
        } else {
          // User exists in auth but not in profiles - try paginated search
          console.log('[API] No profile found, searching auth users...');
          let page = 1;
          let foundUser = null;

          while (!foundUser && page <= 10) { // Max 10 pages to prevent infinite loop
            const { data: usersPage } = await authClient.auth.admin.listUsers({
              page,
              perPage: 100,
            });

            if (!usersPage?.users?.length) break;

            foundUser = usersPage.users.find(u => u.email?.toLowerCase() === normalizedEmail);
            page++;
          }

          if (foundUser) {
            console.log(`[API] Found existing auth user via search: ${foundUser.id}`);
            const { error: updateAuthError } = await authClient.auth.admin.updateUserById(
              foundUser.id,
              { password }
            );

            if (updateAuthError) {
              console.error('[API] Failed to update user password:', updateAuthError);
              return NextResponse.json({ error: 'Failed to update account password' }, { status: 500 });
            }

            // Create user_profiles entry
            await supabaseAdmin
              .from('user_profiles')
              .upsert({
                id: foundUser.id,
                email: normalizedEmail,
                full_name: first_name || normalizedEmail.split('@')[0],
                role: 'customer',
                repairshopr_customer_id,
              }, { onConflict: 'id' });

            // Update customer_accounts
            await supabaseAdmin
              .from('customer_accounts')
              .upsert({ email: normalizedEmail, repairshopr_customer_id, first_name: first_name || null },
                { onConflict: 'email' });

            return NextResponse.json({
              account: {
                id: foundUser.id,
                email: normalizedEmail,
                repairshopr_customer_id,
                first_name: first_name || null,
              },
              action: 'updated',
            });
          }

          // Could not find the user despite "already exists" error
          console.error('[API] User exists but could not be found for update');
          return NextResponse.json({ error: 'Email already in use but could not update' }, { status: 409 });
        }
      }

      // Some other error
      console.error('[API] Supabase Auth create error:', createAuthError);
      return NextResponse.json({ error: 'Failed to create account: ' + createAuthError.message }, { status: 500 });
    }

    if (!newAuthUser?.user) {
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }

    console.log(`[API] Created new auth user: ${newAuthUser.user.id}`);

    // Create user_profiles entry for role and customer linking
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: newAuthUser.user.id,
        email: normalizedEmail,
        full_name: first_name || normalizedEmail.split('@')[0],
        role: 'customer',
        repairshopr_customer_id,
      });

    if (profileError) {
      console.error('[API] User profile create error:', profileError);
      // Don't fail the request - the profile will be created on first login if needed
    }

    // Create customer_accounts entry for backward compatibility
    await supabaseAdmin
      .from('customer_accounts')
      .upsert({ email: normalizedEmail, repairshopr_customer_id, first_name: first_name || null },
        { onConflict: 'email' });

    console.log('[API] Successfully created new customer account');
    return NextResponse.json({
      account: {
        id: newAuthUser.user.id,
        email: normalizedEmail,
        repairshopr_customer_id,
        first_name: first_name || null,
      },
      action: 'created',
    }, { status: 201 });
  } catch (error) {
    console.error('[API] Customer account error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/customer-accounts
 * Delete customer portal account
 */
export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customer_id');

  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin
      .from('customer_accounts')
      .delete()
      .eq('repairshopr_customer_id', parseInt(customerId, 10));

    if (error) {
      console.error('[API] Customer account delete error:', error);
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Customer account error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
