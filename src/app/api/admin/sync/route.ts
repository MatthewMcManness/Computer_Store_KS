/**
 * Admin Sync API
 *
 * Endpoints for triggering and monitoring RepairShopr data sync to Supabase.
 * Admin authentication required.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  runFullSync,
  syncAllCustomers,
  syncAllTickets,
  syncAllTicketComments,
  syncAllAssets,
  syncAllInvoices,
  syncAllLineItems,
  syncAllPayments,
  getSyncLogs,
  getSyncedCounts,
  SyncResult,
  FullSyncResult,
} from '@/lib/repairshopr-sync';

// Valid sync types
type SyncType =
  | 'full'
  | 'customers'
  | 'tickets'
  | 'ticket_comments'
  | 'assets'
  | 'invoices'
  | 'line_items'
  | 'payments';

/**
 * POST /api/admin/sync
 * Trigger a sync operation
 *
 * Body: { type: SyncType }
 * - 'full' - Sync all entities in order
 * - 'customers' - Sync only customers
 * - 'tickets' - Sync only tickets
 * - etc.
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Check admin role
    if (!session.user?.admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const syncType = body.type as SyncType;

    if (!syncType) {
      return NextResponse.json(
        { error: 'Missing required field: type' },
        { status: 400 }
      );
    }

    // Run the appropriate sync
    let result: SyncResult | FullSyncResult;

    switch (syncType) {
      case 'full':
        result = await runFullSync();
        break;
      case 'customers':
        result = await syncAllCustomers();
        break;
      case 'tickets':
        result = await syncAllTickets();
        break;
      case 'ticket_comments':
        result = await syncAllTicketComments();
        break;
      case 'assets':
        result = await syncAllAssets();
        break;
      case 'invoices':
        result = await syncAllInvoices();
        break;
      case 'line_items':
        result = await syncAllLineItems();
        break;
      case 'payments':
        result = await syncAllPayments();
        break;
      default:
        return NextResponse.json(
          { error: `Invalid sync type: ${syncType}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: result.success,
      type: syncType,
      result,
    });
  } catch (error) {
    console.error('[Sync API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/sync
 * Get sync status and logs
 *
 * Query params:
 * - logs: number of recent logs to return (default: 10)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Check admin role
    if (!session.user?.admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const logsLimit = parseInt(searchParams.get('logs') || '10', 10);

    // Get sync logs and counts in parallel
    const [logs, counts] = await Promise.all([
      getSyncLogs(logsLimit),
      getSyncedCounts(),
    ]);

    return NextResponse.json({
      counts,
      logs,
    });
  } catch (error) {
    console.error('[Sync API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
