'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import type { EmailOtpType } from '@supabase/supabase-js';

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
 * Auth confirmation page with click-through protection against email scanners.
 *
 * This page receives a token_hash from the email link and only verifies it
 * when the user clicks the confirmation button. Email scanners click links
 * but don't click buttons, so this protects the one-time token from being
 * consumed before the real user can use it.
 *
 * Supported types:
 * - recovery: Password reset flow
 * - email: Email confirmation flow
 * - signup: Signup confirmation flow
 */
export default function AuthConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get parameters from URL
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') || '/';

  // Create Supabase client
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  // Determine the action text based on type
  const getActionText = () => {
    switch (type) {
      case 'recovery':
        return {
          title: 'Reset Your Password',
          description: 'Click the button below to continue with your password reset.',
          button: 'Continue to Reset Password',
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          ),
        };
      case 'email':
      case 'signup':
        return {
          title: 'Confirm Your Email',
          description: 'Click the button below to confirm your email address.',
          button: 'Confirm Email',
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          ),
        };
      default:
        return {
          title: 'Confirm Your Action',
          description: 'Click the button below to continue.',
          button: 'Continue',
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          ),
        };
    }
  };

  const actionText = getActionText();

  /**
   * Handle the confirmation button click.
   * This verifies the token with Supabase and establishes a session.
   */
  const handleConfirm = async () => {
    if (!tokenHash || !type) {
      setError('Invalid confirmation link. Please request a new one.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      console.log('Verifying OTP token...');
      const { error: verifyError } = await supabase.auth.verifyOtp({
        type,
        token_hash: tokenHash,
      });

      if (verifyError) {
        console.error('Token verification failed:', verifyError.message);

        if (verifyError.message.includes('expired') || verifyError.message.includes('invalid')) {
          setError('This link has expired or already been used. Please request a new one.');
        } else {
          setError(verifyError.message);
        }
        return;
      }

      console.log('Token verified successfully, redirecting...');

      // Determine redirect based on type
      if (type === 'recovery') {
        // For password reset, go to the password change form
        router.push('/reset-password/confirm');
      } else {
        // For other types, go to the specified next URL or home
        router.push(next);
      }
    } catch (err) {
      console.error('Verification exception:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Missing required parameters
  if (!tokenHash || !type) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-green-500 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
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
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Invalid Link
          </h1>
          <p className="mb-6 text-gray-600">
            This confirmation link is invalid or incomplete. Please check your email and try again.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-green-500 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <svg
            className="h-8 w-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {actionText.icon}
          </svg>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          {actionText.title}
        </h1>
        <p className="mb-6 text-gray-600">
          {actionText.description}
        </p>

        {error && (
          <div
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4"
            role="alert"
          >
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={isVerifying}
          className="w-full rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? (
            <span className="flex items-center justify-center">
              <LoadingSpinner className="mr-2 h-5 w-5" />
              Verifying...
            </span>
          ) : (
            actionText.button
          )}
        </button>

        <p className="mt-6 text-sm text-gray-500">
          This extra step helps protect your account from automated systems.
        </p>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <Link
            href="/login"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
