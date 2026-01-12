import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo, getSessionToken } from '@/lib/auth';
import { createRepairShoprClient, getApiToken } from '@/lib/repairshopr';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/repairshopr/tickets/call-customer
 * Fetch all tickets with 'call_customer' status
 * Returns ticket details with customer name and when status was set
 */
export async function GET(request: NextRequest) {
  // Check employee authentication
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get API token
  const apiToken = getApiToken(await getSessionToken());
  if (!apiToken) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }

  try {
    // Get all ticket overrides with 'call_customer' status
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { data: overrides, error: dbError } = await supabaseAdmin
      .from('ticket_status_overrides')
      .select('*')
      .eq('custom_status', 'call_customer')
      .order('updated_at', { ascending: false });

    if (dbError) {
      console.error('[API] Error fetching call_customer overrides:', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch tickets' },
        { status: 500 }
      );
    }

    if (!overrides || overrides.length === 0) {
      return NextResponse.json({ tickets: [] });
    }

    // Fetch ticket details from RepairShopr for each override
    const client = createRepairShoprClient();
    const ticketsWithDetails = await Promise.all(
      overrides.map(async (override) => {
        try {
          const ticket = await client.getTicket(apiToken, override.repairshopr_ticket_id);
          return {
            id: ticket.id,
            number: ticket.number,
            subject: ticket.subject,
            customer_name: ticket.customer_business_then_name || 'Unknown Customer',
            customer_id: ticket.customer_id,
            status_changed_at: override.updated_at,
            customer_question: override.customer_question,
            created_at: ticket.created_at,
          };
        } catch (err) {
          console.error(`[API] Error fetching ticket ${override.repairshopr_ticket_id}:`, err);
          return null;
        }
      })
    );

    // Filter out any failed fetches
    const validTickets = ticketsWithDetails.filter(Boolean);

    return NextResponse.json({ tickets: validTickets });
  } catch (error) {
    console.error('[API] Call customer tickets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call customer tickets' },
      { status: 500 }
    );
  }
}
