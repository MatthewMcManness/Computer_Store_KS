import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Black Friday Sale - 10% Off Refurbished Computers',
  description: 'Black Friday Sale at Computer Store Kansas! 10% off all refurbished computers plus 6-month warranty and 1 year free diagnostics. Sale runs Nov 17 - Jan 1.',
  openGraph: {
    title: 'Black Friday Sale - 10% Off Refurbished Computers',
    description: 'Huge savings on quality refurbished computers! 10% off plus 6-month warranty and free diagnostics for a year.',
    url: 'https://computerstoreks.com/black-friday',
  },
};

export default function BlackFridayPage() {
  return (
    <>
      {/* Black Friday Hero Section */}
      <section className="hero hero-black-friday">
        <div className="container">
          <div className="black-friday-badge">
            <span className="badge-ribbon">Black Friday</span>
            <span className="badge-sale-text">MEGA SALE</span>
          </div>
          <h2>Incredible Savings on Refurbished Computers</h2>
          <p className="hero-dates">November 17th - January 1st</p>
        </div>
      </section>

      {/* Black Friday Intro Section */}
      <section className="black-friday-intro horizontal-diamond texture-circuit overlap-card-container">
        <div className="diamond-accent diamond-accent-2 rotating-element"></div>
        <div className="container overlap-card">
          <h2 className="black-friday-hero-heading">10% Off All Refurbished Computers + Exclusive Bonuses</h2>
          <p>Take advantage of our biggest sale of the year with unbeatable deals on quality refurbished computers!</p>
        </div>
      </section>

      {/* Black Friday Benefits Section */}
      <section className="membership black-friday-benefits">
        <div className="container">
          <div className="membership-text-centered">
            <h2>What You Get With Every Purchase</h2>
            <ul className="membership-features-enhanced">
              <li><strong>10% OFF</strong> the listed price on all refurbished computers</li>
              <li><strong>6 Month Parts Warranty</strong> for peace of mind</li>
              <li><strong>Full Year of Free Diagnostics</strong> - unlimited visits</li>
              <li>Limited-time offer - Sale ends January 1st</li>
            </ul>
            <p className="plan-description">
              This is the perfect time to upgrade or gift a reliable computer. All our refurbished systems are thoroughly tested and come with professional support from The Computer Store.
            </p>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="cta cta-black-friday">
        <div className="container">
          <h2>Ready to Save Big?</h2>
          <p>Browse our selection of refurbished computers and take advantage of these limited-time offers.</p>
          <Link href="/gallery?filter=refurbished" className="btn btn-white">View Refurbished Computers</Link>
        </div>
      </section>
    </>
  );
}
