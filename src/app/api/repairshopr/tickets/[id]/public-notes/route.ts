import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getSessionToken } from '@/lib/auth';
import {
  getTicketPublicNotes,
  createTicketPublicNote,
  deleteTicketPublicNote,
  isSupabaseAdminConfigured,
} from '@/lib/supabase';
import { createRepairShoprClient, RepairShoprAPIError } from '@/lib/repairshopr';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/repairshopr/tickets/[id]/public-notes
 * Get all public notes for a ticket (visible to customers)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Check employee authentication
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
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
  // Check employee authentication
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
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
      author_name: user.name || user.email || 'Staff',
      author_email: user.email,
      content: body.content.trim(),
    });

    if (!note) {
      return NextResponse.json(
        { error: 'Failed to create public note' },
        { status: 500 }
      );
    }

    // 2. Send SMS and Email via RepairShopr ticket comment
    const apiToken = await getSessionToken();
    if (apiToken) {
      try {
        const client = createRepairShoprClient();
        await client.addTicketComment(apiToken, ticketId, {
          subject: 'Update from The Computer Store',
          body: body.content.trim(),
          sms_body: body.content.trim(), // Send as SMS
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
    }

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
  // Check employee authentication
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Public note deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete public note' },
      { status: 500 }
    );
  }
}
