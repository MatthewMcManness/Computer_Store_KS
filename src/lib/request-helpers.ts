/**
 * Shared request helper utilities for API routes.
 *
 * @module request-helpers
 *
 * @version 1.0.0 - 2026-03-20T00:00:00Z - Initial implementation extracted from route files
 */

import { NextRequest } from 'next/server';

/**
 * Extract the client's IP address from the incoming request.
 *
 * Checks common reverse proxy headers (x-forwarded-for, x-real-ip) to determine
 * the true client IP address, with fallback to 'unknown' if no IP can be determined.
 *
 * @param request - The incoming Next.js request object
 * @returns Client IP address string, or 'unknown' if unable to determine
 *
 * @functions_called None
 * @called_by Login route, Register route, Contact route
 *
 * @version 1.0.0 - 2026-03-20T00:00:00Z - Initial implementation
 */
export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
