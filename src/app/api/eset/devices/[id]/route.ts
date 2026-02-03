/**
 * ESET Device Detail API Route
 *
 * Gets detailed information for a specific ESET device by UUID.
 *
 * @module api/eset/devices/[id]
 * @version 1.0.0 - 2026-02-03T22:58:18Z - Initial implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  createEsetClient,
  isEsetConfigured,
  EsetAPIError,
} from '@/lib/eset';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/eset/devices/[id]
 *
 * Get detailed information for a specific ESET device.
 *
 * Path Parameters:
 * - id: ESET device UUID
 *
 * @param request - The incoming Next.js request
 * @param params - Route parameters containing device UUID
 * @returns JSON response with EsetDevice object
 *
 * @functions_called getCurrentUser, createEsetClient, EsetClient.getDeviceById
 * @called_by DeviceDetailPage (ESET device fetch)
 *
 * @version 1.0.0 - 2026-02-03T22:58:18Z - Initial implementation
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

  // Check if ESET is configured
  if (!isEsetConfigured()) {
    return NextResponse.json(
      {
        error: 'ESET integration not configured',
        message: 'ESET_API_URL, ESET_AUTH_URL, ESET_USERNAME, and ESET_PASSWORD must be set',
      },
      { status: 503 }
    );
  }

  const { id } = await params;

  if (!id || !id.trim()) {
    return NextResponse.json(
      { error: 'Invalid device UUID.' },
      { status: 400 }
    );
  }

  try {
    const client = createEsetClient();
    const device = await client.getDeviceById(id);

    return NextResponse.json({
      device,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof EsetAPIError) {
      if (error.status === 404) {
        return NextResponse.json(
          { error: `ESET device with UUID ${id} not found` },
          { status: 404 }
        );
      }

      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: 'Too many requests to ESET API. Please try again later.',
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
            error: 'ESET unavailable',
            message: 'Unable to connect to ESET API.',
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status || 500 }
      );
    }

    console.error(`[ESET API] Error fetching device ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch device from ESET' },
      { status: 500 }
    );
  }
}
