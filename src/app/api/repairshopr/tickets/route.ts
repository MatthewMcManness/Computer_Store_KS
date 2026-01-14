import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo, getSessionToken, getCurrentUser } from '@/lib/auth';
import { createRepairShoprClient, RepairShoprAPIError, getApiToken } from '@/lib/repairshopr';
import { logTicketAction } from '@/lib/audit';
import { supabaseAdmin, TICKET_STATUS_DEFINITIONS } from '@/lib/supabase';
import { getEffectiveLocationId } from '@/lib/location-helpers';

export const dynamic = 'force-dynamic';

/**
 * Filter tickets by location based on customer location_id.
 *
 * @param tickets - Array of tickets to filter
 * @param effectiveLocationId - Location ID to filter by (null means no filtering)
 * @returns Filtered array of tickets
 *
 * @functions_called supabaseAdmin
 * @called_by GET /api/repairshopr/tickets
 *
 * @version 1.0.0 - 2026-01-14T00:00:00Z - Initial implementation
 */
async function filterTicketsByLocation(
  tickets: Array<{ id: number; customer_id?: number; [key: string]: unknown }>,
  effectiveLocationId: string | null
): Promise<Array<{ id: number; customer_id?: number; [key: string]: unknown }>> {
  // No filtering needed if user has access to all locations
  if (!effectiveLocationId || !supabaseAdmin) {
    return tickets;
  }

  // Get customer IDs from tickets
  const customerIds = tickets
    .map((t) => t.customer_id)
    .filter((id): id is number => typeof id === 'number');

  if (customerIds.length === 0) {
    return tickets;
  }

  // Query rs_customers to find which customers belong to the effective location
  const { data: allowedCustomers, error } = await supabaseAdmin
    .from('rs_customers')
    .select('repairshopr_id')
    .eq('location_id', effectiveLocationId)
    .in('repairshopr_id', customerIds);

  if (error) {
    console.error('[API] Failed to filter tickets by location:', error);
    // On error, return no tickets rather than leaking data
    return [];
  }

  // Create a set of allowed customer IDs for fast lookup
  const allowedCustomerIds = new Set(
    (allowedCustomers || []).map((c) => c.repairshopr_id)
  );

  // Filter tickets to only include those with customers in the allowed location
  return tickets.filter((t) => {
    if (typeof t.customer_id !== 'number') {
      // Tickets without customer_id are filtered out for safety
      return false;
    }
    return allowedCustomerIds.has(t.customer_id);
  });
}

/**
 * GET /api/repairshopr/tickets
 * Search/list tickets with optional filters
 * Query params: ?q=search&customer_id=123&status=new&page=1
 *
 * Status filtering:
 * - If status is a custom status (new, diagnosing, repairing, etc.),
 *   filters by ticket_status_overrides in Supabase
 * - If status is a RepairShopr status (New, In Progress, etc.),
 *   passes directly to RepairShopr API
 * - If no status, returns all tickets
 *
 * Location filtering:
 * - Tickets are filtered based on the customer's location_id
 * - Users with global access see all tickets (unless they select a location)
 * - Regular users only see tickets for their assigned location
 *
 * @version 1.0.0 - 2026-01-12T00:00:00Z - Initial implementation
 * @version 1.1.0 - 2026-01-12T00:00:00Z - Added custom status filtering via Supabase
 * @version 1.2.0 - 2026-01-14T00:00:00Z - Added location-based filtering
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

  // Get current user for location filtering
  const currentUser = await getCurrentUser();
  const userRoles = currentUser?.roles || [];
  const userLocationId = currentUser?.location_id || null;

  // Get the effective location ID to filter by
  const effectiveLocationId = await getEffectiveLocationId(userRoles, userLocationId);

  // Get search parameters
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || undefined;
  const customerId = searchParams.get('customer_id');
  const status = searchParams.get('status') || undefined;
  const page = searchParams.get('page');

  try {
    const client = createRepairShoprClient();

    // Check if status is a custom status (from our definitions)
    const isCustomStatus = status && TICKET_STATUS_DEFINITIONS.some(
      (def) => def.status === status
    );

    if (isCustomStatus && supabaseAdmin) {
      // Filter by custom status via Supabase ticket_status_overrides
      // First, get all ticket IDs with this custom status
      const { data: overrides, error: overrideError } = await supabaseAdmin
        .from('ticket_status_overrides')
        .select('repairshopr_ticket_id')
        .eq('custom_status', status);

      if (overrideError) {
        console.error('[API] Failed to fetch status overrides:', overrideError);
        return NextResponse.json(
          { error: 'Failed to filter by status' },
          { status: 500 }
        );
      }

      if (!overrides || overrides.length === 0) {
        // No tickets with this custom status
        return NextResponse.json({ tickets: [] });
      }

      // Get the ticket IDs
      const ticketIds = new Set(overrides.map((o) => o.repairshopr_ticket_id));

      // Fetch tickets from RepairShopr (without status filter, we'll filter ourselves)
      // Fetch multiple pages to ensure we get all matching tickets
      const allTickets: unknown[] = [];
      let currentPage = 1;
      const maxPages = 5; // Limit to prevent infinite loops

      while (currentPage <= maxPages) {
        const pageTickets = await client.searchTickets(apiToken, {
          query,
          customer_id: customerId ? parseInt(customerId, 10) : undefined,
          page: currentPage,
        });

        if (!pageTickets || pageTickets.length === 0) {
          break;
        }

        // Filter to only tickets with matching custom status
        const matchingTickets = pageTickets.filter(
          (ticket: { id: number }) => ticketIds.has(ticket.id)
        );
        allTickets.push(...matchingTickets);

        // If we have enough tickets or no more pages, stop
        if (pageTickets.length < 25 || allTickets.length >= 50) {
          break;
        }

        currentPage++;
      }

      // Filter tickets by location
      const filteredTickets = await filterTicketsByLocation(
        allTickets as Array<{ id: number; customer_id?: number; [key: string]: unknown }>,
        effectiveLocationId
      );

      return NextResponse.json({ tickets: filteredTickets });
    }

    // For RepairShopr statuses or no status filter, pass directly to API
    const tickets = await client.searchTickets(apiToken, {
      query,
      customer_id: customerId ? parseInt(customerId, 10) : undefined,
      status: isCustomStatus ? undefined : status, // Don't pass custom status to RS
      page: page ? parseInt(page, 10) : undefined,
    });

    // Filter tickets by location
    const filteredTickets = await filterTicketsByLocation(
      tickets as unknown as Array<{ id: number; customer_id?: number; [key: string]: unknown }>,
      effectiveLocationId
    );

    return NextResponse.json({ tickets: filteredTickets });
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
