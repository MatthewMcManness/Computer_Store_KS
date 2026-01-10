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

/**
 * GET /api/repairshopr/businesses
 * List businesses with pagination
 * Query params:
 *   - ?page=1&per_page=50 - Pagination
 *   - ?q=search_term - Search by name
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

  try {
    const offset = (page - 1) * perPage;

    // Build query for businesses
    let businessQuery = supabaseAdmin
      .from('businesses')
      .select('id, name', { count: 'exact' })
      .order('name', { ascending: true });

    // Add search filter if provided
    if (query) {
      businessQuery = businessQuery.ilike('name', `%${query}%`);
    }

    // Apply pagination
    businessQuery = businessQuery.range(offset, offset + perPage - 1);

    const { data: businesses, error: listError, count: totalCount } = await businessQuery;

    if (listError) {
      console.error('[API] Supabase business list error:', listError);
      return NextResponse.json({ error: 'Failed to load businesses' }, { status: 500 });
    }

    if (!businesses || businesses.length === 0) {
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

    // Get customer counts for each business
    const businessIds = businesses.map(b => b.id);
    const { data: customerCounts } = await supabaseAdmin
      .from('rs_customers')
      .select('business_id, repairshopr_id')
      .in('business_id', businessIds);

    // Group customer counts by business
    const countMap = new Map<number, number>();
    const customerIdsByBusiness = new Map<number, number[]>();

    for (const row of customerCounts || []) {
      if (row.business_id) {
        countMap.set(row.business_id, (countMap.get(row.business_id) || 0) + 1);
        if (!customerIdsByBusiness.has(row.business_id)) {
          customerIdsByBusiness.set(row.business_id, []);
        }
        customerIdsByBusiness.get(row.business_id)!.push(row.repairshopr_id);
      }
    }

    // Get all customer IDs for protection plan lookup
    const allCustomerIds = (customerCounts || []).map(c => c.repairshopr_id);
    const planTierMap = allCustomerIds.length > 0
      ? await getEffectiveCustomerPlanTiers(allCustomerIds)
      : new Map<number, ProtectionPlanTier>();

    // Build business list with highest tier per business
    const tierHierarchy: Record<string, number> = { 'silver-plus': 3, 'silver': 2, 'eset': 1 };

    const businessList: Business[] = businesses.map(b => {
      // Find highest tier among all customers in this business
      let highestTier: ProtectionPlanTier = null;
      const customerIds = customerIdsByBusiness.get(b.id) || [];

      for (const customerId of customerIds) {
        const tier = planTierMap.get(customerId) ?? null;
        if (tier && (!highestTier || tierHierarchy[tier] > (tierHierarchy[highestTier] || 0))) {
          highestTier = tier;
        }
      }

      return {
        id: b.id,
        name: b.name,
        customerCount: countMap.get(b.id) || 0,
        plan_tier: highestTier,
      };
    });

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
