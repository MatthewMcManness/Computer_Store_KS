import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo, getSessionToken, getCurrentUser } from '@/lib/auth';
import { createRepairShoprClient, RepairShoprAPIError, getApiToken } from '@/lib/repairshopr';
import { logTicketAction } from '@/lib/audit';
import { supabaseAdmin, TICKET_STATUS_DEFINITIONS, getDefaultCustomStatusForRepairShoprStatus } from '@/lib/supabase';
import { getEffectiveLocationId, getRepairShoprLocationId, resolveLocationId } from '@/lib/location-helpers';

export const dynamic = 'force-dynamic';

/**
 * Ensure tickets from RepairShopr are synced into rs_tickets (Supabase).
 * Any ticket not already in rs_tickets gets upserted on the fly so that
 * location filtering works immediately without relying on webhooks.
 *
 * @param tickets - Array of tickets from RepairShopr API
 *
 * @sideEffects
 * - Upserts missing tickets into rs_tickets table
 * - Upserts missing status overrides into ticket_status_overrides table
 *
 * @version 1.0.0 - 2026-02-02T00:00:00Z - Initial implementation
 */
async function ensureTicketsSynced(
  tickets: Array<{ id: number; [key: string]: unknown }>
): Promise<void> {
  if (!supabaseAdmin || tickets.length === 0) return;

  const ticketIds = tickets.map((t) => t.id);

  // Find which tickets are already in rs_tickets
  const { data: existing } = await supabaseAdmin
    .from('rs_tickets')
    .select('repairshopr_id')
    .in('repairshopr_id', ticketIds);

  const existingIds = new Set((existing || []).map((t) => t.repairshopr_id));
  const missing = tickets.filter((t) => !existingIds.has(t.id));

  if (missing.length === 0) return;

  // Resolve location IDs for missing tickets
  const locationIds = await Promise.all(
    missing.map((t) => resolveLocationId(t.location_id as number | undefined))
  );

  const records = missing.map((ticket, i) => ({
    repairshopr_id: ticket.id,
    number: (ticket.number as string) || null,
    subject: (ticket.subject as string) || null,
    status: (ticket.status as string) || null,
    problem_type: (ticket.problem_type as string) || null,
    customer_id: (ticket.customer_id as number) || null,
    customer_business_then_name: (ticket.customer_business_then_name as string) || null,
    user_id: (ticket.user_id as number) || null,
    due_date: (ticket.due_date as string) || null,
    priority: (ticket.priority as string) || null,
    resolved_at: (ticket.resolved_at as string) || null,
    asset_ids: (ticket.asset_ids as number[]) || [],
    location_id: locationIds[i],
    created_at: (ticket.created_at as string) || null,
    updated_at: (ticket.updated_at as string) || null,
    synced_at: new Date().toISOString(),
  }));

  const { error } = await supabaseAdmin
    .from('rs_tickets')
    .upsert(records, { onConflict: 'repairshopr_id' });

  if (error) {
    console.error('[API] Auto-sync tickets error:', error);
    return;
  }

  // Also create status overrides for the newly synced tickets
  const overrides = missing
    .filter((t) => t.status)
    .map((ticket) => ({
      repairshopr_ticket_id: ticket.id,
      custom_status: getDefaultCustomStatusForRepairShoprStatus(ticket.status as string),
      updated_by: 'auto_sync',
      updated_at: new Date().toISOString(),
    }));

  if (overrides.length > 0) {
    await supabaseAdmin
      .from('ticket_status_overrides')
      .upsert(overrides, { onConflict: 'repairshopr_ticket_id' });
  }

  console.log(`[API] Auto-synced ${missing.length} ticket(s) to rs_tickets`);
}

/**
 * Filter tickets by location based on the ticket's own location_id in rs_tickets.
 * Customers are location-agnostic; location is determined by the ticket itself.
 * Automatically syncs any missing tickets before filtering.
 *
 * @param tickets - Array of tickets to filter
 * @param effectiveLocationId - Location ID to filter by (null means no filtering)
 * @returns Filtered array of tickets
 *
 * @functions_called ensureTicketsSynced, supabaseAdmin
 * @called_by GET /api/repairshopr/tickets
 *
 * @version 1.0.0 - 2026-01-14T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-01-27T18:06:47Z - Filter by ticket location_id instead of customer location
 * @version 3.0.0 - 2026-02-02T00:00:00Z - Auto-sync missing tickets before filtering
 */
async function filterTicketsByLocation(
  tickets: Array<{ id: number; customer_id?: number; [key: string]: unknown }>,
  effectiveLocationId: string | null
): Promise<Array<{ id: number; customer_id?: number; [key: string]: unknown }>> {
  if (!supabaseAdmin) return tickets;

  // Auto-sync any tickets not yet in rs_tickets
  await ensureTicketsSynced(tickets);

  // No filtering needed if user has access to all locations
  if (!effectiveLocationId) {
    return tickets;
  }

  // Get ticket IDs
  const ticketIds = tickets.map((t) => t.id);

  if (ticketIds.length === 0) {
    return tickets;
  }

  // Query rs_tickets to find which tickets belong to the effective location
  const { data: allowedTickets, error } = await supabaseAdmin
    .from('rs_tickets')
    .select('repairshopr_id')
    .eq('location_id', effectiveLocationId)
    .in('repairshopr_id', ticketIds);

  if (error) {
    console.error('[API] Failed to filter tickets by location:', error);
    // On error, return no tickets rather than leaking data
    return [];
  }

  // Create a set of allowed ticket IDs for fast lookup
  const allowedTicketIds = new Set(
    (allowedTickets || []).map((t) => t.repairshopr_id)
  );

  // Filter tickets to only include those at the allowed location
  return tickets.filter((t) => allowedTicketIds.has(t.id));
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

    // Get the employee's effective location and map to RepairShopr location ID
    const currentUser = await getCurrentUser();
    const userRoles = currentUser?.roles || [];
    const userLocationId = currentUser?.location_id || null;
    const effectiveLocId = await getEffectiveLocationId(userRoles, userLocationId);

    if (effectiveLocId && !body.location_id) {
      const rsLocId = await getRepairShoprLocationId(effectiveLocId);
      if (rsLocId) {
        body.location_id = rsLocId;
      }
    }

    const ticket = await client.createTicket(apiToken, body);

    // Immediately sync the new ticket into rs_tickets so it's visible
    await ensureTicketsSynced([ticket as unknown as { id: number; [key: string]: unknown }]);

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
