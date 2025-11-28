import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Auth check endpoint
 * Returns user info (email, name, role) if authenticated
 * Returns { authenticated: false } if not authenticated
 *
 * Response format:
 * - Authenticated: { authenticated: true, user: { email, name, role } }
 * - Not authenticated: { authenticated: false }
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (user) {
      return NextResponse.json({
        authenticated: true,
        user: {
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    }

    return NextResponse.json({ authenticated: false });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Auth check failed' },
      { status: 500 }
    );
  }
}
