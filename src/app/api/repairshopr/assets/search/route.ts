import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/repairshopr/assets/search
 *
 * Searches assets in Supabase rs_assets table by name.
 *
 * @param request - Request with query parameter 'q' for search term
 * @returns Array of matching assets with customer info
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ assets: [] });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Search assets by name, including customer info
    const { data: assets, error } = await supabaseAdmin
      .from('rs_assets')
      .select(`
        id,
        repairshopr_id,
        name,
        asset_type_name,
        customer_id,
        rs_customers!inner (
          id,
          firstname,
          lastname,
          business_name
        )
      `)
      .ilike('name', `%${query}%`)
      .limit(20);

    if (error) {
      console.error('[API] Error searching assets:', error);
      return NextResponse.json({ error: 'Failed to search assets' }, { status: 500 });
    }

    // Format results with customer name
    const formattedAssets = (assets || []).map((asset: any) => {
      const customer = asset.rs_customers;
      let customerName = '';
      if (customer) {
        if (customer.business_name) {
          customerName = customer.business_name;
        } else if (customer.firstname || customer.lastname) {
          customerName = `${customer.firstname || ''} ${customer.lastname || ''}`.trim();
        }
      }

      return {
        id: asset.id,
        repairshoprId: asset.repairshopr_id,
        name: asset.name,
        assetTypeName: asset.asset_type_name,
        customerId: asset.customer_id,
        customerName,
      };
    });

    return NextResponse.json({ assets: formattedAssets });
  } catch (error) {
    console.error('[API] Error in asset search:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
