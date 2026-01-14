import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo, getSessionToken } from '@/lib/auth';
import { createRepairShoprClient, getApiToken } from '@/lib/repairshopr';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/repairshopr/tickets/call-customer
 * Fetch all tickets that need customer calls from both:
 * 1. RepairShopr tickets with "CnC" status
 * 2. Supabase overrides with 'call_customer' custom status
 * Returns combined, deduplicated list with customer details
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
    const client = createRepairShoprClient();
    const ticketMap = new Map<number, {
      id: number;
      number: string;
      subject: string;
      customer_name: string;
      customer_id: number;
      status_changed_at: string;
      customer_question: string | null;
      created_at: string;
      source: 'repairshopr' | 'supabase' | 'both';
    }>();

    // 1. Fetch tickets from RepairShopr with "CnC" status
    try {
      const cncTickets = await client.searchTickets(apiToken, { status: 'CnC' });
      for (const ticket of cncTickets) {
        ticketMap.set(ticket.id, {
          id: ticket.id,
          number: ticket.number,
          subject: ticket.subject,
          customer_name: ticket.customer_business_then_name || 'Unknown Customer',
          customer_id: ticket.customer_id,
          status_changed_at: ticket.updated_at || ticket.created_at,
          customer_question: null,
          created_at: ticket.created_at,
          source: 'repairshopr',
        });
      }
    } catch (err) {
      console.error('[API] Error fetching CnC tickets from RepairShopr:', err);
      // Continue - we'll still try Supabase
    }

    // 2. Get tickets with 'call_customer' override from Supabase
    if (supabaseAdmin) {
      const { data: overrides, error: dbError } = await supabaseAdmin
        .from('ticket_status_overrides')
        .select('*')
        .eq('custom_status', 'call_customer')
        .order('updated_at', { ascending: false });

      if (dbError) {
        console.error('[API] Error fetching call_customer overrides:', dbError);
      } else if (overrides && overrides.length > 0) {
        // Fetch ticket details for overrides not already in map
        await Promise.all(
          overrides.map(async (override) => {
            const existing = ticketMap.get(override.repairshopr_ticket_id);
            if (existing) {
              // Merge - prefer Supabase data for customer_question
              existing.customer_question = override.customer_question;
              existing.status_changed_at = override.updated_at;
              existing.source = 'both';
            } else {
              // Fetch from RepairShopr
              try {
                const ticket = await client.getTicket(apiToken, override.repairshopr_ticket_id);
                ticketMap.set(ticket.id, {
                  id: ticket.id,
                  number: ticket.number,
                  subject: ticket.subject,
                  customer_name: ticket.customer_business_then_name || 'Unknown Customer',
                  customer_id: ticket.customer_id,
                  status_changed_at: override.updated_at,
                  customer_question: override.customer_question,
                  created_at: ticket.created_at,
                  source: 'supabase',
                });
              } catch (err) {
                console.error(`[API] Error fetching ticket ${override.repairshopr_ticket_id}:`, err);
              }
            }
          })
        );
      }
    }

    // Convert map to array and sort by status_changed_at ascending (oldest first)
    const tickets = Array.from(ticketMap.values()).sort(
      (a, b) => new Date(a.status_changed_at).getTime() - new Date(b.status_changed_at).getTime()
    );

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('[API] Call customer tickets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call customer tickets' },
      { status: 500 }
    );
  }
}
