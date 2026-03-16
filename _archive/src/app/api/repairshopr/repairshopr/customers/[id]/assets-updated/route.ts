import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo } from '@/lib/auth';
import { getCustomerAssetsUpdated, setCustomerAssetsUpdated, getCustomerAssetCount } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/repairshopr/customers/[id]/assets-updated
 * Get the assets_updated status and asset count for a customer
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

  const { id } = await params;
  const customerId = parseInt(id, 10);
  if (isNaN(customerId)) {
    return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
  }

  try {
    const [assetsUpdated, assetCount] = await Promise.all([
      getCustomerAssetsUpdated(customerId),
      getCustomerAssetCount(customerId)
    ]);

    return NextResponse.json({
      assets_updated: assetsUpdated,
      asset_count: assetCount
    });
  } catch (error) {
    console.error('[API] Get assets_updated error:', error);
    return NextResponse.json(
      { error: 'Failed to get assets_updated status' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/repairshopr/customers/[id]/assets-updated
 * Update the assets_updated status for a customer
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check employee authentication
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const customerId = parseInt(id, 10);
  if (isNaN(customerId)) {
    return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { assets_updated } = body;

    if (typeof assets_updated !== 'boolean') {
      return NextResponse.json(
        { error: 'assets_updated must be a boolean' },
        { status: 400 }
      );
    }

    // If trying to set to true, verify customer has assets
    if (assets_updated) {
      const assetCount = await getCustomerAssetCount(customerId);
      if (assetCount === 0) {
        return NextResponse.json(
          { error: 'Cannot mark as migrated: customer has no assets' },
          { status: 400 }
        );
      }
    }

    const success = await setCustomerAssetsUpdated(customerId, assets_updated);
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update assets_updated status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      assets_updated
    });
  } catch (error) {
    console.error('[API] Update assets_updated error:', error);
    return NextResponse.json(
      { error: 'Failed to update assets_updated status' },
      { status: 500 }
    );
  }
}
