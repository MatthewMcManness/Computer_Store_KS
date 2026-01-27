import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo, getSessionToken, getCurrentUser } from '@/lib/auth';
import { createRepairShoprClient, RepairShoprAPIError, getApiToken } from '@/lib/repairshopr';
import { logTicketAction } from '@/lib/audit';
import { supabaseAdmin } from '@/lib/supabase';
import { getEffectiveLocationId } from '@/lib/location-helpers';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Check if the user has access to view a ticket based on location.
 *
 * @param customerId - Customer ID from the ticket
 * @param effectiveLocationId - Location ID to check against (null means no filtering)
 * @returns true if user has access, false otherwise
 *
 * @functions_called supabaseAdmin
 * @called_by GET /api/repairshopr/tickets/[id], PUT /api/repairshopr/tickets/[id]
 *
 * @version 1.0.0 - 2026-01-14T00:00:00Z - Initial implementation
 */
async function hasLocationAccess(
  ticketId: number,
  effectiveLocationId: string | null
): Promise<boolean> {
  // No filtering needed if user has access to all locations
  if (!effectiveLocationId || !supabaseAdmin) {
    return true;
  }

  // Check if ticket belongs to the effective location
  const { data: ticket, error } = await supabaseAdmin
    .from('rs_tickets')
    .select('location_id')
    .eq('repairshopr_id', ticketId)
    .single();

  if (error) {
    console.error('[API] Failed to check ticket location access:', error);
    return false;
  }

  return ticket?.location_id === effectiveLocationId;
}

/**
 * GET /api/repairshopr/tickets/[id]
 * Get a single ticket with full details (comments, timers, etc.)
 *
 * Location filtering:
 * - Verifies user has access to view the ticket based on customer location
 * - Returns 403 if user doesn't have access to the ticket's customer location
 *
 * @version 1.0.0 - Initial implementation
 * @version 1.1.0 - 2026-01-14T00:00:00Z - Added location-based access check
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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

  const { id } = await params;
  const ticketId = parseInt(id, 10);

  if (isNaN(ticketId) || ticketId <= 0) {
    return NextResponse.json(
      { error: 'Invalid ticket ID' },
      { status: 400 }
    );
  }

  try {
    const client = createRepairShoprClient();
    const ticket = await client.getTicket(apiToken, ticketId);

    // Check if user has access to this ticket based on customer location
    if (!(await hasLocationAccess(ticket.id, effectiveLocationId))) {
      return NextResponse.json(
        { error: 'Access denied - ticket belongs to a different location' },
        { status: 403 }
      );
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    if (error instanceof RepairShoprAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('[API] Ticket fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/repairshopr/tickets/[id]
 * Update a ticket
 * Body: UpdateTicketInput
 *
 * Location filtering:
 * - Verifies user has access to update the ticket based on customer location
 * - Returns 403 if user doesn't have access to the ticket's customer location
 *
 * @version 1.0.0 - Initial implementation
 * @version 1.1.0 - 2026-01-14T00:00:00Z - Added location-based access check
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

  try {
    const client = createRepairShoprClient();

    // First fetch the ticket to check location access
    const existingTicket = await client.getTicket(apiToken, ticketId);

    // Check if user has access to this ticket based on customer location
    if (!(await hasLocationAccess(existingTicket.id, effectiveLocationId))) {
      return NextResponse.json(
        { error: 'Access denied - ticket belongs to a different location' },
        { status: 403 }
      );
    }

    const ticket = await client.updateTicket(apiToken, ticketId, body);

    // Log the ticket update for audit trail
    await logTicketAction(
      employee,
      'ticket_update',
      ticketId,
      ticket.subject,
      body as Record<string, unknown>,
      request
    );

    return NextResponse.json({ ticket });
  } catch (error) {
    if (error instanceof RepairShoprAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('[API] Ticket update error:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}
