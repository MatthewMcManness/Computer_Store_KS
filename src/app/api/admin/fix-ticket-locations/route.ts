/**
 * Fix Ticket Locations API
 *
 * One-time fix endpoint to update location_id for tickets that were synced
 * before the location mapping was properly set up.
 *
 * This fetches tickets from each RepairShopr location and updates their
 * location_id in rs_tickets to the correct Supabase UUID.
 *
 * @version 1.0.0 - 2026-02-05T00:00:00Z - Initial implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { getLocationByRepairShoprId } from '@/lib/location-helpers';

export const dynamic = 'force-dynamic';

// RepairShopr location IDs
const HOLTON_RS_LOCATION_ID = 3310;
const TOPEKA_RS_LOCATION_ID = 3311;

interface RepairShoprTicket {
  id: number;
  number?: string;
  location_id?: number | null;
}

/**
 * POST /api/admin/fix-ticket-locations
 *
 * Fetches all tickets from RepairShopr for each location and updates
 * their location_id in rs_tickets.
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

    const results = {
      holton: { fetched: 0, updated: 0, errors: [] as string[] },
      topeka: { fetched: 0, updated: 0, errors: [] as string[] },
    };

    // Get Supabase UUIDs for each location
    const holtonUuid = await getLocationByRepairShoprId(HOLTON_RS_LOCATION_ID);
    const topekaUuid = await getLocationByRepairShoprId(TOPEKA_RS_LOCATION_ID);

    console.log('[FixLocations] Holton UUID:', holtonUuid);
    console.log('[FixLocations] Topeka UUID:', topekaUuid);

    // Fetch and update Holton tickets
    if (holtonUuid) {
      const holtonTickets = await fetchTicketsByLocation(subdomain, apiKey, HOLTON_RS_LOCATION_ID);
      results.holton.fetched = holtonTickets.length;
      console.log(`[FixLocations] Found ${holtonTickets.length} Holton tickets`);

      if (holtonTickets.length > 0) {
        const ticketIds = holtonTickets.map(t => t.id);

        const { error, count } = await supabaseAdmin
          .from('rs_tickets')
          .update({ location_id: holtonUuid })
          .in('repairshopr_id', ticketIds);

        if (error) {
          results.holton.errors.push(error.message);
          console.error('[FixLocations] Holton update error:', error);
        } else {
          results.holton.updated = count || ticketIds.length;
          console.log(`[FixLocations] Updated ${results.holton.updated} Holton tickets`);
        }
      }
    } else {
      results.holton.errors.push('Could not find Holton location UUID');
    }

    // Fetch and update Topeka tickets (to ensure they have correct location too)
    if (topekaUuid) {
      const topekaTickets = await fetchTicketsByLocation(subdomain, apiKey, TOPEKA_RS_LOCATION_ID);
      results.topeka.fetched = topekaTickets.length;
      console.log(`[FixLocations] Found ${topekaTickets.length} Topeka tickets`);

      if (topekaTickets.length > 0) {
        const ticketIds = topekaTickets.map(t => t.id);

        const { error, count } = await supabaseAdmin
          .from('rs_tickets')
          .update({ location_id: topekaUuid })
          .in('repairshopr_id', ticketIds);

        if (error) {
          results.topeka.errors.push(error.message);
          console.error('[FixLocations] Topeka update error:', error);
        } else {
          results.topeka.updated = count || ticketIds.length;
          console.log(`[FixLocations] Updated ${results.topeka.updated} Topeka tickets`);
        }
      }
    } else {
      results.topeka.errors.push('Could not find Topeka location UUID');
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Fixed locations: ${results.holton.updated} Holton tickets, ${results.topeka.updated} Topeka tickets`,
    });
  } catch (error) {
    console.error('[FixLocations] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Fetch all tickets from RepairShopr for a specific location.
 * Handles pagination to get all tickets.
 */
async function fetchTicketsByLocation(
  subdomain: string,
  apiKey: string,
  locationId: number
): Promise<RepairShoprTicket[]> {
  const allTickets: RepairShoprTicket[] = [];
  let page = 1;
  const pageSize = 100;
  let hasMore = true;

  while (hasMore) {
    const url = `https://${subdomain}.repairshopr.com/api/v1/tickets?api_key=${encodeURIComponent(apiKey)}&location_id=${locationId}&page=${page}&per_page=${pageSize}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`[FixLocations] Failed to fetch location ${locationId} page ${page}: ${response.statusText}`);
      break;
    }

    const data = await response.json();
    const tickets = data.tickets || [];

    allTickets.push(...tickets);

    hasMore = tickets.length === pageSize;
    page++;

    // Rate limiting
    if (hasMore) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return allTickets;
}
