import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo, getSessionToken } from '@/lib/auth';
import { createRepairShoprClient, RepairShoprAPIError, getApiToken } from '@/lib/repairshopr';
import { logAssetAction } from '@/lib/audit';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * POST /api/repairshopr/assets
 * Create a new asset/device
 * Body: CreateAssetInput
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

  // Validate required fields
  if (!body.name || !body.customer_id) {
    return NextResponse.json(
      { error: 'Asset name and customer ID are required' },
      { status: 400 }
    );
  }

  // Debug: log the request body
  console.log('[API] Creating asset with body:', JSON.stringify(body, null, 2));

  try {
    const client = createRepairShoprClient();
    const asset = await client.createAsset(apiToken, body);

    console.log('[API] Asset created, returning:', JSON.stringify(asset, null, 2));

    if (!asset) {
      console.error('[API] No asset returned from RepairShopr client');
      return NextResponse.json({ error: 'No asset created' }, { status: 500 });
    }

    // Sync new asset to Supabase rs_assets table
    if (supabaseAdmin) {
      const { error: syncError } = await supabaseAdmin
        .from('rs_assets')
        .insert({
          repairshopr_id: asset.id,
          customer_id: asset.customer_id || body.customer_id,
          name: asset.name || body.name,
          asset_type_name: asset.asset_type_name || body.asset_type_name || null,
          properties: asset.properties || {},
          created_at: asset.created_at || new Date().toISOString(),
          updated_at: asset.updated_at || new Date().toISOString(),
          synced_at: new Date().toISOString(),
        });

      if (syncError) {
        console.error('[API] Failed to sync new asset to Supabase:', syncError);
      }
    }

    // Log the asset creation for audit trail
    await logAssetAction(
      employee,
      'asset_create',
      asset.id,
      asset.name || body.name,
      { customer_id: body.customer_id, asset_type: body.asset_type },
      request
    );

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    if (error instanceof RepairShoprAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('[API] Asset creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    );
  }
}
