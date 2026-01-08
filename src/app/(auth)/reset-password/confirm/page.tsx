'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Loading spinner component
 */
function LoadingSpinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Password reset confirmation page.
 *
 * This page expects the user to already have a valid session established
 * either via /auth/confirm (new flow) or direct Supabase redirect (legacy flow).
 */
export default function ResetPasswordConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null);
  const hasCheckedSession = useRef(false);

  // Create Supabase client
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  // Check for valid session on mount
  useEffect(() => {
    if (hasCheckedSession.current) return;
    hasCheckedSession.current = true;

    const checkSession = async () => {
      console.log('Checking for valid session...');

      // First check if we already have a session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('Found existing session');
        setHasValidSession(true);
        return;
      }

      // Check for token_hash in URL (new flow - redirect to /auth/confirm)
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      if (tokenHash && type === 'recovery') {
        console.log('Found token_hash, redirecting to /auth/confirm...');
        router.replace(`/auth/confirm?token_hash=${tokenHash}&type=recovery&next=/reset-password/confirm`);
        return;
      }

      // Check for PKCE code in URL (legacy Supabase redirect flow)
      const code = searchParams.get('code');
      if (code) {
        console.log('Found PKCE code, attempting exchange...');
        try {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('Code exchange failed:', exchangeError.message);
            // Try one more time to check for session (might have been exchanged already)
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (retrySession) {
              setHasValidSession(true);
              window.history.replaceState({}, '', '/reset-password/confirm');
              return;
            }
            setHasValidSession(false);
            return;
          }
          if (data.session) {
            console.log('Session established via code exchange');
            window.history.replaceState({}, '', '/reset-password/confirm');
            setHasValidSession(true);
            return;
          }
        } catch (err) {
          console.error('Code exchange exception:', err);
        }
      }

      // Check for hash fragment tokens (implicit flow fallback)
      const hash = window.location.hash;
      if (hash && hash.length > 1) {
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken) {
          console.log('Found hash tokens, setting session...');
          try {
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            if (!sessionError && data.session) {
              window.history.replaceState({}, '', '/reset-password/confirm');
              setHasValidSession(true);
              return;
            }
          } catch (err) {
            console.error('Hash token session error:', err);
          }
        }
      }

      // No valid session found
      console.log('No valid session found');
      setHasValidSession(false);
    };

    const timer = setTimeout(checkSession, 100);
    return () => clearTimeout(timer);
  }, [supabase, searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch {
      setError('Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Still checking session
  if (hasValidSession === null) {
    return (
      <div className="text-center">
        <LoadingSpinner className="mx-auto h-8 w-8 text-blue-600" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying your session...</p>
      </div>
    );
  }

  // No valid session
  if (hasValidSession === false) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Session Expired
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Your password reset session has expired or is invalid. Please request a new password reset link.
        </p>
        <Link href="/reset-password" className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700">
          Request New Link
        </Link>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Password Updated!
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Your password has been successfully updated. Redirecting to login...
        </p>
        <Link href="/login" className="text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
          Go to Login Now
        </Link>
      </div>
    );
  }

  // Password form
  return (
    <>
      <h1 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
        Set New Password
      </h1>
      <p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Enter your new password below.
      </p>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4" role="alert">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            New Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            autoComplete="new-password"
            required
            autoFocus
            disabled={isLoading}
            minLength={8}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            autoComplete="new-password"
            required
            disabled={isLoading}
            minLength={8}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <LoadingSpinner className="mr-2 h-5 w-5" />
              Updating...
            </span>
          ) : (
            'Update Password'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
          Back to Sign In
        </Link>
      </div>
    </>
  );
}
