/**
 * Fix Ticket Locations API
 *
 * Fixes location_id for tickets that were synced before location mapping existed.
 * Fetches each ticket from RepairShopr to get its actual location_id.
 *
 * @version 1.0.0 - 2026-02-05T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-02-05T21:40:00Z - Fixed to update tickets based on ticket_status_overrides
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { getLocationByRepairShoprId } from '@/lib/location-helpers';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/fix-ticket-locations
 *
 * Gets tickets from ticket_status_overrides, fetches their location from
 * RepairShopr, and updates rs_tickets with the correct location_id.
 *
 * Query params:
 * - status: Filter to only fix tickets with this custom_status (e.g., 'completed')
 *
 * @version 3.0.0 - 2026-02-05T22:00:00Z - Added status filter for targeted fixes
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Check admin role
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client not configured' },
        { status: 500 }
      );
    }

    const apiKey = process.env.REPAIRSHOPR_API_KEY;
    const subdomain = process.env.REPAIRSHOPR_SUBDOMAIN;

    if (!apiKey || !subdomain) {
      return NextResponse.json(
        { error: 'RepairShopr API credentials not configured' },
        { status: 500 }
      );
    }

    // Get optional status filter from query params
    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get('status');

    // Build query for ticket_status_overrides
    let query = supabaseAdmin
      .from('ticket_status_overrides')
      .select('repairshopr_ticket_id')
      .order('updated_at', { ascending: false });

    // Apply status filter if provided (much faster for targeted fixes)
    if (statusFilter) {
      query = query.eq('custom_status', statusFilter);
    }

    const { data: overrides, error: overrideError } = await query.limit(500);

    if (overrideError) {
      return NextResponse.json(
        { error: `Failed to fetch overrides: ${overrideError.message}` },
        { status: 500 }
      );
    }

    const ticketIds = overrides?.map(o => o.repairshopr_ticket_id) || [];
    console.log(`[FixLocations] Processing ${ticketIds.length} tickets${statusFilter ? ` with status '${statusFilter}'` : ''} from overrides`);

    const results = {
      processed: 0,
      updated: 0,
      holtonCount: 0,
      topekaCount: 0,
      noLocation: 0,
      errors: [] as string[],
    };

    // Process in batches of 20 to avoid rate limiting
    const BATCH_SIZE = 20;
    for (let i = 0; i < ticketIds.length; i += BATCH_SIZE) {
      const batch = ticketIds.slice(i, i + BATCH_SIZE);

      // Fetch each ticket's location from RepairShopr
      const updates: { ticketId: number; locationUuid: string }[] = [];

      for (const ticketId of batch) {
        try {
          const response = await fetch(
            `https://${subdomain}.repairshopr.com/api/v1/tickets/${ticketId}?api_key=${encodeURIComponent(apiKey)}`
          );

          if (!response.ok) {
            results.errors.push(`Ticket ${ticketId}: ${response.statusText}`);
            continue;
          }

          const data = await response.json();
          const ticket = data.ticket;

          if (ticket?.location_id) {
            const locationUuid = await getLocationByRepairShoprId(ticket.location_id);
            if (locationUuid) {
              updates.push({ ticketId, locationUuid });
              if (ticket.location_id === 3310) {
                results.holtonCount++;
              } else if (ticket.location_id === 3311) {
                results.topekaCount++;
              }
            }
          } else {
            results.noLocation++;
          }

          results.processed++;
        } catch (err) {
          results.errors.push(`Ticket ${ticketId}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      // Batch update rs_tickets
      for (const update of updates) {
        const { error: updateError } = await supabaseAdmin
          .from('rs_tickets')
          .update({ location_id: update.locationUuid })
          .eq('repairshopr_id', update.ticketId);

        if (updateError) {
          results.errors.push(`Update ticket ${update.ticketId}: ${updateError.message}`);
        } else {
          results.updated++;
        }
      }

      // Rate limiting between batches
      if (i + BATCH_SIZE < ticketIds.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Log progress
      console.log(`[FixLocations] Progress: ${Math.min(i + BATCH_SIZE, ticketIds.length)}/${ticketIds.length}`);
    }

    console.log(`[FixLocations] Done: ${results.updated} updated (${results.holtonCount} Holton, ${results.topekaCount} Topeka)`);

    return NextResponse.json({
      success: true,
      results,
      message: `Updated ${results.updated} tickets (${results.holtonCount} Holton, ${results.topekaCount} Topeka, ${results.noLocation} no location)`,
    });
  } catch (error) {
    console.error('[FixLocations] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
