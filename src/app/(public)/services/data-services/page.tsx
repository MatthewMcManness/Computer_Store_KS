import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Data Transfer & Drive Cloning Services | Computer Store Kansas',
  description: 'Professional data transfer and drive cloning services in Topeka, KS. PC-to-PC transfers, drive clones, and data recovery from failing drives. Flat-rate pricing.',
  openGraph: {
    title: 'Data Transfer & Drive Cloning - Computer Store Kansas',
    description: 'Professional data transfer and drive cloning services. We restore your files exactly where they belong.',
    url: 'https://computerstoreks.com/services/data-services',
  },
};

export default function DataServicesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h2>Data Transfer &amp; Drive Cloning</h2>
          <p>Your files, restored exactly where they belong.</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="services horizontal-diamond texture-circuit overlap-card-container">
        <div className="diamond-accent diamond-accent-3 rotating-element"></div>
        <div className="container overlap-card">
          <h2>Our Data Services</h2>

          <div className="cards">
            <div className="card">
              <h3>Data Transfers</h3>
              <p className="price-tag">$120 flat rate</p>
              <p>Moving to a new computer? We transfer your files from your old PC to your new one, or from an old drive to a new drive. No data left behind.</p>
            </div>

            <div className="card">
              <h3>Drive Cloning</h3>
              <p className="price-tag">$240 flat rate</p>
              <p>An exact copy of your entire drive—operating system, programs, settings, and all your files. Perfect for upgrading to a faster SSD without reinstalling everything.</p>
            </div>

            <div className="card">
              <h3>Data Recovery</h3>
              <p className="price-tag">No charge if unsuccessful</p>
              <p>Have a failing drive? We attempt to recover your precious files before it&apos;s too late. If we can&apos;t recover your data, you don&apos;t pay a thing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className="benefits-section">
        <div className="container">
          <h2>Not Just a Data Dump</h2>
          <p>Other shops might copy your files into a single folder on your desktop and call it done. We do things differently.</p>

          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-number">1</div>
              <div className="benefit-content">
                <h4>Organized Restoration</h4>
                <p>Your documents go back in Documents. Pictures go in Pictures. Music in Music. Everything exactly where it should be.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">2</div>
              <div className="benefit-content">
                <h4>Browser Data Preserved</h4>
                <p>We restore your bookmarks, favorites, and saved passwords so you can pick up right where you left off.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">3</div>
              <div className="benefit-content">
                <h4>Secure Handling</h4>
                <p>Your data is handled with care and confidentiality. We treat your files like they&apos;re our own.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">4</div>
              <div className="benefit-content">
                <h4>No-Risk Recovery</h4>
                <p>Attempting recovery from a failing drive? If we can&apos;t get your data back, you owe us nothing.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who Needs This */}
      <section className="services texture-dots">
        <div className="container">
          <h2>Who Benefits from Data Services?</h2>
          <div className="cards">
            <div className="card">
              <h3>Upgrading Your Computer</h3>
              <p>Got a new PC? We&apos;ll move everything from your old machine so your new computer feels like home from day one.</p>
            </div>

            <div className="card">
              <h3>Business Migrations</h3>
              <p>Transitioning your business to new hardware? We handle bulk transfers efficiently while keeping your workflow intact.</p>
            </div>

            <div className="card">
              <h3>Failing Hard Drives</h3>
              <p>Hearing clicking sounds? Computer running slow? Don&apos;t wait until it&apos;s too late—let us rescue your data before the drive fails completely.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Turnaround Note */}
      <section className="section-sm" style={{ background: 'var(--background-light)' }}>
        <div className="container text-center">
          <h3>Turnaround Time</h3>
          <p>Completion time depends on the size and speed of your drives. Older, slower drives naturally take longer to transfer. We&apos;ll give you an estimate when you drop off your equipment.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Transfer Your Data?</h2>
          <p>Bring in your old and new devices, or just the drives. We&apos;ll take it from there.</p>
          <Link href="/contact" className="btn btn-white">Get Started</Link>
        </div>
      </section>
    </>
  );
}
