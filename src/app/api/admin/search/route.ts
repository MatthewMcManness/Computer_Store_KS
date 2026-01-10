import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type ProtectionPlanTier = 'eset' | 'silver' | 'silver-plus' | null;

interface SearchResult {
  id: string | number;
  type: 'customer' | 'business' | 'ticket' | 'invoice';
  title: string;
  subtitle?: string;
  href: string;
  protectionPlan?: ProtectionPlanTier;
}

// Tier hierarchy for determining the highest tier
const tierHierarchy: Record<string, number> = {
  'silver-plus': 3,
  'silver': 2,
  'eset': 1,
};

/**
 * Get the highest protection plan tier for a customer from their assets
 */
async function getCustomerHighestTier(customerId: number): Promise<ProtectionPlanTier> {
  const { data: plans } = await supabase
    .from('asset_protection_plans')
    .select('plan_tier')
    .eq('repairshopr_customer_id', customerId)
    .not('plan_tier', 'is', null);

  if (!plans || plans.length === 0) return null;

  let highestTier: ProtectionPlanTier = null;
  for (const plan of plans) {
    const tier = plan.plan_tier as ProtectionPlanTier;
    if (tier && (!highestTier || tierHierarchy[tier] > tierHierarchy[highestTier])) {
      highestTier = tier;
    }
  }
  return highestTier;
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
      // Fetch protection plans for all customers in parallel
      const customerPlans = await Promise.all(
        customers.map(c => getCustomerHighestTier(c.repairshopr_id))
      );

      for (let i = 0; i < customers.length; i++) {
        const customer = customers[i];
        results.push({
          id: customer.repairshopr_id,
          type: 'customer',
          title: `${customer.firstname || ''} ${customer.lastname || ''}`.trim() || 'Unknown',
          subtitle: customer.email || customer.phone || undefined,
          href: `/admin/customers?id=${customer.repairshopr_id}`,
          protectionPlan: customerPlans[i],
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
      // Fetch protection plans for all businesses in parallel
      const businessPlans = await Promise.all(
        businesses.map(b => getCustomerHighestTier(b.repairshopr_id))
      );

      for (let i = 0; i < businesses.length; i++) {
        const business = businesses[i];
        if (business.business_name) {
          results.push({
            id: business.repairshopr_id,
            type: 'business',
            title: business.business_name,
            subtitle: business.email || business.phone || undefined,
            href: `/admin/businesses?id=${business.repairshopr_id}`,
            protectionPlan: businessPlans[i],
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
        href: `/admin/tickets?id=${ticket.repairshopr_id}`,
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
