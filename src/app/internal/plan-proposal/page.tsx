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
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          min-height: 100vh;
          color: #e4e4e7;
        }

        .proposal-header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 3rem 2rem;
          text-align: center;
          border-bottom: 3px solid #3b82f6;
        }

        .proposal-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .proposal-header p {
          color: #94a3b8;
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
          color: #f1f5f9;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #3b82f6;
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
          border-radius: 1rem;
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
          background: linear-gradient(135deg, #44403c 0%, #292524 100%);
          border: 2px solid #a8a29e;
          box-shadow: 0 4px 20px rgba(168, 162, 158, 0.2);
        }

        .tier-bronze .tier-badge {
          background: linear-gradient(135deg, #d6d3d1 0%, #a8a29e 50%, #78716c 100%);
          color: #292524;
        }

        /* Silver */
        .tier-silver {
          background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
          border: 2px solid #9ca3af;
          box-shadow: 0 4px 20px rgba(156, 163, 175, 0.3);
          transform: scale(1.02);
        }

        .tier-silver::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 200%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
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
          background: #22c55e;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        /* Gold */
        .tier-gold {
          background: linear-gradient(135deg, #854d0e 0%, #422006 100%);
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
          background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.2), transparent);
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
          color: #f1f5f9;
          margin: 1rem 0;
        }

        .tier-price span {
          font-size: 1rem;
          font-weight: 400;
          color: #94a3b8;
        }

        .tier-target {
          color: #94a3b8;
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
          color: #e4e4e7;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .tier-features li:last-child {
          border-bottom: none;
        }

        .tier-features li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #22c55e;
          font-weight: bold;
        }

        .tier-features li.highlight {
          color: #fbbf24;
          font-weight: 600;
        }

        .tier-features li.highlight::before {
          content: '★';
          color: #fbbf24;
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
          background: rgba(255,255,255,0.05);
          border-radius: 0.75rem;
          padding: 1.5rem;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .value-card h4 {
          color: #60a5fa;
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }

        .value-card p {
          color: #94a3b8;
          line-height: 1.6;
        }

        /* Revenue Projections */
        .revenue-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }

        .revenue-table th,
        .revenue-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .revenue-table th {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          font-weight: 600;
        }

        .revenue-table tr:hover {
          background: rgba(255,255,255,0.05);
        }

        .revenue-table .total-row {
          background: rgba(34, 197, 94, 0.1);
          font-weight: 700;
          color: #22c55e;
        }

        /* Comparison Chart */
        .comparison-chart {
          background: rgba(255,255,255,0.05);
          border-radius: 1rem;
          padding: 2rem;
          margin-top: 1rem;
        }

        .comparison-row {
          display: grid;
          grid-template-columns: 2fr repeat(3, 1fr);
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          align-items: center;
        }

        .comparison-row:first-child {
          font-weight: 700;
          color: #60a5fa;
          padding-bottom: 1rem;
          border-bottom: 2px solid rgba(59, 130, 246, 0.3);
        }

        .comparison-row .feature-name {
          color: #e4e4e7;
        }

        .comparison-row .check {
          text-align: center;
          color: #22c55e;
          font-size: 1.25rem;
        }

        .comparison-row .x {
          text-align: center;
          color: #ef4444;
          font-size: 1.25rem;
        }

        .comparison-row .value {
          text-align: center;
          color: #fbbf24;
          font-weight: 600;
        }

        /* Psychology Section */
        .psychology-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .psychology-card {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
          border-radius: 0.75rem;
          padding: 1.5rem;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .psychology-card h4 {
          color: #a78bfa;
          margin-bottom: 0.75rem;
        }

        .psychology-card p {
          color: #94a3b8;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        /* CTA Section */
        .cta-section {
          background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
          border-radius: 1rem;
          padding: 3rem;
          text-align: center;
          margin-top: 3rem;
        }

        .cta-section h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .cta-section p {
          color: #e0e7ff;
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
          border-radius: 0.5rem;
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
          background: #22c55e;
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
          background: rgba(255,255,255,0.05);
          border-radius: 0.75rem;
          padding: 1.5rem;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #22c55e;
        }

        .stat-label {
          color: #94a3b8;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        .disclaimer {
          text-align: center;
          color: #64748b;
          font-size: 0.85rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
      `}</style>

      <header className="proposal-header">
        <h1>Protection Plan Tiers Proposal</h1>
        <p>Bronze, Silver, Gold - A Complete Customer Protection Strategy</p>
      </header>

      <div className="container">
        {/* Key Stats */}
        <section className="section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">+60%</div>
              <div className="stat-label">Expected Subscriber Growth</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">+40%</div>
              <div className="stat-label">Revenue Increase Year 1</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">$15.5K</div>
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
                <li>Antivirus software included</li>
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
                <li className="highlight">Half-price house calls</li>
                <li>50% off account recovery</li>
                <li>Preventive maintenance service</li>
                <li>Remote support (2hrs/month)</li>
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
                <li className="highlight">Premium antivirus + malware suite</li>
                <li className="highlight">75% discount on virus removal</li>
                <li className="highlight">FREE house calls (2/month)</li>
                <li className="highlight">FREE account recovery</li>
                <li>Monthly preventive maintenance</li>
                <li>Extended remote support (4hrs/month)</li>
                <li>25% discount on labor</li>
                <li>Annual comprehensive tune-up</li>
                <li>Data backup consultation</li>
                <li className="highlight">VIP same-day scheduling</li>
                <li>10% off hardware purchases</li>
              </ul>
            </div>
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
              <div className="feature-name">Antivirus Software</div>
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
              <div className="feature-name">House Call Discount</div>
              <div className="x">—</div>
              <div className="value">50%</div>
              <div className="value">FREE (2/mo)</div>
            </div>
            <div className="comparison-row">
              <div className="feature-name">Account Recovery</div>
              <div className="x">—</div>
              <div className="value">50% off</div>
              <div className="value">FREE</div>
            </div>
            <div className="comparison-row">
              <div className="feature-name">Remote Support</div>
              <div className="x">Email only</div>
              <div className="value">2 hrs/mo</div>
              <div className="value">4 hrs/mo</div>
            </div>
            <div className="comparison-row">
              <div className="feature-name">Preventive Maintenance</div>
              <div className="value">Quarterly</div>
              <div className="value">As needed</div>
              <div className="value">Monthly</div>
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
            <div className="comparison-row">
              <div className="feature-name">Annual Tune-up</div>
              <div className="x">—</div>
              <div className="x">—</div>
              <div className="check">✓</div>
            </div>
          </div>
        </section>

        {/* Business Value */}
        <section className="section">
          <h2 className="section-title">Why This Works for the Business</h2>
          <div className="value-grid">
            <div className="value-card">
              <h4>Bronze Captures New Customers</h4>
              <p>Price-sensitive customers who would never pay $24.99 will pay $14.99. Lower discounts mean higher margins on paid services. Perfect entry point to upsell to Silver later.</p>
            </div>
            <div className="value-card">
              <h4>Silver Remains the Sweet Spot</h4>
              <p>Your current plan is already proven. With Bronze below it, Silver looks like even better value. Most customers will naturally gravitate here - exactly where you want them.</p>
            </div>
            <div className="value-card">
              <h4>Gold Creates Premium Revenue</h4>
              <p>Power users and small businesses will gladly pay $40/month for VIP treatment. Free house calls are capped at 2/month, keeping costs predictable while feeling unlimited to customers.</p>
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
              <p>The jump from Bronze to Silver (+$10 for 2x the features) feels better than Silver to Gold (+$15 for premium perks). This guides most customers to Silver - your highest-margin tier.</p>
            </div>
          </div>
        </section>

        {/* Revenue Projections */}
        <section className="section">
          <h2 className="section-title">Revenue Projections</h2>

          <h3 style={{ color: '#94a3b8', marginBottom: '1rem' }}>Year 1 (Conservative Estimate)</h3>
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
                <td>65-70%</td>
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
                <td>8</td>
                <td>$319.92</td>
                <td>$3,839</td>
                <td>50-55%</td>
              </tr>
              <tr className="total-row">
                <td>TOTAL</td>
                <td>53</td>
                <td>$1,294.47</td>
                <td>$15,533</td>
                <td>~58%</td>
              </tr>
            </tbody>
          </table>

          <h3 style={{ color: '#94a3b8', marginBottom: '1rem', marginTop: '2rem' }}>Year 2 (With Growth)</h3>
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
                <td>65-70%</td>
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
                <td>15</td>
                <td>$599.85</td>
                <td>$7,198</td>
                <td>50-55%</td>
              </tr>
              <tr className="total-row">
                <td>TOTAL</td>
                <td>85</td>
                <td>$2,099.15</td>
                <td>$25,190</td>
                <td>~58%</td>
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
              <p>Perfect for seniors on fixed incomes or light users. $14.99/month gets them protected without breaking the bank. Antivirus alone is worth $5-10/month - they&apos;re already saving.</p>
            </div>
            <div className="value-card">
              <h4>Silver: Best Value for Most</h4>
              <p>Families and home users get comprehensive coverage. One virus removal (normally $100+) at 50% off pays for 2 months of the plan. House calls at half price? That&apos;s $50+ savings per visit.</p>
            </div>
            <div className="value-card">
              <h4>Gold: Premium for Power Users</h4>
              <p>People who depend on their computers for work will gladly pay for VIP treatment. FREE house calls alone (normally $100+) make the plan pay for itself after just one visit.</p>
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
              <div className="feature-name">Add Bronze/Gold custom fields to RepairShopr</div>
              <div className="value">1 hour</div>
              <div className="value">High</div>
              <div className="x">Pending</div>
            </div>
            <div className="comparison-row">
              <div className="feature-name">Create Supabase schema for all tiers</div>
              <div className="value">30 min</div>
              <div className="value">High</div>
              <div className="x">Pending</div>
            </div>
            <div className="comparison-row">
              <div className="feature-name">Update website with all three plan pages</div>
              <div className="value">3-4 hours</div>
              <div className="value">High</div>
              <div className="x">Pending</div>
            </div>
            <div className="comparison-row">
              <div className="feature-name">Update admin UI for tier detection</div>
              <div className="value">2 hours</div>
              <div className="value">Medium</div>
              <div className="x">Pending</div>
            </div>
            <div className="comparison-row">
              <div className="feature-name">Create marketing materials</div>
              <div className="value">2-3 hours</div>
              <div className="value">Medium</div>
              <div className="x">Pending</div>
            </div>
            <div className="comparison-row">
              <div className="feature-name">Staff training on new tiers</div>
              <div className="value">1 hour</div>
              <div className="value">Low</div>
              <div className="x">Pending</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <h2>Ready to Implement?</h2>
          <p>This tiered approach captures more customers while increasing average revenue per subscriber.</p>
          <div className="cta-buttons">
            <span className="cta-btn cta-btn-primary">Approve This Plan</span>
            <span className="cta-btn cta-btn-secondary">Request Changes</span>
          </div>
        </section>

        <p className="disclaimer">
          This is an internal proposal document. All projections are estimates based on market research and conservative growth assumptions.
          <br />
          Created for Computer Store KS by Resilient Web Solutions.
        </p>
      </div>
    </div>
  );
}
