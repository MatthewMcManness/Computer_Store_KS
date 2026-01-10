import { NextResponse } from 'next/server';
import { getEmployeeAuditInfo } from '@/lib/auth';
import { getMigrationProgress } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/repairshopr/migration-progress
 * Get migration progress statistics for the assets_updated migration
 */
export async function GET() {
  // Check employee authentication
  const employee = await getEmployeeAuditInfo();
  if (!employee) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const progress = await getMigrationProgress();
    return NextResponse.json(progress);
  } catch (error) {
    console.error('[API] Migration progress error:', error);
    return NextResponse.json(
      { error: 'Failed to get migration progress' },
      { status: 500 }
    );
  }
}
