'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Admin Login Page - Redirect to Unified Login
 *
 * This page now redirects to the unified login at /login.
 * Kept for backward compatibility with any bookmarked URLs.
 *
 * @deprecated Use /login instead
 */
export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified login page
    router.replace('/login');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-2xl text-center">
        {/* Header - Logo only */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/assets/title.png"
            alt="Computer Store KS"
            width={280}
            height={60}
            priority
          />
        </div>

        {/* Redirect message */}
        <div className="mb-6">
          <svg
            className="mx-auto h-8 w-8 animate-spin text-blue-600"
            viewBox="0 0 24 24"
          >
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Redirecting to sign in...
          </p>
        </div>

        {/* Manual redirect link */}
        <p className="text-sm text-gray-500 dark:text-gray-500">
          If you are not redirected,{' '}
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-700 hover:underline"
          >
            click here
          </Link>
          .
        </p>

        {/* RWS Footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
          <span>Created and Maintained by</span>
          <a
            href="https://resilientwebsolutions.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Image
              src="/assets/rws-logo.svg"
              alt="Resilient Web Solutions"
              width={16}
              height={16}
            />
            <span className="font-medium">Resilient Web Solutions</span>
          </a>
        </div>
      </div>
    </div>
  );
}
