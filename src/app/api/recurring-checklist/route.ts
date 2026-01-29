import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Retrieves the current recurring checklist state from Supabase.
 *
 * Returns the array of checked schedule IDs for the default checklist row.
 *
 * @param _request - The incoming Next.js request (unused)
 * @returns NextResponse with { checked_ids: number[] }
 *
 * @throws Returns 500 if Supabase is not configured or query fails
 *
 * @sideEffects None
 *
 * @functions_called supabaseAdmin.from
 * @called_by recurring-checklist.html (fetch on load)
 *
 * @version 1.0.0 - 2026-01-29T16:04:43Z - Initial implementation
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { data, error } = await supabaseAdmin
    .from('recurring_checklist_state')
    .select('checked_ids')
    .eq('id', 'default')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ checked_ids: data?.checked_ids ?? [] });
}

/**
 * Updates the recurring checklist state in Supabase.
 *
 * Accepts an array of checked schedule IDs and upserts the default row.
 *
 * @param request - The incoming Next.js request with JSON body { checked_ids: number[] }
 * @returns NextResponse with { success: true }
 *
 * @throws Returns 400 if checked_ids is not an array
 * @throws Returns 500 if Supabase is not configured or upsert fails
 *
 * @sideEffects
 * - Upserts a row in recurring_checklist_state table
 *
 * @functions_called supabaseAdmin.from
 * @called_by recurring-checklist.html (on checkbox change)
 *
 * @version 1.0.0 - 2026-01-29T16:04:43Z - Initial implementation
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const body = await request.json();
  const { checked_ids } = body;

  if (!Array.isArray(checked_ids)) {
    return NextResponse.json({ error: 'checked_ids must be an array' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('recurring_checklist_state')
    .upsert({
      id: 'default',
      checked_ids,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
