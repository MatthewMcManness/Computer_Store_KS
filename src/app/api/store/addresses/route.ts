/**
 * Saved addresses API route (authentication required).
 *
 * GET: Lists the user's saved shipping/billing addresses.
 * POST: Creates a new saved address.
 * PUT: Updates an existing address by ID.
 * DELETE: Deletes a saved address by ID.
 *
 * When setting is_default=true on a new or updated address, any existing
 * default address for that user is unset first.
 *
 * @param request - NextRequest with JSON body for POST/PUT/DELETE
 * @returns NextResponse with addresses or operation result
 *
 * @sideEffects
 * - Reads/writes store_addresses table via supabaseAdmin
 *
 * @functions_called getCurrentUser, supabaseAdmin
 * @called_by Checkout page (address selection), account settings
 *
 * @version 1.0.0 - 2026-03-02T19:01:25Z - Initial implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const addressSchema = z.object({
  label: z.string().min(1).max(50),
  full_name: z.string().min(1).max(100),
  address_line1: z.string().min(1).max(200),
  address_line2: z.string().max(200).optional().nullable(),
  city: z.string().min(1).max(100),
  state: z.string().min(2).max(2),
  zip_code: z.string().min(5).max(10),
  phone: z.string().max(20).optional().nullable(),
  is_default: z.boolean().optional().default(false),
});

const updateAddressSchema = addressSchema.partial().extend({
  id: z.string().uuid(),
});

const deleteAddressSchema = z.object({
  id: z.string().uuid(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('store_addresses')
      .select('*')
      .eq('user_profile_id', user.supabaseUserId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching addresses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch addresses' },
        { status: 500 }
      );
    }

    return NextResponse.json({ addresses: data || [] });
  } catch (error) {
    console.error('Error in GET /api/store/addresses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const validation = addressSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          errors: validation.error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults first
    if (validation.data.is_default) {
      await supabaseAdmin
        .from('store_addresses')
        .update({ is_default: false })
        .eq('user_profile_id', user.supabaseUserId)
        .eq('is_default', true);
    }

    const { data, error } = await supabaseAdmin
      .from('store_addresses')
      .insert({
        user_profile_id: user.supabaseUserId,
        ...validation.data,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating address:', error);
      return NextResponse.json(
        { error: 'Failed to create address' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, address: data });
  } catch (error) {
    console.error('Error in POST /api/store/addresses:', error);
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const validation = updateAddressSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          errors: validation.error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { id, ...updateData } = validation.data;

    // Verify the address belongs to this user
    const { data: existing } = await supabaseAdmin
      .from('store_addresses')
      .select('id')
      .eq('id', id)
      .eq('user_profile_id', user.supabaseUserId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    // If setting as default, unset other defaults first
    if (updateData.is_default) {
      await supabaseAdmin
        .from('store_addresses')
        .update({ is_default: false })
        .eq('user_profile_id', user.supabaseUserId)
        .eq('is_default', true)
        .neq('id', id);
    }

    const { data, error } = await supabaseAdmin
      .from('store_addresses')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating address:', error);
      return NextResponse.json(
        { error: 'Failed to update address' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, address: data });
  } catch (error) {
    console.error('Error in PUT /api/store/addresses:', error);
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const validation = deleteAddressSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid address ID' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('store_addresses')
      .delete()
      .eq('id', validation.data.id)
      .eq('user_profile_id', user.supabaseUserId);

    if (error) {
      console.error('Error deleting address:', error);
      return NextResponse.json(
        { error: 'Failed to delete address' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/store/addresses:', error);
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    );
  }
}
