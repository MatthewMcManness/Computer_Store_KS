import { NextResponse } from 'next/server';
import { isGitHubConfigured } from '@/lib/github';
import { isSupabaseConfigured } from '@/lib/supabase';

// GET /api/health - Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabaseConnected: isSupabaseConfigured(),
    githubConnected: isGitHubConfigured(),
  });
}
