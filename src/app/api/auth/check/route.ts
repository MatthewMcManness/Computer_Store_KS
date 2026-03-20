/**
 * Auth Check API Route
 *
 * GET /api/auth/check - Returns the current authentication state.
 *
 * @functions_called getCurrentUser, isAuthorizedEmployee (from @/lib/supabase-auth)
 * @called_by Login page auth check, client-side auth context
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 * @version 2.0.0 - 2026-03-20T00:00:00Z - Simplified to single-employee model
 */

import { NextResponse } from 'next/server';
import { getCurrentUser, isAuthorizedEmployee } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ authenticated: false });
    }
    const authorized = await isAuthorizedEmployee();
    return NextResponse.json({
      authenticated: true,
      authorized,
      email: user.email,
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
