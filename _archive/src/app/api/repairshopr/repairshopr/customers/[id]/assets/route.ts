import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo } from '@/lib/auth';
import { getCustomerAssets } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/repairshopr/customers/[id]/assets
 * Get all assets for a customer.
 *
 * Supabase-only: reads exclusively from rs_assets table.
 * RepairShopr asset data is unreliable (legacy employees did not maintain it)
 * so we never pull assets from RepairShopr. Assets are only created through
 * our intake flow, which pushes to RepairShopr as a backup.
 *
 * @version 1.0.0 - Initial implementation (RepairShopr-only)
 * @version 2.0.0 - 2026-02-02T00:00:00Z - Supabase-first pattern
 * @version 3.0.0 - 2026-02-02T00:00:00Z - Supabase-only, never pull from RepairShopr
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check employee authentication
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse customer ID
  const { id } = await params;
  const customerId = parseInt(id, 10);

  if (isNaN(customerId) || customerId <= 0) {
    return NextResponse.json(
      { error: 'Invalid customer ID' },
      { status: 400 }
    );
  }

  try {
    // Supabase is the sole source of truth for assets
    const cachedAssets = await getCustomerAssets(customerId);

    const assets = cachedAssets.map((a) => ({
      id: a.repairshopr_id,
      name: a.name,
      asset_type_name: a.asset_type_name,
      customer_id: a.customer_id,
      properties: a.properties || {},
      created_at: a.created_at,
      updated_at: a.updated_at,
    }));

    return NextResponse.json({ assets });
  } catch (error) {
    console.error('[API] Customer assets fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer assets' },
      { status: 500 }
    );
  }
}
