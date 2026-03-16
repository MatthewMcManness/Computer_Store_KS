import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo, getSessionToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { createRepairShoprClient, RepairShoprAPIError, getApiToken, type RepairShoprCustomer } from '@/lib/repairshopr';

export const dynamic = 'force-dynamic';

/**
 * GET /api/repairshopr/families/customers
 * Get all customers for a specific family
 * Query params: ?family_id=123
 */
export async function GET(request: NextRequest) {
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

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const searchParams = request.nextUrl.searchParams;
  const familyId = searchParams.get('family_id');

  if (!familyId) {
    return NextResponse.json(
      { error: 'family_id parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Get all customer IDs for this family from our database
    const { data: customerRecords, error: dbError } = await supabaseAdmin
      .from('rs_customers')
      .select('repairshopr_id')
      .eq('family_id', parseInt(familyId, 10));

    if (dbError) {
      console.error('[API] Database error:', dbError);
      return NextResponse.json({ error: 'Failed to fetch family customers' }, { status: 500 });
    }

    if (!customerRecords || customerRecords.length === 0) {
      return NextResponse.json({ customers: [] });
    }

    // Fetch full customer details from RepairShopr
    const client = createRepairShoprClient();
    const customers: RepairShoprCustomer[] = [];

    for (const record of customerRecords) {
      try {
        const customer = await client.getCustomer(apiToken, record.repairshopr_id);
        if (customer) {
          customers.push(customer);
        }
      } catch (err) {
        console.error(`[API] Failed to fetch customer ${record.repairshopr_id}:`, err);
        // Continue with other customers
      }
    }

    return NextResponse.json({ customers });
  } catch (error) {
    if (error instanceof RepairShoprAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('[API] Family customers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch family customers' },
      { status: 500 }
    );
  }
}
