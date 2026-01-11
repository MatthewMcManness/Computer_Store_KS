import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Handle user logout and session termination.
 *
 * Destroys the user's active session, clearing authentication cookies
 * and invalidating their current login state.
 *
 * @returns NextResponse with logout result:
 * - Success (200): { success: true, message: 'Logged out successfully' }
 * - Server error (500): { success: false, error: 'Logout failed' }
 *
 * @throws {Error} When session destruction fails
 *
 * @sideEffects
 * - Destroys user session in database/storage
 * - Clears authentication cookies
 * - Logs errors if logout fails
 *
 * @example
 * // POST /api/auth/logout
 * const response = await fetch('/api/auth/logout', { method: 'POST' });
 *
 * @functions_called destroySession (from @/lib/auth)
 * @called_by Logout buttons/actions via fetch
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export async function POST() {
  try {
    await destroySession();

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}
