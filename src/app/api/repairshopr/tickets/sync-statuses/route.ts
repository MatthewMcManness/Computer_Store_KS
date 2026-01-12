/**
 * Sync Status Overrides Endpoint
 *
 * Creates status overrides for all tickets in Supabase that don't have one yet.
 * Uses the ticket's RepairShopr status to determine the appropriate custom status.
 *
 * This endpoint should be called once to backfill existing tickets, then the
 * webhook will handle new/updated tickets going forward.
 *
 * @version 1.0.0 - 2026-01-12T00:00:00Z - Initial implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo } from '@/lib/auth';
import { supabaseAdmin, getDefaultCustomStatusForRepairShoprStatus } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * POST /api/repairshopr/tickets/sync-statuses
 * Create status overrides for all tickets that don't have one
 *
 * @sideEffects
 * - Creates records in ticket_status_overrides table
 */
export async function POST(request: NextRequest) {
  // Check employee authentication
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    // Get all tickets from rs_tickets that don't have a status override
    const { data: ticketsWithoutOverride, error: ticketError } = await supabaseAdmin
      .from('rs_tickets')
      .select('repairshopr_id, status')
      .not('repairshopr_id', 'in',
        supabaseAdmin.from('ticket_status_overrides').select('repairshopr_ticket_id')
      );

    // Alternative approach: Get all tickets and all overrides, then filter in code
    const { data: allTickets, error: allTicketsError } = await supabaseAdmin
      .from('rs_tickets')
      .select('repairshopr_id, status');

    if (allTicketsError) {
      console.error('[Sync] Failed to fetch tickets:', allTicketsError);
      return NextResponse.json(
        { error: 'Failed to fetch tickets' },
        { status: 500 }
      );
    }

    if (!allTickets || allTickets.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No tickets found in database',
        created: 0,
      });
    }

    // Get existing overrides
    const { data: existingOverrides, error: overrideError } = await supabaseAdmin
      .from('ticket_status_overrides')
      .select('repairshopr_ticket_id');

    if (overrideError) {
      console.error('[Sync] Failed to fetch existing overrides:', overrideError);
      return NextResponse.json(
        { error: 'Failed to fetch existing overrides' },
        { status: 500 }
      );
    }

    // Create a set of ticket IDs that already have overrides
    const existingTicketIds = new Set(
      (existingOverrides || []).map((o) => o.repairshopr_ticket_id)
    );

    // Find tickets without overrides
    const ticketsNeedingOverride = allTickets.filter(
      (t) => !existingTicketIds.has(t.repairshopr_id) && t.status
    );

    if (ticketsNeedingOverride.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All tickets already have status overrides',
        created: 0,
        total: allTickets.length,
      });
    }

    // Create overrides for tickets that need them
    const overridesToCreate = ticketsNeedingOverride.map((ticket) => ({
      repairshopr_ticket_id: ticket.repairshopr_id,
      custom_status: getDefaultCustomStatusForRepairShoprStatus(ticket.status),
      updated_by: 'sync_backfill',
    }));

    // Insert in batches to avoid hitting limits
    const batchSize = 100;
    let created = 0;
    let errors = 0;

    for (let i = 0; i < overridesToCreate.length; i += batchSize) {
      const batch = overridesToCreate.slice(i, i + batchSize);
      const { error: insertError } = await supabaseAdmin
        .from('ticket_status_overrides')
        .insert(batch);

      if (insertError) {
        console.error('[Sync] Batch insert error:', insertError);
        errors += batch.length;
      } else {
        created += batch.length;
      }
    }

    console.log(`[Sync] Created ${created} status overrides, ${errors} errors`);

    return NextResponse.json({
      success: true,
      message: `Created status overrides for ${created} tickets`,
      created,
      errors,
      total: allTickets.length,
    });
  } catch (error) {
    console.error('[Sync] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/repairshopr/tickets/sync-statuses
 * Check how many tickets need status overrides
 */
export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    // Get counts
    const { count: totalTickets } = await supabaseAdmin
      .from('rs_tickets')
      .select('*', { count: 'exact', head: true });

    const { count: totalOverrides } = await supabaseAdmin
      .from('ticket_status_overrides')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      totalTickets: totalTickets || 0,
      totalOverrides: totalOverrides || 0,
      needsSync: (totalTickets || 0) - (totalOverrides || 0),
    });
  } catch (error) {
    console.error('[Sync] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Check failed' },
      { status: 500 }
    );
  }
}
