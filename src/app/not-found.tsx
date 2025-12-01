import Link from 'next/link';

export default function NotFound() {
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
      <h1 style={{ fontSize: '6rem', fontWeight: 'bold', color: '#0366d6', margin: 0 }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginTop: '1rem', color: '#333' }}>Page Not Found</h2>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Sorry, we could not find the page you are looking for.
      </p>
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <Link
          href="/"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0366d6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 'bold'
          }}
        >
          Go Home
        </Link>
        <Link
          href="/contact"
          style={{
            padding: '0.75rem 1.5rem',
            border: '2px solid #0366d6',
            color: '#0366d6',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 'bold'
          }}
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
