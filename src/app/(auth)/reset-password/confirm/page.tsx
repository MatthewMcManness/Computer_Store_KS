'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { updatePassword, getAuthErrorMessage } from '@/lib/supabase-auth';

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
 * Password requirements display
 */
function PasswordRequirements({ password }: { password: string }) {
  const requirements = [
    {
      label: 'At least 12 characters',
      met: password.length >= 12,
    },
  ];

  return (
    <div className="mt-2 space-y-1">
      {requirements.map((req, index) => (
        <div
          key={index}
          className={`flex items-center gap-2 text-xs ${
            req.met ? 'text-green-600' : 'text-gray-500'
          }`}
        >
          <span className="flex-shrink-0">
            {req.met ? (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </span>
          <span>{req.label}</span>
        </div>
      ))}
    </div>
  );
}

function ResetPasswordConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  // Check if we have a valid recovery token in the URL
  useEffect(() => {
    // Supabase adds the token in the URL hash after email link click
    // The auth callback route should have already processed this
    // and the user should have a valid recovery session

    // For now, assume the token is valid if we reached this page
    // The actual token validation happens when we call updatePassword
    setIsValidToken(true);
  }, [searchParams]);

  const validateForm = (): boolean => {
    setError('');

    // Validate password length
    if (password.length < 12) {
      setError('Password must be at least 12 characters long.');
      return false;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error: updateError } = await updatePassword(password);

      if (updateError) {
        setError(getAuthErrorMessage(updateError));
        return;
      }

      setIsSuccess(true);

      // Redirect to login after a delay
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
      <div className="flex items-center justify-center py-8">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <LoadingSpinner className="mx-auto h-8 w-8" />
          <p className="mt-2">Verifying...</p>
        </div>
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
          This password reset link is invalid or has expired. Please request a
          new one.
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

  // Show success message
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
          Password Updated
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Your password has been successfully updated. You will be redirected to
          the login page shortly.
        </p>
        <Link
          href="/login"
          className="text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
        >
          Go to Sign In
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
        Please enter your new password below.
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

      {/* New Password Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
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
            minLength={12}
            autoFocus
            disabled={isLoading}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:disabled:bg-gray-700"
          />
          <PasswordRequirements password={password} />
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
            minLength={12}
            disabled={isLoading}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:disabled:bg-gray-700"
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <LoadingSpinner className="mr-2 h-5 w-5" />
              Updating password...
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

export default function ResetPasswordConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <LoadingSpinner className="mx-auto h-8 w-8" />
            <p className="mt-2">Loading...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordConfirmContent />
    </Suspense>
  );
}
