/**
 * OAuth Callback Route Handler
 *
 * Handles the callback from Google OAuth via Supabase. Exchanges the
 * authorization code for a session, then checks whether the authenticated
 * email is the single authorized employee email. Unauthorized users are
 * signed out and redirected to the login page with an error.
 *
 * @param request - Incoming GET request with `code` search param from Supabase OAuth
 * @returns Redirect to /admin (authorized) or /login?error=unauthorized
 *
 * @sideEffects
 * - Exchanges OAuth code for a Supabase session (sets auth cookies)
 * - Signs out unauthorized users
 *
 * @functions_called createServerClient, supabase.auth.exchangeCodeForSession, supabase.auth.getUser, supabase.auth.signOut
 * @called_by Supabase OAuth redirect after Google sign-in
 *
 * @version 1.0.0 - 2026-03-20T00:00:00Z - Rewritten for single-email Google OAuth
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const AUTHORIZED_EMAIL = 'contact@computerstoreks.com';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const origin = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email === AUTHORIZED_EMAIL) {
        return NextResponse.redirect(`${origin}/admin`);
      } else {
        // Unauthorized email - sign them out
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${origin}/login?error=unauthorized`
        );
      }
    }
  }

  // Code missing or exchange failed
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
