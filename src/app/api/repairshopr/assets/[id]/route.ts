import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo, getSessionToken } from '@/lib/auth';
import { createRepairShoprClient, getApiToken } from '@/lib/repairshopr';
import { logAssetAction } from '@/lib/audit';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/repairshopr/assets/[id]
 * Delete an asset/device.
 *
 * Supabase is source of truth — deletes from Supabase first,
 * then pushes delete to RepairShopr as backup.
 *
 * @version 1.0.0 - Initial implementation
 * @version 2.0.0 - 2026-02-02T00:00:00Z - Supabase-first, RS as backup
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiToken = getApiToken(await getSessionToken());
  if (!apiToken) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }

  const { id } = await params;
  const assetId = parseInt(id, 10);

  if (isNaN(assetId)) {
    return NextResponse.json(
      { error: 'Invalid asset ID' },
      { status: 400 }
    );
  }

  try {
    // Get asset name from Supabase for audit logging
    let assetName = `Asset #${assetId}`;
    if (supabaseAdmin) {
      const { data } = await supabaseAdmin
        .from('rs_assets')
        .select('name')
        .eq('repairshopr_id', assetId)
        .single();
      if (data?.name) assetName = data.name;
    }

    // Delete from Supabase (source of truth)
    if (supabaseAdmin) {
      await supabaseAdmin.from('asset_protection_plans').delete().eq('repairshopr_asset_id', assetId);
      await supabaseAdmin.from('rs_assets').delete().eq('repairshopr_id', assetId);
    }

    // Soft-delete in RepairShopr (no DELETE endpoint exists)
    try {
      const client = createRepairShoprClient();
      await client.updateAsset(apiToken, assetId, {
        name: `[DELETED] ${assetName}`,
      });
    } catch (rsError) {
      console.error('[API] Failed to soft-delete asset in RepairShopr:', rsError);
    }

    await logAssetAction(employee, 'asset_delete', assetId, assetName, {}, request);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Asset deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/repairshopr/assets/[id]
 * Get a single asset by ID.
 *
 * Supabase-only: never pulls from RepairShopr.
 *
 * @version 1.0.0 - Initial implementation (RepairShopr)
 * @version 2.0.0 - 2026-02-02T00:00:00Z - Supabase-only
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const assetId = parseInt(id, 10);

  if (isNaN(assetId)) {
    return NextResponse.json(
      { error: 'Invalid asset ID' },
      { status: 400 }
    );
  }

  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { data: asset, error } = await supabaseAdmin
      .from('rs_assets')
      .select('*')
      .eq('repairshopr_id', assetId)
      .single();

    if (error || !asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    return NextResponse.json({
      asset: {
        id: asset.repairshopr_id,
        name: asset.name,
        asset_type_name: asset.asset_type_name,
        customer_id: asset.customer_id,
        properties: asset.properties || {},
        created_at: asset.created_at,
        updated_at: asset.updated_at,
      },
    });
  } catch (error) {
    console.error('[API] Asset fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset' },
      { status: 500 }
    );
  }
}
