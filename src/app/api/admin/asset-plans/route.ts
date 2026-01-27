import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getSessionToken } from '@/lib/auth';
import {
  getAssetProtectionPlan,
  getAssetProtectionPlans,
  getCustomerAssetProtectionPlans,
  setAssetProtectionPlan,
  updateAssetEsetStatus,
  deleteAssetProtectionPlan,
  getCustomerProtectionSummary,
  type ProtectionPlanTier,
  type EsetStatus,
} from '@/lib/supabase';
import { createRepairShoprClient, getProtectionPlanAnswerId } from '@/lib/repairshopr';

export const dynamic = 'force-dynamic';

// The custom field name in RepairShopr for protection plan
const PROTECTION_PLAN_FIELD = 'Protection Plan';

/**
 * Validate that a value is a valid protection plan tier
 */
function isValidPlanTier(value: unknown): value is ProtectionPlanTier {
  return value === null || value === 'eset' || value === 'bronze' || value === 'silver' || value === 'silver-plus' || value === 'gold';
}

/**
 * Validate that a value is a valid ESET status
 */
function isValidEsetStatus(value: unknown): value is EsetStatus {
  return value === null || value === 'protected' || value === 'expired' || value === 'unprotected';
}

/**
 * GET /api/admin/asset-plans
 * Get protection plan for an asset or all assets for a customer
 *
 * Query params:
 *   - asset_id: Get plan for specific asset
 *   - customer_id: Get all plans for a customer's assets
 *   - summary: If true with customer_id, get summary only
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const assetId = searchParams.get('asset_id');
  const customerId = searchParams.get('customer_id');
  const summary = searchParams.get('summary') === 'true';

  try {
    // Get plan for specific asset
    if (assetId) {
      const plan = await getAssetProtectionPlan(parseInt(assetId, 10));
      return NextResponse.json({
        plan,
        plan_tier: plan?.plan_tier ?? null,
        eset_status: plan?.eset_status ?? null,
      });
    }

    // Get all plans for a customer's assets
    if (customerId) {
      const customerIdNum = parseInt(customerId, 10);

      // If summary requested, return aggregated data
      if (summary) {
        const summaryData = await getCustomerProtectionSummary(customerIdNum);
        return NextResponse.json({ summary: summaryData });
      }

      // Otherwise return all plans
      const plans = await getCustomerAssetProtectionPlans(customerIdNum);
      return NextResponse.json({ plans });
    }

    return NextResponse.json({ error: 'asset_id or customer_id required' }, { status: 400 });
  } catch (error) {
    console.error('[API] Asset protection plan fetch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/asset-plans
 * Set or update protection plan for an asset
 *
 * Body:
 *   - asset_id: Required - the asset to update
 *   - customer_id: Required - the customer who owns the asset
 *   - plan_tier: The protection plan tier (null, bronze, silver, silver-plus, gold)
 *   - eset_status: ESET status (null, protected, expired, unprotected)
 *   - eset_expiry: ESET expiry date (ISO string)
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

  const { asset_id, customer_id, plan_tier, eset_status, eset_expiry } = body;

  if (!asset_id) {
    return NextResponse.json({ error: 'asset_id is required' }, { status: 400 });
  }

  if (!customer_id) {
    return NextResponse.json({ error: 'customer_id is required' }, { status: 400 });
  }

  // Validate plan_tier if provided
  if (plan_tier !== undefined && !isValidPlanTier(plan_tier)) {
    return NextResponse.json(
      { error: 'plan_tier must be null, "eset", "silver", or "silver-plus"' },
      { status: 400 }
    );
  }

  // Validate eset_status if provided
  if (eset_status !== undefined && !isValidEsetStatus(eset_status)) {
    return NextResponse.json(
      { error: 'eset_status must be null, "protected", "expired", or "unprotected"' },
      { status: 400 }
    );
  }

  try {
    // Update the asset protection plan in Supabase
    const plan = await setAssetProtectionPlan(
      asset_id,
      customer_id,
      plan_tier ?? null,
      eset_status,
      eset_expiry
    );

    if (!plan) {
      return NextResponse.json({ error: 'Failed to update asset protection plan' }, { status: 500 });
    }

    // Also update customer's RepairShopr custom field if they now have/don't have a paid plan
    // This keeps the customer-level indicator in sync
    let repairshoprUpdated = false;

    if (plan_tier !== undefined) {
      const customerSummary = await getCustomerProtectionSummary(customer_id);
      const paidTiers: ProtectionPlanTier[] = ['silver', 'silver-plus'];

      // Update RepairShopr with the highest tier among all assets
      // Sort by tier hierarchy: silver-plus > silver > eset > null
      const tierHierarchy: Record<string, number> = {
        'silver-plus': 3,
        'silver': 2,
        'eset': 1,
      };

      let highestTier: ProtectionPlanTier = null;
      if (customerSummary?.plan_tiers) {
        for (const tier of customerSummary.plan_tiers) {
          if (tier && (!highestTier || (tierHierarchy[tier] ?? 0) > (tierHierarchy[highestTier] ?? 0))) {
            highestTier = tier;
          }
        }
      }

      // Sync to RepairShopr if it's a paid tier (not bronze)
      if (highestTier && paidTiers.includes(highestTier)) {
        const apiToken = await getSessionToken();
        if (apiToken) {
          try {
            const client = createRepairShoprClient();
            const currentCustomer = await client.getCustomer(apiToken, customer_id);

            // Map silver-plus to gold for RepairShopr
            const repairshoprTier = highestTier === 'silver-plus' ? 'gold' : highestTier;
            const answerId = getProtectionPlanAnswerId(repairshoprTier);

            const updatedProperties = {
              ...currentCustomer.properties,
              [PROTECTION_PLAN_FIELD]: answerId,
            };

            await client.updateCustomer(apiToken, customer_id, {
              properties: updatedProperties,
            });

            repairshoprUpdated = true;
            console.log(`[API] Updated RepairShopr customer ${customer_id} protection plan to ${repairshoprTier}`);
          } catch (rsError) {
            console.error('[API] Failed to update RepairShopr:', rsError);
          }
        }
      } else if (!highestTier || highestTier === 'eset') {
        // Clear RepairShopr protection plan field if no paid plans (ESET is not a paid plan)
        const apiToken = await getSessionToken();
        if (apiToken) {
          try {
            const client = createRepairShoprClient();
            const currentCustomer = await client.getCustomer(apiToken, customer_id);

            const updatedProperties = {
              ...currentCustomer.properties,
              [PROTECTION_PLAN_FIELD]: '', // Clear the field
            };

            await client.updateCustomer(apiToken, customer_id, {
              properties: updatedProperties,
            });

            repairshoprUpdated = true;
            console.log(`[API] Cleared RepairShopr customer ${customer_id} protection plan`);
          } catch (rsError) {
            console.error('[API] Failed to clear RepairShopr protection plan:', rsError);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      plan,
      repairshopr_updated: repairshoprUpdated,
    });
  } catch (error) {
    console.error('[API] Asset protection plan update error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/asset-plans
 * Update ESET status only for an asset
 *
 * Body:
 *   - asset_id: Required - the asset to update
 *   - eset_status: ESET status (null, protected, expired, unprotected)
 *   - eset_expiry: ESET expiry date (ISO string)
 */
