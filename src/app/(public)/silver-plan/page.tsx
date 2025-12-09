import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Silver Plan - Computer Protection Plan',
  description: 'Silver Plan - Comprehensive computer protection for $24.99/month. Includes antivirus, 50% off virus removal, preventive maintenance, and more. Protect your PC today!',
  openGraph: {
    title: 'Silver Plan Computer Protection - $24.99/month',
    description: 'Comprehensive computer protection plan with antivirus, discounts on repairs, and preventive maintenance. Peace of mind for your PC.',
    url: 'https://computerstoreks.com/silver-plan',
  },
};

export default function SilverPlanPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="silver-plan-badge">
            <span className="badge-text">Silver Plan</span>
            <span className="badge-subtext">Protected</span>
          </div>
        </div>
      </section>

      {/* Silver Plan Intro Section */}
      <section className="silver-plan-intro horizontal-diamond texture-circuit overlap-card-container">
        <div className="diamond-accent diamond-accent-2 rotating-element"></div>
        <div className="container overlap-card">
          <h2 className="silver-hero-heading">Comprehensive Computer Protection &amp; Peace of Mind</h2>
          <p>Get complete care for your computer with our affordable monthly plan</p>
        </div>
      </section>

      {/* Silver Plan Features Section */}
      <section className="membership">
        <div className="container">
          <div className="membership-text-centered">
            <h2>Everything You Need to Keep Your Computer Running Smoothly</h2>
            <ul className="membership-features-enhanced">
              <li>Anti-virus software</li>
              <li>50% off virus removal services</li>
              <li>Half-price house calls</li>
              <li>50% off account recovery assistance</li>
              <li>Preventive maintenance service</li>
              <li>Limited help desk/remote support</li>
              <li>Free in-store diagnostics and estimates</li>
              <li>Performance monitoring and alert service</li>
              <li>15% discount on labor</li>
            </ul>
            <p className="plan-description">
              Our Silver Plan provides comprehensive care for your computer. For only{' '}
              <strong>$24.99 per month</strong>{' '}
              (with a three-month commitment), you&apos;ll receive comprehensive computer protection and maintenance for peace of mind.
            </p>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Get Protected?</h2>
          <p>Sign up for our Silver Plan today and enjoy comprehensive computer protection.</p>
          <Link href="/contact" className="btn btn-white">Start My Silver Plan</Link>
        </div>
      </section>
    </>
  );
}
