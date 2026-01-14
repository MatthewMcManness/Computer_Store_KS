import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getEffectiveLocationId } from '@/lib/location-helpers';

export const dynamic = 'force-dynamic';

// Lazy initialization of Supabase client to avoid build-time errors
let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabase;
}

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
async function getCustomerHighestTier(client: SupabaseClient, customerId: number): Promise<ProtectionPlanTier> {
  const { data: plans } = await client
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
 *
 * Location filtering:
 * - Customers and businesses are filtered by location
 * - Tickets are filtered based on customer location
 * - Users with global access see all results
 *
 * @version 1.0.0 - Initial implementation
 * @version 1.1.0 - 2026-01-14T00:00:00Z - Added location-based filtering
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

  // Get Supabase client
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  // Get the effective location ID for filtering
  const userRoles = user.roles || [];
  const userLocationId = user.location_id || null;
  const effectiveLocationId = await getEffectiveLocationId(userRoles, userLocationId);

  const results: SearchResult[] = [];
  const searchPattern = `%${query}%`;

  try {
    // Search customers (rs_customers table from sync) with location filtering
    let customerQuery = supabaseClient
      .from('rs_customers')
      .select('repairshopr_id, firstname, lastname, email, phone')
      .or(`firstname.ilike.${searchPattern},lastname.ilike.${searchPattern},email.ilike.${searchPattern},phone.ilike.${searchPattern}`);

    // Apply location filter if user doesn't have access to all locations
    if (effectiveLocationId) {
      customerQuery = customerQuery.eq('location_id', effectiveLocationId);
    }

    const { data: customers } = await customerQuery.limit(5);

    if (customers) {
      // Fetch protection plans for all customers in parallel
      const customerPlans = await Promise.all(
        customers.map(c => getCustomerHighestTier(supabaseClient, c.repairshopr_id))
      );

      for (let i = 0; i < customers.length; i++) {
        const customer = customers[i];
        results.push({
          id: customer.repairshopr_id,
          type: 'customer',
          title: `${customer.firstname || ''} ${customer.lastname || ''}`.trim() || 'Unknown',
          subtitle: customer.email || customer.phone || undefined,
          href: `/admin/customers/${customer.repairshopr_id}`,
          protectionPlan: customerPlans[i],
        });
      }
    }

    // Search businesses (rs_customers table from sync) with location filtering
    let businessQuery = supabaseClient
      .from('rs_customers')
      .select('repairshopr_id, business_name, email, phone')
      .not('business_name', 'is', null)
      .ilike('business_name', searchPattern);

    // Apply location filter if user doesn't have access to all locations
    if (effectiveLocationId) {
      businessQuery = businessQuery.eq('location_id', effectiveLocationId);
    }

    const { data: businesses } = await businessQuery.limit(5);

    if (businesses) {
      // Fetch protection plans for all businesses in parallel
      const businessPlans = await Promise.all(
        businesses.map(b => getCustomerHighestTier(supabaseClient, b.repairshopr_id))
      );

      for (let i = 0; i < businesses.length; i++) {
        const business = businesses[i];
        if (business.business_name) {
          results.push({
            id: business.repairshopr_id,
            type: 'business',
            title: business.business_name,
            subtitle: business.email || business.phone || undefined,
            href: `/admin/businesses/${business.repairshopr_id}`,
            protectionPlan: businessPlans[i],
          });
        }
      }
    }

    // Search tickets (rs_tickets table from sync) with location filtering
    // First try exact number match (if query is numeric), then search subject
    const isNumericQuery = /^\d+$/.test(query);
    let tickets: Array<{ repairshopr_id: number; number: number; subject: string | null; status: string | null; customer_id: number }> | null = null;

    if (isNumericQuery) {
      const { data } = await supabaseClient
        .from('rs_tickets')
        .select('repairshopr_id, number, subject, status, customer_id')
        .eq('number', parseInt(query))
        .limit(5);
      tickets = data;
    }

    // Also search by subject
    const { data: ticketsBySubject } = await supabaseClient
      .from('rs_tickets')
      .select('repairshopr_id, number, subject, status, customer_id')
      .ilike('subject', searchPattern)
      .limit(5);

    // Combine results, avoiding duplicates
    const ticketIds = new Set(tickets?.map(t => t.repairshopr_id) || []);
    let allTickets = [...(tickets || []), ...(ticketsBySubject?.filter(t => !ticketIds.has(t.repairshopr_id)) || [])];

    // Filter tickets by location if user doesn't have access to all locations
    if (effectiveLocationId && allTickets.length > 0) {
      const ticketCustomerIds = allTickets.map(t => t.customer_id).filter(id => id);
      if (ticketCustomerIds.length > 0) {
        const { data: allowedCustomers } = await supabaseClient
          .from('rs_customers')
          .select('repairshopr_id')
          .eq('location_id', effectiveLocationId)
          .in('repairshopr_id', ticketCustomerIds);

        const allowedCustomerIds = new Set((allowedCustomers || []).map(c => c.repairshopr_id));
        allTickets = allTickets.filter(t => t.customer_id && allowedCustomerIds.has(t.customer_id));
      }
    }

    for (const ticket of allTickets) {
      results.push({
        id: ticket.repairshopr_id,
        type: 'ticket',
        title: `#${ticket.number}: ${ticket.subject || 'No subject'}`,
        subtitle: `Status: ${ticket.status || 'Unknown'}`,
        href: `/admin/tickets?id=${ticket.repairshopr_id}`,
      });
    }

    // Search invoices (rs_invoices table from sync) with location filtering
    // Invoice number is numeric, so use exact match for numeric queries
    let invoices: Array<{ repairshopr_id: number; number: number; total: number | null; status: string | null; customer_id: number }> | null = null;

    if (isNumericQuery) {
      const { data } = await supabaseClient
        .from('rs_invoices')
        .select('repairshopr_id, number, total, status, customer_id')
        .eq('number', parseInt(query))
        .limit(5);
      invoices = data;
    }

    if (invoices && invoices.length > 0) {
      // Filter invoices by location if user doesn't have access to all locations
      let filteredInvoices = invoices;
      if (effectiveLocationId) {
        const invoiceCustomerIds = invoices.map(i => i.customer_id).filter(id => id);
        if (invoiceCustomerIds.length > 0) {
          const { data: allowedCustomers } = await supabaseClient
            .from('rs_customers')
            .select('repairshopr_id')
            .eq('location_id', effectiveLocationId)
            .in('repairshopr_id', invoiceCustomerIds);

          const allowedCustomerIds = new Set((allowedCustomers || []).map(c => c.repairshopr_id));
          filteredInvoices = invoices.filter(i => i.customer_id && allowedCustomerIds.has(i.customer_id));
        }
      }

      for (const invoice of filteredInvoices) {
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
