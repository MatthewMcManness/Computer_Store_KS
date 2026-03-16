import { NextResponse } from 'next/server';
import { getCurrentUser, getSessionToken } from '@/lib/auth';
import { createRepairShoprClient, getApiToken } from '@/lib/repairshopr';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/deprecated-statuses
 *
 * Fetches all tickets with deprecated_rs_status custom status.
 * Only accessible by owner and lead_developer roles.
 *
 * Returns tickets with:
 * - Basic ticket info from RepairShopr
 * - Status override info (who set it, when)
 * - All notes for context
 *
 * @returns JSON with tickets array
 *
 * @functions_called getCurrentUser, supabaseAdmin, createRepairShoprClient
 * @called_by DeprecatedStatusesPage
 *
 * @version 1.0.0 - 2026-01-13T00:00:00Z - Initial implementation
 */
export async function GET() {
  // Check employee authentication
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user has owner or lead_developer role
  const roles = user.roles || [];
  const hasAccess = roles.includes('owner') || roles.includes('lead_developer');
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Access denied. This page is restricted to owner and lead developer.' },
      { status: 403 }
    );
  }

  // Get API token
  const apiToken = getApiToken(await getSessionToken());
  if (!apiToken) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 500 }
    );
  }

  try {
    // Fetch all tickets with deprecated_rs_status from Supabase
    const { data: overrides, error: overrideError } = await supabaseAdmin
      .from('ticket_status_overrides')
      .select('*')
      .eq('custom_status', 'deprecated_rs_status')
      .order('updated_at', { ascending: false });

    if (overrideError) {
      console.error('[API] Failed to fetch deprecated status overrides:', overrideError);
      return NextResponse.json(
        { error: 'Failed to fetch tickets' },
        { status: 500 }
      );
    }

    if (!overrides || overrides.length === 0) {
      return NextResponse.json({ tickets: [] });
    }

    // Fetch ticket details from RepairShopr
    const client = createRepairShoprClient();
    const ticketPromises = overrides.map(async (override) => {
      try {
        // Fetch ticket details
        const ticket = await client.getTicket(apiToken, override.repairshopr_ticket_id);
        if (!ticket) return null;

        // Fetch ticket notes/comments
        let notes: Array<{
          id: number;
          body: string;
          created_at: string;
          tech: string | null;
          subject: string | null;
          hidden: boolean;
        }> = [];
        try {
          const commentsResponse = await fetch(
            `https://${process.env.REPAIRSHOPR_SUBDOMAIN}.repairshopr.com/api/v1/tickets/${override.repairshopr_ticket_id}/comments`,
            {
              headers: {
                Authorization: `Bearer ${apiToken}`,
              },
            }
          );
          if (commentsResponse.ok) {
            const commentsData = await commentsResponse.json();
            notes = (commentsData.comments || []).map((c: {
              id: number;
              body: string;
              created_at: string;
              tech?: string;
              subject?: string;
              hidden?: boolean;
            }) => ({
              id: c.id,
              body: c.body || '',
              created_at: c.created_at,
              tech: c.tech || null,
              subject: c.subject || null,
              hidden: c.hidden || false,
            }));
          }
        } catch {
          // Ignore note fetch errors, continue with empty notes
        }

        return {
          id: ticket.id,
          number: ticket.number?.toString() || ticket.id.toString(),
          subject: ticket.subject || 'No subject',
          status: ticket.status || 'Unknown',
          customer_name: ticket.customer?.fullname || ticket.customer?.business_name || 'Unknown',
          created_at: ticket.created_at,
          updated_at: ticket.updated_at,
          override_updated_by: override.updated_by,
          override_updated_at: override.updated_at,
          notes,
        };
      } catch (err) {
        console.error(`[API] Failed to fetch ticket ${override.repairshopr_ticket_id}:`, err);
        return null;
      }
    });

    const ticketResults = await Promise.all(ticketPromises);
    const tickets = ticketResults.filter((t): t is NonNullable<typeof t> => t !== null);

    return NextResponse.json({ tickets });
  } catch (err) {
    console.error('[API] Error fetching deprecated status tickets:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
