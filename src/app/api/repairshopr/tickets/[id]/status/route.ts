import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo, getSessionToken, getCurrentUser } from '@/lib/auth';
import { createRepairShoprClient, RepairShoprAPIError, getApiToken } from '@/lib/repairshopr';
import { logTicketAction } from '@/lib/audit';
import {
  supabaseAdmin,
  getTicketStatusOverride,
  setTicketStatusOverride,
  getRepairShoprStatusForCustomStatus,
  statusRequiresCustomerQuestion,
  TICKET_STATUS_DEFINITIONS,
  TicketCustomStatus,
} from '@/lib/supabase';
import { getEffectiveLocationId } from '@/lib/location-helpers';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Check if the user has access to a ticket based on its customer's location.
 *
 * @param ticketId - The ticket ID to check
 * @param apiToken - API token for RepairShopr
 * @param effectiveLocationId - Location ID to check against (null means no filtering)
 * @returns true if user has access, false otherwise
 *
 * @version 1.0.0 - 2026-01-14T00:00:00Z - Initial implementation
 */
async function hasTicketLocationAccess(
  ticketId: number,
  apiToken: string,
  effectiveLocationId: string | null
): Promise<boolean> {
  // No filtering needed if user has access to all locations
  if (!effectiveLocationId || !supabaseAdmin) {
    return true;
  }

  // Fetch ticket from RepairShopr to get customer_id
  const client = createRepairShoprClient();
  const ticket = await client.getTicket(apiToken, ticketId);

  if (!ticket.customer_id) {
    // Tickets without customer_id are denied for safety
    return false;
  }

  // Check if customer belongs to the effective location
  const { data: customer, error } = await supabaseAdmin
    .from('rs_customers')
    .select('location_id')
    .eq('repairshopr_id', ticket.customer_id)
    .single();

  if (error) {
    console.error('[API] Failed to check ticket status location access:', error);
    return false;
  }

  return customer?.location_id === effectiveLocationId;
}

/**
 * GET /api/repairshopr/tickets/[id]/status
 * Get the custom status override for a ticket
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Check employee authentication
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
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

  // Check location access before allowing status update
  try {
    if (!(await hasTicketLocationAccess(ticketId, apiToken, effectiveLocationId))) {
      return NextResponse.json(
        { error: 'Access denied - ticket belongs to a different location' },
        { status: 403 }
      );
    }
  } catch (error) {
    if (error instanceof RepairShoprAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: 'Failed to verify ticket access' },
      { status: 500 }
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
      employee.name
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

    // Log the status change for audit trail
    await logTicketAction(
      employee,
      'ticket_status_change',
      ticketId,
      undefined,
      { custom_status, repairshopr_status: repairShoprStatus, customer_question: customer_question || null },
      request
    );

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
