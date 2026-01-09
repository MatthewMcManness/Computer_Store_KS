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
    // Search customers
    const { data: customers } = await supabase
      .from('repairshopr_customers')
      .select('id, firstname, lastname, email, phone')
      .or(`firstname.ilike.${searchPattern},lastname.ilike.${searchPattern},email.ilike.${searchPattern},phone.ilike.${searchPattern}`)
      .limit(5);

    if (customers) {
      for (const customer of customers) {
        results.push({
          id: customer.id,
          type: 'customer',
          title: `${customer.firstname || ''} ${customer.lastname || ''}`.trim() || 'Unknown',
          subtitle: customer.email || customer.phone || undefined,
          href: `/admin/customers?search=${encodeURIComponent(`${customer.firstname || ''} ${customer.lastname || ''}`.trim())}`,
        });
      }
    }

    // Search businesses
    const { data: businesses } = await supabase
      .from('repairshopr_customers')
      .select('id, business_name, email, phone')
      .not('business_name', 'is', null)
      .ilike('business_name', searchPattern)
      .limit(5);

    if (businesses) {
      for (const business of businesses) {
        if (business.business_name) {
          results.push({
            id: business.id,
            type: 'business',
            title: business.business_name,
            subtitle: business.email || business.phone || undefined,
            href: `/admin/businesses?search=${encodeURIComponent(business.business_name)}`,
          });
        }
      }
    }

    // Search tickets
    const { data: tickets } = await supabase
      .from('repairshopr_tickets')
      .select('id, number, subject, status, customer_id')
      .or(`number.ilike.${searchPattern},subject.ilike.${searchPattern}`)
      .limit(5);

    if (tickets) {
      for (const ticket of tickets) {
        results.push({
          id: ticket.id,
          type: 'ticket',
          title: `#${ticket.number}: ${ticket.subject || 'No subject'}`,
          subtitle: `Status: ${ticket.status || 'Unknown'}`,
          href: `/admin/tickets?search=${encodeURIComponent(ticket.number?.toString() || '')}`,
        });
      }
    }

    // Search invoices
    const { data: invoices } = await supabase
      .from('repairshopr_invoices')
      .select('id, number, total, status, customer_id')
      .or(`number.ilike.${searchPattern}`)
      .limit(5);

    if (invoices) {
      for (const invoice of invoices) {
        results.push({
          id: invoice.id,
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
