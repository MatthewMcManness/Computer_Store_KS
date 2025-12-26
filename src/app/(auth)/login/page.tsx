'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

/**
 * Error code to user-friendly message mapping
 */
const errorMessages: Record<string, string> = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  RATE_LIMITED: 'Too many login attempts. Please wait a moment.',
  SERVICE_UNAVAILABLE: 'Authentication service unavailable. Please try again.',
};

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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if already authenticated
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        if (mounted && data.authenticated) {
          // Redirect based on user type or return URL
          if (returnTo) {
            router.replace(returnTo);
          } else if (data.user?.userType === 'customer') {
            router.replace('/portal');
          } else {
            router.replace('/admin');
          }
        }
      } catch {
        // Not authenticated, stay on login page
      } finally {
        if (mounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [router, returnTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Show success message with user name
        const userName = result.user?.name || 'User';
        setSuccessMessage(`Welcome back, ${userName}!`);

        // Redirect based on user type or return URL
        setTimeout(() => {
          if (returnTo) {
            router.push(returnTo);
          } else if (result.user?.userType === 'customer') {
            router.push('/portal');
          } else {
            router.push('/admin');
          }
          router.refresh();
        }, 800);
      } else {
        // Map error code to user-friendly message
        const errorCode = result.code || '';
        const errorMsg =
          errorMessages[errorCode] || result.error || 'Invalid credentials';
        setError(errorMsg);
        setPassword('');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking initial auth
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <LoadingSpinner className="mx-auto h-8 w-8" />
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Title */}
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
        Sign In
      </h1>

      {/* Success Message */}
      {successMessage && (
        <div
          className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4"
          role="alert"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-green-600">{successMessage}</p>
        </div>
      )}

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

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
            required
            autoFocus
            disabled={isLoading || !!successMessage}
            aria-describedby={error ? 'login-error' : undefined}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:disabled:bg-gray-700"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            disabled={isLoading || !!successMessage}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:disabled:bg-gray-700"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !!successMessage}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <LoadingSpinner className="mr-2 h-5 w-5" />
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Links */}
      <div className="mt-6 space-y-3 text-center text-sm">
        <div>
          <Link
            href="/reset-password"
            className="text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            Forgot your password?
          </Link>
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            Create account
          </Link>
        </div>
      </div>
    </>
  );
}
