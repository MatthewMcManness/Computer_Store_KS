/**
 * ERROR PAGE - Shown when something goes wrong on the site.
 * Displays a friendly error message with a retry button.
 *
 * WHEN TO EDIT: When changing the error page design or adding error reporting.
 */
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: '#dc2626', margin: 0 }}>Error</h1>
      <h2 style={{ fontSize: '1.5rem', marginTop: '1rem', color: '#333' }}>Something went wrong</h2>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        We apologize for the inconvenience. Please try again.
      </p>
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button
          onClick={reset}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0366d6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
        <Link
          href="/"
          style={{
            padding: '0.75rem 1.5rem',
            border: '2px solid #0366d6',
            color: '#0366d6',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 'bold'
          }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
