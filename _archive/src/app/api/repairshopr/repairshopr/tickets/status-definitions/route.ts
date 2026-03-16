import { NextResponse } from 'next/server';
import { getEmployeeAuditInfo } from '@/lib/auth';
import { TICKET_STATUS_DEFINITIONS } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/repairshopr/tickets/status-definitions
 * Get all available ticket status definitions
 */
export async function GET() {
  // Check employee authentication
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    definitions: TICKET_STATUS_DEFINITIONS,
  });
}
