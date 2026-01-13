import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo } from '@/lib/auth';
import { getEffectiveCustomerPlanTiers, type ProtectionPlanTier } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * POST /api/repairshopr/customers/protection-plans-batch
 * Get protection plan tiers for multiple customers
 *
 * Body: { customer_ids: number[] }
 * Returns: { tiers: Record<number, ProtectionPlanTier> }
 *
 * Used for batch fetching protection plan tiers when displaying ticket lists
 * with priority-based sorting.
 *
 * @param request - Next.js request with JSON body containing customer_ids array
 * @returns NextResponse with map of customer ID to protection plan tier
 *
 * @sideEffects
 * - Reads from customer_silver_plans and asset_protection_plans tables
 *
 * @functions_called getEmployeeAuditInfo, getEffectiveCustomerPlanTiers
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

  // Validate customer_ids
  const { customer_ids } = body;
  if (!Array.isArray(customer_ids) || customer_ids.length === 0) {
    return NextResponse.json({ tiers: {} });
  }

  // Validate all IDs are numbers
  const validIds = customer_ids.filter(
    (id): id is number => typeof id === 'number' && !isNaN(id)
  );

  if (validIds.length === 0) {
    return NextResponse.json({ tiers: {} });
  }

  try {
    // Get protection plan tiers for all customers
    const tiersMap = await getEffectiveCustomerPlanTiers(validIds);

    // Convert Map to plain object for JSON response
    const tiers: Record<number, ProtectionPlanTier> = {};
    for (const [customerId, tier] of tiersMap.entries()) {
      tiers[customerId] = tier;
    }

    return NextResponse.json({ tiers });
  } catch (error) {
    console.error('[API] Protection plans batch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch protection plans' },
      { status: 500 }
    );
  }
}
