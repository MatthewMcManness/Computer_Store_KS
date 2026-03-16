import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo, getSessionToken } from '@/lib/auth';
import { createRepairShoprClient, RepairShoprAPIError, getApiToken } from '@/lib/repairshopr';

export const dynamic = 'force-dynamic';

/**
 * GET /api/repairshopr/businesses/customers
 * Get all customers for a specific business
 * Query params: ?business_name=BusinessName
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

  const searchParams = request.nextUrl.searchParams;
  const businessName = searchParams.get('business_name');

  if (!businessName) {
    return NextResponse.json(
      { error: 'business_name parameter is required' },
      { status: 400 }
    );
  }

  try {
    const client = createRepairShoprClient();

    // Search for customers with this business name
    const customers = await client.searchCustomers(apiToken, businessName);

    // Filter to only customers with matching business name (case insensitive)
    const businessCustomers = customers.filter(
      c => c.business_name?.toLowerCase() === businessName.toLowerCase()
    );

    return NextResponse.json({ customers: businessCustomers });
  } catch (error) {
    if (error instanceof RepairShoprAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('[API] Business customers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business customers' },
      { status: 500 }
    );
  }
}
