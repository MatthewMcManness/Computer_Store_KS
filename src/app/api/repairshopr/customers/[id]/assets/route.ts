import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo, getSessionToken } from '@/lib/auth';
import { createRepairShoprClient, RepairShoprAPIError, getApiToken } from '@/lib/repairshopr';
import { getCustomerAssets, supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/repairshopr/customers/[id]/assets
 * Get all assets for a customer.
 *
 * Supabase-first: reads from rs_assets table. Falls back to RepairShopr API
 * if no assets found in Supabase, then syncs the results back.
 *
 * @version 1.0.0 - Initial implementation (RepairShopr-only)
 * @version 2.0.0 - 2026-02-02T00:00:00Z - Supabase-first pattern
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

  // Get API token (shared key preferred, falls back to session token)
  const apiToken = getApiToken(await getSessionToken());
  if (!apiToken) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
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
    // Supabase-first: try to get assets from our database
    const cachedAssets = await getCustomerAssets(customerId);

    if (cachedAssets.length > 0) {
      // Map Supabase rs_assets rows to RepairShopr-shaped response
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
    }

    // Fallback: fetch from RepairShopr if no assets in Supabase
    const client = createRepairShoprClient();
    const assets = await client.getCustomerAssets(apiToken, customerId);

    // Sync to Supabase for future requests
    if (supabaseAdmin && assets.length > 0) {
      for (const asset of assets) {
        await supabaseAdmin
          .from('rs_assets')
          .upsert({
            repairshopr_id: asset.id,
            customer_id: asset.customer_id || customerId,
            name: asset.name,
            asset_type_name: asset.asset_type_name || null,
            properties: asset.properties || {},
            created_at: asset.created_at || new Date().toISOString(),
            updated_at: asset.updated_at || new Date().toISOString(),
            synced_at: new Date().toISOString(),
          }, { onConflict: 'repairshopr_id' })
          .then(({ error }) => {
            if (error) console.error(`[API] Failed to sync asset ${asset.id} to Supabase:`, error);
          });
      }
    }

    return NextResponse.json({ assets });
  } catch (error) {
    if (error instanceof RepairShoprAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('[API] Customer assets fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer assets' },
      { status: 500 }
    );
  }
}
