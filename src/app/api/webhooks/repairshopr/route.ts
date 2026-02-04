/**
 * RepairShopr Webhook Handler
 *
 * Receives webhook events from RepairShopr Notification Center for real-time sync.
 *
 * RepairShopr sends webhooks in the format: { text, html, link, attributes }
 * - `text`: Human-readable event description
 * - `html`: HTML version of the notification
 * - `link`: URL to the entity (e.g., https://subdomain.repairshopr.com/tickets/12345)
 * - `attributes`: Complete entity data object
 *
 * Entity type is determined by parsing the `link` URL path:
 * - /tickets/ → ticket or comment event
 * - /customers/ → customer event
 * - /invoices/ → invoice event
 *
 * Comment vs ticket is differentiated by checking `attributes.ticket_id`
 * (comments have ticket_id referencing their parent ticket).
 *
 * Supported events:
 * - Ticket: created, updated, status changed (syncs ticket + embedded customer/comments)
 * - Comment: added to ticket (syncs to rs_ticket_comments)
 * - Customer: created, updated
 * - Invoice: created, updated, paid
 * Note: Assets are NOT synced from RepairShopr. We only push assets TO RepairShopr.
 *
 * To set up in RepairShopr:
 * 1. Go to Admin > Notification Center
 * 2. Create a new Notification Set
 * 3. Enter webhook URL: https://yoursite.com/api/webhooks/repairshopr
 * 4. Enable the Webhook checkbox for desired events
 *
 * Security:
 * - Optional: Set REPAIRSHOPR_WEBHOOK_SECRET env var for signature validation
 * - Validates request payload structure
 * - Rate limited by Render
 *
 * @version 1.0.0 - 2026-01-12T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-02-04T21:25:23Z - Rewrote to handle actual RepairShopr payload format {text, html, link, attributes}
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getDefaultCustomStatusForRepairShoprStatus, setCustomerProtectionPlan, getCustomerAssetsUpdated } from '@/lib/supabase';
import { getProtectionPlanTier } from '@/lib/repairshopr';
import { createHmac } from 'crypto';

export const dynamic = 'force-dynamic';

// =============================================================================
// Types
// =============================================================================

/**
 * Actual payload format sent by RepairShopr Notification Center webhooks
 */
interface RepairShoprWebhookPayload {
  text: string;
  html: string;
  link: string;
  attributes: Record<string, unknown>;
}

/**
 * Entity type parsed from the webhook link URL
 */
type WebhookEntityType = 'ticket' | 'comment' | 'customer' | 'invoice' | 'unknown';

interface RepairShoprWebhookCustomer {
  id: number;
  firstname?: string;
  lastname?: string;
  fullname?: string;
  business_name?: string | null;
  email?: string;
  phone?: string | null;
  mobile?: string | null;
  address?: string | null;
  address_2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  created_at?: string;
  updated_at?: string;
  tags?: string[];
  properties?: Record<string, unknown>;
  custom_fields?: Record<string, unknown>;
}

interface RepairShoprWebhookTicket {
  id: number;
  number?: number | string;
  subject?: string;
  status?: string;
  problem_type?: string;
  customer_id?: number;
  customer_business_then_name?: string;
  user_id?: number | null;
  created_at?: string;
  updated_at?: string;
  due_date?: string | null;
  priority?: string | null;
  resolved_at?: string | null;
  location_id?: number | null;
  comments?: RepairShoprWebhookComment[];
  customer?: RepairShoprWebhookCustomer;
}

