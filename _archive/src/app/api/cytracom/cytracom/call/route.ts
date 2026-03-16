import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo, getCurrentUser } from '@/lib/auth';
import {
  isCytracomConfigured,
  originateCallWithLogging,
  getConfiguredExtensions,
  formatPhoneNumber,
} from '@/lib/cytracom';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cytracom/call
 *
 * Initiates a click-to-call and logs the action to Supabase.
 *
 * Request body:
 * - toNumber: Phone number to call (required)
 * - fromExtension: Extension to call from (required)
 * - customerId: RepairShopr customer ID (optional)
 * - customerName: Customer name for logging (optional)
 * - context: Context for the call like "Ticket #1234" (optional)
 *
 * Response:
 * - success: boolean
 * - callId: Cytracom call ID if successful
 * - logId: Supabase call log ID
 * - error: Error message if failed
 *
 * @sideEffects
 * - Initiates outbound call via Cytracom API
 * - Creates record in call_logs Supabase table
 *
 * @functions_called getEmployeeAuditInfo, getCurrentUser, originateCallWithLogging
 * @called_by ReceptionDashboard, CustomerDetailPage, TicketDetailPage
 *
 * @version 1.0.0 - 2026-01-19T22:30:00Z - Initial implementation
 */
export async function POST(request: NextRequest) {
  // Check employee authentication
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if Cytracom is configured
  if (!isCytracomConfigured()) {
    return NextResponse.json(
      { error: 'Cytracom phone system is not configured' },
      { status: 503 }
    );
  }

  // Get current user for employee ID
  const currentUser = await getCurrentUser();
  if (!currentUser?.id) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  // Parse request body
  let body: {
    toNumber?: string;
    fromExtension?: string;
    customerId?: number;
    customerName?: string;
    context?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const { toNumber, fromExtension, customerId, customerName, context } = body;

  // Validate required fields
  if (!toNumber) {
    return NextResponse.json(
      { error: 'Phone number (toNumber) is required' },
      { status: 400 }
    );
  }

  if (!fromExtension) {
    return NextResponse.json(
      { error: 'Extension (fromExtension) is required' },
      { status: 400 }
    );
  }

  // Validate extension is one of the configured extensions
  const configuredExtensions = getConfiguredExtensions();
  const validExtension = configuredExtensions.find(
    ext => ext.extension === fromExtension
  );

  if (!validExtension) {
    return NextResponse.json(
      {
        error: `Invalid extension. Valid extensions: ${configuredExtensions
          .map(e => `${e.extension} (${e.name})`)
          .join(', ')}`,
      },
      { status: 400 }
    );
  }

  try {
    // Initiate call with logging
    const result = await originateCallWithLogging({
      fromExtension,
      toNumber,
      employeeId: currentUser.id,
      repairshoprCustomerId: customerId,
      customerName,
      context,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        callId: result.callId,
        logId: result.logId,
        message: `Calling ${formatPhoneNumber(toNumber)} from extension ${fromExtension}`,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to initiate call',
          logId: result.logId,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[API] Click-to-call error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initiate call',
      },
      { status: 500 }
    );
  }
}
