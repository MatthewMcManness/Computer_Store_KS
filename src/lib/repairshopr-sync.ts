/**
 * RepairShopr Data Sync Library
 *
 * Syncs data from RepairShopr API to Supabase for:
 * - Faster local queries
 * - Data backup and ownership
 * - Eventual migration away from RepairShopr
 *
 * Strategy:
 * 1. Initial sync: Pull all data from RepairShopr to Supabase
 * 2. Dual-write: After go-live, write to both systems
 * 3. Future: Disable RepairShopr, use Supabase only
 */

import {
  createRepairShoprClient,
  getSharedApiKey,
  RepairShoprCustomer,
  RepairShoprTicket,
  RepairShoprTicketDetail,
  RepairShoprInvoice,
  RepairShoprPayment,
  RepairShoprAsset,
  RepairShoprTicketComment,
  RepairShoprProduct,
} from './repairshopr';
import { supabaseAdmin } from './supabase';

// =============================================================================
// Types
// =============================================================================

export interface SyncResult {
  success: boolean;
  entity: string;
  synced: number;
  failed: number;
  errors: string[];
  duration: number;
}

export interface FullSyncResult {
  success: boolean;
  results: SyncResult[];
  totalSynced: number;
  totalFailed: number;
  duration: number;
}

export interface SyncLogEntry {
  id?: number;
  sync_type: 'full' | 'incremental' | 'entity';
  entity_type?: string;
  started_at?: string;
  completed_at?: string;
  records_synced: number;
  records_failed: number;
  errors?: unknown;
  status: 'running' | 'completed' | 'failed';
}

// =============================================================================
// Sync Log Functions
// =============================================================================

async function createSyncLog(
  syncType: 'full' | 'incremental' | 'entity',
  entityType?: string
): Promise<number | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('rs_sync_log')
    .insert({
      sync_type: syncType,
      entity_type: entityType,
      status: 'running',
      records_synced: 0,
      records_failed: 0,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating sync log:', error);
    return null;
  }

  return data.id;
}

async function updateSyncLog(
  logId: number,
  updates: Partial<SyncLogEntry>
): Promise<void> {
  if (!supabaseAdmin) return;

  const { error } = await supabaseAdmin
    .from('rs_sync_log')
    .update({
      ...updates,
      completed_at: updates.status !== 'running' ? new Date().toISOString() : undefined,
    })
    .eq('id', logId);

  if (error) {
    console.error('Error updating sync log:', error);
  }
}

// =============================================================================
// Customer Sync
// =============================================================================

/**
 * Fetch all customers from RepairShopr with pagination
 */
async function fetchAllCustomers(apiToken: string): Promise<RepairShoprCustomer[]> {
  const client = createRepairShoprClient();
  const allCustomers: RepairShoprCustomer[] = [];
  let page = 1;
  const pageSize = 100;
  let hasMore = true;

  while (hasMore) {
    // RepairShopr customers endpoint with pagination
    const response = await fetch(
      `https://${process.env.REPAIRSHOPR_SUBDOMAIN}.repairshopr.com/api/v1/customers?api_key=${encodeURIComponent(apiToken)}&page=${page}&per_page=${pageSize}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch customers page ${page}: ${response.statusText}`);
    }

    const data = await response.json();
    const customers = data.customers || [];

    console.log(`[Sync] Customers page ${page}: found ${customers.length} customers (response keys: ${Object.keys(data).join(', ')})`);

    allCustomers.push(...customers);

    // Check if there are more pages
    hasMore = customers.length === pageSize;
    page++;

    // Rate limit protection - small delay between pages
    if (hasMore) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return allCustomers;
}

/**
 * Sync all customers from RepairShopr to Supabase
 */
