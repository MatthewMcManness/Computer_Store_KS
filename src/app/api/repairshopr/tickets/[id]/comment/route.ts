import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getSessionToken } from '@/lib/auth';
import { createRepairShoprClient, RepairShoprAPIError } from '@/lib/repairshopr';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/repairshopr/tickets/[id]/comment
 * Add a comment to a ticket (private or internal)
 * Body: AddTicketCommentInput
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  // Check employee authentication
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiToken = await getSessionToken();
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
    const client = createRepairShoprClient();
    const comment = await client.addTicketComment(apiToken, ticketId, body);

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
