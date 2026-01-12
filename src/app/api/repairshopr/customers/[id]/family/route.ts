import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo, getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { getEffectiveLocationId } from '@/lib/location-helpers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/repairshopr/customers/[id]/family
 * Get the family a customer belongs to
 *
 * @param request - Next.js request
 * @param params - Route parameters containing customer ID
 * @returns Family info or null if not assigned
 *
 * @version 1.0.0 - 2026-01-12T00:00:00Z - Initial implementation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const { id } = await params;
  const customerId = parseInt(id, 10);

  if (isNaN(customerId)) {
    return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
  }

  try {
    // Get customer record with family info
    const { data: customer, error } = await supabaseAdmin
      .from('rs_customers')
      .select('family_id, families(id, name)')
      .eq('repairshopr_id', customerId)
      .single();

    if (error || !customer) {
      return NextResponse.json({ family: null });
    }

    return NextResponse.json({
      family: customer.families || null,
    });
  } catch (error) {
    console.error('[API] Get customer family error:', error);
    return NextResponse.json({ error: 'Failed to get customer family' }, { status: 500 });
  }
}

/**
 * PUT /api/repairshopr/customers/[id]/family
 * Assign a customer to a family
 *
 * @param request - Next.js request with JSON body { family_id: number }
 * @param params - Route parameters containing customer ID
 * @returns Updated customer record
 *
 * @sideEffects
 * - Updates rs_customers record in Supabase
 *
 * @version 1.0.0 - 2026-01-12T00:00:00Z - Initial implementation
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const { id } = await params;
  const customerId = parseInt(id, 10);

  if (isNaN(customerId)) {
    return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { family_id } = body;

    if (!family_id || typeof family_id !== 'number') {
      return NextResponse.json({ error: 'family_id is required' }, { status: 400 });
    }

    // Get current user for location check
    const currentUser = await getCurrentUser();
    const userRoles = currentUser?.roles || [];
    const userLocationId = currentUser?.location_id || null;
    const effectiveLocationId = await getEffectiveLocationId(userRoles, userLocationId);

    // Verify family exists and user has access
    const { data: family, error: familyError } = await supabaseAdmin
      .from('families')
      .select('id, location_id')
      .eq('id', family_id)
      .single();

    if (familyError || !family) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    }

    if (effectiveLocationId && family.location_id !== effectiveLocationId) {
      return NextResponse.json({ error: 'Access denied to this family' }, { status: 403 });
    }

    // Update customer's family
    const { data: updatedCustomer, error: updateError } = await supabaseAdmin
      .from('rs_customers')
      .update({ family_id })
      .eq('repairshopr_id', customerId)
      .select('repairshopr_id, family_id')
      .single();

    if (updateError) {
      console.error('[API] Update customer family error:', updateError);
      return NextResponse.json({ error: 'Failed to assign customer to family' }, { status: 500 });
    }

    return NextResponse.json({ customer: updatedCustomer });
  } catch (error) {
    console.error('[API] Assign customer family error:', error);
    return NextResponse.json({ error: 'Failed to assign customer to family' }, { status: 500 });
  }
}

/**
 * DELETE /api/repairshopr/customers/[id]/family
 * Remove a customer from their family
 *
 * @param request - Next.js request
 * @param params - Route parameters containing customer ID
 * @returns Success message
 *
 * @sideEffects
 * - Sets family_id to null in rs_customers record
 *
 * @version 1.0.0 - 2026-01-12T00:00:00Z - Initial implementation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const { id } = await params;
  const customerId = parseInt(id, 10);

  if (isNaN(customerId)) {
    return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
  }

  try {
    // Get current user for location check
    const currentUser = await getCurrentUser();
    const userRoles = currentUser?.roles || [];
    const userLocationId = currentUser?.location_id || null;
    const effectiveLocationId = await getEffectiveLocationId(userRoles, userLocationId);

    // Get the customer's current family to check access
    const { data: customer, error: checkError } = await supabaseAdmin
      .from('rs_customers')
      .select('family_id, location_id')
      .eq('repairshopr_id', customerId)
      .single();

    if (checkError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    if (effectiveLocationId && customer.location_id !== effectiveLocationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!customer.family_id) {
      return NextResponse.json({ success: true, message: 'Customer is not in a family' });
    }

    // Remove from family
    const { error: updateError } = await supabaseAdmin
      .from('rs_customers')
      .update({ family_id: null })
      .eq('repairshopr_id', customerId);

    if (updateError) {
      console.error('[API] Remove customer from family error:', updateError);
      return NextResponse.json({ error: 'Failed to remove customer from family' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Remove customer family error:', error);
    return NextResponse.json({ error: 'Failed to remove customer from family' }, { status: 500 });
  }
}
