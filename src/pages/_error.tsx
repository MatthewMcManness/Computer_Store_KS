import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode: number;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '6rem', fontWeight: 'bold', color: '#dc2626', margin: 0 }}>
        {statusCode}
      </h1>
      <h2 style={{ fontSize: '1.5rem', marginTop: '1rem', color: '#333' }}>
        {statusCode === 404 ? 'Page Not Found' : 'Server Error'}
      </h2>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        {statusCode === 404
          ? 'Sorry, we could not find the page you are looking for.'
          : 'We apologize for the inconvenience. Please try again later.'}
      </p>
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <a
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
        </a>
        <a
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
        </a>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
