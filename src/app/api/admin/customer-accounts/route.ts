import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcrypt';

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

  try {
    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if account exists
    const { data: existing } = await supabaseAdmin
      .from('customer_accounts')
      .select('id')
      .eq('repairshopr_customer_id', repairshopr_customer_id)
      .single();

    if (existing) {
      // Update existing account
      const { data, error } = await supabaseAdmin
        .from('customer_accounts')
        .update({
          email: email.toLowerCase(),
          password_hash: passwordHash,
          first_name: first_name || null,
        })
        .eq('repairshopr_customer_id', repairshopr_customer_id)
        .select('id, email, repairshopr_customer_id, first_name, created_at, updated_at')
        .single();

      if (error) {
        console.error('[API] Customer account update error:', error);
        return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
      }

      return NextResponse.json({ account: data, action: 'updated' });
    } else {
      // Create new account
      const { data, error } = await supabaseAdmin
        .from('customer_accounts')
        .insert({
          email: email.toLowerCase(),
          password_hash: passwordHash,
          repairshopr_customer_id,
          first_name: first_name || null,
        })
        .select('id, email, repairshopr_customer_id, first_name, created_at, updated_at')
        .single();

      if (error) {
        console.error('[API] Customer account create error:', error);
        if (error.code === '23505') {
          return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
      }

      return NextResponse.json({ account: data, action: 'created' }, { status: 201 });
    }
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
