import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo, getSessionToken } from '@/lib/auth';
import { createRepairShoprClient, RepairShoprAPIError, getApiToken } from '@/lib/repairshopr';
import { logTicketAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

/**
 * GET /api/repairshopr/tickets
 * Search/list tickets with optional filters
 * Query params: ?q=search&customer_id=123&status=New&page=1
 */
export async function GET(request: NextRequest) {
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

  // Get search parameters
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || undefined;
  const customerId = searchParams.get('customer_id');
  const status = searchParams.get('status') || undefined;
  const page = searchParams.get('page');

  try {
    const client = createRepairShoprClient();
    const tickets = await client.searchTickets(apiToken, {
      query,
      customer_id: customerId ? parseInt(customerId, 10) : undefined,
      status,
      page: page ? parseInt(page, 10) : undefined,
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    if (error instanceof RepairShoprAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('[API] Ticket search error:', error);
    return NextResponse.json(
      { error: 'Failed to search tickets' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/repairshopr/tickets
 * Create a new ticket
 * Body: CreateTicketInput
 */
export async function POST(request: NextRequest) {
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

  // Validate required fields
  if (!body.customer_id || !body.subject) {
    return NextResponse.json(
      { error: 'Customer ID and subject are required' },
      { status: 400 }
    );
  }

  try {
    const client = createRepairShoprClient();
    const ticket = await client.createTicket(apiToken, body);

    // Log the ticket creation for audit trail
    await logTicketAction(
      employee,
      'ticket_create',
      ticket.id,
      ticket.subject || body.subject,
      { customer_id: body.customer_id, problem_type: body.problem_type },
      request
    );

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    if (error instanceof RepairShoprAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('[API] Ticket creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
