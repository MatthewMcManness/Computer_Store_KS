import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Computer Repair Services in Topeka, KS',
  description: 'Computer repair services in Topeka, KS - diagnostics, virus removal, hardware repair, upgrades, and custom PC builds. Professional computer service since 2003.',
  openGraph: {
    title: 'Computer Repair Services - Computer Store Kansas',
    description: 'Professional computer repair services in Topeka: diagnostics, virus removal, hardware repair, and custom builds.',
    url: 'https://computerstoreks.com/services',
  },
};

export default function ServicesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h2>Our Services</h2>
          <p>Comprehensive support for your computers and devices.</p>
        </div>
      </section>

      {/* Detailed Services Section */}
      <section className="services horizontal-diamond texture-circuit overlap-card-container">
        <div className="diamond-accent diamond-accent-3 rotating-element"></div>
        <div className="container overlap-card">
          <h2>What We Offer</h2>
          <div className="cards">
            <div className="card">
              <h3>Diagnostics</h3>
              <p>Thorough troubleshooting to identify issues quickly and accurately.</p>
            </div>
            <div className="card">
              <h3>Virus &amp; Malware Removal</h3>
              <p>Deep cleaning and protection against viruses, spyware and other malware.</p>
            </div>
            <div className="card">
              <h3>Hardware Repair</h3>
              <p>Replacement of failing components such as hard drives, screens and power supplies.</p>
            </div>
            <div className="card">
              <h3>Upgrades &amp; Builds</h3>
              <p>Performance upgrades and custom PC builds tailored to your needs and budget.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="cta">
        <div className="container">
          <h2>Not Sure What You Need?</h2>
          <p>Contact us for a free consultation and we&apos;ll help you find the right solution.</p>
          <Link href="/contact" className="btn btn-white">Talk to an Expert</Link>
        </div>
      </section>
    </>
  );
}
