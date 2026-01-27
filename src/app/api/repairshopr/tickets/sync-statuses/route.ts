/**
 * Sync Status Overrides Endpoint
 *
 * Creates or updates status overrides for all tickets in Supabase based on
 * their current RepairShopr status.
 *
 * @version 1.0.0 - 2026-01-12T00:00:00Z - Initial implementation
 * @version 1.1.0 - 2026-01-13T00:00:00Z - Changed to upsert all tickets, not just new ones
 * @version 1.2.0 - 2026-01-13T00:00:00Z - Added pagination to fetch all tickets (not just first 1000)
 */

import { NextResponse } from 'next/server';
import { getEmployeeAuditInfo } from '@/lib/auth';
import { supabaseAdmin, getDefaultCustomStatusForRepairShoprStatus } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * POST /api/repairshopr/tickets/sync-statuses
 * Create or update status overrides for all tickets based on their RS status
 *
 * @sideEffects
 * - Upserts records in ticket_status_overrides table
 */
export async function POST() {
  // Check employee authentication
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    // Get all tickets from rs_tickets with pagination (Supabase default limit is 1000)
    const allTickets: { repairshopr_id: number; status: string | null }[] = [];
    const pageSize = 1000;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const { data: batch, error: batchError } = await supabaseAdmin
        .from('rs_tickets')
        .select('repairshopr_id, status')
        .range(offset, offset + pageSize - 1);

      if (batchError) {
        console.error('[Sync] Failed to fetch tickets batch:', batchError);
        return NextResponse.json(
          { error: 'Failed to fetch tickets' },
          { status: 500 }
        );
      }

      if (batch && batch.length > 0) {
        allTickets.push(...batch);
        offset += pageSize;
        hasMore = batch.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    console.log(`[Sync] Fetched ${allTickets.length} total tickets`);

    if (allTickets.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No tickets found in database',
        synced: 0,
      });
    }

    // Filter to only tickets with a status
    const ticketsWithStatus = allTickets.filter((t) => t.status);

    if (ticketsWithStatus.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No tickets with status found',
        synced: 0,
        total: allTickets.length,
      });
    }

    // Create override records for all tickets
    const overridesToUpsert = ticketsWithStatus.map((ticket) => ({
      repairshopr_ticket_id: ticket.repairshopr_id,
      custom_status: getDefaultCustomStatusForRepairShoprStatus(ticket.status ?? ''),
      updated_by: 'sync_all',
      updated_at: new Date().toISOString(),
    }));

    // Upsert in batches to avoid hitting limits
    const batchSize = 100;
    let synced = 0;
    let errors = 0;

    for (let i = 0; i < overridesToUpsert.length; i += batchSize) {
      const batch = overridesToUpsert.slice(i, i + batchSize);
      const { error: upsertError } = await supabaseAdmin
        .from('ticket_status_overrides')
        .upsert(batch, { onConflict: 'repairshopr_ticket_id' });

      if (upsertError) {
        console.error('[Sync] Batch upsert error:', upsertError);
        errors += batch.length;
      } else {
        synced += batch.length;
      }
    }

    console.log(`[Sync] Synced ${synced} status overrides, ${errors} errors`);

    return NextResponse.json({
      success: true,
      message: `Synced status overrides for ${synced} tickets`,
      synced,
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
 * Check how many tickets have status overrides
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
