import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import {
  LOCATION_COOKIE_NAME,
  LOCATION_COOKIE_MAX_AGE,
  isValidLocation,
  canAccessAllLocations,
} from '@/types/locations';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/set-location
 * Set the selected location for users with global access.
 *
 * Only owner and lead_developer roles can call this endpoint.
 * The selected location is stored in a cookie.
 *
 * @param request - Request with { location: string | null }
 * @returns Success/error response
 *
 * @functions_called getCurrentUser, canAccessAllLocations
 * @called_by LocationSelector component
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user || user.userType !== 'employee') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user has global access
  const userRoles = user.roles || (user.role ? [user.role] : []);
  if (!canAccessAllLocations(userRoles)) {
    return NextResponse.json(
      { error: 'You do not have permission to switch locations' },
      { status: 403 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { location } = body;

  // Validate location if provided
  if (location !== null && !isValidLocation(location)) {
    return NextResponse.json({ error: 'Invalid location' }, { status: 400 });
  }

  const cookieStore = await cookies();

  if (location) {
    // Set the location cookie
    cookieStore.set(LOCATION_COOKIE_NAME, location, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: LOCATION_COOKIE_MAX_AGE,
      path: '/',
    });
  } else {
    // Clear the cookie (view all locations)
    cookieStore.delete(LOCATION_COOKIE_NAME);
  }

  return NextResponse.json({
    success: true,
    location: location || 'all',
  });
}
