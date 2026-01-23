import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Protection Plans - Silver & Silver Plus',
  description: 'Computer protection plans starting at $24.99/month. Silver Plan for home users, Silver Plus for businesses. Antivirus, discounts on repairs, remote support, and more.',
  openGraph: {
    title: 'Computer Protection Plans - Silver & Silver Plus',
    description: 'Comprehensive computer protection plans for home and business. Antivirus, repair discounts, remote support, and peace of mind.',
    url: 'https://computerstoreks.com/silver-plan',
  },
};

// Animated silver gradient for badges
const silverBadgeStyle = {
  display: 'inline-block',
  padding: '0.5rem 1.5rem',
  borderRadius: '8px',
  fontSize: '1.75rem',
  fontWeight: 800,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  backgroundColor: '#c8c8c8',
  backgroundImage: 'linear-gradient(135deg, #e8e8e8 0%, #b8b8b8 25%, #d4d4d4 50%, #a0a0a0 75%, #c8c8c8 100%)',
  backgroundSize: '300% 300%',
  color: '#2a2a2a',
  textShadow: '1px 1px 2px rgba(255,255,255,0.9), -1px -1px 1px rgba(0,0,0,0.15)',
  boxShadow: '0 4px 15px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.1)',
  border: '2px solid #a0a0a0',
};

export default function ProtectionPlansPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1920&q=80)' }}>
        <div className="container">
          <h1 className="hero-title">Protection Plans</h1>
          <p className="hero-subtitle">Comprehensive computer care for home and business</p>
        </div>
      </section>

      {/* Plans Section */}
      <section className="membership">
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            maxWidth: '900px',
            margin: '0 auto',
            padding: '2rem 0'
          }}>

            {/* Silver Plan Card */}
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              border: '2px solid #a0a0a0'
            }}>
              <div style={{
                position: 'absolute',
                top: '-12px',
                right: '20px',
                padding: '0.25rem 1rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                background: '#10b981',
                color: 'white'
              }}>Most Popular</div>

              {/* Animated Silver Badge Header */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div className="animate-silver-shine" style={silverBadgeStyle}>Silver</div>
              </div>

              <div style={{
                textAlign: 'center',
                marginBottom: '1.5rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <div style={{ margin: '0.5rem 0' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1f2937' }}>$24.99</span>
                  <span style={{ fontSize: '1rem', color: '#6b7280' }}>/month</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0' }}>3-month minimum commitment</p>
                <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: '0.5rem 0 0 0' }}><em>Best value for home users, families, and remote workers</em></p>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', flexGrow: 1 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem 0', fontSize: '0.95rem', color: '#374151' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                  Antivirus software included
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem 0', fontSize: '0.95rem', color: '#374151' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                  50% discount on virus removal
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem 0', fontSize: '0.95rem', color: '#374151' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                  50% off house calls
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem 0', fontSize: '0.95rem', color: '#374151' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                  50% off account recovery
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem 0', fontSize: '0.95rem', color: '#374151' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                  Remote support (4 hrs/month)
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem 0', fontSize: '0.95rem', color: '#374151' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                  Performance monitoring &amp; alerts
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem 0', fontSize: '0.95rem', color: '#374151' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                  15% discount on labor
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem 0', fontSize: '0.95rem', color: '#374151' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                  Priority scheduling
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem 0', fontSize: '0.95rem', color: '#374151' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                  Free in-store diagnostics
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem 0', fontSize: '0.95rem', color: '#374151' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                  Email support (24-48hr response)
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem 0', fontSize: '0.95rem', color: '#374151' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                  Quarterly system health check
                </li>
              </ul>

              <Link href="/contact" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', padding: '0.875rem 1.5rem', fontSize: '1rem', marginTop: 'auto' }}>Get Started</Link>
            </div>

            {/* Silver Plus Plan Card */}
            <div className="silver-plus-card" style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div style={{
                position: 'absolute',
                top: '-12px',
                right: '20px',
                padding: '0.25rem 1rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                background: 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)',
                color: 'white'
              }}>Best for Business</div>

              {/* Animated Silver Badge Header with Gold "Plus" */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div className="animate-silver-shine gold-glow-badge" style={silverBadgeStyle}>
                  Silver <span className="gold-text">Plus</span>
                </div>
              </div>

              <div style={{
                textAlign: 'center',
                marginBottom: '1.5rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <div style={{ margin: '0.5rem 0' }}>
                  <span className="gold-text" style={{ fontSize: '2.5rem', fontWeight: 700 }}>$34.99</span>
                  <span style={{ fontSize: '1rem', color: '#6b7280' }}>/device/month</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0' }}>3-month minimum commitment</p>
                <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: '0.5rem 0 0 0' }}><em>Tailored for small businesses and professionals requiring reliable support</em></p>
              </div>

              <p style={{ fontWeight: 600, color: '#1f2937', marginBottom: '0.5rem' }}>Everything in Silver, plus:</p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', flexGrow: 1 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem 0', fontSize: '0.95rem', color: '#b8860b', fontWeight: 500 }}>
                  <span style={{ color: '#ffd700', fontWeight: 'bold', flexShrink: 0 }}>★</span>
                  $35 service calls (65% off - normally $100)
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem 0', fontSize: '0.95rem', color: '#b8860b', fontWeight: 500 }}>
                  <span style={{ color: '#ffd700', fontWeight: 'bold', flexShrink: 0 }}>★</span>
                  6 hours/month remote support included
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem 0', fontSize: '0.95rem', color: '#b8860b', fontWeight: 500 }}>
                  <span style={{ color: '#ffd700', fontWeight: 'bold', flexShrink: 0 }}>★</span>
                  25% off all labor charges
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem 0', fontSize: '0.95rem', color: '#374151' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                  Business-grade antivirus included
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem 0', fontSize: '0.95rem', color: '#374151' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                  Priority business scheduling
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem 0', fontSize: '0.95rem', color: '#374151' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                  Proactive system monitoring
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem 0', fontSize: '0.95rem', color: '#374151' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                  Monthly system health reports
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem 0', fontSize: '0.95rem', color: '#374151' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                  Business hours phone support
                </li>
              </ul>

              <Link href="/contact" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', padding: '0.875rem 1.5rem', fontSize: '1rem', marginTop: 'auto' }}>Get Started</Link>
            </div>

          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="cta">
        <div className="container">
          <h2>Questions About Our Plans?</h2>
          <p>Contact us to find the right protection plan for your needs.</p>
          <Link href="/contact" className="btn btn-white">Contact Us</Link>
        </div>
      </section>
    </>
  );
}
