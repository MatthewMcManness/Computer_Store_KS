import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo, getSessionToken, getCurrentUser } from '@/lib/auth';
import { createRepairShoprClient, RepairShoprAPIError, getApiToken } from '@/lib/repairshopr';
import { logTicketAction } from '@/lib/audit';
import { supabaseAdmin, getDefaultCustomStatusForRepairShoprStatus, getTicketComments, syncTicketComments } from '@/lib/supabase';
import { getEffectiveLocationId, resolveLocationId } from '@/lib/location-helpers';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Ensure a single ticket is synced to rs_tickets. If it doesn't exist
 * in Supabase yet, upsert it so location filtering works immediately.
 *
 * @param ticket - Ticket object from RepairShopr API
 *
 * @sideEffects
 * - Upserts ticket into rs_tickets if missing
 * - Upserts status override if missing
 *
 * @version 1.0.0 - 2026-02-02T00:00:00Z - Initial implementation
 */
async function ensureTicketSynced(
  ticket: { id: number; [key: string]: unknown }
): Promise<void> {
  if (!supabaseAdmin) return;

  const { data: existing } = await supabaseAdmin
    .from('rs_tickets')
    .select('repairshopr_id')
    .eq('repairshopr_id', ticket.id)
    .single();

  if (existing) return;

  const locationId = await resolveLocationId(ticket.location_id as number | undefined);

  const { error } = await supabaseAdmin
    .from('rs_tickets')
    .upsert({
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
      location_id: locationId,
      created_at: (ticket.created_at as string) || null,
      updated_at: (ticket.updated_at as string) || null,
      synced_at: new Date().toISOString(),
    }, { onConflict: 'repairshopr_id' });

  if (error) {
    console.error('[API] Auto-sync single ticket error:', error);
    return;
  }

  if (ticket.status) {
    await supabaseAdmin
      .from('ticket_status_overrides')
      .upsert({
        repairshopr_ticket_id: ticket.id,
        custom_status: getDefaultCustomStatusForRepairShoprStatus(ticket.status as string),
        updated_by: 'auto_sync',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'repairshopr_ticket_id' });
  }

  console.log(`[API] Auto-synced ticket ${ticket.id} to rs_tickets`);
}

/**
 * Check if the user has access to view a ticket based on location.
 * Auto-syncs the ticket first if it's not in rs_tickets.
 *
 * @param ticketId - RepairShopr ticket ID
 * @param effectiveLocationId - Location ID to check against (null means no filtering)
 * @param ticket - Full ticket object from RepairShopr (used for auto-sync)
 * @returns true if user has access, false otherwise
 *
 * @functions_called ensureTicketSynced, supabaseAdmin
 * @called_by GET /api/repairshopr/tickets/[id], PUT /api/repairshopr/tickets/[id]
 *
 * @version 1.0.0 - 2026-01-14T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-02-02T00:00:00Z - Auto-sync ticket before checking access
 */
