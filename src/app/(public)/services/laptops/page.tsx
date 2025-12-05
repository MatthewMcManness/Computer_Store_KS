import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'New & Refurbished Laptops | Computer Store Kansas',
  description: 'New and refurbished laptops in Topeka, KS. Quality Asus and Lenovo laptops, thoroughly tested refurbished units, and expert help choosing the right computer.',
  openGraph: {
    title: 'Laptops - New & Refurbished - Computer Store Kansas',
    description: 'Quality laptops for every budget. New models, refurbished deals, and expert guidance.',
    url: 'https://computerstoreks.com/services/laptops',
  },
};

export default function LaptopsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h2>Laptops</h2>
          <p>New and refurbished—quality computers for every budget.</p>
        </div>
      </section>

      {/* New Laptops Section */}
      <section className="services horizontal-diamond texture-circuit overlap-card-container">
        <div className="diamond-accent diamond-accent-3 rotating-element"></div>
        <div className="container overlap-card">
          <h2>New Laptops</h2>
          <p style={{ fontSize: '1.15rem', maxWidth: '800px', margin: '0 auto 2rem' }}>
            We recommend and stock laptops from <strong>Asus</strong> and <strong>Lenovo</strong>—brands known for
            reliability and value. Whether you need a basic machine for everyday tasks or a powerful workstation,
            we have options across a range of prices.
          </p>

          <div className="cards">
            <div className="card">
              <h3>In-Stock Selection</h3>
              <p>We keep a variety of laptops on hand at different price points. Stop by to see what&apos;s available and try before you buy.</p>
            </div>

            <div className="card">
              <h3>Custom Orders</h3>
              <p>Need something specific? We can order laptops to match your exact requirements—processor, RAM, storage, screen size, whatever you need.</p>
            </div>

            <div className="card">
              <h3>Free Lifetime Diagnostics</h3>
              <p>Every new laptop purchased through us includes free diagnostic service for life. If something seems wrong, bring it in and we&apos;ll check it out.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Refurbished Laptops Section */}
      <section className="benefits-section">
        <div className="container">
          <h2>Refurbished Laptops</h2>
          <p>Quality computers at a fraction of the price—thoroughly tested and ready to work.</p>

          <div className="linux-highlight" style={{ marginBottom: '3rem' }}>
            <h3>Where Do Our Refurbished Laptops Come From?</h3>
            <p>We source from corporate lease returns, trade-ins, and business upgrades. These are often high-quality machines that were well-maintained and still have years of life left.</p>
          </div>

          <h3 style={{ textAlign: 'center', marginBottom: '2rem' }}>Our Refurbishment Process</h3>
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-number">1</div>
              <div className="benefit-content">
                <h4>Thorough Inspection</h4>
                <p>Every laptop is fully inspected for cosmetic and functional issues before we consider it for sale.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">2</div>
              <div className="benefit-content">
                <h4>Stress Testing</h4>
                <p>Intensive stress tests push the hardware to identify any components that are failing or close to failure.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">3</div>
              <div className="benefit-content">
                <h4>Part Replacement</h4>
                <p>Failed or suspect components are replaced. Many units get upgraded batteries, SSDs, or additional RAM.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">4</div>
              <div className="benefit-content">
                <h4>Fresh OS Install</h4>
                <p>A clean operating system installation ensures no leftover data and optimal performance from day one.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Warranty Info */}
      <section className="cta" style={{ background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-dark) 100%)' }}>
        <div className="container">
          <h2>Refurbished Warranty</h2>
          <div className="pricing-breakdown">
            <p><strong>Parts Warranty:</strong> 3 months</p>
            <p><strong>Free Diagnostics:</strong> 6 months</p>
            <p>We stand behind our refurbished machines. If something goes wrong, we&apos;ll make it right.</p>
          </div>
        </div>
      </section>

      {/* Why Buy From Us */}
      <section className="services texture-dots">
        <div className="container">
          <h2>More Than Just a Sale</h2>
          <p className="text-center" style={{ maxWidth: '700px', margin: '0 auto 3rem' }}>
            Buying a laptop from us is different from picking one off a shelf at a big box store.
          </p>

          <div className="cards">
            <div className="card">
              <h3>Expert Guidance</h3>
              <p>Not sure what you need? We&apos;ll ask the right questions and help you find a laptop that fits your actual use case and budget—no upselling, just honest advice.</p>
            </div>

            <div className="card">
              <h3>Setup Included</h3>
              <p>Your laptop is set up and ready to use before you leave. User accounts created, updates installed, desktop organized—just like our OS installation service.</p>
            </div>

            <div className="card">
              <h3>Ongoing Support</h3>
              <p>Having issues after your purchase? We&apos;re here to help. Our support doesn&apos;t end when you walk out the door.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="benefits-section">
        <div className="container">
          <h2>Laptops for Everyone</h2>
          <p>We help all kinds of customers find the right machine.</p>

          <div className="cards">
            <div className="card">
              <h3>Students</h3>
              <p>Reliable laptops for schoolwork, research, and everything college throws at you—without breaking the bank.</p>
            </div>

            <div className="card">
              <h3>Business Users</h3>
              <p>Professional machines built for productivity, security, and all-day battery life. Single units or bulk orders for your team.</p>
            </div>

            <div className="card">
              <h3>Home Users</h3>
              <p>Computers for browsing, streaming, video calls, and staying connected with family and friends.</p>
            </div>

            <div className="card">
              <h3>Budget Shoppers</h3>
              <p>Quality doesn&apos;t have to mean expensive. Our refurbished selection offers excellent value for cost-conscious buyers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <h2>Find Your Perfect Laptop</h2>
          <p>Stop by to see our current selection, or tell us what you need and we&apos;ll help you find it.</p>
          <Link href="/contact" className="btn btn-white">Get in Touch</Link>
        </div>
      </section>
    </>
  );
}
