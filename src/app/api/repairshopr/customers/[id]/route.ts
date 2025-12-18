import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getSessionToken } from '@/lib/auth';
import { createRepairShoprClient, RepairShoprAPIError, UpdateCustomerInput } from '@/lib/repairshopr';

export const dynamic = 'force-dynamic';

/**
 * GET /api/repairshopr/customers/[id]
 * Get a customer by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check employee authentication
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiToken = await getSessionToken();
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
    const customer = await client.getCustomer(apiToken, customerId);

    // Debug: Log what properties/custom fields RepairShopr returns
    console.log(`[API] Customer ${customerId} properties:`, JSON.stringify(customer.properties, null, 2));
    console.log(`[API] Customer ${customerId} custom_fields:`, JSON.stringify(customer.custom_fields, null, 2));

    return NextResponse.json({ customer });
  } catch (error) {
    if (error instanceof RepairShoprAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('[API] Customer fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/repairshopr/customers/[id]
 * Update a customer by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check employee authentication
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiToken = await getSessionToken();
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
    const body = await request.json();

    // Validate allowed fields
    const allowedFields: (keyof UpdateCustomerInput)[] = [
      'firstname', 'lastname', 'email', 'phone', 'mobile',
      'address', 'address_2', 'city', 'state', 'zip',
      'business_name', 'notes', 'get_sms', 'opt_out', 'no_email',
      'properties'
    ];

    const updateData: UpdateCustomerInput = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Debug: Log what we're sending to RepairShopr
    console.log(`[API] Updating customer ${customerId} with:`, JSON.stringify(updateData, null, 2));

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const client = createRepairShoprClient();
    const customer = await client.updateCustomer(apiToken, customerId, updateData);

    return NextResponse.json({ customer });
  } catch (error) {
    if (error instanceof RepairShoprAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('[API] Customer update error:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}
