/**
 * RepairShopr Webhook Handler
 *
 * Receives webhook events from RepairShopr for real-time data synchronization.
 * Supported events:
 * - Customer: created, updated
 * - Ticket: created, updated, status changed
 * - Invoice: created, updated, paid
 * - Asset: created, updated
 *
 * To set up in RepairShopr:
 * 1. Go to Admin > Notification Center
 * 2. Create a new Notification Set
 * 3. Enter webhook URL: https://yoursite.com/api/webhooks/repairshopr
 * 4. Enable webhook for desired events
 *
 * Security:
 * - Optional: Set REPAIRSHOPR_WEBHOOK_SECRET env var for signature validation
 * - Validates request payload structure
 * - Rate limited by Render
 *
 * @version 1.0.0 - 2026-01-12T00:00:00Z - Initial implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getDefaultCustomStatusForRepairShoprStatus } from '@/lib/supabase';
import { createHmac } from 'crypto';

export const dynamic = 'force-dynamic';

// =============================================================================
// Types
// =============================================================================

interface WebhookEvent {
  event_type: string;
  webhook_type?: string;
  customer?: RepairShoprWebhookCustomer;
  ticket?: RepairShoprWebhookTicket;
  invoice?: RepairShoprWebhookInvoice;
  asset?: RepairShoprWebhookAsset;
  // For backwards compatibility with different payload formats
  data?: {
    customer?: RepairShoprWebhookCustomer;
    ticket?: RepairShoprWebhookTicket;
    invoice?: RepairShoprWebhookInvoice;
    asset?: RepairShoprWebhookAsset;
  };
}

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
}

interface RepairShoprWebhookTicket {
  id: number;
  number?: string;
  subject?: string;
  status?: string;
  problem_type?: string;
  customer_id?: number;
  customer_business_then_name?: string;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
  due_date?: string | null;
  priority?: string | null;
  resolved_at?: string | null;
  location_id?: number | null;
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

interface RepairShoprWebhookAsset {
  id: number;
  name?: string;
  asset_type?: string;
  customer_id?: number;
  serial?: string | null;
  created_at?: string;
  updated_at?: string;
  properties?: Record<string, unknown>;
}

// =============================================================================
// Security Helpers
// =============================================================================

/**
 * Validate webhook signature if secret is configured
 */
function validateSignature(body: string, signature: string | null): boolean {
  const secret = process.env.REPAIRSHOPR_WEBHOOK_SECRET;

  // If no secret configured, skip validation (allow all webhooks)
  if (!secret) {
    console.log('[Webhook] No secret configured, skipping signature validation');
    return true;
  }

  if (!signature) {
    console.log('[Webhook] Missing signature header');
    return false;
  }

  // RepairShopr uses HMAC-SHA256 for webhook signatures
  const expectedSignature = createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return signature === expectedSignature || signature === `sha256=${expectedSignature}`;
}

// =============================================================================
// Sync Handlers
// =============================================================================

/**
 * Sync a single customer to Supabase
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
}

/**
 * Sync a single ticket to Supabase
 * Also creates/updates the status override to map RepairShopr status to our custom status
 */
async function syncTicket(ticket: RepairShoprWebhookTicket): Promise<void> {
  if (!supabaseAdmin) {
    throw new Error('Supabase not configured');
  }

  // Resolve RepairShopr location ID to Supabase UUID
  const { resolveLocationId } = await import('@/lib/location-helpers');
  const locationId = await resolveLocationId(ticket.location_id ?? undefined);

  const record = {
    repairshopr_id: ticket.id,
    number: ticket.number || null,
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

  // Auto-create/update status override based on RepairShopr status
  if (ticket.status) {
    const customStatus = getDefaultCustomStatusForRepairShoprStatus(ticket.status);

    // Upsert the status override - this ensures the custom status stays in sync
    // with RepairShopr's status when changed via RepairShopr directly
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
      // Don't throw - this is non-critical
    } else {
      console.log(`[Webhook] Updated status override for ticket ${ticket.id}: ${customStatus}`);
    }
  }

  console.log(`[Webhook] Synced ticket ${ticket.id}`);
}

/**
 * Sync a single invoice to Supabase
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

/**
 * Sync a single asset to Supabase
 */
async function syncAsset(asset: RepairShoprWebhookAsset): Promise<void> {
  if (!supabaseAdmin) {
    throw new Error('Supabase not configured');
  }

  const record = {
    repairshopr_id: asset.id,
    name: asset.name || null,
    asset_type_name: asset.asset_type || null,
    customer_id: asset.customer_id || null,
    properties: asset.properties || null,
    created_at: asset.created_at || null,
    updated_at: asset.updated_at || null,
    synced_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from('rs_assets')
    .upsert(record, { onConflict: 'repairshopr_id' });

  if (error) {
    console.error('[Webhook] Asset sync error:', error);
    throw new Error(`Failed to sync asset ${asset.id}: ${error.message}`);
  }

  console.log(`[Webhook] Synced asset ${asset.id}`);
}

// =============================================================================
// Main Handler
// =============================================================================

/**
 * POST /api/webhooks/repairshopr
 * Handle incoming webhook events from RepairShopr
 *
 * @param request - Incoming webhook request with event payload
 * @returns Success/error response
 *
 * @sideEffects
 * - Upserts records to Supabase tables based on event type
 * - Logs webhook processing for debugging
 *
 * @version 1.0.0 - 2026-01-12T00:00:00Z - Initial implementation
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
    let event: WebhookEvent;
    try {
      event = JSON.parse(rawBody);
    } catch {
      console.error('[Webhook] Invalid JSON payload');
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Log incoming webhook
    console.log(`[Webhook] Received event: ${event.event_type || event.webhook_type || 'unknown'}`);
    console.log(`[Webhook] Payload keys: ${Object.keys(event).join(', ')}`);

    // Extract data (RepairShopr can send in different formats)
    const customer = event.customer || event.data?.customer;
    const ticket = event.ticket || event.data?.ticket;
    const invoice = event.invoice || event.data?.invoice;
    const asset = event.asset || event.data?.asset;

    // Determine event type
    const eventType = (event.event_type || event.webhook_type || '').toLowerCase();

    // Process based on event type and available data
    let processed = false;
    const results: string[] = [];

    // Customer events
    if (customer && (eventType.includes('customer') || !eventType)) {
      await syncCustomer(customer);
      results.push(`customer:${customer.id}`);
      processed = true;
    }

    // Ticket events
    if (ticket && (eventType.includes('ticket') || !eventType)) {
      await syncTicket(ticket);
      results.push(`ticket:${ticket.id}`);
      processed = true;
    }

    // Invoice events
    if (invoice && (eventType.includes('invoice') || !eventType)) {
      await syncInvoice(invoice);
      results.push(`invoice:${invoice.id}`);
      processed = true;
    }

    // Asset events
    if (asset && (eventType.includes('asset') || !eventType)) {
      await syncAsset(asset);
      results.push(`asset:${asset.id}`);
      processed = true;
    }

    if (!processed) {
      console.log(`[Webhook] No processable data in event: ${eventType}`);
      return NextResponse.json({
        success: true,
        message: 'No data to process',
        event_type: eventType,
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
 * Health check endpoint for webhook configuration
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'RepairShopr webhook endpoint is active',
    signature_validation: process.env.REPAIRSHOPR_WEBHOOK_SECRET ? 'enabled' : 'disabled',
  });
}
