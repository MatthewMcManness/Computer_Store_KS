import { NextResponse } from 'next/server';
import { isGitHubConfigured } from '@/lib/github';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';

// GET /api/health - Health check endpoint
export async function GET() {
  // Test actual database connectivity
  let dbTest = { success: false, customerCount: 0, error: null as string | null };

  if (supabaseAdmin) {
    try {
      const { count, error } = await supabaseAdmin
        .from('gallery_computers')
        .select('*', { count: 'exact', head: true });

      if (error) {
        dbTest = { success: false, customerCount: 0, error: error.message };
      } else {
        dbTest = { success: true, customerCount: count || 0, error: null };
      }
    } catch (e) {
      dbTest = { success: false, customerCount: 0, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  } else {
    dbTest = { success: false, customerCount: 0, error: 'supabaseAdmin not configured - check SUPABASE_SERVICE_ROLE_KEY' };
  }

  return NextResponse.json({
    status: dbTest.success ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    supabaseConfigured: isSupabaseConfigured(),
    supabaseAdminConfigured: !!supabaseAdmin,
    githubConnected: isGitHubConfigured(),
    database: dbTest,
    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }
  });
}