interface RepairShoprWebhookComment {
  id: number;
  ticket_id: number;
  subject?: string;
  body: string;
  tech?: string;
  hidden?: boolean;
  user_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

interface RepairShoprWebhookInvoice {
  id: number;
  number?: string;
  customer_id?: number;
  total?: number;
  balance?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  paid_at?: string | null;
}

// =============================================================================
// Payload Parsing
// =============================================================================

/**
 * Determine entity type from the webhook link URL and attributes.
 *
 * Link format: https://subdomain.repairshopr.com/{entity_type}/{id}
 * Comment events also link to /tickets/ but their attributes contain ticket_id
 * (referencing the parent ticket) rather than being the ticket itself.
 *
 * @param link - The RepairShopr URL from the webhook payload
 * @param attributes - The attributes object from the webhook payload
 * @param text - The text description from the webhook payload
 * @returns The determined entity type
 *
 * @version 1.0.0 - 2026-02-04T21:25:23Z - Initial implementation
 */
function determineEntityType(
  link: string,
  attributes: Record<string, unknown>,
  text: string
): WebhookEntityType {
  const textLower = text.toLowerCase();

  // Comments: attributes have ticket_id (pointing to parent) and body field
  if ('ticket_id' in attributes && 'body' in attributes) {
    return 'comment';
  }

  // Also check text for comment indicators
  if (textLower.includes('comment was added') || textLower.includes('comment added')) {
    return 'comment';
  }

  // Parse link URL for entity type
  try {
    const url = new URL(link);
    const pathParts = url.pathname.split('/').filter(Boolean);

    const firstPart = pathParts[0];
    if (firstPart) {
      const entityPath = firstPart.toLowerCase();

      if (entityPath === 'tickets') return 'ticket';
      if (entityPath === 'customers') return 'customer';
      if (entityPath === 'invoices') return 'invoice';
      if (entityPath === 'estimates') return 'invoice'; // Estimates use invoice table
    }
  } catch {
    // Link parsing failed, try to infer from attributes
  }

  // Fallback: infer from attributes structure
  if ('subject' in attributes && 'status' in attributes && 'customer_id' in attributes) {
    return 'ticket';
  }
  if ('firstname' in attributes || 'lastname' in attributes || 'email' in attributes) {
    return 'customer';
  }
  if ('balance' in attributes && 'total' in attributes) {
    return 'invoice';
  }

  return 'unknown';
}

// =============================================================================
// Security Helpers
// =============================================================================

/**
 * Validate webhook signature if secret is configured.
 *
 * @param body - Raw request body string
 * @param signature - Signature header value from the request
 * @returns true if signature is valid or no secret configured
 *
 * @version 1.0.0 - 2026-01-12T00:00:00Z - Initial implementation
 */
function validateSignature(body: string, signature: string | null): boolean {
  const secret = process.env.REPAIRSHOPR_WEBHOOK_SECRET;

  // If no secret configured, skip validation (allow all webhooks)
  if (!secret) {
    return true;
  }

  if (!signature) {
    console.log('[Webhook] Missing signature header');
    return false;
  }

  const expectedSignature = createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return signature === expectedSignature || signature === `sha256=${expectedSignature}`;
}

// =============================================================================
// Sync Handlers
// =============================================================================

/**
 * Sync a customer record to Supabase.
 * Also syncs protection plan tier to customer_silver_plans table for legacy customers
 * (assets_updated=false). Migrated customers use per-device plans in the devices table.
 * The businesses table auto-links via PostgreSQL trigger when business_name changes.
 *
 * @param customer - Customer data from webhook attributes or embedded in ticket
 *
 * @sideEffects
 * - Upserts record to rs_customers table (triggers business auto-linking)
 * - For legacy customers only: upserts protection plan tier to customer_silver_plans
 *
 * @functions_called getProtectionPlanTier, setCustomerProtectionPlan, getCustomerAssetsUpdated
 *
 * @version 1.0.0 - 2026-01-12T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-02-04T21:25:23Z - Added custom_fields, protection plan sync, assets_updated check
 */
async function syncCustomer(customer: RepairShoprWebhookCustomer): Promise<void> {
  if (!supabaseAdmin) {
    throw new Error('Supabase not configured');
  }

  const record = {
    repairshopr_id: customer.id,
    firstname: customer.firstname || null,
    lastname: customer.lastname || null,
    fullname: customer.fullname || `${customer.firstname || ''} ${customer.lastname || ''}`.trim() || null,
    business_name: customer.business_name || null,
    email: customer.email || null,
    phone: customer.phone || null,
    mobile: customer.mobile || null,
    address: customer.address || null,
    address_2: customer.address_2 || null,
    city: customer.city || null,
    state: customer.state || null,
    zip: customer.zip || null,
    tags: customer.tags || null,
    properties: customer.properties || null,
    custom_fields: customer.custom_fields || null,
    created_at: customer.created_at || null,
    updated_at: customer.updated_at || null,
    synced_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from('rs_customers')
    .upsert(record, { onConflict: 'repairshopr_id' });

  if (error) {
    console.error('[Webhook] Customer sync error:', error);
    throw new Error(`Failed to sync customer ${customer.id}: ${error.message}`);
  }

  console.log(`[Webhook] Synced customer ${customer.id}`);

  // Sync protection plan tier to customer_silver_plans table
  // Only for legacy customers who haven't been migrated to the devices system.
  // Migrated customers (assets_updated=true) have per-device plans in the `devices` table.
  const assetsUpdated = await getCustomerAssetsUpdated(customer.id);
  if (!assetsUpdated) {
    const planTier = getProtectionPlanTier(customer);
    if (planTier) {
      try {
        await setCustomerProtectionPlan(customer.id, planTier);
        console.log(`[Webhook] Synced legacy protection plan for customer ${customer.id}: ${planTier}`);
      } catch (err) {
        console.error(`[Webhook] Protection plan sync error for customer ${customer.id}:`, err);
        // Non-critical, don't throw
      }
    }
  } else {
    console.log(`[Webhook] Skipping RS protection plan for customer ${customer.id} (migrated to devices)`);
  }
}

/**
 * Sync a ticket record to Supabase.
 * Also creates/updates the status override to map RepairShopr status to our custom status.
 * If the webhook payload includes embedded customer or comments, syncs those too.
 *
 * @param ticket - Ticket data from webhook attributes
 *
 * @sideEffects
 * - Upserts record to rs_tickets table
 * - Upserts status override to ticket_status_overrides table
 * - Optionally syncs embedded customer to rs_customers
 * - Optionally syncs embedded comments to rs_ticket_comments
 *
 * @functions_called resolveLocationId, getDefaultCustomStatusForRepairShoprStatus, syncCustomer, syncComment
 *
 * @version 1.0.0 - 2026-01-12T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-02-04T21:25:23Z - Added embedded customer/comment sync from webhook attributes
 */
async function syncTicket(ticket: RepairShoprWebhookTicket): Promise<string[]> {
  if (!supabaseAdmin) {
    throw new Error('Supabase not configured');
  }

  const results: string[] = [];

  // Resolve RepairShopr location ID to Supabase UUID
  const { resolveLocationId } = await import('@/lib/location-helpers');
  const locationId = await resolveLocationId(ticket.location_id ?? undefined);

  const record = {
    repairshopr_id: ticket.id,
    number: ticket.number ? String(ticket.number) : null,
    subject: ticket.subject || null,
    status: ticket.status || null,
    problem_type: ticket.problem_type || null,
    customer_id: ticket.customer_id || null,
    customer_business_then_name: ticket.customer_business_then_name || null,
    user_id: ticket.user_id || null,
    due_date: ticket.due_date || null,
    priority: ticket.priority || null,
    resolved_at: ticket.resolved_at || null,
    location_id: locationId,
    created_at: ticket.created_at || null,
    updated_at: ticket.updated_at || null,
    synced_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from('rs_tickets')
    .upsert(record, { onConflict: 'repairshopr_id' });

  if (error) {
    console.error('[Webhook] Ticket sync error:', error);
    throw new Error(`Failed to sync ticket ${ticket.id}: ${error.message}`);
  }

  results.push(`ticket:${ticket.id}`);
  console.log(`[Webhook] Synced ticket ${ticket.id}`);

  // Auto-create/update status override based on RepairShopr status
  if (ticket.status) {
    const customStatus = getDefaultCustomStatusForRepairShoprStatus(ticket.status);

    const { error: overrideError } = await supabaseAdmin
      .from('ticket_status_overrides')
      .upsert({
        repairshopr_ticket_id: ticket.id,
        custom_status: customStatus,
        updated_by: 'webhook_auto_sync',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'repairshopr_ticket_id' });

    if (overrideError) {
      console.error('[Webhook] Status override upsert error:', overrideError);
    } else {
      console.log(`[Webhook] Updated status override for ticket ${ticket.id}: ${customStatus}`);
    }
  }

  // Sync embedded customer if present
  if (ticket.customer && ticket.customer.id) {
    try {
      await syncCustomer(ticket.customer);
      results.push(`customer:${ticket.customer.id}`);
    } catch (err) {
      console.error('[Webhook] Embedded customer sync error:', err);
      // Non-critical, don't throw
    }
  }

  // Sync embedded comments if present
  if (ticket.comments && Array.isArray(ticket.comments)) {
    for (const comment of ticket.comments) {
      try {
        await syncComment(comment);
        results.push(`comment:${comment.id}`);
      } catch (err) {
        console.error(`[Webhook] Embedded comment ${comment.id} sync error:`, err);
        // Non-critical, don't throw
      }
    }
  }

  return results;
}

/**
 * Sync a single comment to Supabase.
 *
 * @param comment - Comment data from webhook attributes or embedded in ticket
 *
 * @sideEffects
 * - Upserts record to rs_ticket_comments table
 *
 * @version 1.0.0 - 2026-02-04T21:25:23Z - Initial implementation
 */
async function syncComment(comment: RepairShoprWebhookComment): Promise<void> {
  if (!supabaseAdmin) {
    throw new Error('Supabase not configured');
  }

  const record = {
    repairshopr_id: comment.id,
    ticket_id: comment.ticket_id,
    subject: comment.subject || null,
    body: comment.body,
    tech: comment.tech || null,
    hidden: comment.hidden || false,
    user_id: comment.user_id || null,
    created_at: comment.created_at || null,
    updated_at: comment.updated_at || null,
    synced_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from('rs_ticket_comments')
    .upsert(record, { onConflict: 'repairshopr_id' });

  if (error) {
    console.error('[Webhook] Comment sync error:', error);
    throw new Error(`Failed to sync comment ${comment.id}: ${error.message}`);
  }

  console.log(`[Webhook] Synced comment ${comment.id} for ticket ${comment.ticket_id}`);
}

/**
 * Sync an invoice record to Supabase.
 *
 * @param invoice - Invoice data from webhook attributes
 *
 * @sideEffects
 * - Upserts record to rs_invoices table
 *
 * @version 1.0.0 - 2026-01-12T00:00:00Z - Initial implementation
 */
async function syncInvoice(invoice: RepairShoprWebhookInvoice): Promise<void> {
  if (!supabaseAdmin) {
    throw new Error('Supabase not configured');
  }

  const record = {
    repairshopr_id: invoice.id,
    number: invoice.number || null,
    customer_id: invoice.customer_id || null,
    total: invoice.total || 0,
    balance_due: invoice.balance || 0,
    status: invoice.status || null,
    is_paid: invoice.paid_at ? true : ((invoice.balance ?? 0) === 0 && (invoice.total ?? 0) > 0),
    created_at: invoice.created_at || null,
    updated_at: invoice.updated_at || null,
    synced_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from('rs_invoices')
    .upsert(record, { onConflict: 'repairshopr_id' });

  if (error) {
    console.error('[Webhook] Invoice sync error:', error);
    throw new Error(`Failed to sync invoice ${invoice.id}: ${error.message}`);
  }

  console.log(`[Webhook] Synced invoice ${invoice.id}`);
}

// =============================================================================
// Main Handler
// =============================================================================

/**
 * POST /api/webhooks/repairshopr
 * Handle incoming webhook events from RepairShopr Notification Center.
 *
 * RepairShopr sends payload as: { text, html, link, attributes }
 * The `link` URL path determines entity type, `attributes` contains the entity data.
 *
 * @param request - Incoming webhook request with RepairShopr notification payload
 * @returns Success/error response with list of synced entities
 *
 * @sideEffects
 * - Upserts records to Supabase tables based on entity type
 * - Logs webhook processing for debugging
 *
 * @functions_called validateSignature, determineEntityType, syncTicket, syncComment, syncCustomer, syncInvoice
 * @called_by RepairShopr Notification Center (external)
 *
 * @version 1.0.0 - 2026-01-12T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-02-04T21:25:23Z - Rewrote to parse actual {text, html, link, attributes} format
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Get raw body for signature validation
    const rawBody = await request.text();
    const signature = request.headers.get('x-repairshopr-signature') ||
                     request.headers.get('x-webhook-signature');

    // Validate signature
    if (!validateSignature(rawBody, signature)) {
      console.log('[Webhook] Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse payload
    let payload: RepairShoprWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      console.error('[Webhook] Invalid JSON payload');
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Validate payload has the expected RepairShopr structure
    if (!payload.attributes || typeof payload.attributes !== 'object') {
      console.log('[Webhook] Payload missing attributes field, keys:', Object.keys(payload).join(', '));
      return NextResponse.json({
        success: true,
        message: 'No attributes to process',
      });
    }

    const { text = '', link = '', attributes } = payload;

    // Determine entity type from link URL and attributes
    const entityType = determineEntityType(link, attributes, text);

    console.log(`[Webhook] Received: ${entityType} | ${text.substring(0, 80)}`);

    const results: string[] = [];

    switch (entityType) {
      case 'ticket': {
        const ticket = attributes as unknown as RepairShoprWebhookTicket;
        if (!ticket.id) {
          console.log('[Webhook] Ticket attributes missing id');
          break;
        }
        const ticketResults = await syncTicket(ticket);
        results.push(...ticketResults);
        break;
      }

      case 'comment': {
        const comment = attributes as unknown as RepairShoprWebhookComment;
        if (!comment.id || !comment.ticket_id) {
          console.log('[Webhook] Comment attributes missing id or ticket_id');
          break;
        }
        await syncComment(comment);
        results.push(`comment:${comment.id}`);
        break;
      }

      case 'customer': {
        const customer = attributes as unknown as RepairShoprWebhookCustomer;
        if (!customer.id) {
          console.log('[Webhook] Customer attributes missing id');
          break;
        }
        await syncCustomer(customer);
        results.push(`customer:${customer.id}`);
        break;
      }

      case 'invoice': {
        const invoice = attributes as unknown as RepairShoprWebhookInvoice;
        if (!invoice.id) {
          console.log('[Webhook] Invoice attributes missing id');
          break;
        }
        await syncInvoice(invoice);
        results.push(`invoice:${invoice.id}`);
        break;
      }

      default:
        console.log(`[Webhook] Unknown entity type from link: ${link}`);
    }

    if (results.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No data to process',
        entity_type: entityType,
      });
    }

    const duration = Date.now() - startTime;
    console.log(`[Webhook] Processed in ${duration}ms: ${results.join(', ')}`);

    return NextResponse.json({
      success: true,
      processed: results,
      duration: `${duration}ms`,
    });
  } catch (error) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Webhook processing failed',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/repairshopr
 * Health check endpoint for webhook configuration.
 *
 * @returns JSON with status and configuration info
 *
 * @version 1.0.0 - 2026-01-12T00:00:00Z - Initial implementation
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'RepairShopr webhook endpoint is active',
    signature_validation: process.env.REPAIRSHOPR_WEBHOOK_SECRET ? 'enabled' : 'disabled',
  });
}
