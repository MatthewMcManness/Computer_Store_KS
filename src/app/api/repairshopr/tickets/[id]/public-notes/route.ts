import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo, getSessionToken } from '@/lib/auth';
import {
  getTicketPublicNotes,
  createTicketPublicNote,
  deleteTicketPublicNote,
  isSupabaseAdminConfigured,
} from '@/lib/supabase';
import { createRepairShoprClient, RepairShoprAPIError, getApiToken } from '@/lib/repairshopr';
import { logTicketAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/repairshopr/tickets/[id]/public-notes
 * Get all public notes for a ticket (visible to customers)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Check employee authentication and get audit info
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 503 }
    );
  }

  const { id } = await params;
  const ticketId = parseInt(id, 10);

  if (isNaN(ticketId) || ticketId <= 0) {
    return NextResponse.json(
      { error: 'Invalid ticket ID' },
      { status: 400 }
    );
  }

  try {
    const notes = await getTicketPublicNotes(ticketId);
    return NextResponse.json({ notes });
  } catch (error) {
    console.error('[API] Public notes fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public notes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/repairshopr/tickets/[id]/public-notes
 * Create a public note for a ticket
 * Body: { content: string, customer_id: number }
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

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 503 }
    );
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
  if (!body.content || !body.content.trim()) {
    return NextResponse.json(
      { error: 'Note content is required' },
      { status: 400 }
    );
  }

  if (!body.customer_id || body.customer_id <= 0) {
    return NextResponse.json(
      { error: 'Customer ID is required' },
      { status: 400 }
    );
  }

  try {
    // 1. Store in Supabase for portal viewing
    const note = await createTicketPublicNote({
      repairshopr_ticket_id: ticketId,
      repairshopr_customer_id: body.customer_id,
      author_name: employee.name || employee.email || 'Staff',
      author_email: employee.email,
      content: body.content.trim(),
    });

    if (!note) {
      return NextResponse.json(
        { error: 'Failed to create public note' },
        { status: 500 }
      );
    }

    // 2. Send SMS and Email via RepairShopr ticket comment
    try {
      const client = createRepairShoprClient();
      // Prefix with employee name for visibility in RepairShopr
      const noteBody = `[${employee.name}] ${body.content.trim()}`;
      await client.addTicketComment(apiToken, ticketId, {
        subject: 'Update from The Computer Store',
        body: noteBody,
        sms_body: body.content.trim(), // Send clean SMS without prefix
        hidden: false, // Not a private note
        do_not_email: false, // Send email
      });
      console.log('[API] Public note sent via SMS and Email');
    } catch (rsError) {
      // Log but don't fail - the public note was created, communication is best-effort
      console.error('[API] Failed to send SMS/Email via RepairShopr:', rsError);
      if (rsError instanceof RepairShoprAPIError) {
        console.error('[API] RepairShopr error details:', rsError.message, rsError.status);
      }
    }

    // Log the public note creation for audit trail
    await logTicketAction(
      employee,
      'ticket_comment',
      ticketId,
      undefined,
      { public_note: true, content_length: body.content.length, customer_id: body.customer_id },
      request
    );

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error('[API] Public note creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create public note' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/repairshopr/tickets/[id]/public-notes
 * Delete a public note
 * Query param: ?note_id=uuid
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // Check employee authentication and get audit info
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 503 }
    );
  }

  // We don't actually need the ticket ID for deletion, but validate it anyway
  const { id } = await params;
  const ticketId = parseInt(id, 10);

  if (isNaN(ticketId) || ticketId <= 0) {
    return NextResponse.json(
      { error: 'Invalid ticket ID' },
      { status: 400 }
    );
  }

  const noteId = request.nextUrl.searchParams.get('note_id');
  if (!noteId) {
    return NextResponse.json(
      { error: 'Note ID is required' },
      { status: 400 }
    );
  }

  try {
    const success = await deleteTicketPublicNote(noteId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete public note' },
        { status: 500 }
      );
    }

    // Log the public note deletion for audit trail
    await logTicketAction(
      employee,
      'ticket_comment',
      ticketId,
      undefined,
      { public_note: true, action: 'delete', note_id: noteId },
      request
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Public note deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete public note' },
      { status: 500 }
    );
  }
}
