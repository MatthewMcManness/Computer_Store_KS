import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo } from '@/lib/auth';
import {
  isCytracomConfigured,
  fetchCallHistory,
  getCustomerCallHistory,
  getMissedCalls,
  formatPhoneNumber,
  formatCallDuration,
  getDirectionLabel,
  getDispositionLabel,
  clearCytracomCache,
  type CallDirection,
} from '@/lib/cytracom';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cytracom/call-history
 *
 * Fetches call history from Cytracom API with optional filtering.
 *
 * Query params:
 * - phoneNumber: Filter by phone number (matches caller or called)
 * - extension: Filter by extension
 * - direction: Filter by direction (inbound, outbound, internal)
 * - startDate: Start of date range (ISO string)
 * - endDate: End of date range (ISO string)
 * - limit: Maximum records (default 50)
 * - missedOnly: If "true", only return missed/voicemail calls
 *
 * Response:
 * - calls: Array of call records with formatted fields
 * - meta: Pagination and filter info
 *
 * @functions_called getEmployeeAuditInfo, fetchCallHistory, getCustomerCallHistory, getMissedCalls
 * @called_by CallHistoryWidget, CustomerDetailPage, ReceptionDashboard
 *
 * @version 1.0.0 - 2026-01-19T22:30:00Z - Initial implementation
 */
export async function GET(request: NextRequest) {
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

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const phoneNumber = searchParams.get('phoneNumber');
  const extension = searchParams.get('extension');
  const direction = searchParams.get('direction') as CallDirection | null;
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const missedOnly = searchParams.get('missedOnly') === 'true';
  const debug = searchParams.get('debug') === 'true';
  const clearCache = searchParams.get('clearCache') === 'true';

  // Clear cache if requested
  if (clearCache) {
    clearCytracomCache();
  }

  // Parse dates
  const startDate = startDateStr ? new Date(startDateStr) : undefined;
  const endDate = endDateStr ? new Date(endDateStr) : undefined;

  try {
    let calls;
    let debugInfo: Record<string, unknown> | undefined;

    if (missedOnly) {
      // Get only missed calls
      calls = await getMissedCalls(startDate, endDate);

      // If debug mode, also get all calls for comparison
      if (debug) {
        const allCalls = await fetchCallHistory({
          startDate,
          endDate,
          limit: 50,
        });
        const inboundCalls = allCalls.filter(c => c.direction === 'inbound');
        debugInfo = {
          allCallsCount: allCalls.length,
          inboundCallsCount: inboundCalls.length,
          missedCallsCount: calls.length,
          dispositionBreakdown: allCalls.reduce((acc, c) => {
            acc[c.disposition] = (acc[c.disposition] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          inboundDispositions: inboundCalls.reduce((acc, c) => {
            acc[c.disposition] = (acc[c.disposition] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          sampleUnanswered: allCalls
            .filter(c => c.disposition !== 'answered')
            .slice(0, 5)
            .map(c => ({
              id: c.callId,
              direction: c.direction,
              disposition: c.disposition,
              callerNumber: c.callerNumber,
            })),
        };
      }
    } else if (phoneNumber) {
      // Get customer-specific call history
      calls = await getCustomerCallHistory(phoneNumber, limit);
    } else {
      // Get general call history with filters
      calls = await fetchCallHistory({
        extension: extension || undefined,
        direction: direction || undefined,
        startDate,
        endDate,
        limit,
      });
    }

    // Format calls for response
    const formattedCalls = calls.map(call => ({
      id: call.callId,
      direction: call.direction,
      directionLabel: getDirectionLabel(call.direction),
      callerNumber: call.callerNumber,
      callerNumberFormatted: formatPhoneNumber(call.callerNumber),
      callerName: call.callerName,
      calledNumber: call.calledNumber,
      calledNumberFormatted: formatPhoneNumber(call.calledNumber),
      calledName: call.calledName,
      extension: call.extension,
      startTime: call.startTime.toISOString(),
      endTime: call.endTime.toISOString(),
      duration: call.durationSeconds,
      durationFormatted: formatCallDuration(call.durationSeconds),
      disposition: call.disposition,
      dispositionLabel: getDispositionLabel(call.disposition),
      hasRecording: !!call.recordingUrl,
      recordingUrl: call.recordingUrl,
      queue: call.queue,
    }));

    return NextResponse.json({
      calls: formattedCalls,
      meta: {
        total: formattedCalls.length,
        limit,
        filters: {
          phoneNumber,
          extension,
          direction,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          missedOnly,
        },
      },
      ...(debug && debugInfo ? { debug: debugInfo } : {}),
    });
  } catch (error) {
    console.error('[API] Call history error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch call history' },
      { status: 500 }
    );
  }
}
