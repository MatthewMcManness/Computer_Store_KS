import { NextResponse } from 'next/server';
import { getEmployeeAuditInfo } from '@/lib/auth';
import {
  isCytracomConfigured,
  fetchExtensions,
  getConfiguredExtensions,
} from '@/lib/cytracom';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cytracom/extensions
 *
 * Fetches available phone extensions from Cytracom.
 * Falls back to configured extensions from environment if API fails.
 *
 * Response:
 * - extensions: Array of extension objects with number, name, type, status
 * - source: "api" if fetched from Cytracom, "config" if from environment
 *
 * @functions_called getEmployeeAuditInfo, fetchExtensions, getConfiguredExtensions
 * @called_by ClickToCallDialog, ExtensionSelector
 *
 * @version 1.0.0 - 2026-01-19T22:30:00Z - Initial implementation
 */
export async function GET() {
  // Check employee authentication
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if Cytracom is configured
  if (!isCytracomConfigured()) {
    return NextResponse.json(
      { error: 'Cytracom phone system is not configured' },
      { status: 503 }
    );
  }

  try {
    // Try to fetch from API first
    const apiExtensions = await fetchExtensions();

    if (apiExtensions.length > 0) {
      return NextResponse.json({
        extensions: apiExtensions.map(ext => ({
          extension: ext.extension,
          name: ext.name,
          type: ext.type || 'user',
          status: ext.status || 'available',
          email: ext.email,
        })),
        source: 'api',
      });
    }

    // Fall back to configured extensions
    const configExtensions = getConfiguredExtensions();
    return NextResponse.json({
      extensions: configExtensions.map(ext => ({
        extension: ext.extension,
        name: ext.name,
        type: 'user',
        status: 'available',
      })),
      source: 'config',
    });
  } catch (error) {
    console.error('[API] Extensions error:', error);

    // Fall back to configured extensions on error
    const configExtensions = getConfiguredExtensions();
    if (configExtensions.length > 0) {
      return NextResponse.json({
        extensions: configExtensions.map(ext => ({
          extension: ext.extension,
          name: ext.name,
          type: 'user',
          status: 'available',
        })),
        source: 'config',
        warning: 'Could not fetch from API, using configured extensions',
      });
    }

    return NextResponse.json(
      { error: 'Failed to fetch extensions and no configured fallback' },
      { status: 500 }
    );
  }
}