export async function syncAllCustomers(): Promise<SyncResult> {
  const startTime = Date.now();
  const result: SyncResult = {
    success: false,
    entity: 'customers',
    synced: 0,
    failed: 0,
    errors: [],
    duration: 0,
  };

  if (!supabaseAdmin) {
    result.errors.push('Supabase admin client not configured');
    result.duration = Date.now() - startTime;
    return result;
  }

  const logId = await createSyncLog('entity', 'customers');

  try {
    const apiToken = getSharedApiKey();
    console.log('[Sync] Fetching all customers from RepairShopr...');

    const customers = await fetchAllCustomers(apiToken);
    console.log(`[Sync] Found ${customers.length} customers to sync`);

    // Batch upsert customers
    for (const customer of customers) {
      try {
        const { error } = await supabaseAdmin.from('rs_customers').upsert(
          {
            repairshopr_id: customer.id,
            firstname: customer.firstname,
            lastname: customer.lastname,
            fullname: customer.fullname,
            business_name: customer.business_name || null,
            email: customer.email,
            phone: customer.phone || null,
            mobile: customer.mobile || null,
            address: customer.address || null,
            address_2: customer.address_2 || null,
            city: customer.city || null,
            state: customer.state || null,
            zip: customer.zip || null,
            tags: customer.tags || [],
            properties: customer.properties || {},
            created_at: customer.created_at,
            updated_at: customer.updated_at,
            synced_at: new Date().toISOString(),
          },
          { onConflict: 'repairshopr_id' }
        );

        if (error) {
          result.failed++;
          result.errors.push(`Customer ${customer.id}: ${error.message}`);
        } else {
          result.synced++;
        }
      } catch (err) {
        result.failed++;
        result.errors.push(`Customer ${customer.id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    result.success = result.failed === 0;
  } catch (err) {
    result.errors.push(`Sync failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  result.duration = Date.now() - startTime;

  if (logId) {
    await updateSyncLog(logId, {
      status: result.success ? 'completed' : 'failed',
      records_synced: result.synced,
      records_failed: result.failed,
      errors: result.errors.length > 0 ? result.errors : null,
    });
  }

  console.log(`[Sync] Customers sync complete: ${result.synced} synced, ${result.failed} failed`);
  return result;
}

// =============================================================================
// Ticket Sync
// =============================================================================

/**
 * Fetch all tickets from RepairShopr with pagination
 */
async function fetchAllTickets(apiToken: string): Promise<RepairShoprTicket[]> {
  const allTickets: RepairShoprTicket[] = [];
  let page = 1;
  const pageSize = 100;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `https://${process.env.REPAIRSHOPR_SUBDOMAIN}.repairshopr.com/api/v1/tickets?api_key=${encodeURIComponent(apiToken)}&page=${page}&per_page=${pageSize}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch tickets page ${page}: ${response.statusText}`);
    }

    const data = await response.json();
    const tickets = data.tickets || [];

    console.log(`[Sync] Tickets page ${page}: found ${tickets.length} tickets (response keys: ${Object.keys(data).join(', ')})`);

    allTickets.push(...tickets);
    hasMore = tickets.length === pageSize;
    page++;

    if (hasMore) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return allTickets;
}

/**
 * Fetch detailed ticket with comments
 */
async function fetchTicketWithComments(
  apiToken: string,
  ticketId: number
): Promise<RepairShoprTicketDetail | null> {
  try {
    const response = await fetch(
      `https://${process.env.REPAIRSHOPR_SUBDOMAIN}.repairshopr.com/api/v1/tickets/${ticketId}?api_key=${encodeURIComponent(apiToken)}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.ticket;
  } catch {
    return null;
  }
}

/**
 * Sync all tickets from RepairShopr to Supabase
 */
export async function syncAllTickets(): Promise<SyncResult> {
  const startTime = Date.now();
  const result: SyncResult = {
    success: false,
    entity: 'tickets',
    synced: 0,
    failed: 0,
    errors: [],
    duration: 0,
  };

  if (!supabaseAdmin) {
    result.errors.push('Supabase admin client not configured');
    result.duration = Date.now() - startTime;
    return result;
  }

  const logId = await createSyncLog('entity', 'tickets');

  try {
    const apiToken = getSharedApiKey();
    console.log('[Sync] Fetching all tickets from RepairShopr...');

    const tickets = await fetchAllTickets(apiToken);
    console.log(`[Sync] Found ${tickets.length} tickets to sync`);

    for (const ticket of tickets) {
      try {
        const { error } = await supabaseAdmin.from('rs_tickets').upsert(
          {
            repairshopr_id: ticket.id,
            number: ticket.number,
            subject: ticket.subject,
            customer_id: ticket.customer_id,
            customer_business_then_name: ticket.customer_business_then_name || null,
            status: ticket.status || null,
            problem_type: ticket.problem_type || null,
            priority: ticket.priority || null,
            due_date: ticket.due_date || null,
            resolved_at: ticket.resolved_at || null,
            user_id: ticket.user_id || null,
            properties: ticket.properties || {},
            tags: ticket.tag_list || [],
            created_at: ticket.created_at,
            updated_at: ticket.updated_at,
            synced_at: new Date().toISOString(),
          },
          { onConflict: 'repairshopr_id' }
        );

        if (error) {
          result.failed++;
          result.errors.push(`Ticket ${ticket.id}: ${error.message}`);
        } else {
          result.synced++;
        }
      } catch (err) {
        result.failed++;
        result.errors.push(`Ticket ${ticket.id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    result.success = result.failed === 0;
  } catch (err) {
    result.errors.push(`Sync failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  result.duration = Date.now() - startTime;

  if (logId) {
    await updateSyncLog(logId, {
      status: result.success ? 'completed' : 'failed',
      records_synced: result.synced,
      records_failed: result.failed,
      errors: result.errors.length > 0 ? result.errors : null,
    });
  }

  console.log(`[Sync] Tickets sync complete: ${result.synced} synced, ${result.failed} failed`);
  return result;
}

/**
 * Sync all ticket comments from RepairShopr to Supabase
 * This requires fetching each ticket individually to get comments
 */
export async function syncAllTicketComments(): Promise<SyncResult> {
  const startTime = Date.now();
  const result: SyncResult = {
    success: false,
    entity: 'ticket_comments',
    synced: 0,
    failed: 0,
    errors: [],
    duration: 0,
  };

  if (!supabaseAdmin) {
    result.errors.push('Supabase admin client not configured');
    result.duration = Date.now() - startTime;
    return result;
  }

  const logId = await createSyncLog('entity', 'ticket_comments');

  try {
    const apiToken = getSharedApiKey();

    // Get all synced ticket IDs
    const { data: tickets, error: ticketError } = await supabaseAdmin
      .from('rs_tickets')
      .select('repairshopr_id');

    if (ticketError || !tickets) {
      result.errors.push('Failed to fetch synced tickets');
      result.duration = Date.now() - startTime;
      return result;
    }

    console.log(`[Sync] Fetching comments for ${tickets.length} tickets...`);

    for (const ticket of tickets) {
      try {
        const ticketDetail = await fetchTicketWithComments(apiToken, ticket.repairshopr_id);

        if (ticketDetail?.comments) {
          for (const comment of ticketDetail.comments) {
            const { error } = await supabaseAdmin.from('rs_ticket_comments').upsert(
              {
                repairshopr_id: comment.id,
                ticket_id: comment.ticket_id,
                subject: comment.subject || null,
                body: comment.body,
                tech: comment.tech || null,
                hidden: comment.hidden || false,
                user_id: comment.user_id || null,
                created_at: comment.created_at,
                updated_at: comment.updated_at,
                synced_at: new Date().toISOString(),
              },
              { onConflict: 'repairshopr_id' }
            );

            if (error) {
              result.failed++;
              result.errors.push(`Comment ${comment.id}: ${error.message}`);
            } else {
              result.synced++;
            }
          }
        }

        // Rate limit protection
        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (err) {
        result.errors.push(`Ticket ${ticket.repairshopr_id} comments: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    result.success = result.failed === 0;
  } catch (err) {
    result.errors.push(`Sync failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  result.duration = Date.now() - startTime;

  if (logId) {
    await updateSyncLog(logId, {
      status: result.success ? 'completed' : 'failed',
      records_synced: result.synced,
      records_failed: result.failed,
      errors: result.errors.length > 0 ? result.errors : null,
    });
  }

  console.log(`[Sync] Ticket comments sync complete: ${result.synced} synced, ${result.failed} failed`);
  return result;
}

// =============================================================================
// Invoice Sync
// =============================================================================

/**
 * Fetch all invoices from RepairShopr with pagination
 */
async function fetchAllInvoices(apiToken: string): Promise<RepairShoprInvoice[]> {
  const allInvoices: RepairShoprInvoice[] = [];
  let page = 1;
  const pageSize = 25;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await fetch(
      `https://${process.env.REPAIRSHOPR_SUBDOMAIN}.repairshopr.com/api/v1/invoices?api_key=${encodeURIComponent(apiToken)}&page=${page}&per_page=${pageSize}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch invoices page ${page}: ${response.statusText}`);
    }

    const data = await response.json();
    const invoices = data.invoices || [];
    const meta = data.meta || {};

    if (meta.total_pages) {
      totalPages = meta.total_pages;
    } else if (meta.total_entries && invoices.length > 0) {
      totalPages = Math.ceil(meta.total_entries / pageSize);
    }

    console.log(`[Sync] Invoices page ${page}/${totalPages}: found ${invoices.length} invoices (total: ${meta.total_entries || 'unknown'})`);

    allInvoices.push(...invoices);
    page++;

    if (page <= totalPages) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return allInvoices;
}

// =============================================================================
// Product/Inventory Sync
// =============================================================================

/**
 * Fetch all products from RepairShopr with pagination
 */
async function fetchAllProducts(apiToken: string): Promise<RepairShoprProduct[]> {
  const allProducts: RepairShoprProduct[] = [];
  let page = 1;
  const pageSize = 25; // RepairShopr products API defaults to smaller pages
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await fetch(
      `https://${process.env.REPAIRSHOPR_SUBDOMAIN}.repairshopr.com/api/v1/products?api_key=${encodeURIComponent(apiToken)}&page=${page}&per_page=${pageSize}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch products page ${page}: ${response.statusText}`);
    }

    const data = await response.json();
    const products = data.products || [];
    const meta = data.meta || {};

    // Update total pages from meta if available
    if (meta.total_pages) {
      totalPages = meta.total_pages;
    } else if (meta.total_entries && products.length > 0) {
      // Calculate from total_entries if total_pages not available
      totalPages = Math.ceil(meta.total_entries / pageSize);
    }

    console.log(`[Sync] Products page ${page}/${totalPages}: found ${products.length} products (total: ${meta.total_entries || 'unknown'})`);

    allProducts.push(...products);
    page++;

    if (page <= totalPages) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return allProducts;
}

/**
 * Sync all products/inventory from RepairShopr to Supabase
 */
export async function syncAllProducts(): Promise<SyncResult> {
  const startTime = Date.now();
  const result: SyncResult = {
    success: false,
    entity: 'products',
    synced: 0,
    failed: 0,
    errors: [],
    duration: 0,
  };

  if (!supabaseAdmin) {
    result.errors.push('Supabase admin client not configured');
    result.duration = Date.now() - startTime;
    return result;
  }

  const logId = await createSyncLog('entity', 'products');

  try {
    const apiToken = getSharedApiKey();
    console.log('[Sync] Fetching all products from RepairShopr...');

    const products = await fetchAllProducts(apiToken);
    console.log(`[Sync] Found ${products.length} products to sync`);

    for (const product of products) {
      try {
        const { error } = await supabaseAdmin.from('rs_products').upsert(
          {
            repairshopr_id: product.id,
            name: product.name,
            description: product.description || null,
            sku: product.sku || null,
            upc_code: product.upc_code || null,
            price_retail: product.price_retail ? parseFloat(product.price_retail) : null,
            price_cost: product.price_cost ? parseFloat(product.price_cost) : null,
            quantity: product.quantity || 0,
            quantity_minimum: product.quantity_minimum || null,
            category: product.category || product.product_category || null,
            taxable: product.taxable || false,
            disabled: product.disabled || false,
            notes: product.notes || null,
            location: product.location || null,
            location_id: product.location_id || null,
            vendor: product.vendor || null,
            vendor_id: product.vendor_id || null,
            created_at: product.created_at,
            updated_at: product.updated_at,
            synced_at: new Date().toISOString(),
          },
          { onConflict: 'repairshopr_id' }
        );

        if (error) {
          result.failed++;
          result.errors.push(`Product ${product.id}: ${error.message}`);
        } else {
          result.synced++;
        }
      } catch (err) {
        result.failed++;
        result.errors.push(`Product ${product.id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    result.success = result.failed === 0;
  } catch (err) {
    result.errors.push(`Sync failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  result.duration = Date.now() - startTime;

  if (logId) {
    await updateSyncLog(logId, {
      status: result.success ? 'completed' : 'failed',
      records_synced: result.synced,
      records_failed: result.failed,
      errors: result.errors.length > 0 ? result.errors : null,
    });
  }

  console.log(`[Sync] Products sync complete: ${result.synced} synced, ${result.failed} failed`);
  return result;
}

/**
 * Sync all invoices from RepairShopr to Supabase
 * Uses streaming batch processing to avoid timeouts and memory issues
 */
export async function syncAllInvoices(): Promise<SyncResult> {
  const startTime = Date.now();
  const result: SyncResult = {
    success: false,
    entity: 'invoices',
    synced: 0,
    failed: 0,
    errors: [],
    duration: 0,
  };

  if (!supabaseAdmin) {
    result.errors.push('Supabase admin client not configured');
    result.duration = Date.now() - startTime;
    return result;
  }

  const logId = await createSyncLog('entity', 'invoices');

  try {
    const apiToken = getSharedApiKey();
    console.log('[Sync] Starting invoice sync with batch processing...');

    let page = 1;
    const pageSize = 25;
    let totalPages = 1;
    const BATCH_SIZE = 100; // Upsert 100 records at a time
    let pendingInvoices: RepairShoprInvoice[] = [];

    // Helper to upsert a batch
    const upsertBatch = async (invoices: RepairShoprInvoice[]) => {
      if (invoices.length === 0) return;

      const records = invoices.map(invoice => ({
        repairshopr_id: invoice.id,
        number: invoice.number,
        customer_id: invoice.customer_id,
        customer_business_then_name: invoice.customer_business_then_name || null,
        ticket_id: invoice.ticket_id || null,
        total: parseFloat(invoice.total) || 0,
        balance_due: parseFloat(invoice.balance_due) || 0,
        status: invoice.status || null,
        date: invoice.date || null,
        due_date: invoice.due_date || null,
        po_number: invoice.po_number || null,
        note: invoice.note || null,
        is_paid: invoice.is_paid || false,
        created_at: invoice.created_at,
        updated_at: invoice.updated_at,
        synced_at: new Date().toISOString(),
      }));

      const { error } = await supabaseAdmin.from('rs_invoices').upsert(records, { onConflict: 'repairshopr_id' });

      if (error) {
        result.failed += invoices.length;
        result.errors.push(`Batch upsert failed: ${error.message}`);
      } else {
        result.synced += invoices.length;
      }
    };

    // Stream through pages, processing in batches
    while (page <= totalPages) {
      const response = await fetch(
        `https://${process.env.REPAIRSHOPR_SUBDOMAIN}.repairshopr.com/api/v1/invoices?api_key=${encodeURIComponent(apiToken)}&page=${page}&per_page=${pageSize}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch invoices page ${page}: ${response.statusText}`);
      }

      const data = await response.json();
      const invoices = data.invoices || [];
      const meta = data.meta || {};

      if (meta.total_pages) {
        totalPages = meta.total_pages;
      } else if (meta.total_entries && invoices.length > 0) {
        totalPages = Math.ceil(meta.total_entries / pageSize);
      }

      // Add to pending batch
      pendingInvoices.push(...invoices);

      // Log progress every 50 pages
      if (page % 50 === 0 || page === 1) {
        console.log(`[Sync] Invoices page ${page}/${totalPages}: ${result.synced + pendingInvoices.length} processed`);
      }

      // Upsert when batch is full
      if (pendingInvoices.length >= BATCH_SIZE) {
        await upsertBatch(pendingInvoices);
        pendingInvoices = [];
      }

      page++;

      // Small delay between pages for rate limiting
      if (page <= totalPages) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }

    // Upsert any remaining invoices
    if (pendingInvoices.length > 0) {
      await upsertBatch(pendingInvoices);
    }

    result.success = result.failed === 0;
  } catch (err) {
    result.errors.push(`Sync failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  result.duration = Date.now() - startTime;

  if (logId) {
    await updateSyncLog(logId, {
      status: result.success ? 'completed' : 'failed',
      records_synced: result.synced,
      records_failed: result.failed,
      errors: result.errors.length > 0 ? result.errors : null,
    });
  }

  console.log(`[Sync] Invoices sync complete: ${result.synced} synced, ${result.failed} failed in ${(result.duration / 1000).toFixed(1)}s`);
  return result;
}

// =============================================================================
// Payment Sync
// =============================================================================

/**
 * Fetch all payments from RepairShopr with pagination
 */
async function fetchAllPayments(apiToken: string): Promise<RepairShoprPayment[]> {
  const allPayments: RepairShoprPayment[] = [];
  let page = 1;
  const pageSize = 25;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await fetch(
      `https://${process.env.REPAIRSHOPR_SUBDOMAIN}.repairshopr.com/api/v1/payments?api_key=${encodeURIComponent(apiToken)}&page=${page}&per_page=${pageSize}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch payments page ${page}: ${response.statusText}`);
    }

    const data = await response.json();
    const payments = data.payments || [];
    const meta = data.meta || {};

    if (meta.total_pages) {
      totalPages = meta.total_pages;
    } else if (meta.total_entries && payments.length > 0) {
      totalPages = Math.ceil(meta.total_entries / pageSize);
    }

    console.log(`[Sync] Payments page ${page}/${totalPages}: found ${payments.length} payments (total: ${meta.total_entries || 'unknown'})`);

    allPayments.push(...payments);
    page++;

    if (page <= totalPages) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return allPayments;
}

/**
 * Sync all payments from RepairShopr to Supabase
 * Uses streaming batch processing to avoid timeouts and memory issues
 */
export async function syncAllPayments(): Promise<SyncResult> {
  const startTime = Date.now();
  const result: SyncResult = {
    success: false,
    entity: 'payments',
    synced: 0,
    failed: 0,
    errors: [],
    duration: 0,
  };

  if (!supabaseAdmin) {
    result.errors.push('Supabase admin client not configured');
    result.duration = Date.now() - startTime;
    return result;
  }

  const logId = await createSyncLog('entity', 'payments');

  try {
    const apiToken = getSharedApiKey();
    console.log('[Sync] Starting payment sync with batch processing...');

    let page = 1;
    const pageSize = 25;
    let totalPages = 1;
    const BATCH_SIZE = 100; // Upsert 100 records at a time
    let pendingPayments: RepairShoprPayment[] = [];

    // Helper to upsert a batch
    const upsertBatch = async (payments: RepairShoprPayment[]) => {
      if (payments.length === 0) return;

      const records = payments.map(payment => ({
        repairshopr_id: payment.id,
        invoice_id: payment.invoice_id,
        customer_id: payment.customer_id,
        customer_business_then_name: payment.customer_business_then_name || null,
        amount: parseFloat(payment.amount) || 0,
        payment_method: payment.payment_method || null,
        reference: payment.reference || null,
        applied_at: payment.applied_at || null,
        created_at: payment.created_at,
        updated_at: payment.updated_at,
        synced_at: new Date().toISOString(),
      }));

      const { error } = await supabaseAdmin.from('rs_payments').upsert(records, { onConflict: 'repairshopr_id' });

      if (error) {
        result.failed += payments.length;
        result.errors.push(`Batch upsert failed: ${error.message}`);
      } else {
        result.synced += payments.length;
      }
    };

    // Stream through pages, processing in batches
    while (page <= totalPages) {
      const response = await fetch(
        `https://${process.env.REPAIRSHOPR_SUBDOMAIN}.repairshopr.com/api/v1/payments?api_key=${encodeURIComponent(apiToken)}&page=${page}&per_page=${pageSize}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch payments page ${page}: ${response.statusText}`);
      }

      const data = await response.json();
      const payments = data.payments || [];
      const meta = data.meta || {};

      if (meta.total_pages) {
        totalPages = meta.total_pages;
      } else if (meta.total_entries && payments.length > 0) {
        totalPages = Math.ceil(meta.total_entries / pageSize);
      }

      // Add to pending batch
      pendingPayments.push(...payments);

      // Log progress every 50 pages
      if (page % 50 === 0 || page === 1) {
        console.log(`[Sync] Payments page ${page}/${totalPages}: ${result.synced + pendingPayments.length} processed`);
      }

      // Upsert when batch is full
      if (pendingPayments.length >= BATCH_SIZE) {
        await upsertBatch(pendingPayments);
        pendingPayments = [];
      }

      page++;

      // Small delay between pages for rate limiting
      if (page <= totalPages) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }

    // Upsert any remaining payments
    if (pendingPayments.length > 0) {
      await upsertBatch(pendingPayments);
    }

    result.success = result.failed === 0;
  } catch (err) {
    result.errors.push(`Sync failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  result.duration = Date.now() - startTime;

  if (logId) {
    await updateSyncLog(logId, {
      status: result.success ? 'completed' : 'failed',
      records_synced: result.synced,
      records_failed: result.failed,
      errors: result.errors.length > 0 ? result.errors : null,
    });
  }

  console.log(`[Sync] Payments sync complete: ${result.synced} synced, ${result.failed} failed in ${(result.duration / 1000).toFixed(1)}s`);
  return result;
}

// =============================================================================
// Asset Sync
// =============================================================================

/**
 * Fetch all assets from RepairShopr with pagination
 */
async function fetchAllAssets(apiToken: string): Promise<RepairShoprAsset[]> {
  const allAssets: RepairShoprAsset[] = [];
  let page = 1;
  const pageSize = 25;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await fetch(
      `https://${process.env.REPAIRSHOPR_SUBDOMAIN}.repairshopr.com/api/v1/customer_assets?api_key=${encodeURIComponent(apiToken)}&page=${page}&per_page=${pageSize}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch assets page ${page}: ${response.statusText}`);
    }

    const data = await response.json();
    // RepairShopr returns customer_assets for this endpoint, not assets
    const assets = data.customer_assets || data.assets || [];
    const meta = data.meta || {};

    if (meta.total_pages) {
      totalPages = meta.total_pages;
    } else if (meta.total_entries && assets.length > 0) {
      totalPages = Math.ceil(meta.total_entries / pageSize);
    }

    console.log(`[Sync] Assets page ${page}/${totalPages}: found ${assets.length} assets (total: ${meta.total_entries || 'unknown'})`);

    allAssets.push(...assets);
    page++;

    if (page <= totalPages) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return allAssets;
}

/**
 * Sync all assets from RepairShopr to Supabase
 */
export async function syncAllAssets(): Promise<SyncResult> {
  const startTime = Date.now();
  const result: SyncResult = {
    success: false,
    entity: 'assets',
    synced: 0,
    failed: 0,
    errors: [],
    duration: 0,
  };

  if (!supabaseAdmin) {
    result.errors.push('Supabase admin client not configured');
    result.duration = Date.now() - startTime;
    return result;
  }

  const logId = await createSyncLog('entity', 'assets');

  try {
    const apiToken = getSharedApiKey();
    console.log('[Sync] Fetching all assets from RepairShopr...');

    const assets = await fetchAllAssets(apiToken);
    console.log(`[Sync] Found ${assets.length} assets to sync`);

    for (const asset of assets) {
      try {
        const { error } = await supabaseAdmin.from('rs_assets').upsert(
          {
            repairshopr_id: asset.id,
            name: asset.name,
            asset_type_name: asset.asset_type_name || null,
            customer_id: asset.customer_id,
            properties: asset.properties || {},
            created_at: asset.created_at,
            updated_at: asset.updated_at,
            synced_at: new Date().toISOString(),
          },
          { onConflict: 'repairshopr_id' }
        );

        if (error) {
          result.failed++;
          result.errors.push(`Asset ${asset.id}: ${error.message}`);
        } else {
          result.synced++;
        }
      } catch (err) {
        result.failed++;
        result.errors.push(`Asset ${asset.id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    result.success = result.failed === 0;
  } catch (err) {
    result.errors.push(`Sync failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  result.duration = Date.now() - startTime;

  if (logId) {
    await updateSyncLog(logId, {
      status: result.success ? 'completed' : 'failed',
      records_synced: result.synced,
      records_failed: result.failed,
      errors: result.errors.length > 0 ? result.errors : null,
    });
  }

  console.log(`[Sync] Assets sync complete: ${result.synced} synced, ${result.failed} failed`);
  return result;
}

// =============================================================================
// Full Sync
// =============================================================================

/**
 * Run a full sync of all RepairShopr data to Supabase
 * Order: Customers -> Tickets -> Comments -> Assets -> Invoices -> Line Items -> Payments
 */
export async function runFullSync(): Promise<FullSyncResult> {
  const startTime = Date.now();
  const results: SyncResult[] = [];

  console.log('[Sync] Starting full RepairShopr data sync...');

  const logId = await createSyncLog('full');

  // Sync in dependency order
  // 1. Customers first (no dependencies)
  console.log('[Sync] 1/7 Syncing customers...');
  results.push(await syncAllCustomers());

  // 2. Tickets (depends on customers)
  console.log('[Sync] 2/7 Syncing tickets...');
  results.push(await syncAllTickets());

  // 3. Ticket comments (depends on tickets)
  console.log('[Sync] 3/7 Syncing ticket comments...');
  results.push(await syncAllTicketComments());

  // 4. Assets (depends on customers)
  console.log('[Sync] 4/7 Syncing assets...');
  results.push(await syncAllAssets());

  // 5. Invoices (depends on customers, tickets)
  console.log('[Sync] 5/7 Syncing invoices...');
  results.push(await syncAllInvoices());

  // 6. Products/Inventory (no dependencies)
  console.log('[Sync] 6/7 Syncing products...');
  results.push(await syncAllProducts());

  // 7. Payments (depends on invoices, customers)
  console.log('[Sync] 7/7 Syncing payments...');
  results.push(await syncAllPayments());

  const totalSynced = results.reduce((sum, r) => sum + r.synced, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const duration = Date.now() - startTime;

  const fullResult: FullSyncResult = {
    success: results.every((r) => r.success),
    results,
    totalSynced,
    totalFailed,
    duration,
  };

  if (logId) {
    await updateSyncLog(logId, {
      status: fullResult.success ? 'completed' : 'failed',
      records_synced: totalSynced,
      records_failed: totalFailed,
      errors: results.flatMap((r) => r.errors),
    });
  }

  console.log(`[Sync] Full sync complete in ${(duration / 1000).toFixed(1)}s`);
  console.log(`[Sync] Total: ${totalSynced} synced, ${totalFailed} failed`);

  return fullResult;
}

// =============================================================================
// Sync Status
// =============================================================================

/**
 * Get recent sync log entries
 */
export async function getSyncLogs(limit = 10): Promise<SyncLogEntry[]> {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('rs_sync_log')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching sync logs:', error);
    return [];
  }

  return data || [];
}

/**
 * Get counts of synced records
 */
export async function getSyncedCounts(): Promise<Record<string, number>> {
  if (!supabaseAdmin) {
    console.error('[Sync] getSyncedCounts: supabaseAdmin is not configured');
    return {};
  }

  const counts: Record<string, number> = {};

  const tables = [
    'rs_customers',
    'rs_tickets',
    'rs_ticket_comments',
    'rs_assets',
    'rs_invoices',
    'rs_products',
    'rs_payments',
  ];

  for (const table of tables) {
    const { count, error } = await supabaseAdmin
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error(`[Sync] Error counting ${table}:`, error.message);
    }

    if (!error && count !== null) {
      counts[table.replace('rs_', '')] = count;
    } else {
      counts[table.replace('rs_', '')] = 0;
    }
  }

  console.log('[Sync] getSyncedCounts result:', counts);
  return counts;
}
