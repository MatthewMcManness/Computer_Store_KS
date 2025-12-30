import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  createNinjaOneClient,
  isNinjaOneConfigured,
  NinjaOneAPIError,
} from '@/lib/ninjaone';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ email: string }>;
}

/**
 * GET /api/ninjaone/devices/customer/[email]
 *
 * Get all devices associated with a customer by email or name.
 * This searches NinjaOne organizations for matches and returns
 * all devices belonging to those organizations.
 *
 * Path Parameters:
 * - email: Customer email or organization name to search for (URL encoded)
 *
 * Returns: Array of NinjaOneDevice objects for matching customer
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Check employee authentication
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
    return NextResponse.json(
      { error: 'Unauthorized. Employee access required.' },
      { status: 401 }
    );
  }

  // Check if NinjaOne is configured
  if (!isNinjaOneConfigured()) {
    return NextResponse.json(
      {
        error: 'NinjaOne integration not configured',
        message: 'NINJAONE_API_URL, NINJAONE_CLIENT_ID, and NINJAONE_CLIENT_SECRET must be set',
      },
      { status: 503 }
    );
  }

  const { email } = await params;

  // Decode the email/search term from the URL
  const searchTerm = decodeURIComponent(email);

  // Validate search term
  if (!searchTerm || searchTerm.trim().length < 2) {
    return NextResponse.json(
      { error: 'Search term must be at least 2 characters' },
      { status: 400 }
    );
  }

  try {
    const client = createNinjaOneClient();

    // Fetch devices by customer search term
    const devices = await client.getDevicesByCustomer(searchTerm.trim());

    return NextResponse.json({
      devices,
      count: devices.length,
      searchTerm: searchTerm.trim(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof NinjaOneAPIError) {
      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: 'Too many requests to NinjaOne API. Please try again later.',
            retryAfter: error.retryAfter,
          },
          {
            status: 429,
            headers: error.retryAfter
              ? { 'Retry-After': String(error.retryAfter) }
              : undefined,
          }
        );
      }

      if (error.code === 'NETWORK_ERROR') {
        return NextResponse.json(
          {
            error: 'NinjaOne unavailable',
            message: 'Unable to connect to NinjaOne API.',
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status || 500 }
      );
    }

    console.error(`[NinjaOne API] Error fetching customer devices for "${searchTerm}":`, error);
    return NextResponse.json(
      { error: 'Failed to fetch customer devices from NinjaOne' },
      { status: 500 }
    );
  }
}
