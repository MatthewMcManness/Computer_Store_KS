import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo, getSessionToken } from '@/lib/auth';
import { createRepairShoprClient, RepairShoprAPIError, RepairShoprCustomer, getApiToken } from '@/lib/repairshopr';
import { supabaseAdmin, getCustomerProtectionPlans, type ProtectionPlanTier } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Business representation from customer data
export interface Business {
  name: string;
  primaryCustomer: RepairShoprCustomer;
  customerCount: number;
  plan_tier?: ProtectionPlanTier;
}

/**
 * GET /api/repairshopr/businesses
 * Search for businesses (customers with business_name populated)
 * Query params:
 *   - ?q=search_term - Search for businesses (uses RepairShopr API)
 *   - ?page=1&per_page=50 - List all businesses with pagination (uses Supabase)
 */
export async function GET(request: NextRequest) {
  // Check employee authentication
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get search query and pagination params
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('per_page') || '50', 10);

  // If no search query, list all businesses from Supabase with pagination
  if (!query || !query.trim()) {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    try {
      const offset = (page - 1) * perPage;

      // Get unique business names with count and a representative customer
      const { data: businesses, error: listError } = await supabaseAdmin
        .from('rs_customers')
        .select('repairshopr_id, firstname, lastname, email, phone, mobile, address, address_2, city, state, zip, business_name')
        .not('business_name', 'is', null)
        .neq('business_name', '')
        .order('business_name', { ascending: true })
        .range(offset, offset + perPage - 1);

      if (listError) {
        console.error('[API] Supabase business list error:', listError);
        return NextResponse.json({ error: 'Failed to load businesses' }, { status: 500 });
      }

      // Group by business name
      const businessMap = new Map<string, { customers: typeof businesses; count: number }>();
      for (const customer of businesses || []) {
        if (customer.business_name) {
          const key = customer.business_name.toLowerCase();
          if (!businessMap.has(key)) {
            businessMap.set(key, { customers: [], count: 0 });
          }
          businessMap.get(key)!.customers.push(customer);
          businessMap.get(key)!.count++;
        }
      }

      // Get customer IDs for protection plan lookup
      const customerIds = (businesses || []).map(c => c.repairshopr_id);
      const existingPlans = customerIds.length > 0
        ? await getCustomerProtectionPlans(customerIds)
        : [];
      const planTierMap = new Map<number, ProtectionPlanTier>(
        existingPlans.map(sp => [sp.repairshopr_customer_id, sp.plan_tier])
      );

      // Build business list
      const businessList: Business[] = [];
      for (const [, data] of businessMap.entries()) {
        const primaryCustomer = data.customers[0];
        if (primaryCustomer && primaryCustomer.business_name) {
          // Get highest tier among all customers in this business
          let highestTier: ProtectionPlanTier = null;
          const tierHierarchy: Record<string, number> = { 'silver-plus': 3, 'silver': 2, 'eset': 1 };
          for (const c of data.customers) {
            const tier = planTierMap.get(c.repairshopr_id) ?? null;
            if (tier && (!highestTier || tierHierarchy[tier] > (tierHierarchy[highestTier] || 0))) {
              highestTier = tier;
            }
          }

          businessList.push({
            name: primaryCustomer.business_name,
            primaryCustomer: {
              id: primaryCustomer.repairshopr_id,
              firstname: primaryCustomer.firstname,
              lastname: primaryCustomer.lastname,
              fullname: `${primaryCustomer.firstname || ''} ${primaryCustomer.lastname || ''}`.trim(),
              email: primaryCustomer.email,
              phone: primaryCustomer.phone,
              mobile: primaryCustomer.mobile,
              address: primaryCustomer.address,
              address_2: primaryCustomer.address_2,
              city: primaryCustomer.city,
              state: primaryCustomer.state,
              zip: primaryCustomer.zip,
              business_name: primaryCustomer.business_name,
            } as RepairShoprCustomer,
            customerCount: data.count,
            plan_tier: highestTier,
          });
        }
      }

      // Get total count of unique businesses
      const { count: totalCount } = await supabaseAdmin
        .from('rs_customers')
        .select('business_name', { count: 'exact', head: true })
        .not('business_name', 'is', null)
        .neq('business_name', '');

      return NextResponse.json({
        businesses: businessList,
        meta: {
          total_entries: totalCount || 0,
          page,
          per_page: perPage,
          total_pages: Math.ceil((totalCount || 0) / perPage),
        },
      });
    } catch (error) {
      console.error('[API] Business list error:', error);
      return NextResponse.json({ error: 'Failed to list businesses' }, { status: 500 });
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

    // Search customers - this will include those with matching business names
    const customers = await client.searchCustomers(apiToken, query);

    // Group by business name and deduplicate
    const businessMap = new Map<string, { customers: RepairShoprCustomer[] }>();

    for (const customer of customers) {
      if (customer.business_name) {
        const key = customer.business_name.toLowerCase();
        if (!businessMap.has(key)) {
          businessMap.set(key, { customers: [] });
        }
        businessMap.get(key)!.customers.push(customer);
      }
    }

    // Build business list with primary customer (first one found) and count
    const businesses: Business[] = [];
    for (const [, data] of businessMap.entries()) {
      const primaryCustomer = data.customers[0];
      if (primaryCustomer && primaryCustomer.business_name) {
        businesses.push({
          name: primaryCustomer.business_name,
          primaryCustomer,
          customerCount: data.customers.length,
        });
      }
    }

    // Sort by business name
    businesses.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ businesses });
  } catch (error) {
    if (error instanceof RepairShoprAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('[API] Business search error:', error);
    return NextResponse.json(
      { error: 'Failed to search businesses' },
      { status: 500 }
    );
  }
}
