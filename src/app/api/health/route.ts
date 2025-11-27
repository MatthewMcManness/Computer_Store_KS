import { NextResponse } from 'next/server';
import { isGitHubConfigured, getGitHubConfig } from '@/lib/github';

// GET /api/health - Health check endpoint
export async function GET() {
  const config = getGitHubConfig();

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    githubConnected: isGitHubConfigured(),
    githubConfig: {
      owner: config.owner,
      repo: config.repo,
      branch: config.branch,
    },
  });
}
