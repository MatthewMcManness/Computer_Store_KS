import { NextResponse } from 'next/server';
import { getEmployeeAuditInfo } from '@/lib/auth';
import { isCytracomConfigured, getCytracomConfig } from '@/lib/cytracom';

export const dynamic = 'force-dynamic';

/**
 * Debug endpoint to see raw Cytracom API response
 *
 * GET /api/cytracom/debug
 */
export async function GET() {
  // Check employee authentication
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isCytracomConfigured()) {
    return NextResponse.json({ error: 'Cytracom not configured' }, { status: 503 });
  }

  const config = getCytracomConfig();
  if (!config) {
    return NextResponse.json({ error: 'Config error' }, { status: 500 });
  }

  try {
    // Fetch last 24 hours of calls
    const start = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const end = new Date();

    const basicAuth = Buffer.from(`token:${config.apiToken}`).toString('base64');

    const response = await fetch(`${config.apiUrl}/insights/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: {
          date_range: {
            start: start.toISOString(),
            end: end.toISOString(),
          },
        },
        options: {
          size: 20,
        },
      }),
    });

    const rawData = await response.json();

    // Extract records and analyze them
    const records = rawData?.data?.search?.records || [];

    // Analyze call types for debugging
    const analysis = records.map((record: Record<string, unknown>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const legs = (record.legs as any[]) || [];
      const lastLeg = legs[legs.length - 1];

      return {
        uuid: record.uuid,
        direction: record.direction,
        answered: record.answered,
        duration: record.duration,
        original_caller_id: record.original_caller_id,
        dialed_number: record.dialed_number,
        legs_count: legs.length,
        last_leg_callee_type: lastLeg?.callee?.type,
        last_leg_callee_number: lastLeg?.callee?.number,
        last_leg_bridged: lastLeg?.bridged,
        raw_last_leg: lastLeg,
      };
    });

    // Group by answered status
    const answeredCalls = analysis.filter((a: Record<string, unknown>) => a.answered === true);
    const unansweredCalls = analysis.filter((a: Record<string, unknown>) => a.answered === false);
    const voicemailCalls = analysis.filter((a: Record<string, unknown>) =>
      a.last_leg_callee_type === 'mailbox' ||
      String(a.last_leg_callee_type).toLowerCase().includes('voicemail') ||
      String(a.last_leg_callee_type).toLowerCase().includes('vm')
    );

    return NextResponse.json({
      summary: {
        total: records.length,
        answered: answeredCalls.length,
        unanswered: unansweredCalls.length,
        identified_voicemails: voicemailCalls.length,
      },
      unique_callee_types: [...new Set(analysis.map((a: Record<string, unknown>) => a.last_leg_callee_type))],
      analysis,
      raw_sample: records.slice(0, 3),
    });
  } catch (error) {
    console.error('[Debug API] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
