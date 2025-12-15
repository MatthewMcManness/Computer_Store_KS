import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getSessionToken } from '@/lib/auth';
import { createRepairShoprClient, RepairShoprAPIError } from '@/lib/repairshopr';
import {
  getTicketStatusOverride,
  setTicketStatusOverride,
  getRepairShoprStatusForCustomStatus,
  statusRequiresCustomerQuestion,
  TICKET_STATUS_DEFINITIONS,
  TicketCustomStatus,
} from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/repairshopr/tickets/[id]/status
 * Get the custom status override for a ticket
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Check employee authentication
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const ticketId = parseInt(id, 10);

  if (isNaN(ticketId) || ticketId <= 0) {
    return NextResponse.json(
      { error: 'Invalid ticket ID' },
      { status: 400 }
    );
  }

  try {
    const statusOverride = await getTicketStatusOverride(ticketId);

    return NextResponse.json({
      status_override: statusOverride,
      definitions: TICKET_STATUS_DEFINITIONS,
    });
  } catch (error) {
    console.error('[API] Ticket status fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket status' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/repairshopr/tickets/[id]/status
 * Update the custom status for a ticket
 * Body: { custom_status: string, customer_question?: string }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  // Check employee authentication
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiToken = await getSessionToken();
  if (!apiToken) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }

  const { id } = await params;
  const ticketId = parseInt(id, 10);

  if (isNaN(ticketId) || ticketId <= 0) {
    return NextResponse.json(
      { error: 'Invalid ticket ID' },
      { status: 400 }
    );
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

  const { custom_status, customer_question } = body;

  // Validate custom_status
  if (!custom_status) {
    return NextResponse.json(
      { error: 'custom_status is required' },
      { status: 400 }
    );
  }

  const validStatuses = TICKET_STATUS_DEFINITIONS.map(d => d.status);
  if (!validStatuses.includes(custom_status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
      { status: 400 }
    );
  }

  // Validate customer_question if required
  if (statusRequiresCustomerQuestion(custom_status as TicketCustomStatus) && !customer_question) {
    return NextResponse.json(
      { error: 'customer_question is required for this status' },
      { status: 400 }
    );
  }

  try {
    // 1. Update the custom status in Supabase
    const statusOverride = await setTicketStatusOverride(
      ticketId,
      custom_status as TicketCustomStatus,
      customer_question || null,
      user.name || user.email
    );

    if (!statusOverride) {
      return NextResponse.json(
        { error: 'Failed to update custom status in database' },
        { status: 500 }
      );
    }

    // 2. Update the RepairShopr status to match the mapped status
    const repairShoprStatus = getRepairShoprStatusForCustomStatus(custom_status as TicketCustomStatus);

    const client = createRepairShoprClient();
    await client.updateTicket(apiToken, ticketId, {
      status: repairShoprStatus,
    });

    return NextResponse.json({
      status_override: statusOverride,
      repairshopr_status: repairShoprStatus,
    });
  } catch (error) {
    if (error instanceof RepairShoprAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('[API] Ticket status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket status' },
      { status: 500 }
    );
  }
}
