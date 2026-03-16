import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo, getSessionToken } from '@/lib/auth';
import { supabaseAdmin, getEffectiveCustomerPlanTiers, type ProtectionPlanTier } from '@/lib/supabase';
import { createRepairShoprClient, getApiToken, type RepairShoprCustomer } from '@/lib/repairshopr';

export const dynamic = 'force-dynamic';

const tierHierarchy: Record<string, number> = { 'silver-plus': 3, 'silver': 2, 'eset': 1 };

/**
 * GET /api/repairshopr/families/[id]
 * Get a single family with its customers and plan tier
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing family ID
 * @returns Family details with customers list
 *
 * @sideEffects
 * - Queries Supabase for family and customer data
 * - Fetches customer details from RepairShopr API
 *
 * @version 1.0.0 - 2026-01-12T00:00:00Z - Initial implementation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check employee authentication
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get API token
  const apiToken = getApiToken(await getSessionToken());
  if (!apiToken) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const { id } = await params;
  const familyId = parseInt(id, 10);

  if (isNaN(familyId)) {
    return NextResponse.json({ error: 'Invalid family ID' }, { status: 400 });
  }

  try {
    // Families are location-agnostic — no location filtering
    const { data: family, error: familyError } = await supabaseAdmin
      .from('families')
      .select('id, name')
      .eq('id', familyId)
      .single();

    if (familyError || !family) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    }

    // Get customer IDs for this family
    const { data: customerRecords, error: customerError } = await supabaseAdmin
      .from('rs_customers')
      .select('repairshopr_id')
      .eq('family_id', familyId);

    if (customerError) {
      console.error('[API] Error fetching family customers:', customerError);
      return NextResponse.json({ error: 'Failed to load family customers' }, { status: 500 });
    }

    // Fetch full customer details from RepairShopr
    const client = createRepairShoprClient();
    const customers: RepairShoprCustomer[] = [];

    if (customerRecords && customerRecords.length > 0) {
      for (const record of customerRecords) {
        try {
          const customer = await client.getCustomer(apiToken, record.repairshopr_id);
          if (customer) {
            customers.push(customer);
          }
        } catch (err) {
          console.error(`[API] Failed to fetch customer ${record.repairshopr_id}:`, err);
        }
      }
    }

    // Calculate highest plan tier among all customers
    const customerIds = customerRecords?.map(c => c.repairshopr_id) || [];
    let highestTier: ProtectionPlanTier = null;

    if (customerIds.length > 0) {
      const planTierMap = await getEffectiveCustomerPlanTiers(customerIds);
      for (const customerId of customerIds) {
        const tier = planTierMap.get(customerId) ?? null;
        if (tier && (!highestTier || (tierHierarchy[tier] ?? 0) > (tierHierarchy[highestTier] ?? 0))) {
          highestTier = tier;
        }
      }
    }

    return NextResponse.json({
      family: {
        id: family.id,
        name: family.name,
        customerCount: customers.length,
        plan_tier: highestTier,
      },
      customers,
    });
  } catch (error) {
    console.error('[API] Family detail error:', error);
    return NextResponse.json({ error: 'Failed to load family' }, { status: 500 });
  }
}

/**
 * PUT /api/repairshopr/families/[id]
 * Update a family's name
 *
 * @param request - Next.js request with JSON body { name: string }
 * @param params - Route parameters containing family ID
 * @returns Updated family data
 *
 * @sideEffects
 * - Updates family record in Supabase
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
  const familyId = parseInt(id, 10);

  if (isNaN(familyId)) {
    return NextResponse.json({ error: 'Invalid family ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Family name is required' }, { status: 400 });
    }

    // Check family exists
    const { data: existingFamily, error: checkError } = await supabaseAdmin
      .from('families')
      .select('id')
      .eq('id', familyId)
      .single();

    if (checkError || !existingFamily) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    }

    // Update family
    const { data: family, error: updateError } = await supabaseAdmin
      .from('families')
      .update({ name: name.trim() })
      .eq('id', familyId)
      .select('id, name')
      .single();

    if (updateError) {
      console.error('[API] Update family error:', updateError);
      return NextResponse.json({ error: 'Failed to update family' }, { status: 500 });
    }

    return NextResponse.json({ family });
  } catch (error) {
    console.error('[API] Update family error:', error);
    return NextResponse.json({ error: 'Failed to update family' }, { status: 500 });
  }
}

/**
 * DELETE /api/repairshopr/families/[id]
 * Delete a family (only if no customers are assigned)
 *
 * @param request - Next.js request
 * @param params - Route parameters containing family ID
 * @returns Success message or error
 *
 * @sideEffects
 * - Deletes family record from Supabase
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
  const familyId = parseInt(id, 10);

  if (isNaN(familyId)) {
    return NextResponse.json({ error: 'Invalid family ID' }, { status: 400 });
  }

  try {
    // Check family exists
    const { data: existingFamily, error: checkError } = await supabaseAdmin
      .from('families')
      .select('id')
      .eq('id', familyId)
      .single();

    if (checkError || !existingFamily) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    }

    // Check if family has customers
    const { count: customerCount } = await supabaseAdmin
      .from('rs_customers')
      .select('*', { count: 'exact', head: true })
      .eq('family_id', familyId);

    if (customerCount && customerCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete family with assigned customers. Remove customers first.' },
        { status: 400 }
      );
    }

    // Delete family
    const { error: deleteError } = await supabaseAdmin
      .from('families')
      .delete()
      .eq('id', familyId);

    if (deleteError) {
      console.error('[API] Delete family error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete family' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Delete family error:', error);
    return NextResponse.json({ error: 'Failed to delete family' }, { status: 500 });
  }
}
