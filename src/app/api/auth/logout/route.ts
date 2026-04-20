/**
 * Logout API Route
 *
 * POST /api/auth/logout - Signs out the current user via Supabase.
 *
 * @functions_called signOut (from @/lib/supabase-auth)
 * @called_by AdminSidebar logout button
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 * @version 2.0.0 - 2026-03-20T00:00:00Z - Simplified to use Supabase OAuth signOut
 */

import { NextResponse } from 'next/server';
import { signOut } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await signOut();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}
