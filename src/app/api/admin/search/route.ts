import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SearchResult {
  id: string | number;
  type: 'customer' | 'business' | 'ticket' | 'invoice';
  title: string;
  subtitle?: string;
  href: string;
}

/**
 * GET /api/admin/search
 * Universal search across customers, businesses, tickets, and invoices
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results: SearchResult[] = [];
  const searchPattern = `%${query}%`;

  try {
    // Search customers (rs_customers table from sync)
    const { data: customers } = await supabase
      .from('rs_customers')
      .select('repairshopr_id, firstname, lastname, email, phone')
      .or(`firstname.ilike.${searchPattern},lastname.ilike.${searchPattern},email.ilike.${searchPattern},phone.ilike.${searchPattern}`)
      .limit(5);

    if (customers) {
      for (const customer of customers) {
        results.push({
          id: customer.repairshopr_id,
          type: 'customer',
          title: `${customer.firstname || ''} ${customer.lastname || ''}`.trim() || 'Unknown',
          subtitle: customer.email || customer.phone || undefined,
          href: `/admin/customers?search=${encodeURIComponent(`${customer.firstname || ''} ${customer.lastname || ''}`.trim())}`,
        });
      }
    }

    // Search businesses (rs_customers table from sync)
    const { data: businesses } = await supabase
      .from('rs_customers')
      .select('repairshopr_id, business_name, email, phone')
      .not('business_name', 'is', null)
      .ilike('business_name', searchPattern)
      .limit(5);

    if (businesses) {
      for (const business of businesses) {
        if (business.business_name) {
          results.push({
            id: business.repairshopr_id,
            type: 'business',
            title: business.business_name,
            subtitle: business.email || business.phone || undefined,
            href: `/admin/businesses?search=${encodeURIComponent(business.business_name)}`,
          });
        }
      }
    }

    // Search tickets (rs_tickets table from sync)
    // First try exact number match (if query is numeric), then search subject
    const isNumericQuery = /^\d+$/.test(query);
    let tickets: Array<{ repairshopr_id: number; number: number; subject: string | null; status: string | null; customer_id: number }> | null = null;

    if (isNumericQuery) {
      const { data } = await supabase
        .from('rs_tickets')
        .select('repairshopr_id, number, subject, status, customer_id')
        .eq('number', parseInt(query))
        .limit(5);
      tickets = data;
    }

    // Also search by subject
    const { data: ticketsBySubject } = await supabase
      .from('rs_tickets')
      .select('repairshopr_id, number, subject, status, customer_id')
      .ilike('subject', searchPattern)
      .limit(5);

    // Combine results, avoiding duplicates
    const ticketIds = new Set(tickets?.map(t => t.repairshopr_id) || []);
    const allTickets = [...(tickets || []), ...(ticketsBySubject?.filter(t => !ticketIds.has(t.repairshopr_id)) || [])];

    for (const ticket of allTickets) {
      results.push({
        id: ticket.repairshopr_id,
        type: 'ticket',
        title: `#${ticket.number}: ${ticket.subject || 'No subject'}`,
        subtitle: `Status: ${ticket.status || 'Unknown'}`,
        href: `/admin/tickets?search=${encodeURIComponent(ticket.number?.toString() || '')}`,
      });
    }

    // Search invoices (rs_invoices table from sync)
    // Invoice number is numeric, so use exact match for numeric queries
    let invoices: Array<{ repairshopr_id: number; number: number; total: number | null; status: string | null; customer_id: number }> | null = null;

    if (isNumericQuery) {
      const { data } = await supabase
        .from('rs_invoices')
        .select('repairshopr_id, number, total, status, customer_id')
        .eq('number', parseInt(query))
        .limit(5);
      invoices = data;
    }

    if (invoices) {
      for (const invoice of invoices) {
        results.push({
          id: invoice.repairshopr_id,
          type: 'invoice',
          title: `Invoice #${invoice.number}`,
          subtitle: `$${invoice.total?.toFixed(2) || '0.00'} - ${invoice.status || 'Unknown'}`,
          href: `/admin/tickets?invoice=${invoice.number}`,
        });
      }
    }

    // Sort results by relevance (exact matches first)
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase().includes(query.toLowerCase()) ? 0 : 1;
      const bExact = b.title.toLowerCase().includes(query.toLowerCase()) ? 0 : 1;
      return aExact - bExact;
    });

    return NextResponse.json({
      results: results.slice(0, 15),
      query
    });
  } catch (error) {
    console.error('[Search API] Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
