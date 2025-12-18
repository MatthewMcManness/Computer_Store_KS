import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Protection Plans - Computer Protection Plans',
  description: 'Choose the right protection plan for your computer. Bronze ($14.99), Silver ($24.99), or Gold ($39.99) monthly plans with antivirus, discounts on repairs, and peace of mind.',
  openGraph: {
    title: 'Computer Protection Plans - Bronze, Silver, Gold',
    description: 'Comprehensive computer protection plans starting at $14.99/month. Antivirus, repair discounts, remote support, and more.',
    url: 'https://computerstoreks.com/silver-plan',
  },
};

export default function ProtectionPlansPage() {
  return (
    <>
      <style>{`
        .plans-hero {
          background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-dark) 100%);
          padding: 4rem 0;
          text-align: center;
        }

        .plans-hero h1 {
          color: white;
          font-size: clamp(2rem, 5vw, 3rem);
          margin-bottom: 0.5rem;
        }

        .plans-hero p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.2rem;
          margin-bottom: 0;
        }

        .plans-section {
          padding: 4rem 0;
          background: var(--background-light);
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        @media (max-width: 1024px) {
          .plans-grid {
            grid-template-columns: 1fr;
            max-width: 500px;
          }
        }

        .plan-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .plan-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        /* Bronze Card */
        .plan-bronze {
          border: 2px solid #d4a574;
          box-shadow: 0 4px 20px rgba(212, 165, 116, 0.2);
        }

        .plan-bronze .plan-badge {
          background: linear-gradient(135deg, #e8d4b8 0%, #d4a574 50%, #b8860b 100%);
          color: #422006;
        }

        /* Silver Card */
        .plan-silver {
          border: 2px solid #94a3b8;
          box-shadow: 0 4px 20px rgba(148, 163, 184, 0.3);
          transform: scale(1.03);
          z-index: 1;
        }

        .plan-silver:hover {
          transform: scale(1.03) translateY(-8px);
        }

        .plan-silver::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 200%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.3), transparent);
          animation: silver-shine 3s ease-in-out infinite;
        }

        @keyframes silver-shine {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }

        .plan-silver .plan-badge {
          background: linear-gradient(135deg, #e5e7eb 0%, #9ca3af 50%, #6b7280 100%);
          color: #1f2937;
        }

        .popular-tag {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: var(--success);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Gold Card */
        .plan-gold {
          border: 2px solid #fbbf24;
          box-shadow: 0 4px 20px rgba(251, 191, 36, 0.3);
        }

        .plan-gold::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 200%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.2), transparent);
          animation: gold-shine 2.5s ease-in-out infinite;
        }

        @keyframes gold-shine {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }

        .plan-gold .plan-badge {
          background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 50%, #d97706 100%);
          color: #422006;
        }

        .plan-badge {
          display: inline-block;
          padding: 0.5rem 1.5rem;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }

        .plan-price {
          font-size: 3rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0.5rem 0;
          line-height: 1;
        }

        .plan-price span {
          font-size: 1rem;
          font-weight: 400;
          color: var(--text-muted);
        }

        .plan-commitment {
          color: var(--text-muted);
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }

        .plan-target {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          font-style: italic;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .plan-features {
          list-style: none;
          padding: 0;
          margin: 0 0 1.5rem 0;
          flex-grow: 1;
        }

        .plan-features li {
          padding: 0.6rem 0;
          padding-left: 1.75rem;
          position: relative;
          color: var(--text-secondary);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          font-size: 0.95rem;
        }

        .plan-features li:last-child {
          border-bottom: none;
        }

        .plan-features li::before {
          content: '\\2713';
          position: absolute;
          left: 0;
          color: var(--success);
          font-weight: bold;
        }

        .plan-features li.highlight {
          color: #d97706;
          font-weight: 600;
        }

        .plan-features li.highlight::before {
          content: '\\2605';
          color: #d97706;
        }

        .plan-cta {
          display: block;
          text-align: center;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          margin-top: auto;
        }

        .plan-bronze .plan-cta {
          background: linear-gradient(135deg, #d4a574 0%, #b8860b 100%);
          color: white;
        }

        .plan-bronze .plan-cta:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(184, 134, 11, 0.4);
        }

        .plan-silver .plan-cta {
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
          color: white;
        }

        .plan-silver .plan-cta:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(75, 85, 99, 0.4);
        }

        .plan-gold .plan-cta {
          background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
          color: white;
        }

        .plan-gold .plan-cta:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4);
        }

        /* Comparison Section */
        .comparison-section {
          padding: 4rem 0;
          background: white;
        }

        .comparison-section h2 {
          text-align: center;
          margin-bottom: 2rem;
          color: var(--text-primary);
        }

        .comparison-table {
          max-width: 1000px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .comparison-row {
          display: grid;
          grid-template-columns: 2fr repeat(3, 1fr);
          border-bottom: 1px solid #e5e7eb;
        }

        .comparison-row:last-child {
          border-bottom: none;
        }

        .comparison-row.header {
          background: var(--primary-blue);
          color: white;
          font-weight: 700;
        }

        .comparison-row.header > div {
          padding: 1rem;
          text-align: center;
        }

        .comparison-row.header > div:first-child {
          text-align: left;
        }

        .comparison-row > div {
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .comparison-row > div:first-child {
          justify-content: flex-start;
          color: var(--text-secondary);
        }

        .comparison-row:not(.header):hover {
          background: var(--background-light);
        }

        .check-icon {
          color: var(--success);
          font-size: 1.25rem;
          font-weight: bold;
        }

        .x-icon {
          color: #d1d5db;
          font-size: 1.25rem;
        }

        .value-text {
          color: #d97706;
          font-weight: 600;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .comparison-row {
            grid-template-columns: 1.5fr repeat(3, 1fr);
          }

          .comparison-row > div {
            padding: 0.75rem 0.5rem;
            font-size: 0.85rem;
          }

          .value-text {
            font-size: 0.8rem;
          }
        }

        /* Value Props Section */
        .value-section {
          padding: 4rem 0;
          background: var(--background-light);
        }

        .value-section h2 {
          text-align: center;
          margin-bottom: 2rem;
        }

        .value-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        @media (max-width: 768px) {
          .value-grid {
            grid-template-columns: 1fr;
          }
        }

        .value-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .value-card h3 {
          color: var(--primary-blue);
          font-size: 1.25rem;
          margin-bottom: 1rem;
        }

        .value-card p {
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 0;
        }

        /* CTA Section */
        .plans-cta {
          padding: 4rem 0;
          background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-dark) 100%);
          text-align: center;
        }

        .plans-cta h2 {
          color: white;
          margin-bottom: 1rem;
        }

        .plans-cta p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.1rem;
          margin-bottom: 2rem;
        }

        .plans-cta .btn {
          display: inline-block;
          padding: 1rem 2.5rem;
          background: white;
          color: var(--primary-blue);
          font-weight: 600;
          font-size: 1.1rem;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .plans-cta .btn:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .plans-note {
          text-align: center;
          padding: 2rem;
          color: var(--text-muted);
          font-size: 0.9rem;
        }
      `}</style>

      {/* Hero Section */}
      <section className="plans-hero">
        <div className="container">
          <h1>Computer Protection Plans</h1>
          <p>Choose the right level of protection for your peace of mind</p>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="plans-section">
        <div className="plans-grid">
          {/* Bronze Plan */}
          <div className="plan-card plan-bronze">
            <span className="plan-badge">Bronze</span>
            <div className="plan-price">$14.99<span>/month</span></div>
            <div className="plan-commitment">3-month minimum commitment</div>
            <div className="plan-target">Perfect for budget-conscious users and light computer users</div>
            <ul className="plan-features">
              <li>Antivirus software included</li>
              <li>25% discount on virus removal</li>
              <li>10% discount on labor</li>
              <li>Free in-store diagnostics</li>
              <li>Email support (24-48hr response)</li>
              <li>Quarterly system health check</li>
            </ul>
            <Link href="/contact?plan=bronze" className="plan-cta">Get Started</Link>
          </div>

          {/* Silver Plan */}
          <div className="plan-card plan-silver">
            <span className="popular-tag">Most Popular</span>
            <span className="plan-badge">Silver</span>
            <div className="plan-price">$24.99<span>/month</span></div>
            <div className="plan-commitment">3-month minimum commitment</div>
            <div className="plan-target">Best value for home users, families, and remote workers</div>
            <ul className="plan-features">
              <li>Everything in Bronze, plus:</li>
              <li className="highlight">50% discount on virus removal</li>
              <li className="highlight">50% off house calls</li>
              <li>50% off account recovery</li>
              <li>Remote support (2 hrs/month)</li>
              <li>Performance monitoring &amp; alerts</li>
              <li>15% discount on labor</li>
              <li>Priority scheduling</li>
            </ul>
            <Link href="/contact?plan=silver" className="plan-cta">Get Started</Link>
          </div>

          {/* Gold Plan */}
          <div className="plan-card plan-gold">
            <span className="plan-badge">Gold</span>
            <div className="plan-price">$39.99<span>/month</span></div>
            <div className="plan-commitment">3-month minimum commitment</div>
            <div className="plan-target">Premium protection for power users and home offices</div>
            <ul className="plan-features">
              <li>Everything in Silver, plus:</li>
              <li className="highlight">Premium antivirus suite</li>
              <li className="highlight">75% discount on virus removal</li>
              <li className="highlight">50% off house calls</li>
              <li className="highlight">1 FREE account recovery/month</li>
              <li>Extended remote support (4 hrs/month)</li>
              <li>25% discount on labor</li>
              <li className="highlight">Annual comprehensive tune-up</li>
              <li>Data backup consultation</li>
              <li className="highlight">VIP same-day scheduling</li>
              <li>10% off hardware purchases</li>
            </ul>
            <Link href="/contact?plan=gold" className="plan-cta">Get Started</Link>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="comparison-section">
        <div className="container">
          <h2>Compare Plans</h2>
          <div className="comparison-table">
            <div className="comparison-row header">
              <div>Feature</div>
              <div>Bronze</div>
              <div>Silver</div>
              <div>Gold</div>
            </div>
            <div className="comparison-row">
              <div>Antivirus Protection</div>
              <div><span className="check-icon">&#10003;</span></div>
              <div><span className="check-icon">&#10003;</span></div>
              <div><span className="value-text">Premium</span></div>
            </div>
            <div className="comparison-row">
              <div>Virus Removal Discount</div>
              <div><span className="value-text">25%</span></div>
              <div><span className="value-text">50%</span></div>
              <div><span className="value-text">75%</span></div>
            </div>
            <div className="comparison-row">
              <div>Labor Discount</div>
              <div><span className="value-text">10%</span></div>
              <div><span className="value-text">15%</span></div>
              <div><span className="value-text">25%</span></div>
            </div>
            <div className="comparison-row">
              <div>House Calls ($100 value)</div>
              <div><span className="x-icon">&mdash;</span></div>
              <div><span className="value-text">50% off</span></div>
              <div><span className="value-text">50% off</span></div>
            </div>
            <div className="comparison-row">
              <div>Account Recovery ($50 value)</div>
              <div><span className="x-icon">&mdash;</span></div>
              <div><span className="value-text">50% off</span></div>
              <div><span className="value-text">1 FREE/mo</span></div>
            </div>
            <div className="comparison-row">
              <div>Remote Support</div>
              <div><span className="value-text">Email</span></div>
              <div><span className="value-text">2 hrs/mo</span></div>
              <div><span className="value-text">4 hrs/mo</span></div>
            </div>
            <div className="comparison-row">
              <div>System Maintenance</div>
              <div><span className="value-text">Quarterly</span></div>
              <div><span className="value-text">As needed</span></div>
              <div><span className="value-text">Annual tune-up</span></div>
            </div>
            <div className="comparison-row">
              <div>Performance Monitoring</div>
              <div><span className="x-icon">&mdash;</span></div>
              <div><span className="check-icon">&#10003;</span></div>
              <div><span className="check-icon">&#10003;</span></div>
            </div>
            <div className="comparison-row">
              <div>Priority Scheduling</div>
              <div><span className="x-icon">&mdash;</span></div>
              <div><span className="check-icon">&#10003;</span></div>
              <div><span className="value-text">VIP Same-Day</span></div>
            </div>
            <div className="comparison-row">
              <div>Hardware Discount</div>
              <div><span className="x-icon">&mdash;</span></div>
              <div><span className="x-icon">&mdash;</span></div>
              <div><span className="value-text">10%</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="value-section">
        <div className="container">
          <h2>Why Choose a Protection Plan?</h2>
          <div className="value-grid">
            <div className="value-card">
              <h3>Peace of Mind</h3>
              <p>Stop worrying about viruses, malware, and computer problems. With antivirus protection included, your computer is protected around the clock.</p>
            </div>
            <div className="value-card">
              <h3>Save Money</h3>
              <p>One virus removal at full price can cost more than months of protection plan coverage. Our discounts pay for themselves quickly.</p>
            </div>
            <div className="value-card">
              <h3>Priority Service</h3>
              <p>When something goes wrong, you get to the front of the line. Silver and Gold members get priority scheduling so you&apos;re back up and running fast.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="plans-cta">
        <div className="container">
          <h2>Ready to Protect Your Computer?</h2>
          <p>Contact us today to sign up for the plan that&apos;s right for you.</p>
          <Link href="/contact" className="btn">Get Protected Today</Link>
        </div>
      </section>

      <p className="plans-note">
        All plans require a 3-month minimum commitment. Prices are per computer.
        <br />
        Contact us for multi-computer discounts or business pricing.
      </p>
    </>
  );
}
