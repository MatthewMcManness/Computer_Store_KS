/**
 * Scam Warning Page - Emergency customer assistance page.
 *
 * Displays a prominent flashing "STOP" message to help customers who may be
 * victims of tech support scams. This page is intentionally not linked from
 * the main site and is shared directly with customers when scam situations
 * are suspected.
 *
 * @returns {JSX.Element} Full-page scam warning display
 *
 * @sideEffects
 * - None - purely presentational component
 *
 * @functions_called None
 * @called_by Next.js App Router (direct URL access only)
 *
 * @version 1.0.0 - 2026-01-21T19:00:00Z - Initial implementation
 */
export default function ScamWarningPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style>
        {`
          @keyframes flash {
            0%, 50% {
              opacity: 1;
            }
            25%, 75% {
              opacity: 0.3;
            }
          }

          .flash-text {
            animation: flash 1s ease-in-out infinite;
          }
        `}
      </style>

      <h1
        className="flash-text"
        style={{
          fontSize: 'clamp(100px, 25vw, 300px)',
          fontWeight: 900,
          color: '#ef4444',
          margin: 0,
          textAlign: 'center',
          lineHeight: 1,
          textShadow: '4px 4px 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        STOP
      </h1>

      <p
        style={{
          fontSize: 'clamp(18px, 4vw, 36px)',
          fontWeight: 700,
          color: '#1e40af',
          textAlign: 'center',
          marginTop: '30px',
          maxWidth: '800px',
          lineHeight: 1.4,
        }}
      >
        You are being scammed.
        <br />
        Call Computer Store immediately:
      </p>

      <a
        href="tel:785-267-3223"
        style={{
          fontSize: 'clamp(28px, 6vw, 60px)',
          fontWeight: 900,
          color: '#2563eb',
          textDecoration: 'none',
          marginTop: '20px',
          padding: '15px 30px',
          border: '4px solid #2563eb',
          borderRadius: '12px',
          backgroundColor: '#dbeafe',
        }}
      >
        785-267-3223
      </a>

      <p
        style={{
          fontSize: 'clamp(14px, 2.5vw, 20px)',
          color: '#6b7280',
          textAlign: 'center',
          marginTop: '40px',
          maxWidth: '600px',
        }}
      >
        Do NOT give anyone remote access to your computer.
        <br />
        Do NOT give anyone your bank information.
        <br />
        Do NOT purchase gift cards for anyone.
      </p>
    </div>
  );
}
