import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo, getSessionToken, getCurrentUser } from '@/lib/auth';
import { createRepairShoprClient, RepairShoprAPIError, getProtectionPlanTier, getApiToken } from '@/lib/repairshopr';
import { supabaseAdmin, getCustomerProtectionPlans, setCustomerProtectionPlan, getEffectiveCustomerPlanTiers, type ProtectionPlanTier } from '@/lib/supabase';
import { logCustomerAction } from '@/lib/audit';
import { getEffectiveLocationId } from '@/lib/location-helpers';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

/**
 * GET /api/repairshopr/customers
 * Search for customers by query string or list all customers with pagination
 * Query params:
 *   - ?q=search_term - Search for customers (uses RepairShopr API)
 *   - ?page=1&per_page=50 - List all customers with pagination (uses Supabase)
 *
 * Auto-syncs silver plan status from RepairShopr custom fields to Supabase
 */
export async function GET(request: NextRequest) {
  // Check employee authentication and get audit info
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get search query and pagination params
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('per_page') || '50', 10);
  const planTierFilter = searchParams.get('plan_tier') as ProtectionPlanTier | null;

  // If no search query, list all customers from Supabase with pagination
  if (!query || !query.trim()) {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    try {
      // Get current user for location filtering
      const currentUser = await getCurrentUser();
      const userRoles = currentUser?.roles || [];
      const userLocationId = currentUser?.location_id || null;

      // Get the effective location ID to filter by
      const effectiveLocationId = await getEffectiveLocationId(userRoles, userLocationId);

      // Build base query with location filter
      let countQuery = supabaseAdmin
        .from('rs_customers')
        .select('*', { count: 'exact', head: true });

      // Customers are location-agnostic — no location filter applied

      // Get total count
      const { count: totalInDb } = await countQuery;

      // Fetch ALL customers in batches (Supabase limits to 1000 per request)
      const BATCH_SIZE = 1000;
      const allCustomers: Array<{
        repairshopr_id: number;
        firstname: string;
        lastname: string;
        email: string;
        phone: string;
        mobile: string;
        address: string;
        address_2: string;
        city: string;
        state: string;
        zip: string;
        business_name: string;
        created_at: string;
        updated_at: string;
      }> = [];

      const totalBatches = Math.ceil((totalInDb || 0) / BATCH_SIZE);

      for (let batch = 0; batch < totalBatches; batch++) {
        const from = batch * BATCH_SIZE;
        const to = from + BATCH_SIZE - 1;

        let batchQuery = supabaseAdmin
          .from('rs_customers')
          .select('repairshopr_id, firstname, lastname, email, phone, mobile, address, address_2, city, state, zip, business_name, created_at, updated_at');

        // Customers are location-agnostic — no location filter applied

        const { data: batchCustomers, error: batchError } = await batchQuery
          .order('lastname', { ascending: true })
          .order('firstname', { ascending: true })
          .range(from, to);

        if (batchError) {
          console.error(`[API] Supabase customer batch ${batch} error:`, batchError);
          return NextResponse.json({ error: 'Failed to load customers' }, { status: 500 });
        }

        if (batchCustomers) {
          allCustomers.push(...batchCustomers);
        }
      }

      // Map to expected format and get effective protection plans (respects assets_updated flag)
      const customerIds = (allCustomers || []).map(c => c.repairshopr_id);
      const planTierMap = customerIds.length > 0
        ? await getEffectiveCustomerPlanTiers(customerIds)
        : new Map<number, ProtectionPlanTier>();

      const allCustomersWithPlanStatus = (allCustomers || []).map(c => ({
        id: c.repairshopr_id,
        firstname: c.firstname,
        lastname: c.lastname,
        fullname: `${c.firstname || ''} ${c.lastname || ''}`.trim(),
        email: c.email,
        phone: c.phone,
        mobile: c.mobile,
        address: c.address,
        address_2: c.address_2,
        city: c.city,
        state: c.state,
        zip: c.zip,
        business_name: c.business_name,
        created_at: c.created_at,
        updated_at: c.updated_at,
        plan_tier: planTierMap.get(c.repairshopr_id) ?? null,
      }));

      // Apply plan tier filter if specified
      let filteredCustomers = allCustomersWithPlanStatus;
      if (planTierFilter) {
        filteredCustomers = allCustomersWithPlanStatus.filter(c => c.plan_tier === planTierFilter);
      }

      // Calculate pagination on filtered results
      const totalCount = filteredCustomers.length;
      const totalPages = Math.ceil(totalCount / perPage);
      const offset = (page - 1) * perPage;
      const paginatedCustomers = filteredCustomers.slice(offset, offset + perPage);

      return NextResponse.json({
        customers: paginatedCustomers,
        meta: {
          total_entries: totalCount,
          page,
          per_page: perPage,
          total_pages: totalPages,
        },
      });
    } catch (error) {
      console.error('[API] Customer list error:', error);
      return NextResponse.json({ error: 'Failed to list customers' }, { status: 500 });
    }
  }

  // Search mode: use RepairShopr API
  // Get API token (shared key preferred, falls back to session token)
  const apiToken = getApiToken(await getSessionToken());
  if (!apiToken) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }

  try {
    const client = createRepairShoprClient();
    const customers = await client.searchCustomers(apiToken, query);

    // Debug: Log what RepairShopr returns for first customer
    if (customers.length > 0) {
      const firstCustomer = customers[0]!;
      console.log(`[API] Customer search results (first customer):`, JSON.stringify({
        id: firstCustomer.id,
        fullname: firstCustomer.fullname,
        properties: firstCustomer.properties,
        custom_fields: firstCustomer.custom_fields,
        customer_fields: firstCustomer.customer_fields,
        tags: firstCustomer.tags,
        tag_list: firstCustomer.tag_list,
      }, null, 2));
    }

    // Get effective protection plan statuses (respects assets_updated flag)
    const customerIds = customers.map(c => c.id);
    const planTierMap = await getEffectiveCustomerPlanTiers(customerIds);

    // Check each customer for protection plan status and auto-sync
    const customersWithPlanStatus = await Promise.all(
      customers.map(async (customer) => {
        // Check if RepairShopr indicates a plan tier (silver only - RepairShopr's "gold" maps to our "silver")
        const apiPlanTier = getProtectionPlanTier(customer);
        const dbPlanTier = planTierMap.get(customer.id) ?? null;

        // Debug: Log plan tier detection for each customer
        console.log(`[API] Customer ${customer.id} (${customer.fullname}): API tier=${apiPlanTier}, DB tier=${dbPlanTier}`);

        // Tiers that only exist in Supabase (RepairShopr can't detect these)
        const supabaseOnlyTiers: ProtectionPlanTier[] = ['silver-plus', 'eset'];

        // Determine effective plan tier
        // Priority: DB tier for silver-plus/eset (Supabase-only), then API tier
        let effectiveTier: ProtectionPlanTier = dbPlanTier;

        // Only sync API tier to DB if:
        // 1. API detected a tier AND
        // 2. DB has no tier OR DB tier is not a Supabase-only tier
        if (apiPlanTier && !dbPlanTier) {
          // No DB tier, use API tier
          console.log(`[API] Syncing plan tier "${apiPlanTier}" to DB for customer ${customer.id}`);
          await setCustomerProtectionPlan(customer.id, apiPlanTier);
          effectiveTier = apiPlanTier;
        } else if (dbPlanTier && supabaseOnlyTiers.includes(dbPlanTier)) {
          // DB has a Supabase-only tier (silver-plus, bronze, eset) - preserve it
          effectiveTier = dbPlanTier;
        } else if (apiPlanTier && apiPlanTier !== dbPlanTier && supabaseAdmin) {
          // Both have tiers but they differ and DB tier is not Supabase-only
          console.log(`[API] Syncing plan tier "${apiPlanTier}" to DB for customer ${customer.id}`);
          await setCustomerProtectionPlan(customer.id, apiPlanTier);
          effectiveTier = apiPlanTier;
        }

        // Return customer with plan tier from best source
        return {
          ...customer,
          plan_tier: effectiveTier,
          is_silver_plan: effectiveTier === 'silver', // Legacy field
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
  // Check employee authentication and get audit info
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get API token (shared key preferred, falls back to session token)
  const apiToken = getApiToken(await getSessionToken());
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

    // Step 2: Sync customer to rs_customers table in Supabase
    if (supabaseAdmin) {
      try {
        const { error: syncError } = await supabaseAdmin
          .from('rs_customers')
          .upsert({
            repairshopr_id: customer.id,
            firstname: customer.firstname,
            lastname: customer.lastname,
            email: customer.email,
            phone: customer.phone || null,
            mobile: customer.mobile || null,
            address: customer.address || null,
            address_2: customer.address_2 || null,
            city: customer.city || null,
            state: customer.state || null,
            zip: customer.zip || null,
            business_name: customer.business_name || null,
            created_at: customer.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            // New customers created through website default to asset-level tracking
            assets_updated: true,
          }, { onConflict: 'repairshopr_id' });

        if (syncError) {
          console.error('[API] Failed to sync customer to Supabase:', syncError);
        }
      } catch (error) {
        console.error('[API] Error syncing customer to Supabase:', error);
      }
    }

    // Step 3: If password provided, create customer portal account in Supabase
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

    // Log the customer creation for audit trail
    await logCustomerAction(
      employee,
      'customer_create',
      customer.id,
      customer.fullname || `${customerData.firstname} ${customerData.lastname}`,
      { email: customerData.email, portal_created: portalAccountCreated },
      request
    );

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
