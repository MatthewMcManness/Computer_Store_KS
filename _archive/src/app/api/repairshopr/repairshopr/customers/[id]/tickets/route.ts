import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo, getSessionToken } from '@/lib/auth';
import { createRepairShoprClient, RepairShoprAPIError, getApiToken } from '@/lib/repairshopr';

export const dynamic = 'force-dynamic';

/**
 * GET /api/repairshopr/customers/[id]/tickets
 * Get all tickets for a customer
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
    const client = createRepairShoprClient();
    const tickets = await client.getCustomerTickets(apiToken, customerId);

    return NextResponse.json({ tickets });
  } catch (error) {
    if (error instanceof RepairShoprAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('[API] Customer tickets fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer tickets' },
      { status: 500 }
    );
  }
}
