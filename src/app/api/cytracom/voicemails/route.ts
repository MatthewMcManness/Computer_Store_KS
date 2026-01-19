import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo } from '@/lib/auth';
import {
  isCytracomConfigured,
  getVoicemails,
  formatPhoneNumber,
  formatCallDuration,
} from '@/lib/cytracom';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cytracom/voicemails
 *
 * Fetches voicemails from Cytracom call history.
 *
 * Note: Voicemail audio URLs are only available if Cytracom provides
 * recording URLs in their CDR API. Check `hasAudio` field in response.
 *
 * Query params:
 * - startDate: Start of date range (ISO string, default 7 days ago)
 * - endDate: End of date range (ISO string, default now)
 *
 * Response:
 * - voicemails: Array of voicemail records
 * - meta: Count and date range info
 *
 * @functions_called getEmployeeAuditInfo, getVoicemails
 * @called_by VoicemailDashboard, ReceptionDashboard
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
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');

  // Parse dates (default to last 7 days)
  const startDate = startDateStr
    ? new Date(startDateStr)
    : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const endDate = endDateStr ? new Date(endDateStr) : new Date();

  try {
    const voicemails = await getVoicemails(startDate, endDate);

    // Format voicemails for response
    const formattedVoicemails = voicemails.map(vm => ({
      id: vm.id,
      extension: vm.extension,
      callerNumber: vm.callerNumber,
      callerNumberFormatted: formatPhoneNumber(vm.callerNumber),
      callerName: vm.callerName,
      timestamp: vm.timestamp.toISOString(),
      duration: vm.durationSeconds,
      durationFormatted: formatCallDuration(vm.durationSeconds),
      transcription: vm.transcription,
      hasAudio: !!vm.audioUrl,
      audioUrl: vm.audioUrl,
      isNew: vm.isNew,
    }));

    // Count voicemails with audio
    const withAudio = formattedVoicemails.filter(vm => vm.hasAudio).length;

    return NextResponse.json({
      voicemails: formattedVoicemails,
      meta: {
        total: formattedVoicemails.length,
        withAudio,
        withoutAudio: formattedVoicemails.length - withAudio,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        note: withAudio === 0
          ? 'Voicemail audio playback requires recording URLs from Cytracom API. ' +
            'If no audio URLs are returned, voicemails may be delivered via email only.'
          : undefined,
      },
    });
  } catch (error) {
    console.error('[API] Voicemails error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch voicemails' },
      { status: 500 }
    );
  }
}
