/**
 * OAuth Callback Route
 *
 * Handles the callback from OAuth providers (Google, etc.)
 * Exchanges the auth code for a session and redirects the user
 */

import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
      // Get the user to determine redirect destination
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Check if user has a profile, create if not
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!profile) {
          // New OAuth user - create profile with customer role
          await supabase.from('user_profiles').insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            role: 'customer',
          });
        }

        // Determine redirect based on role or returnTo param
        if (returnTo) {
          return NextResponse.redirect(`${origin}${returnTo}`);
        }

        // Employee roles go to admin, customers go to portal
        const isEmployee = profile?.role && ['admin', 'technician', 'receptionist'].includes(profile.role);
        const redirectPath = isEmployee ? '/admin' : '/portal';
        return NextResponse.redirect(`${origin}${redirectPath}`);
      }
    }
  }

  // If something went wrong, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