export async function PATCH(request: NextRequest) {
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

  const { asset_id, eset_status, eset_expiry } = body;

  if (!asset_id) {
    return NextResponse.json({ error: 'asset_id is required' }, { status: 400 });
  }

  if (!isValidEsetStatus(eset_status)) {
    return NextResponse.json(
      { error: 'eset_status must be null, "protected", "expired", or "unprotected"' },
      { status: 400 }
    );
  }

  try {
    const plan = await updateAssetEsetStatus(asset_id, eset_status, eset_expiry);

    if (!plan) {
      return NextResponse.json({ error: 'Asset not found or update failed' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error('[API] Asset ESET status update error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/asset-plans
 * Delete protection plan for an asset
 *
 * Query params:
 *   - asset_id: Required - the asset to remove plan from
 *   - customer_id: Required - to update RepairShopr sync
 */
export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const assetId = searchParams.get('asset_id');
  const customerId = searchParams.get('customer_id');

  if (!assetId) {
    return NextResponse.json({ error: 'asset_id is required' }, { status: 400 });
  }

  try {
    const success = await deleteAssetProtectionPlan(parseInt(assetId, 10));

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete asset protection plan' }, { status: 500 });
    }

    // Update RepairShopr if customer_id provided
    if (customerId) {
      const customerIdNum = parseInt(customerId, 10);
      const customerSummary = await getCustomerProtectionSummary(customerIdNum);

      // If no more paid plans, clear RepairShopr field
      if (!customerSummary?.has_paid_plan) {
        const apiToken = await getSessionToken();
        if (apiToken) {
          try {
            const client = createRepairShoprClient();
            const currentCustomer = await client.getCustomer(apiToken, customerIdNum);

            const updatedProperties = {
              ...currentCustomer.properties,
              [PROTECTION_PLAN_FIELD]: '',
            };

            await client.updateCustomer(apiToken, customerIdNum, {
              properties: updatedProperties,
            });

            console.log(`[API] Cleared RepairShopr customer ${customerIdNum} protection plan`);
          } catch (rsError) {
            console.error('[API] Failed to clear RepairShopr protection plan:', rsError);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Asset protection plan delete error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