async function hasLocationAccess(
  ticketId: number,
  effectiveLocationId: string | null,
  ticket?: { id: number; [key: string]: unknown }
): Promise<boolean> {
  // No filtering needed if user has access to all locations
  if (!effectiveLocationId || !supabaseAdmin) {
    return true;
  }

  // Auto-sync the ticket if we have the full object
  if (ticket) {
    await ensureTicketSynced(ticket);
  }

  // Check if ticket belongs to the effective location
  const { data: rsTicket, error } = await supabaseAdmin
    .from('rs_tickets')
    .select('location_id')
    .eq('repairshopr_id', ticketId)
    .single();

  if (error) {
    console.error('[API] Failed to check ticket location access:', error);
    return false;
  }

  return rsTicket?.location_id === effectiveLocationId;
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
    // Supabase-first: try to get ticket metadata from our database
    if (supabaseAdmin) {
      const { data: cached } = await supabaseAdmin
        .from('rs_tickets')
        .select('*')
        .eq('repairshopr_id', ticketId)
        .single();

      if (cached) {
        // Check location access using cached data
        if (effectiveLocationId && cached.location_id !== effectiveLocationId) {
          return NextResponse.json(
            { error: 'Access denied - ticket belongs to a different location' },
            { status: 403 }
          );
        }

        // Load comments from Supabase AND fetch fresh ticket from RepairShopr in parallel.
        // The list-API sync may store a truncated subject; the detail endpoint returns the full text.
        const client = createRepairShoprClient();
        const [comments, freshTicket] = await Promise.all([
          getTicketComments(ticketId),
          client.getTicket(apiToken, ticketId).catch(() => null),
        ]);

        // Prefer the fresh subject from RepairShopr (untruncated)
        const fullSubject = freshTicket?.subject || cached.subject;

        // Update the cached subject in the background if it differs
        if (freshTicket?.subject && freshTicket.subject !== cached.subject) {
          supabaseAdmin!.from('rs_tickets')
            .update({ subject: freshTicket.subject })
            .eq('repairshopr_id', ticketId)
            .then(() => {})
            .catch(() => {});
        }

        // Build ticket response from Supabase data
        const ticket = {
          id: cached.repairshopr_id,
          number: cached.number,
          subject: fullSubject,
          status: cached.status,
          problem_type: cached.problem_type,
          customer_id: cached.customer_id,
          customer_business_then_name: cached.customer_business_then_name,
          user_id: cached.user_id,
          due_date: cached.due_date,
          priority: cached.priority,
          resolved_at: cached.resolved_at,
          asset_ids: cached.asset_ids || [],
          location_id: cached.location_id,
          created_at: cached.created_at,
          updated_at: cached.updated_at,
          comments: comments.map((c) => ({
            id: c.repairshopr_comment_id || c.id,
            body: c.body,
            subject: c.subject,
            tech: c.tech,
            hidden: c.hidden,
            created_at: c.created_at,
          })),
        };

        return NextResponse.json({ ticket });
      }
    }

    // Fallback: fetch from RepairShopr if not in Supabase
    const client = createRepairShoprClient();
    const ticket = await client.getTicket(apiToken, ticketId);

    // Check if user has access to this ticket based on location (auto-syncs if needed)
    if (!(await hasLocationAccess(ticket.id, effectiveLocationId, ticket as unknown as { id: number; [key: string]: unknown }))) {
      return NextResponse.json(
        { error: 'Access denied - ticket belongs to a different location' },
        { status: 403 }
      );
    }

    // Sync comments from RepairShopr to Supabase for future requests
    if (ticket.comments && ticket.comments.length > 0) {
      syncTicketComments(ticketId, ticket.comments).catch((err) => {
        console.error('[API] Failed to sync ticket comments to Supabase:', err);
      });
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

    // First fetch the ticket to check location access (auto-syncs if needed)
    const existingTicket = await client.getTicket(apiToken, ticketId);

    if (!(await hasLocationAccess(existingTicket.id, effectiveLocationId, existingTicket as unknown as { id: number; [key: string]: unknown }))) {
      return NextResponse.json(
        { error: 'Access denied - ticket belongs to a different location' },
        { status: 403 }
      );
    }

    const ticket = await client.updateTicket(apiToken, ticketId, body);

    // Sync updated ticket to rs_tickets in Supabase
    if (supabaseAdmin) {
      const locationId = await resolveLocationId(ticket.location_id as number | undefined);
      await supabaseAdmin
        .from('rs_tickets')
        .upsert({
          repairshopr_id: ticket.id,
          number: ticket.number || null,
          subject: ticket.subject || null,
          status: ticket.status || null,
          problem_type: ticket.problem_type || null,
          customer_id: ticket.customer_id || null,
          customer_business_then_name: ticket.customer_business_then_name || null,
          user_id: ticket.user_id || null,
          due_date: ticket.due_date || null,
          priority: ticket.priority || null,
          resolved_at: ticket.resolved_at || null,
          asset_ids: ticket.asset_ids || [],
          location_id: locationId,
          created_at: ticket.created_at || null,
          updated_at: ticket.updated_at || null,
          synced_at: new Date().toISOString(),
        }, { onConflict: 'repairshopr_id' })
        .then(({ error: syncErr }) => {
          if (syncErr) console.error('[API] Failed to sync ticket update to Supabase:', syncErr);
        });
    }

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
