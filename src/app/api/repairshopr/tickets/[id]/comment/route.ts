import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo, getSessionToken } from '@/lib/auth';
import { createRepairShoprClient, RepairShoprAPIError, getApiToken } from '@/lib/repairshopr';
import { createTicketComment } from '@/lib/supabase';
import { logTicketAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/repairshopr/tickets/[id]/comment
 * Add a comment to a ticket (private or internal).
 *
 * Supabase-first: stores comment in ticket_comments table, then pushes
 * to RepairShopr for SMS/email delivery and backup.
 *
 * @version 1.0.0 - Initial implementation (RepairShopr-only)
 * @version 2.0.0 - 2026-02-02T00:00:00Z - Supabase-first pattern
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  // Check employee authentication and get audit info
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get API token (shared key preferred, falls back to session token)
  const apiToken = getApiToken(await getSessionToken());
  if (!apiToken) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }

  const { id } = await params;
  const ticketId = parseInt(id, 10);

  if (isNaN(ticketId) || ticketId <= 0) {
    return NextResponse.json(
      { error: 'Invalid ticket ID' },
      { status: 400 }
    );
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

  // Validate required fields
  if (!body.body || !body.body.trim()) {
    return NextResponse.json(
      { error: 'Comment body is required' },
      { status: 400 }
    );
  }

  try {
    // Prefix internal/tech comments with employee name for visibility
    const commentBody = body.hidden
      ? `[${employee.name}] ${body.body}`
      : body.body;

    // 1. Store in Supabase first (source of truth)
    const supabaseComment = await createTicketComment({
      repairshopr_ticket_id: ticketId,
      body: commentBody,
      subject: body.subject || undefined,
      tech: employee.name || employee.email || 'Staff',
      hidden: body.hidden ?? true,
    });

    // 2. Push to RepairShopr for SMS/email delivery and backup
    let rsComment = null;
    try {
      const client = createRepairShoprClient();
      rsComment = await client.addTicketComment(apiToken, ticketId, {
        ...body,
        body: commentBody,
      });
    } catch (rsError) {
      // Log but don't fail - Supabase has the comment, RS is backup
      console.error('[API] Failed to push comment to RepairShopr:', rsError);
    }

    // Log the comment for audit trail
    await logTicketAction(
      employee,
      'ticket_comment',
      ticketId,
      undefined,
      { hidden: body.hidden, body_length: body.body.length },
      request
    );

    // Return the Supabase comment (or RS comment as fallback shape)
    const comment = rsComment || supabaseComment;
    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    if (error instanceof RepairShoprAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('[API] Comment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}
