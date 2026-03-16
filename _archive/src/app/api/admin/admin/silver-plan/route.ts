import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getSessionToken } from '@/lib/auth';
import { getCustomerProtectionPlan, setCustomerProtectionPlan, type ProtectionPlanTier } from '@/lib/supabase';
import { createRepairShoprClient, getProtectionPlanAnswerId } from '@/lib/repairshopr';

export const dynamic = 'force-dynamic';

// The custom field name in RepairShopr for protection plan
const PROTECTION_PLAN_FIELD = 'Protection Plan';

/**
 * Validate that a value is a valid protection plan tier
 */
function isValidPlanTier(value: unknown): value is ProtectionPlanTier {
  return value === null || value === 'bronze' || value === 'silver' || value === 'silver-plus' || value === 'gold';
}

/**
 * GET /api/admin/silver-plan
 * Get protection plan status for a customer
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customer_id');

  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
  }

  try {
    const plan = await getCustomerProtectionPlan(parseInt(customerId, 10));
    return NextResponse.json({
      // Legacy field for backwards compatibility
      is_silver_plan: plan?.is_silver_plan ?? false,
      // New tier field
      plan_tier: plan?.plan_tier ?? null,
      plan
    });
  } catch (error) {
    console.error('[API] Protection plan fetch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/silver-plan
 * Set protection plan tier for a customer
 * Updates both Supabase AND RepairShopr (for silver/gold only)
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { customer_id, plan_tier, is_silver_plan } = body;

  if (!customer_id) {
    return NextResponse.json({ error: 'customer_id is required' }, { status: 400 });
  }

  // Support both new plan_tier and legacy is_silver_plan
  let tier: ProtectionPlanTier;
  if (plan_tier !== undefined) {
    if (!isValidPlanTier(plan_tier)) {
      return NextResponse.json(
        { error: 'plan_tier must be null, "bronze", "silver", "silver-plus", or "gold"' },
        { status: 400 }
      );
    }
    tier = plan_tier;
  } else if (typeof is_silver_plan === 'boolean') {
    // Legacy support
    tier = is_silver_plan ? 'silver' : null;
  } else {
    return NextResponse.json(
      { error: 'plan_tier or is_silver_plan is required' },
      { status: 400 }
    );
  }

  try {
    // Update Supabase first
    const plan = await setCustomerProtectionPlan(customer_id, tier);

    if (!plan) {
      return NextResponse.json({ error: 'Failed to update protection plan in database' }, { status: 500 });
    }

    // Also update RepairShopr custom field
    // Note: silver-plus syncs as gold in RepairShopr (silver-plus doesn't exist there)
    // Bronze is Supabase-only for now
    let repairshoprUpdated = false;

    if (tier === 'bronze') {
      // Bronze is Supabase-only, no RepairShopr sync needed
      console.log(`[API] ${tier} plan - skipping RepairShopr update (Supabase-only)`);
      repairshoprUpdated = true;
    } else {
      // All other tiers sync to RepairShopr
      // silver-plus maps to gold in RepairShopr
      const apiToken = await getSessionToken();
      if (!apiToken) {
        console.warn('[API] No API token for RepairShopr sync, but Supabase update succeeded');
        return NextResponse.json({
          success: true,
          is_silver_plan: plan.is_silver_plan,
          plan_tier: plan.plan_tier,
          plan,
          repairshopr_updated: false,
          warning: 'Database updated but RepairShopr sync skipped (session expired)',
        });
      }

      try {
        const client = createRepairShoprClient();

        // First get the current customer to see their properties
        const currentCustomer = await client.getCustomer(apiToken, customer_id);
        console.log(`[API] Current customer ${customer_id} properties:`, JSON.stringify(currentCustomer.properties, null, 2));

        // Map silver-plus to gold for RepairShopr (silver-plus doesn't exist there)
        const repairshoprTier = tier === 'silver-plus' ? 'gold' : tier;

        // Merge with existing properties
        // Use answer ID for dropdowns - RepairShopr expects the ID, not the text
        const existingProperties = currentCustomer.properties || {};
        const answerId = getProtectionPlanAnswerId(repairshoprTier);
        const updatedProperties = {
          ...existingProperties,
          [PROTECTION_PLAN_FIELD]: answerId,
        };

        console.log(`[API] Updating customer ${customer_id} properties to:`, JSON.stringify(updatedProperties, null, 2));
        if (tier === 'silver-plus') {
          console.log(`[API] Note: silver-plus mapped to gold for RepairShopr sync`);
        }

        // Update the customer in RepairShopr
        const updatedCustomer = await client.updateCustomer(apiToken, customer_id, {
          properties: updatedProperties,
        });

        console.log(`[API] RepairShopr update response properties:`, JSON.stringify(updatedCustomer.properties, null, 2));
        repairshoprUpdated = true;
      } catch (rsError) {
        // Log but don't fail - Supabase update succeeded
        console.error('[API] Failed to update RepairShopr:', rsError);
      }
    }

    return NextResponse.json({
      success: true,
      // Legacy field
      is_silver_plan: plan.is_silver_plan,
      // New tier field
      plan_tier: plan.plan_tier,
      plan,
      repairshopr_updated: repairshoprUpdated,
    });
  } catch (error) {
    console.error('[API] Protection plan update error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
