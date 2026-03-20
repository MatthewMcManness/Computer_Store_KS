/**
 * OAuth Callback Route
 *
 * Handles the callback from Google OAuth via Supabase.
 * Exchanges the auth code for a session and redirects:
 * - Authorized employee (contact@computerstoreks.com) -> /admin
 * - Unauthorized email -> /login?error=unauthorized (signs them out)
 *
 * @functions_called createClient (from @/lib/supabase-server)
 * @called_by Google OAuth redirect after sign-in
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-03-20T00:00:00Z - Simplified to single-employee model
 */

import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTHORIZED_EMAIL = 'contact@computerstoreks.com';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const returnTo = requestUrl.searchParams.get('returnTo');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.redirect(`${origin}/login?error=auth_not_configured`);
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Only allow the authorized employee email
        if (user.email !== AUTHORIZED_EMAIL) {
          // Sign out the unauthorized user
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/login?error=unauthorized`);
        }

        // Authorized employee -- redirect to admin or returnTo
        return NextResponse.redirect(`${origin}${returnTo || '/admin'}`);
      }
    }
  }

  // If something went wrong, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
