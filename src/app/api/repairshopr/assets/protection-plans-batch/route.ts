import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo } from '@/lib/auth';
import { supabaseAdmin, type ProtectionPlanTier } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * POST /api/repairshopr/assets/protection-plans-batch
 * Get protection plan tiers for multiple assets
 *
 * Body: { asset_ids: number[] }
 * Returns: { tiers: Record<number, ProtectionPlanTier> }
 *
 * Used for batch fetching asset protection plan tiers when displaying ticket lists
 * with priority-based sorting. Returns the protection plan tier for each asset.
 *
 * @param request - Next.js request with JSON body containing asset_ids array
 * @returns NextResponse with map of asset ID to protection plan tier
 *
 * @sideEffects
 * - Reads from asset_protection_plans table
 *
 * @functions_called getEmployeeAuditInfo
 * @called_by TicketsListPage
 *
 * @version 1.0.0 - 2026-01-13T00:00:00Z - Initial implementation
 */
export async function POST(request: NextRequest) {
  // Check employee authentication
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  // Validate asset_ids
  const { asset_ids } = body;
  if (!Array.isArray(asset_ids) || asset_ids.length === 0) {
    return NextResponse.json({ tiers: {} });
  }

  // Validate all IDs are numbers
  const validIds = asset_ids.filter(
    (id): id is number => typeof id === 'number' && !isNaN(id)
  );

  if (validIds.length === 0) {
    return NextResponse.json({ tiers: {} });
  }

  try {
    // Get protection plan tiers for all assets from asset_protection_plans table
    const { data: plans, error } = await supabaseAdmin
      .from('asset_protection_plans')
      .select('repairshopr_asset_id, plan_tier')
      .in('repairshopr_asset_id', validIds);

    if (error) {
      console.error('[API] Asset protection plans batch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch asset protection plans' },
        { status: 500 }
      );
    }

    // Convert to plain object for JSON response
    const tiers: Record<number, ProtectionPlanTier> = {};
    for (const plan of plans || []) {
      tiers[plan.repairshopr_asset_id] = plan.plan_tier;
    }

    return NextResponse.json({ tiers });
  } catch (error) {
    console.error('[API] Asset protection plans batch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset protection plans' },
      { status: 500 }
    );
  }
}
