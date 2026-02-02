import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo, getSessionToken } from '@/lib/auth';
import { createRepairShoprClient, RepairShoprAPIError, UpdateCustomerInput, getApiToken } from '@/lib/repairshopr';
import { supabaseAdmin } from '@/lib/supabase';
import { logCustomerAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

/**
 * GET /api/repairshopr/customers/[id]
 * Get a customer by ID
 */
export async function GET(
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
    // Supabase-first: try to get customer from our database
    if (supabaseAdmin) {
      const { data: cached } = await supabaseAdmin
        .from('rs_customers')
        .select('*')
        .eq('repairshopr_id', customerId)
        .single();

      if (cached) {
        // Build a RepairShoprCustomer-shaped response from Supabase data
        const customer = {
          id: cached.repairshopr_id,
          firstname: cached.firstname || '',
          lastname: cached.lastname || '',
          fullname: [cached.firstname, cached.lastname].filter(Boolean).join(' '),
          business_name: cached.business_name || null,
          email: cached.email || '',
          phone: cached.phone || null,
          mobile: cached.mobile || null,
          address: cached.address || null,
          address_2: cached.address_2 || null,
          city: cached.city || null,
          state: cached.state || null,
          zip: cached.zip || null,
          created_at: cached.created_at || null,
          updated_at: cached.updated_at || null,
        };

        return NextResponse.json({ customer });
      }
    }

    // Fallback: fetch from RepairShopr if not in Supabase
    const client = createRepairShoprClient();
    const customer = await client.getCustomer(apiToken, customerId);

    // Sync to Supabase for future requests
    if (supabaseAdmin) {
      await supabaseAdmin
        .from('rs_customers')
        .upsert({
          repairshopr_id: customer.id,
          firstname: customer.firstname,
          lastname: customer.lastname,
          email: customer.email,
          phone: customer.phone || null,
          mobile: customer.mobile || null,
          address: customer.address || null,
          address_2: customer.address_2 || null,
          city: customer.city || null,
          state: customer.state || null,
          zip: customer.zip || null,
          business_name: customer.business_name || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'repairshopr_id' })
        .then(({ error: syncError }) => {
          if (syncError) console.error('[API] Failed to sync customer to Supabase:', syncError);
        });
    }

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

    // Sync updated customer to rs_customers table in Supabase
    if (supabaseAdmin) {
      try {
        const { error: syncError } = await supabaseAdmin
          .from('rs_customers')
          .upsert({
            repairshopr_id: customer.id,
            firstname: customer.firstname,
            lastname: customer.lastname,
            email: customer.email,
            phone: customer.phone || null,
            mobile: customer.mobile || null,
            address: customer.address || null,
            address_2: customer.address_2 || null,
            city: customer.city || null,
            state: customer.state || null,
            zip: customer.zip || null,
            business_name: customer.business_name || null,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'repairshopr_id' });

        if (syncError) {
          console.error('[API] Failed to sync customer update to Supabase:', syncError);
        }
      } catch (error) {
        console.error('[API] Error syncing customer update to Supabase:', error);
      }
    }

    // Log the customer update for audit trail
    await logCustomerAction(
      employee,
      'customer_update',
      customerId,
      customer.fullname,
      updateData as Record<string, unknown>,
      request
    );

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
