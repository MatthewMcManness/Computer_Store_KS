import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * Auth Callback Route Handler
 *
 * Handles Supabase auth callbacks for:
 * - Email verification after signup
 * - Password reset links
 * - Magic link sign-ins
 *
 * The callback exchanges the auth code for a session and redirects
 * the user to the appropriate page.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const type = searchParams.get('type');

  // If there's no code, redirect to home with error
  if (!code) {
    console.error('[AUTH CALLBACK] No code provided');
    return NextResponse.redirect(
      new URL('/login?error=invalid_callback', request.url)
    );
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[AUTH CALLBACK] Supabase not configured');
      return NextResponse.redirect(
        new URL('/login?error=configuration', request.url)
      );
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
    });

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[AUTH CALLBACK] Code exchange failed:', error.message);
      return NextResponse.redirect(
        new URL('/login?error=exchange_failed', request.url)
      );
    }

    console.log('[AUTH CALLBACK] Session established for user:', data.user?.email);

    // Determine redirect based on callback type
    let redirectTo = next;

    // Handle specific callback types
    if (type === 'recovery' || type === 'password_recovery') {
      // Password reset - redirect to password update page
      redirectTo = '/reset-password/confirm';
    } else if (type === 'signup' || type === 'email_confirm') {
      // Email verification - redirect to login with success message
      redirectTo = '/login?verified=true';
    } else if (type === 'magiclink') {
      // Magic link login - get user role and redirect accordingly
      if (data.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role) {
          if (
            profile.role === 'admin' ||
            profile.role === 'technician' ||
            profile.role === 'receptionist'
          ) {
            redirectTo = '/admin';
          } else if (profile.role === 'customer') {
            redirectTo = '/portal';
          }
        }
      }
    } else {
      // Default: check user role and redirect
      if (data.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role) {
          if (
            profile.role === 'admin' ||
            profile.role === 'technician' ||
            profile.role === 'receptionist'
          ) {
            redirectTo = '/admin';
          } else if (profile.role === 'customer') {
            redirectTo = '/portal';
          }
        }
      }
    }

    return NextResponse.redirect(new URL(redirectTo, request.url));
  } catch (error) {
    console.error('[AUTH CALLBACK] Unexpected error:', error);
    return NextResponse.redirect(
      new URL('/login?error=unknown', request.url)
    );
  }
}
