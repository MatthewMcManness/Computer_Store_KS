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

export default function ProtectionPlansPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Protection Plans</h1>
          <p className="hero-subtitle">Comprehensive computer care for home and business</p>
        </div>
      </section>

      {/* Plans Section */}
      <section className="membership">
        <div className="container">
          <div className="plans-grid">

            {/* Silver Plan Card */}
            <div className="plan-card plan-card-silver">
              <div className="plan-badge plan-badge-popular">Most Popular</div>
              <div className="plan-header">
                <h2 className="plan-name">Silver</h2>
                <div className="plan-price">
                  <span className="price-amount">$24.99</span>
                  <span className="price-period">/month</span>
                </div>
                <p className="plan-commitment">3-month minimum commitment</p>
                <p className="plan-tagline"><em>Best value for home users, families, and remote workers</em></p>
              </div>

              <ul className="plan-features">
                <li className="feature-item">
                  <span className="feature-icon">✓</span>
                  Antivirus software included
                </li>
                <li className="feature-item feature-highlight">
                  <span className="feature-icon feature-icon-star">★</span>
                  50% discount on virus removal
                </li>
                <li className="feature-item feature-highlight">
                  <span className="feature-icon feature-icon-star">★</span>
                  50% off house calls
                </li>
                <li className="feature-item">
                  <span className="feature-icon">✓</span>
                  50% off account recovery
                </li>
                <li className="feature-item">
                  <span className="feature-icon">✓</span>
                  Remote support (4 hrs/month)
                </li>
                <li className="feature-item">
                  <span className="feature-icon">✓</span>
                  Performance monitoring &amp; alerts
                </li>
                <li className="feature-item">
                  <span className="feature-icon">✓</span>
                  15% discount on labor
                </li>
                <li className="feature-item">
                  <span className="feature-icon">✓</span>
                  Priority scheduling
                </li>
                <li className="feature-item">
                  <span className="feature-icon">✓</span>
                  Free in-store diagnostics
                </li>
                <li className="feature-item">
                  <span className="feature-icon">✓</span>
                  Email support (24-48hr response)
                </li>
                <li className="feature-item">
                  <span className="feature-icon">✓</span>
                  Quarterly system health check
                </li>
              </ul>

              <Link href="/contact" className="btn btn-primary plan-cta">Get Started</Link>
            </div>

            {/* Silver Plus Plan Card */}
            <div className="plan-card plan-card-silver-plus">
              <div className="plan-badge plan-badge-business">Best for Business</div>
              <div className="plan-header">
                <h2 className="plan-name">Silver Plus</h2>
                <div className="plan-price">
                  <span className="price-amount">$34.99</span>
                  <span className="price-period">/device/month</span>
                </div>
                <p className="plan-commitment">3-month minimum commitment</p>
                <p className="plan-tagline"><em>Tailored for small businesses and professionals requiring reliable support</em></p>
              </div>

              <p className="plan-includes">Everything in Silver, plus:</p>

              <ul className="plan-features">
                <li className="feature-item feature-highlight">
                  <span className="feature-icon feature-icon-star">★</span>
                  $35 service calls (65% off - normally $100)
                </li>
                <li className="feature-item feature-highlight">
                  <span className="feature-icon feature-icon-star">★</span>
                  6 hours/month remote support included
                </li>
                <li className="feature-item feature-highlight">
                  <span className="feature-icon feature-icon-star">★</span>
                  25% off all labor charges
                </li>
                <li className="feature-item">
                  <span className="feature-icon">✓</span>
                  Business-grade antivirus included
                </li>
                <li className="feature-item">
                  <span className="feature-icon">✓</span>
                  Priority business scheduling
                </li>
                <li className="feature-item">
                  <span className="feature-icon">✓</span>
                  Proactive system monitoring
                </li>
                <li className="feature-item">
                  <span className="feature-icon">✓</span>
                  Monthly system health reports
                </li>
                <li className="feature-item">
                  <span className="feature-icon">✓</span>
                  Business hours phone support
                </li>
              </ul>

              <Link href="/contact" className="btn btn-primary plan-cta">Get Started</Link>
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

      <style jsx>{`
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem 0;
        }

        .plan-card {
          background: #fff;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .plan-card-silver {
          border: 2px solid #6b7280;
        }

        .plan-card-silver-plus {
          border: 2px solid #f59e0b;
        }

        .plan-badge {
          position: absolute;
          top: -12px;
          right: 20px;
          padding: 0.25rem 1rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .plan-badge-popular {
          background: #10b981;
          color: white;
        }

        .plan-badge-business {
          background: #f59e0b;
          color: white;
        }

        .plan-header {
          text-align: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .plan-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }

        .plan-card-silver .plan-name {
          color: #6b7280;
        }

        .plan-card-silver-plus .plan-name {
          color: #f59e0b;
        }

        .plan-price {
          margin: 0.5rem 0;
        }

        .price-amount {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        .price-period {
          font-size: 1rem;
          color: #6b7280;
        }

        .plan-commitment {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0.25rem 0;
        }

        .plan-tagline {
          font-size: 0.875rem;
          color: #4b5563;
          margin: 0.5rem 0 0 0;
        }

        .plan-includes {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .plan-features {
          list-style: none;
          padding: 0;
          margin: 0 0 1.5rem 0;
          flex-grow: 1;
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.5rem 0;
          font-size: 0.95rem;
          color: #374151;
        }

        .feature-highlight {
          color: #d97706;
          font-weight: 500;
        }

        .feature-icon {
          color: #10b981;
          font-weight: bold;
          flex-shrink: 0;
        }

        .feature-icon-star {
          color: #f59e0b;
        }

        .plan-cta {
          width: 100%;
          text-align: center;
          padding: 0.875rem 1.5rem;
          font-size: 1rem;
          margin-top: auto;
        }

        @media (max-width: 768px) {
          .plans-grid {
            grid-template-columns: 1fr;
            padding: 1rem;
          }

          .plan-card {
            padding: 1.5rem;
          }

          .price-amount {
            font-size: 2rem;
          }
        }
      `}</style>
    </>
  );
}
