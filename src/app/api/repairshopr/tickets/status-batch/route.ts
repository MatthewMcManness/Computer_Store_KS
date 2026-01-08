import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo } from '@/lib/auth';
import { getTicketStatusOverrides } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * POST /api/repairshopr/tickets/status-batch
 * Get custom status overrides for multiple tickets
 * Body: { ticket_ids: number[] }
 */
export async function POST(request: NextRequest) {
  // Check employee authentication
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const { ticket_ids } = body;

  if (!Array.isArray(ticket_ids) || ticket_ids.length === 0) {
    return NextResponse.json(
      { error: 'ticket_ids must be a non-empty array' },
      { status: 400 }
    );
  }

  // Limit to 100 tickets per request
  if (ticket_ids.length > 100) {
    return NextResponse.json(
      { error: 'Maximum 100 ticket IDs per request' },
      { status: 400 }
    );
  }

  try {
    const overrides = await getTicketStatusOverrides(ticket_ids);

    // Convert to a map for easy lookup
    const overridesMap: Record<number, typeof overrides[0]> = {};
    for (const override of overrides) {
      overridesMap[override.repairshopr_ticket_id] = override;
    }

    return NextResponse.json({ overrides: overridesMap });
  } catch (error) {
    console.error('[API] Batch status fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status overrides' },
      { status: 500 }
    );
  }
}
