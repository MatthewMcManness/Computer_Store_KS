import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getSessionToken } from '@/lib/auth';
import { createRepairShoprClient, RepairShoprAPIError, RepairShoprCustomer } from '@/lib/repairshopr';

export const dynamic = 'force-dynamic';

// Business representation from customer data
export interface Business {
  name: string;
  primaryCustomer: RepairShoprCustomer;
  customerCount: number;
}

/**
 * GET /api/repairshopr/businesses
 * Search for businesses (customers with business_name populated)
 * Query params: ?q=search_term
 */
export async function GET(request: NextRequest) {
  // Check employee authentication
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiToken = await getSessionToken();
  if (!apiToken) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }

  // Get search query
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { error: 'Search query must be at least 2 characters' },
      { status: 400 }
    );
  }

  try {
    const client = createRepairShoprClient();

    // Search customers - this will include those with matching business names
    const customers = await client.searchCustomers(apiToken, query);

    // Group by business name and deduplicate
    const businessMap = new Map<string, { customers: RepairShoprCustomer[] }>();

    for (const customer of customers) {
      if (customer.business_name) {
        const key = customer.business_name.toLowerCase();
        if (!businessMap.has(key)) {
          businessMap.set(key, { customers: [] });
        }
        businessMap.get(key)!.customers.push(customer);
      }
    }

    // Build business list with primary customer (first one found) and count
    const businesses: Business[] = [];
    for (const [, data] of businessMap.entries()) {
      const primaryCustomer = data.customers[0];
      if (primaryCustomer && primaryCustomer.business_name) {
        businesses.push({
          name: primaryCustomer.business_name,
          primaryCustomer,
          customerCount: data.customers.length,
        });
      }
    }

    // Sort by business name
    businesses.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ businesses });
  } catch (error) {
    if (error instanceof RepairShoprAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('[API] Business search error:', error);
    return NextResponse.json(
      { error: 'Failed to search businesses' },
      { status: 500 }
    );
  }
}
