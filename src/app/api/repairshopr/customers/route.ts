import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getSessionToken } from '@/lib/auth';
import { createRepairShoprClient, RepairShoprAPIError, getProtectionPlanTier } from '@/lib/repairshopr';
import { supabaseAdmin, getCustomerProtectionPlans, setCustomerProtectionPlan, type ProtectionPlanTier } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

/**
 * GET /api/repairshopr/customers
 * Search for customers by query string
 * Query params: ?q=search_term
 *
 * Auto-syncs silver plan status from RepairShopr custom fields to Supabase
 */
export async function GET(request: NextRequest) {
  // Check employee authentication
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiToken = await getSessionToken();
  if (!apiToken) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }

  // Get search query
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || !query.trim()) {
    return NextResponse.json(
      { error: 'Search query parameter "q" is required' },
      { status: 400 }
    );
  }

  try {
    const client = createRepairShoprClient();
    const customers = await client.searchCustomers(apiToken, query);

    // Debug: Log what RepairShopr returns for first customer
    if (customers.length > 0) {
      console.log(`[API] Customer search results (first customer):`, JSON.stringify({
        id: customers[0].id,
        fullname: customers[0].fullname,
        properties: customers[0].properties,
        custom_fields: customers[0].custom_fields,
        customer_fields: customers[0].customer_fields,
        tags: customers[0].tags,
        tag_list: customers[0].tag_list,
      }, null, 2));
    }

    // Get existing protection plan statuses from Supabase
    const customerIds = customers.map(c => c.id);
    const existingPlans = await getCustomerProtectionPlans(customerIds);
    const planTierMap = new Map<number, ProtectionPlanTier>(
      existingPlans.map(sp => [sp.repairshopr_customer_id, sp.plan_tier])
    );

    // Check each customer for protection plan status and auto-sync
    const customersWithPlanStatus = await Promise.all(
      customers.map(async (customer) => {
        // Check if RepairShopr indicates a plan tier (silver or gold - bronze is Supabase-only)
        const apiPlanTier = getProtectionPlanTier(customer);
        const dbPlanTier = planTierMap.get(customer.id) ?? null;

        // Debug: Log plan tier detection for each customer
        console.log(`[API] Customer ${customer.id} (${customer.fullname}): API tier=${apiPlanTier}, DB tier=${dbPlanTier}`);

        // Determine effective plan tier (DB takes priority for bronze, API for silver/gold)
        let effectiveTier: ProtectionPlanTier = dbPlanTier;

        // If API says silver/gold and DB doesn't match, sync to DB
        if (apiPlanTier && apiPlanTier !== dbPlanTier && supabaseAdmin) {
          console.log(`[API] Syncing plan tier "${apiPlanTier}" to DB for customer ${customer.id}`);
          await setCustomerProtectionPlan(customer.id, apiPlanTier);
          effectiveTier = apiPlanTier;
        } else if (apiPlanTier && !dbPlanTier) {
          effectiveTier = apiPlanTier;
        }

        // Return customer with plan tier from best source
        return {
          ...customer,
          plan_tier: effectiveTier,
          is_silver_plan: effectiveTier === 'silver' || effectiveTier === 'gold', // Legacy field
        };
      })
    );

    return NextResponse.json({ customers: customersWithPlanStatus });
  } catch (error) {
    if (error instanceof RepairShoprAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('[API] Customer search error:', error);
    return NextResponse.json(
      { error: 'Failed to search customers' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/repairshopr/customers
 * Create a new customer
 * Body: CreateCustomerInput + optional password field
 */
export async function POST(request: NextRequest) {
  // Check employee authentication
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiToken = await getSessionToken();
  if (!apiToken) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
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

  // Extract password field (for optional portal account creation)
  const { password, ...customerData } = body;

  // Validate required fields
  if (!customerData.firstname || !customerData.lastname || !customerData.email) {
    return NextResponse.json(
      { error: 'First name, last name, and email are required' },
      { status: 400 }
    );
  }

  try {
    // Step 1: Create customer in RepairShopr
    const client = createRepairShoprClient();
    const customer = await client.createCustomer(apiToken, customerData);

    // Step 2: If password provided, create customer portal account in Supabase
    let portalAccountCreated = false;

    if (password && password.trim() && supabaseAdmin) {
      try {
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create account in Supabase
        const { error: insertError } = await supabaseAdmin
          .from('customer_accounts')
          .insert({
            email: customerData.email.toLowerCase(),
            password_hash: passwordHash,
            repairshopr_customer_id: customer.id,
            first_name: customerData.firstname,
          });

        if (!insertError) {
          portalAccountCreated = true;
        } else {
          console.error('[API] Failed to create customer portal account:', insertError);
        }
      } catch (error) {
        console.error('[API] Error creating customer portal account:', error);
      }
    }

    return NextResponse.json(
      {
        customer,
        portal_account_created: portalAccountCreated,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof RepairShoprAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('[API] Customer creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
