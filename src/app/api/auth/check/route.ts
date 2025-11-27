import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const authenticated = await isAuthenticated();

    return NextResponse.json({
      authenticated,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Auth check failed' },
      { status: 500 }
    );
  }
}
