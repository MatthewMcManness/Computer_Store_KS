import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo, getSessionToken } from '@/lib/auth';
import { createRepairShoprClient, RepairShoprAPIError, getApiToken } from '@/lib/repairshopr';
import { logAssetAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/repairshopr/assets/[id]
 * Delete an asset/device
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;
  const assetId = parseInt(id, 10);

  if (isNaN(assetId)) {
    return NextResponse.json(
      { error: 'Invalid asset ID' },
      { status: 400 }
    );
  }

  try {
    const client = createRepairShoprClient();

    // First, get the asset details for audit logging
    let assetName = `Asset #${assetId}`;
    try {
      const asset = await client.getAsset(apiToken, assetId);
      if (asset) {
        assetName = asset.name || assetName;
      }
    } catch {
      // Continue with deletion even if we can't get the asset name
    }

    // Delete the asset
    await client.deleteAsset(apiToken, assetId);

    // Log the asset deletion for audit trail
    await logAssetAction(
      employee,
      'asset_delete',
      assetId,
      assetName,
      {},
      request
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof RepairShoprAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('[API] Asset deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/repairshopr/assets/[id]
 * Get a single asset by ID
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

  // Get API token
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
    const client = createRepairShoprClient();
    const asset = await client.getAsset(apiToken, assetId);

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ asset });
  } catch (error) {
    if (error instanceof RepairShoprAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('[API] Asset fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset' },
      { status: 500 }
    );
  }
}
