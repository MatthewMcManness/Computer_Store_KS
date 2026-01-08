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

export default function ResetPasswordConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const hasCheckedToken = useRef(false);

  // Create Supabase client once using useMemo
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  // Handle token detection on mount
  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (hasCheckedToken.current) return;
    hasCheckedToken.current = true;

    const checkToken = async () => {
      // IMPORTANT: Check for existing session FIRST
      // This handles the case where code was already exchanged (refresh, re-render)
      // and prevents trying to exchange an already-used code
      console.log('Checking for existing session...');
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (existingSession) {
        console.log('Found existing session - user already authenticated');
        setIsValidToken(true);
        // Clean up URL if it still has code parameter
        if (searchParams.get('code')) {
          window.history.replaceState({}, '', '/reset-password/confirm');
        }
        return;
      }

      // Method 1: Check for PKCE code in query params (modern Supabase flow)
      const code = searchParams.get('code');
      if (code) {
        console.log('Found PKCE code in URL, exchanging for session...');
        try {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error('Error exchanging code:', exchangeError.message);
            // If code was already used, check if we have a session anyway
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (retrySession) {
              console.log('Code exchange failed but found existing session');
              setIsValidToken(true);
              window.history.replaceState({}, '', '/reset-password/confirm');
              return;
            }
            setIsValidToken(false);
            return;
          }

          if (data.session) {
            console.log('Session established via PKCE code exchange');
            // Clean up URL to prevent re-exchange attempts
            window.history.replaceState({}, '', '/reset-password/confirm');
            setIsValidToken(true);
            return;
          }
        } catch (err) {
          console.error('Exception during code exchange:', err);
          setIsValidToken(false);
          return;
        }
      }

      // Method 2: Check for hash fragment with tokens (legacy/implicit flow)
      const hash = window.location.hash;
      if (hash && hash.length > 1) {
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log('Hash params found:', { hasAccessToken: !!accessToken, type });

        if (accessToken) {
          try {
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (sessionError) {
              console.error('Error setting session:', sessionError.message);
              setIsValidToken(false);
              return;
            }

            if (data.session) {
              console.log('Session established via hash tokens');
              // Clean up URL
              window.history.replaceState({}, '', '/reset-password/confirm');
              setIsValidToken(true);
              return;
            }
          } catch (err) {
            console.error('Exception setting session:', err);
            setIsValidToken(false);
            return;
          }
        }
      }

      // No valid token or session found
      console.log('No valid token, code, or session found');
      setIsValidToken(false);
    };

    // Small delay to ensure the page is fully loaded
    const timer = setTimeout(checkToken, 100);
    return () => clearTimeout(timer);
  }, [supabase, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    // Validate password strength
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

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch {
      setError('Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Still checking token validity
  if (isValidToken === null) {
    return (
      <div className="text-center">
        <LoadingSpinner className="mx-auto h-8 w-8 text-blue-600" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying reset link...</p>
      </div>
    );
  }

  // Invalid or expired token
  if (isValidToken === false) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Invalid or Expired Link
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link
          href="/reset-password"
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700"
        >
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
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Password Updated!
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Your password has been successfully updated. Redirecting to login...
        </p>
        <Link
          href="/login"
          className="text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
        >
          Go to Login Now
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Page Title */}
      <h1 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
        Set New Password
      </h1>
      <p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Enter your new password below.
      </p>

      {/* Error Message */}
      {error && (
        <div
          className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Password Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            New Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            autoComplete="new-password"
            required
            autoFocus
            disabled={isLoading}
            minLength={8}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:disabled:bg-gray-700"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            autoComplete="new-password"
            required
            disabled={isLoading}
            minLength={8}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:disabled:bg-gray-700"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Back to login link */}
      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
        >
          Back to Sign In
        </Link>
      </div>
    </>
  );
}
