import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo, getCurrentUser } from '@/lib/auth';
import { supabaseAdmin, getEffectiveCustomerPlanTiers, type ProtectionPlanTier } from '@/lib/supabase';
import { getEffectiveLocationId } from '@/lib/location-helpers';

export const dynamic = 'force-dynamic';

// Family representation
export interface Family {
  id: number;
  name: string;
  customerCount: number;
  plan_tier?: ProtectionPlanTier;
}

const tierHierarchy: Record<string, number> = { 'silver-plus': 3, 'silver': 2, 'eset': 1 };

/**
 * GET /api/repairshopr/families
 * List families with pagination and filtering
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
    // Get current user for location filtering
    const currentUser = await getCurrentUser();
    const userRoles = currentUser?.roles || [];
    const userLocationId = currentUser?.location_id || null;

    // Get the effective location ID to filter by
    const effectiveLocationId = await getEffectiveLocationId(userRoles, userLocationId);

    // Get all families (we need to calculate tiers before we can filter/paginate)
    let familyQuery = supabaseAdmin
      .from('families')
      .select('id, name')
      .order('name', { ascending: true });

    // Apply location filter if user doesn't have access to all locations
    if (effectiveLocationId) {
      familyQuery = familyQuery.eq('location_id', effectiveLocationId);
    }

    // Add search filter if provided
    if (query) {
      familyQuery = familyQuery.ilike('name', `%${query}%`);
    }

    const { data: allFamilies, error: listError } = await familyQuery;

    if (listError) {
      console.error('[API] Supabase family list error:', listError);
      return NextResponse.json({ error: 'Failed to load families' }, { status: 500 });
    }

    if (!allFamilies || allFamilies.length === 0) {
      return NextResponse.json({
        families: [],
        meta: {
          total_entries: 0,
          page,
          per_page: perPage,
          total_pages: 0,
        },
      });
    }

    // Get all customers with their family associations
    // Fetch in batches to handle Supabase's 1000 row limit
    const familyIds = allFamilies.map(f => f.id);

    // Build count query with location filter
    let customerCountQuery = supabaseAdmin
      .from('rs_customers')
      .select('*', { count: 'exact', head: true })
      .in('family_id', familyIds);

    if (effectiveLocationId) {
      customerCountQuery = customerCountQuery.eq('location_id', effectiveLocationId);
    }

    const { count: customerCount } = await customerCountQuery;

    const BATCH_SIZE = 1000;
    const allCustomers: Array<{ family_id: number; repairshopr_id: number }> = [];
    const totalBatches = Math.ceil((customerCount || 0) / BATCH_SIZE);

    for (let batch = 0; batch < totalBatches; batch++) {
      const from = batch * BATCH_SIZE;
      const to = from + BATCH_SIZE - 1;

      let batchQuery = supabaseAdmin
        .from('rs_customers')
        .select('family_id, repairshopr_id')
        .in('family_id', familyIds);

      if (effectiveLocationId) {
        batchQuery = batchQuery.eq('location_id', effectiveLocationId);
      }

      const { data: batchCustomers } = await batchQuery.range(from, to);

      if (batchCustomers) {
        allCustomers.push(...batchCustomers);
      }
    }

    // Group customers by family
    const customerIdsByFamily = new Map<number, number[]>();
    for (const row of allCustomers || []) {
      if (row.family_id) {
        if (!customerIdsByFamily.has(row.family_id)) {
          customerIdsByFamily.set(row.family_id, []);
        }
        customerIdsByFamily.get(row.family_id)!.push(row.repairshopr_id);
      }
    }

    // Get plan tiers for all customers
    const allCustomerIds = (allCustomers || []).map(c => c.repairshopr_id);
    const planTierMap = allCustomerIds.length > 0
      ? await getEffectiveCustomerPlanTiers(allCustomerIds)
      : new Map<number, ProtectionPlanTier>();

    // Build full family list with tiers
    const allFamiliesWithTiers: Family[] = allFamilies.map(f => {
      const customerIds = customerIdsByFamily.get(f.id) || [];

      // Find highest tier among all customers in this family
      let highestTier: ProtectionPlanTier = null;
      for (const customerId of customerIds) {
        const tier = planTierMap.get(customerId) ?? null;
        if (tier && (!highestTier || (tierHierarchy[tier] ?? 0) > (tierHierarchy[highestTier] ?? 0))) {
          highestTier = tier;
        }
      }

      return {
        id: f.id,
        name: f.name,
        customerCount: customerIds.length,
        plan_tier: highestTier,
      };
    });

    // Apply plan tier filter if specified
    let filteredFamilies = allFamiliesWithTiers;
    if (planTierFilter) {
      filteredFamilies = allFamiliesWithTiers.filter(f => f.plan_tier === planTierFilter);
    }

    // Calculate pagination on filtered results
    const totalCount = filteredFamilies.length;
    const totalPages = Math.ceil(totalCount / perPage);
    const offset = (page - 1) * perPage;
    const paginatedFamilies = filteredFamilies.slice(offset, offset + perPage);

    return NextResponse.json({
      families: paginatedFamilies,
      meta: {
        total_entries: totalCount,
        page,
        per_page: perPage,
        total_pages: totalPages,
      },
    });
  } catch (error) {
    console.error('[API] Family list error:', error);
    return NextResponse.json({ error: 'Failed to list families' }, { status: 500 });
  }
}

/**
 * POST /api/repairshopr/families
 * Create a new family
 */
export async function POST(request: NextRequest) {
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Family name is required' }, { status: 400 });
    }

    // Get current user for location
    const currentUser = await getCurrentUser();
    const locationId = currentUser?.location_id || null;

    const { data: family, error } = await supabaseAdmin
      .from('families')
      .insert({
        name: name.trim(),
        location_id: locationId,
      })
      .select('id, name')
      .single();

    if (error) {
      console.error('[API] Create family error:', error);
      return NextResponse.json({ error: 'Failed to create family' }, { status: 500 });
    }

    return NextResponse.json({
      family: {
        ...family,
        customerCount: 0,
        plan_tier: null,
      },
    });
  } catch (error) {
    console.error('[API] Create family error:', error);
    return NextResponse.json({ error: 'Failed to create family' }, { status: 500 });
  }
}
