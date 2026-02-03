/**
 * ESET Devices API Route
 *
 * Lists and searches ESET Protect Cloud devices.
 *
 * @module api/eset/devices
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

/**
 * GET /api/eset/devices
 *
 * List all ESET devices. Supports optional search filtering.
 *
 * Query Parameters:
 * - search: Search by device name, OS, IP, or FQDN
 *
 * @param request - The incoming Next.js request
 * @returns JSON response with array of EsetDevice objects
 *
 * @functions_called getCurrentUser, createEsetClient, EsetClient.getDevices, EsetClient.searchDevices
 * @called_by LinkEsetDialog
 *
 * @version 1.0.0 - 2026-02-03T22:58:18Z - Initial implementation
 */
export async function GET(request: NextRequest) {
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

  try {
    const client = createEsetClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let devices;
    if (search && search.trim()) {
      devices = await client.searchDevices(search.trim());
    } else {
      devices = await client.getDevices();
    }

    return NextResponse.json({
      devices,
      count: devices.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof EsetAPIError) {
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

      if (error.code === 'AUTH_ERROR') {
        return NextResponse.json(
          {
            error: 'Authentication failed',
            message: 'Failed to authenticate with ESET API. Check credentials.',
          },
          { status: 401 }
        );
      }

      if (error.code === 'NETWORK_ERROR') {
        return NextResponse.json(
          {
            error: 'ESET unavailable',
            message: 'Unable to connect to ESET API. The service may be temporarily unavailable.',
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status || 500 }
      );
    }

    console.error('[ESET API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devices from ESET' },
      { status: 500 }
    );
  }
}
