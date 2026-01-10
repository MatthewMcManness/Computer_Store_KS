import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo } from '@/lib/auth';
import { supabaseAdmin, getEffectiveCustomerPlanTiers, type ProtectionPlanTier } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Business representation
export interface Business {
  id: number;
  name: string;
  customerCount: number;
  plan_tier?: ProtectionPlanTier;
}

const tierHierarchy: Record<string, number> = { 'silver-plus': 3, 'silver': 2, 'eset': 1 };

/**
 * GET /api/repairshopr/businesses
 * List businesses with pagination and filtering
 * Query params:
 *   - ?page=1&per_page=50 - Pagination
 *   - ?q=search_term - Search by name
 *   - ?plan_tier=eset|silver|silver-plus - Filter by protection plan tier
 */
export async function GET(request: NextRequest) {
  // Check employee authentication
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q')?.trim();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('per_page') || '50', 10);
  const planTierFilter = searchParams.get('plan_tier') as ProtectionPlanTier | null;

  try {
    // Get all businesses (we need to calculate tiers before we can filter/paginate)
    let businessQuery = supabaseAdmin
      .from('businesses')
      .select('id, name')
      .order('name', { ascending: true });

    // Add search filter if provided
    if (query) {
      businessQuery = businessQuery.ilike('name', `%${query}%`);
    }

    const { data: allBusinesses, error: listError } = await businessQuery;

    if (listError) {
      console.error('[API] Supabase business list error:', listError);
      return NextResponse.json({ error: 'Failed to load businesses' }, { status: 500 });
    }

    if (!allBusinesses || allBusinesses.length === 0) {
      return NextResponse.json({
        businesses: [],
        meta: {
          total_entries: 0,
          page,
          per_page: perPage,
          total_pages: 0,
        },
      });
    }

    // Get all customers with their business associations
    const businessIds = allBusinesses.map(b => b.id);
    const { data: allCustomers } = await supabaseAdmin
      .from('rs_customers')
      .select('business_id, repairshopr_id')
      .in('business_id', businessIds);

    // Group customers by business
    const customerIdsByBusiness = new Map<number, number[]>();
    for (const row of allCustomers || []) {
      if (row.business_id) {
        if (!customerIdsByBusiness.has(row.business_id)) {
          customerIdsByBusiness.set(row.business_id, []);
        }
        customerIdsByBusiness.get(row.business_id)!.push(row.repairshopr_id);
      }
    }

    // Get plan tiers for all customers
    const allCustomerIds = (allCustomers || []).map(c => c.repairshopr_id);
    const planTierMap = allCustomerIds.length > 0
      ? await getEffectiveCustomerPlanTiers(allCustomerIds)
      : new Map<number, ProtectionPlanTier>();

    // Build full business list with tiers
    const allBusinessesWithTiers: Business[] = allBusinesses.map(b => {
      const customerIds = customerIdsByBusiness.get(b.id) || [];

      // Find highest tier among all customers in this business
      let highestTier: ProtectionPlanTier = null;
      for (const customerId of customerIds) {
        const tier = planTierMap.get(customerId) ?? null;
        if (tier && (!highestTier || tierHierarchy[tier] > (tierHierarchy[highestTier] || 0))) {
          highestTier = tier;
        }
      }

      return {
        id: b.id,
        name: b.name,
        customerCount: customerIds.length,
        plan_tier: highestTier,
      };
    });

    // Apply plan tier filter if specified
    let filteredBusinesses = allBusinessesWithTiers;
    if (planTierFilter) {
      filteredBusinesses = allBusinessesWithTiers.filter(b => b.plan_tier === planTierFilter);
    }

    // Calculate pagination on filtered results
    const totalCount = filteredBusinesses.length;
    const totalPages = Math.ceil(totalCount / perPage);
    const offset = (page - 1) * perPage;
    const paginatedBusinesses = filteredBusinesses.slice(offset, offset + perPage);

    return NextResponse.json({
      businesses: paginatedBusinesses,
      meta: {
        total_entries: totalCount,
        page,
        per_page: perPage,
        total_pages: totalPages,
      },
    });
  } catch (error) {
    console.error('[API] Business list error:', error);
    return NextResponse.json({ error: 'Failed to list businesses' }, { status: 500 });
  }
}
