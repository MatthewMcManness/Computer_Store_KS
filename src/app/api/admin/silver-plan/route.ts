import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getSessionToken } from '@/lib/auth';
import { getCustomerSilverPlan, setCustomerSilverPlan } from '@/lib/supabase';
import { createRepairShoprClient } from '@/lib/repairshopr';

export const dynamic = 'force-dynamic';

// The custom field name in RepairShopr for protection plan
const PROTECTION_PLAN_FIELD = 'Protection Plan';
// RepairShopr dropdown answer ID for "Silver"
const SILVER_PLAN_ANSWER_ID = '4027';

/**
 * GET /api/admin/silver-plan
 * Get silver plan status for a customer
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
    const plan = await getCustomerSilverPlan(parseInt(customerId, 10));
    return NextResponse.json({
      is_silver_plan: plan?.is_silver_plan ?? false,
      plan
    });
  } catch (error) {
    console.error('[API] Silver plan fetch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/silver-plan
 * Set silver plan status for a customer
 * Updates both Supabase AND RepairShopr
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiToken = await getSessionToken();
  if (!apiToken) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { customer_id, is_silver_plan } = body;

  if (!customer_id || typeof is_silver_plan !== 'boolean') {
    return NextResponse.json(
      { error: 'customer_id and is_silver_plan (boolean) are required' },
      { status: 400 }
    );
  }

  try {
    // Update Supabase first
    const plan = await setCustomerSilverPlan(customer_id, is_silver_plan);

    if (!plan) {
      return NextResponse.json({ error: 'Failed to update silver plan in database' }, { status: 500 });
    }

    // Also update RepairShopr custom field
    let repairshoprUpdated = false;
    try {
      const client = createRepairShoprClient();

      // First get the current customer to see their properties
      const currentCustomer = await client.getCustomer(apiToken, customer_id);
      console.log(`[API] Current customer ${customer_id} properties:`, JSON.stringify(currentCustomer.properties, null, 2));

      // Merge with existing properties
      // Use answer ID for dropdowns - RepairShopr expects the ID, not the text
      const existingProperties = currentCustomer.properties || {};
      const updatedProperties = {
        ...existingProperties,
        [PROTECTION_PLAN_FIELD]: is_silver_plan ? SILVER_PLAN_ANSWER_ID : '',
      };

      console.log(`[API] Updating customer ${customer_id} properties to:`, JSON.stringify(updatedProperties, null, 2));

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

    return NextResponse.json({
      success: true,
      is_silver_plan: plan.is_silver_plan,
      plan,
      repairshopr_updated: repairshoprUpdated,
    });
  } catch (error) {
    console.error('[API] Silver plan update error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
