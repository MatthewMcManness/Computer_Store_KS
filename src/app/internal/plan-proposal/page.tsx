import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Protection Plan Tiers Proposal - Internal Review',
  description: 'Bronze, Silver, Gold protection plan proposal for Computer Store KS',
  robots: 'noindex, nofollow',
};

export default function PlanProposalPage() {
  return (
    <div className="proposal-page">
      <style>{`
        .proposal-page {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          background: #f8f9fb;
          min-height: 100vh;
          color: #374151;
        }

        .proposal-header {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          padding: 3rem 2rem;
          text-align: center;
          border-bottom: 4px solid #1e40af;
        }

        .proposal-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.5rem;
        }

        .proposal-header p {
          color: #dbeafe;
          font-size: 1.1rem;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .section {
          margin-bottom: 4rem;
        }

        .section-title {
          font-size: 1.75rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 3px solid #2563eb;
        }

        /* Tier Cards */
        .tiers-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-top: 2rem;
        }

        @media (max-width: 1024px) {
          .tiers-grid {
            grid-template-columns: 1fr;
          }
        }

        .tier-card {
          border-radius: 16px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .tier-card:hover {
          transform: translateY(-5px);
        }

        /* Bronze */
        .tier-bronze {
          background: linear-gradient(135deg, #faf5f0 0%, #f5ebe0 100%);
          border: 2px solid #d4a574;
          box-shadow: 0 4px 20px rgba(212, 165, 116, 0.2);
        }

        .tier-bronze .tier-badge {
          background: linear-gradient(135deg, #e8d4b8 0%, #d4a574 50%, #b8860b 100%);
          color: #422006;
        }

        /* Silver */
        .tier-silver {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border: 2px solid #94a3b8;
          box-shadow: 0 4px 20px rgba(148, 163, 184, 0.3);
          transform: scale(1.02);
        }

        .tier-silver::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 200%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: silver-shimmer 3s ease-in-out infinite;
        }

        @keyframes silver-shimmer {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }

        .tier-silver .tier-badge {
          background: linear-gradient(135deg, #e5e7eb 0%, #9ca3af 50%, #6b7280 100%);
          color: #1f2937;
        }

        .current-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: #10b981;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        /* Gold */
        .tier-gold {
          background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
          border: 2px solid #fbbf24;
          box-shadow: 0 4px 20px rgba(251, 191, 36, 0.3);
        }

        .tier-gold::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 200%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.3), transparent);
          animation: gold-shimmer 2.5s ease-in-out infinite;
        }

        @keyframes gold-shimmer {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }

        .tier-gold .tier-badge {
          background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 50%, #d97706 100%);
          color: #422006;
        }

        .tier-badge {
          display: inline-block;
          padding: 0.5rem 1.5rem;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 1.25rem;
          margin-bottom: 1rem;
        }

        .tier-price {
          font-size: 3rem;
          font-weight: 700;
          color: #111827;
          margin: 1rem 0;
        }

        .tier-price span {
          font-size: 1rem;
          font-weight: 400;
          color: #6b7280;
        }

        .tier-target {
          color: #6b7280;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          font-style: italic;
        }

        .tier-features {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .tier-features li {
          padding: 0.5rem 0;
          padding-left: 1.75rem;
          position: relative;
          color: #374151;
          border-bottom: 1px solid rgba(0,0,0,0.08);
        }

        .tier-features li:last-child {
          border-bottom: none;
        }

        .tier-features li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #10b981;
          font-weight: bold;
        }

        .tier-features li.highlight {
          color: #d97706;
          font-weight: 600;
        }

        .tier-features li.highlight::before {
          content: '★';
          color: #d97706;
        }

        /* Tools Section */
        .tools-banner {
          background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
          border: 2px solid #2563eb;
          border-radius: 12px;
          padding: 1.5rem 2rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .tools-banner h3 {
          color: #1e40af;
          margin: 0;
          font-size: 1.1rem;
        }

        .tools-list {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .tool-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #374151;
          font-weight: 500;
        }

        .tool-item .icon {
          width: 24px;
          height: 24px;
          background: #2563eb;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.75rem;
        }

        /* Business Value Section */
        .value-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 768px) {
          .value-grid {
            grid-template-columns: 1fr;
          }
        }

        .value-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .value-card h4 {
          color: #2563eb;
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }

        .value-card p {
          color: #6b7280;
          line-height: 1.6;
        }

        /* Revenue Projections */
        .revenue-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .revenue-table th,
        .revenue-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }

        .revenue-table th {
          background: #2563eb;
          color: #ffffff;
          font-weight: 600;
        }

        .revenue-table tr:hover {
          background: #f8f9fb;
        }

        .revenue-table .total-row {
          background: #d1fae5;
          font-weight: 700;
          color: #065f46;
        }

        /* Comparison Chart */
        .comparison-chart {
          background: #ffffff;
          border-radius: 16px;
          padding: 2rem;
          margin-top: 1rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border: 1px solid #e5e7eb;
        }

        .comparison-row {
          display: grid;
          grid-template-columns: 2fr repeat(3, 1fr);
          padding: 0.75rem 0;
          border-bottom: 1px solid #e5e7eb;
          align-items: center;
        }

        .comparison-row:first-child {
          font-weight: 700;
          color: #2563eb;
          padding-bottom: 1rem;
          border-bottom: 2px solid #2563eb;
        }

        .comparison-row .feature-name {
          color: #374151;
        }

        .comparison-row .check {
          text-align: center;
          color: #10b981;
          font-size: 1.25rem;
        }

        .comparison-row .x {
          text-align: center;
          color: #9ca3af;
          font-size: 1.25rem;
        }

        .comparison-row .value {
          text-align: center;
          color: #d97706;
          font-weight: 600;
        }

        /* Psychology Section */
        .psychology-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        @media (max-width: 768px) {
          .psychology-grid {
            grid-template-columns: 1fr;
          }
        }

        .psychology-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 1.5rem;
          border: 2px solid #dbeafe;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
        }

        .psychology-card h4 {
          color: #1e40af;
          margin-bottom: 0.75rem;
        }

        .psychology-card p {
          color: #6b7280;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        /* CTA Section */
        .cta-section {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          border-radius: 16px;
          padding: 3rem;
          text-align: center;
          margin-top: 3rem;
        }

        .cta-section h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #ffffff;
        }

        .cta-section p {
          color: #dbeafe;
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .cta-btn {
          padding: 1rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 0.2s ease;
          text-decoration: none;
        }

        .cta-btn:hover {
          transform: scale(1.05);
        }

        .cta-btn-primary {
          background: #10b981;
          color: white;
          border: none;
        }

        .cta-btn-secondary {
          background: transparent;
          color: white;
          border: 2px solid white;
        }

        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin: 2rem 0;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .stat-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #10b981;
        }

        .stat-label {
          color: #6b7280;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        /* Cost Analysis */
        .cost-analysis {
          background: #fef3c7;
          border: 2px solid #f59e0b;
          border-radius: 12px;
          padding: 1.5rem;
          margin: 2rem 0;
        }

        .cost-analysis h4 {
          color: #92400e;
          margin-bottom: 1rem;
        }

        .cost-analysis table {
          width: 100%;
          border-collapse: collapse;
        }

        .cost-analysis td {
          padding: 0.5rem;
          border-bottom: 1px solid rgba(245, 158, 11, 0.3);
        }

        .cost-analysis td:last-child {
          text-align: right;
          font-weight: 600;
          color: #92400e;
        }

        .cost-analysis .profit-row {
          background: rgba(16, 185, 129, 0.2);
          color: #065f46;
          font-weight: 700;
        }

        .disclaimer {
          text-align: center;
          color: #9ca3af;
          font-size: 0.85rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e5e7eb;
        }
      `}</style>

      <header className="proposal-header">
        <h1>Protection Plan Tiers Proposal</h1>
        <p>Bronze, Silver, Gold - A Complete Customer Protection Strategy</p>
      </header>

      <div className="container">
        {/* Tools Banner */}
        <div className="tools-banner">
          <h3>Powered By:</h3>
          <div className="tools-list">
            <div className="tool-item">
              <span className="icon">🛡️</span>
              <span>Seraph Secure (Antivirus)</span>
            </div>
            <div className="tool-item">
              <span className="icon">🖥️</span>
              <span>NinjaRMM (Remote Support)</span>
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <section className="section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">+60%</div>
              <div className="stat-label">Expected Subscriber Growth</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">+45%</div>
              <div className="stat-label">Revenue Increase Year 1</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">$16K+</div>
              <div className="stat-label">Projected ARR Year 1</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">~10hrs</div>
              <div className="stat-label">Implementation Time</div>
            </div>
          </div>
        </section>

        {/* Tier Cards */}
        <section className="section">
          <h2 className="section-title">The Three Tiers</h2>
          <div className="tiers-grid">
            {/* Bronze */}
            <div className="tier-card tier-bronze">
              <span className="tier-badge">Bronze</span>
              <div className="tier-price">$14.99<span>/month</span></div>
              <div className="tier-target">Budget-conscious users, seniors, light users</div>
              <ul className="tier-features">
                <li>Seraph Secure antivirus included</li>
                <li>25% discount on virus removal</li>
                <li>10% discount on labor</li>
                <li>Free in-store diagnostics</li>
                <li>Email support (24-48hr response)</li>
                <li>Quarterly system health check</li>
              </ul>
            </div>

            {/* Silver */}
            <div className="tier-card tier-silver">
              <span className="current-badge">CURRENT PLAN</span>
              <span className="tier-badge">Silver</span>
              <div className="tier-price">$24.99<span>/month</span></div>
              <div className="tier-target">Average home users, families, remote workers</div>
              <ul className="tier-features">
                <li>Everything in Bronze, plus:</li>
                <li className="highlight">50% discount on virus removal</li>
                <li className="highlight">50% off house calls ($50 savings)</li>
                <li>50% off account recovery</li>
                <li>Remote support via Ninja (2hrs/month)</li>
                <li>Performance monitoring & alerts</li>
                <li>15% discount on labor</li>
                <li>Priority scheduling</li>
              </ul>
            </div>

            {/* Gold */}
            <div className="tier-card tier-gold">
              <span className="tier-badge">Gold</span>
              <div className="tier-price">$39.99<span>/month</span></div>
              <div className="tier-target">Power users, home office, small business</div>
              <ul className="tier-features">
                <li>Everything in Silver, plus:</li>
                <li className="highlight">Seraph Secure Premium Suite</li>
                <li className="highlight">75% off virus removal</li>
                <li className="highlight">75% off house calls ($75 savings)</li>
                <li className="highlight">1 FREE account recovery/month</li>
                <li>Extended Ninja remote support (4hrs/month)</li>
                <li>25% discount on labor</li>
                <li className="highlight">Annual comprehensive tune-up</li>
                <li>Data backup consultation</li>
                <li className="highlight">VIP same-day scheduling</li>
                <li>10% off hardware purchases</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Cost Analysis */}
        <section className="section">
          <h2 className="section-title">Gold Tier Profitability Analysis</h2>
          <div className="cost-analysis">
            <h4>Why This Gold Tier Works (Per Customer/Month)</h4>
            <table>
              <tbody>
                <tr>
                  <td>Monthly subscription revenue</td>
                  <td>+$39.99</td>
                </tr>
                <tr>
                  <td>Seraph Secure license cost (est.)</td>
                  <td>-$5.00</td>
                </tr>
                <tr>
                  <td>1 free account recovery (normally $50, avg usage ~0.3/mo)</td>
                  <td>-$15.00</td>
                </tr>
                <tr>
                  <td>Annual tune-up amortized ($75 ÷ 12)</td>
                  <td>-$6.25</td>
                </tr>
                <tr>
                  <td>Ninja RMM seat cost (est.)</td>
                  <td>-$3.00</td>
                </tr>
                <tr className="profit-row">
                  <td>Estimated Monthly Profit</td>
                  <td>~$10.74</td>
                </tr>
              </tbody>
            </table>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#92400e' }}>
              <strong>Note:</strong> House calls at 75% off still generates $25/call revenue.
              The 1 free account recovery/month prevents abuse while providing real value.
              Most customers won&apos;t use all benefits every month, increasing actual margin.
            </p>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="section">
          <h2 className="section-title">Feature Comparison</h2>
          <div className="comparison-chart">
            <div className="comparison-row">
              <div className="feature-name">Feature</div>
              <div>Bronze</div>
              <div>Silver</div>
              <div>Gold</div>
            </div>
            <div className="comparison-row">
              <div className="feature-name">Seraph Secure Antivirus</div>
              <div className="check">✓</div>
              <div className="check">✓</div>
              <div className="value">Premium</div>
            </div>
            <div className="comparison-row">
              <div className="feature-name">Virus Removal Discount</div>
              <div className="value">25%</div>
              <div className="value">50%</div>
              <div className="value">75%</div>
            </div>
            <div className="comparison-row">
              <div className="feature-name">Labor Discount</div>
              <div className="value">10%</div>
              <div className="value">15%</div>
              <div className="value">25%</div>
            </div>
            <div className="comparison-row">
              <div className="feature-name">House Call Discount ($100 normal)</div>
              <div className="x">—</div>
              <div className="value">50% ($50)</div>
              <div className="value">75% ($25)</div>
            </div>
            <div className="comparison-row">
              <div className="feature-name">Account Recovery ($50 normal)</div>
              <div className="x">—</div>
              <div className="value">50% off</div>
              <div className="value">1 FREE/mo</div>
            </div>
            <div className="comparison-row">
              <div className="feature-name">Ninja Remote Support</div>
              <div className="x">Email only</div>
              <div className="value">2 hrs/mo</div>
              <div className="value">4 hrs/mo</div>
            </div>
            <div className="comparison-row">
              <div className="feature-name">System Tune-up</div>
              <div className="value">Quarterly check</div>
              <div className="x">As needed</div>
              <div className="value">Annual full tune-up</div>
            </div>
            <div className="comparison-row">
              <div className="feature-name">Performance Monitoring</div>
              <div className="x">—</div>
              <div className="check">✓</div>
              <div className="check">✓</div>
            </div>
            <div className="comparison-row">
              <div className="feature-name">Priority Scheduling</div>
              <div className="x">—</div>
              <div className="check">✓</div>
              <div className="value">VIP Same-Day</div>
            </div>
            <div className="comparison-row">
              <div className="feature-name">Hardware Discount</div>
              <div className="x">—</div>
              <div className="x">—</div>
              <div className="value">10%</div>
            </div>
          </div>
        </section>

        {/* Business Value */}
        <section className="section">
          <h2 className="section-title">Why This Works for the Business</h2>
          <div className="value-grid">
            <div className="value-card">
              <h4>Bronze Captures New Customers</h4>
              <p>Price-sensitive customers who would never pay $24.99 will pay $14.99. Lower discounts (25% vs 50%) mean higher margins on paid services. Perfect entry point to upsell to Silver later.</p>
            </div>
            <div className="value-card">
              <h4>Silver Remains the Sweet Spot</h4>
              <p>Your current plan is already proven. With Bronze below it, Silver looks like even better value. Most customers will naturally gravitate here - exactly where you want them.</p>
            </div>
            <div className="value-card">
              <h4>Gold: Premium Without the Loss</h4>
              <p>75% off house calls still generates $25/call. One free account recovery/month is capped exposure ($50 max). Annual tune-up spreads cost across 12 months. High perceived value, sustainable margins.</p>
            </div>
          </div>
        </section>

        {/* Pricing Psychology */}
        <section className="section">
          <h2 className="section-title">Pricing Psychology at Work</h2>
          <div className="psychology-grid">
            <div className="psychology-card">
              <h4>The Anchor Effect</h4>
              <p>Bronze at $14.99 makes Silver at $24.99 look like a great deal. &quot;Only $10 more for SO much more value!&quot; Most customers choose the middle option when presented with three choices.</p>
            </div>
            <div className="psychology-card">
              <h4>Aspirational Gold</h4>
              <p>Even customers who choose Silver see Gold and think &quot;maybe someday.&quot; It creates an upgrade path and makes Silver feel like a smart, reasonable choice rather than the &quot;cheap option.&quot;</p>
            </div>
            <div className="psychology-card">
              <h4>Value Perception</h4>
              <p>The jump from Bronze to Silver (+$10 for 2x the features) feels better than Silver to Gold (+$15 for premium perks). This guides most customers to Silver - your proven tier.</p>
            </div>
          </div>
        </section>

        {/* Revenue Projections */}
        <section className="section">
          <h2 className="section-title">Revenue Projections</h2>

          <h3 style={{ color: '#6b7280', marginBottom: '1rem' }}>Year 1 (Conservative Estimate)</h3>
          <table className="revenue-table">
            <thead>
              <tr>
                <th>Tier</th>
                <th>Est. Customers</th>
                <th>Monthly Revenue</th>
                <th>Annual Revenue</th>
                <th>Est. Margin</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Bronze ($14.99)</td>
                <td>15</td>
                <td>$224.85</td>
                <td>$2,698</td>
                <td>70-75%</td>
              </tr>
              <tr>
                <td>Silver ($24.99)</td>
                <td>30</td>
                <td>$749.70</td>
                <td>$8,996</td>
                <td>55-60%</td>
              </tr>
              <tr>
                <td>Gold ($39.99)</td>
                <td>10</td>
                <td>$399.90</td>
                <td>$4,799</td>
                <td>25-35%</td>
              </tr>
              <tr className="total-row">
                <td>TOTAL</td>
                <td>55</td>
                <td>$1,374.45</td>
                <td>$16,493</td>
                <td>~55%</td>
              </tr>
            </tbody>
          </table>

          <h3 style={{ color: '#6b7280', marginBottom: '1rem', marginTop: '2rem' }}>Year 2 (With Growth)</h3>
          <table className="revenue-table">
            <thead>
              <tr>
                <th>Tier</th>
                <th>Est. Customers</th>
                <th>Monthly Revenue</th>
                <th>Annual Revenue</th>
                <th>Est. Margin</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Bronze ($14.99)</td>
                <td>25</td>
                <td>$374.75</td>
                <td>$4,497</td>
                <td>70-75%</td>
              </tr>
              <tr>
                <td>Silver ($24.99)</td>
                <td>45</td>
                <td>$1,124.55</td>
                <td>$13,495</td>
                <td>55-60%</td>
              </tr>
              <tr>
                <td>Gold ($39.99)</td>
                <td>18</td>
                <td>$719.82</td>
                <td>$8,638</td>
                <td>25-35%</td>
              </tr>
              <tr className="total-row">
                <td>TOTAL</td>
                <td>88</td>
                <td>$2,219.12</td>
                <td>$26,630</td>
                <td>~55%</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Customer Value */}
        <section className="section">
          <h2 className="section-title">Why Customers Will Love It</h2>
          <div className="value-grid">
            <div className="value-card">
              <h4>Bronze: Entry-Level Peace of Mind</h4>
              <p>Perfect for seniors on fixed incomes or light users. $14.99/month gets them Seraph Secure protection without breaking the bank. One virus removal at 25% off saves them $25+ immediately.</p>
            </div>
            <div className="value-card">
              <h4>Silver: Best Value for Most</h4>
              <p>Families and home users get comprehensive coverage. One house call at 50% off ($50 savings) pays for 2 months of the plan. Remote support via Ninja means help without leaving home.</p>
            </div>
            <div className="value-card">
              <h4>Gold: Premium for Power Users</h4>
              <p>People who depend on their computers for work get VIP treatment. One free account recovery ($50) plus one 75% off house call ($75 savings) = $125 value in just two services.</p>
            </div>
          </div>
        </section>

        {/* Implementation */}
        <section className="section">
          <h2 className="section-title">Implementation Roadmap</h2>
          <div className="comparison-chart">
            <div className="comparison-row">
              <div className="feature-name">Task</div>
              <div>Effort</div>
              <div>Priority</div>
              <div>Status</div>
            </div>
            <div className="comparison-row">
              <div className="feature-name">Add Bronze/Gold to RepairShopr Protection Plan dropdown</div>
              <div className="value">30 min</div>
              <div className="value">High</div>
              <div className="x">Pending</div>
            </div>
            <div className="comparison-row">
              <div className="feature-name">Update Supabase schema for all tiers</div>
              <div className="value">30 min</div>
              <div className="value">High</div>
              <div className="x">Pending</div>
            </div>
            <div className="comparison-row">
              <div className="feature-name">Create Bronze and Gold plan pages on website</div>
              <div className="value">3-4 hours</div>
              <div className="value">High</div>
              <div className="x">Pending</div>
            </div>
            <div className="comparison-row">
              <div className="feature-name">Update /silver-plan to /plans comparison page</div>
              <div className="value">2 hours</div>
              <div className="value">High</div>
              <div className="x">Pending</div>
            </div>
            <div className="comparison-row">
              <div className="feature-name">Update admin UI for Bronze/Gold detection</div>
              <div className="value">2 hours</div>
              <div className="value">Medium</div>
              <div className="x">Pending</div>
            </div>
            <div className="comparison-row">
              <div className="feature-name">Staff training on new tiers & selling points</div>
              <div className="value">1 hour</div>
              <div className="value">Low</div>
              <div className="x">Pending</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <h2>Ready to Implement?</h2>
          <p>This tiered approach captures more customers while maintaining sustainable margins on every plan.</p>
          <div className="cta-buttons">
            <span className="cta-btn cta-btn-primary">Approve This Plan</span>
            <span className="cta-btn cta-btn-secondary">Request Changes</span>
          </div>
        </section>

        <p className="disclaimer">
          This is an internal proposal document. All projections are estimates based on market research and conservative growth assumptions.
          <br />
          Seraph Secure and NinjaRMM costs are estimates - verify with actual licensing agreements.
          <br />
          Created for Computer Store KS by Resilient Web Solutions.
        </p>
      </div>
    </div>
  );
}
