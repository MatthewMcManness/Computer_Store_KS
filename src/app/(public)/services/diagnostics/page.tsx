import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Computer Diagnostics | Computer Store Kansas',
  description: 'Professional computer diagnostics in Topeka, KS. Flat fee to find out what\'s wrong. Hardware and software troubleshooting, usually same-day results.',
  openGraph: {
    title: 'Computer Diagnostics - Computer Store Kansas',
    description: 'Flat fee diagnostics. We find the problem and give you options.',
    url: 'https://computerstoreks.com/services/diagnostics',
  },
};

export default function DiagnosticsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h2>Computer Diagnostics</h2>
          <p>Something wrong? We&apos;ll figure it out.</p>
        </div>
      </section>

      {/* Main Pricing */}
      <section className="services horizontal-diamond texture-circuit overlap-card-container">
        <div className="diamond-accent diamond-accent-3 rotating-element"></div>
        <div className="container overlap-card">
          <h2>Flat Fee Diagnostics</h2>
          <p style={{ fontSize: '1.15rem', maxWidth: '800px', margin: '0 auto 2rem' }}>
            No guessing games, no hourly charges adding up while we poke around. For a flat fee, we&apos;ll
            thoroughly diagnose your computer and tell you exactly what&apos;s wrong.
          </p>

          <div className="linux-highlight">
            <h3>Small Problems? Fixed on the Spot.</h3>
            <p>If the issue turns out to be something minor that doesn&apos;t require parts or significant labor, we just fix it—included in the diagnostic fee. You leave with a working computer.</p>
          </div>
        </div>
      </section>

      {/* What We Check */}
      <section className="benefits-section">
        <div className="container">
          <h2>Comprehensive Testing</h2>
          <p>We check everything to find the root cause of your problem.</p>

          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-number">1</div>
              <div className="benefit-content">
                <h4>Hardware Testing</h4>
                <p>RAM, hard drives, SSDs, CPU, GPU, power supply, motherboard—we test all the components to identify failures.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">2</div>
              <div className="benefit-content">
                <h4>Software Troubleshooting</h4>
                <p>Operating system issues, driver conflicts, corrupted files, malware—we dig into the software side too.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">3</div>
              <div className="benefit-content">
                <h4>Performance Analysis</h4>
                <p>Slow computer? We identify what&apos;s causing the bottleneck—whether it&apos;s hardware limitations, software bloat, or something else.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">4</div>
              <div className="benefit-content">
                <h4>Boot Issues</h4>
                <p>Computer won&apos;t start? We determine if it&apos;s a drive failure, corrupted OS, hardware problem, or something else entirely.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Common Problems */}
      <section className="services texture-dots">
        <div className="container">
          <h2>Common Symptoms We Diagnose</h2>

          <div className="cards">
            <div className="card">
              <h3>Won&apos;t Turn On</h3>
              <p>No power at all? Lights come on but nothing happens? We&apos;ll find out if it&apos;s the power supply, motherboard, or something simpler.</p>
            </div>

            <div className="card">
              <h3>Blue Screens &amp; Crashes</h3>
              <p>Random crashes and blue screens can be caused by failing RAM, overheating, driver issues, or dying drives. We pinpoint the culprit.</p>
            </div>

            <div className="card">
              <h3>Slow Performance</h3>
              <p>Computer running like molasses? Could be a failing drive, insufficient RAM, malware, or just years of accumulated software bloat.</p>
            </div>

            <div className="card">
              <h3>Strange Noises</h3>
              <p>Clicking, grinding, or loud fan noise? These sounds often indicate hardware problems that need attention before they get worse.</p>
            </div>

            <div className="card">
              <h3>Overheating</h3>
              <p>Computer getting hot or shutting down unexpectedly? We check fans, thermal paste, airflow, and identify what&apos;s causing the heat.</p>
            </div>

            <div className="card">
              <h3>Won&apos;t Boot Properly</h3>
              <p>Stuck on a loading screen? Boot loops? We determine if it&apos;s a software corruption issue or hardware failure.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Process */}
      <section className="benefits-section">
        <div className="container">
          <h2>How It Works</h2>

          <div className="service-details">
            <ul className="feature-list">
              <li>Drop off your computer and describe the problem</li>
              <li>We run comprehensive diagnostics (usually same day, 48 hours max)</li>
              <li>If it&apos;s a quick fix, we handle it—included in the diagnostic fee</li>
              <li>If it needs parts or significant repair, we contact you with options</li>
              <li>You decide how to proceed—no work happens without your approval</li>
            </ul>
          </div>

          <div className="linux-highlight" style={{ marginTop: '3rem' }}>
            <h3>No Surprises</h3>
            <p>We never proceed with repairs that cost extra without contacting you first. After diagnosis, we explain what&apos;s wrong, what your options are, and what each option costs. You make the call.</p>
          </div>
        </div>
      </section>

      {/* Turnaround */}
      <section className="section-sm" style={{ background: 'var(--background-light)' }}>
        <div className="container text-center">
          <h3>Turnaround Time</h3>
          <p>Most diagnostics are completed the same day. During busy periods, expect results within 48 hours. We&apos;ll let you know when you drop off if we&apos;re running behind.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <h2>Let&apos;s Find the Problem</h2>
          <p>Bring in your computer and we&apos;ll get to the bottom of it.</p>
          <Link href="/contact" className="btn btn-white">Schedule a Diagnosis</Link>
        </div>
      </section>
    </>
  );
}
