import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAuditInfo, getCurrentUser } from '@/lib/auth';
import { getEmployeeCallLogs, getAllCallLogs } from '@/lib/cytracom';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cytracom/call-logs
 *
 * Fetches click-to-call logs from Supabase.
 *
 * Query params:
 * - all: If "true", fetch all employee logs (requires manager role)
 * - limit: Maximum records (default 50)
 *
 * Response:
 * - logs: Array of call log records
 * - meta: Count and filter info
 *
 * @functions_called getEmployeeAuditInfo, getCurrentUser, getEmployeeCallLogs, getAllCallLogs
 * @called_by CallLogsPage, EmployeeActivityReport
 *
 * @version 1.0.0 - 2026-01-19T22:30:00Z - Initial implementation
 */
export async function GET(request: NextRequest) {
  // Check employee authentication
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get current user
  const currentUser = await getCurrentUser();
  if (!currentUser?.id) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const fetchAll = searchParams.get('all') === 'true';
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  try {
    if (fetchAll) {
      // Check if user has permission to view all logs
      const userRoles = currentUser.roles || [];
      const canViewAll = userRoles.some(role =>
        ['owner', 'lead_developer', 'manager'].includes(role)
      );

      if (!canViewAll) {
        return NextResponse.json(
          { error: 'Permission denied. Only managers can view all call logs.' },
          { status: 403 }
        );
      }

      const logs = await getAllCallLogs(limit);

      return NextResponse.json({
        logs: logs.map(log => ({
          ...log,
          // Add formatted timestamp if available
          createdAtFormatted: log.createdAt
            ? log.createdAt.toLocaleString()
            : undefined,
        })),
        meta: {
          total: logs.length,
          limit,
          scope: 'all',
        },
      });
    } else {
      // Fetch only current employee's logs
      const logs = await getEmployeeCallLogs(currentUser.id, limit);

      return NextResponse.json({
        logs,
        meta: {
          total: logs.length,
          limit,
          scope: 'self',
          employeeId: currentUser.id,
        },
      });
    }
  } catch (error) {
    console.error('[API] Call logs error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch call logs' },
      { status: 500 }
    );
  }
}
