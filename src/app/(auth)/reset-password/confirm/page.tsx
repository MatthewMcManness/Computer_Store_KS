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
 * Click-through confirmation page for password reset.
 *
 * This page uses a two-step flow to protect against email link scanners:
 * 1. User clicks the email link -> lands on this page with a "Continue" button
 * 2. User clicks "Continue" -> PKCE code is exchanged for a session
 *
 * Email security scanners (like those in corporate email) automatically click
 * links to check for malware, but they don't click buttons. This prevents
 * scanners from consuming the one-time PKCE code before the real user can.
 */
export default function ResetPasswordConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Token validation states:
  // null = initial/checking for existing session
  // 'pending_confirmation' = code found, waiting for user to click button
  // true = valid session established
  // false = invalid/expired token
  const [tokenState, setTokenState] = useState<boolean | 'pending_confirmation' | null>(null);
  const [isExchangingCode, setIsExchangingCode] = useState(false);
  const hasCheckedSession = useRef(false);

  // Create Supabase client once using useMemo
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  // Check for existing session on mount (but don't exchange code automatically)
  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (hasCheckedSession.current) return;
    hasCheckedSession.current = true;

    const checkExistingSession = async () => {
      // Check for existing session FIRST
      // This handles the case where code was already exchanged (refresh, re-render)
      console.log('Checking for existing session...');
      const { data: { session: existingSession } } = await supabase.auth.getSession();

      if (existingSession) {
        console.log('Found existing session - user already authenticated');
        setTokenState(true);
        // Clean up URL if it still has code parameter
        if (searchParams.get('code')) {
          window.history.replaceState({}, '', '/reset-password/confirm');
        }
        return;
      }

      // Check for PKCE code in query params
      const code = searchParams.get('code');
      if (code) {
        console.log('Found PKCE code in URL - waiting for user confirmation');
        // Don't exchange automatically - wait for user to click button
        setTokenState('pending_confirmation');
        return;
      }

      // Check for hash fragment with tokens (legacy/implicit flow)
      const hash = window.location.hash;
      if (hash && hash.length > 1) {
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');

        if (accessToken) {
          // For legacy flow, we need to set session immediately
          // (this flow is less common and usually not affected by scanners)
          console.log('Found hash tokens - setting session');
          const refreshToken = hashParams.get('refresh_token');

          try {
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (sessionError) {
              console.error('Error setting session:', sessionError.message);
              setTokenState(false);
              return;
            }

            if (data.session) {
              console.log('Session established via hash tokens');
              window.history.replaceState({}, '', '/reset-password/confirm');
              setTokenState(true);
              return;
            }
          } catch (err) {
            console.error('Exception setting session:', err);
            setTokenState(false);
            return;
          }
        }
      }

      // No valid token, code, or session found
      console.log('No valid token, code, or session found');
      setTokenState(false);
    };

    // Small delay to ensure the page is fully loaded
    const timer = setTimeout(checkExistingSession, 100);
    return () => clearTimeout(timer);
  }, [supabase, searchParams]);

  /**
   * Handle the "Continue to Reset Password" button click.
   * This is where we actually exchange the PKCE code for a session.
   */
  const handleConfirmClick = async () => {
    setIsExchangingCode(true);
    setError('');

    const code = searchParams.get('code');
    if (!code) {
      setError('Reset code not found. Please request a new password reset link.');
      setTokenState(false);
      setIsExchangingCode(false);
      return;
    }

    try {
      console.log('Exchanging PKCE code for session...');
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Error exchanging code:', exchangeError.message);

        // Check if we somehow have a session anyway
        const { data: { session: retrySession } } = await supabase.auth.getSession();
        if (retrySession) {
          console.log('Code exchange failed but found existing session');
          window.history.replaceState({}, '', '/reset-password/confirm');
          setTokenState(true);
          setIsExchangingCode(false);
          return;
        }

        // Provide helpful error message
        if (exchangeError.message.includes('expired') || exchangeError.message.includes('invalid')) {
          setError('This password reset link has expired or already been used. Please request a new one.');
        } else {
          setError(exchangeError.message);
        }
        setTokenState(false);
        setIsExchangingCode(false);
        return;
      }

      if (data.session) {
        console.log('Session established via PKCE code exchange');
        // Clean up URL to prevent re-exchange attempts
        window.history.replaceState({}, '', '/reset-password/confirm');
        setTokenState(true);
      } else {
        setError('Failed to establish session. Please request a new password reset link.');
        setTokenState(false);
      }
    } catch (err) {
      console.error('Exception during code exchange:', err);
      setError('An unexpected error occurred. Please try again or request a new link.');
      setTokenState(false);
    } finally {
      setIsExchangingCode(false);
    }
  };

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

  // Still checking for existing session
  if (tokenState === null) {
    return (
      <div className="text-center">
        <LoadingSpinner className="mx-auto h-8 w-8 text-blue-600" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying reset link...</p>
      </div>
    );
  }

  // Code found - show confirmation button (protection against email scanners)
  if (tokenState === 'pending_confirmation') {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <svg
            className="h-8 w-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Reset Your Password
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Click the button below to continue with your password reset.
        </p>

        {error && (
          <div
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4"
            role="alert"
            aria-live="assertive"
          >
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          onClick={handleConfirmClick}
          disabled={isExchangingCode}
          className="inline-block rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExchangingCode ? (
            <span className="flex items-center justify-center">
              <LoadingSpinner className="mr-2 h-5 w-5" />
              Verifying...
            </span>
          ) : (
            'Continue to Reset Password'
          )}
        </button>

        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          This extra step helps protect your account from automated systems.
        </p>
      </div>
    );
  }

  // Invalid or expired token
  if (tokenState === false) {
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
          {error || 'This password reset link is invalid or has expired. Please request a new one.'}
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
