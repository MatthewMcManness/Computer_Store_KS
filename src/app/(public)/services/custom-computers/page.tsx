import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Custom-Built Computers | Computer Store Kansas',
  description: 'Custom-built PCs in Topeka, KS. Gaming rigs, workstations, home offices, servers, and more. Expert consultation, quality parts, and $180 flat build labor.',
  openGraph: {
    title: 'Custom-Built Computers - Computer Store Kansas',
    description: 'Your vision, expertly built. Custom PCs for gaming, work, or anything in between.',
    url: 'https://computerstoreks.com/services/custom-computers',
  },
};

export default function CustomComputersPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h2>Custom-Built Computers</h2>
          <p>Your vision, expertly built. From gaming rigs to business servers.</p>
        </div>
      </section>

      {/* Main Value Prop */}
      <section className="services horizontal-diamond texture-circuit overlap-card-container">
        <div className="diamond-accent diamond-accent-3 rotating-element"></div>
        <div className="container overlap-card">
          <h2>Why Go Custom?</h2>
          <p style={{ fontSize: '1.15rem', maxWidth: '800px', margin: '0 auto 2rem' }}>
            Pre-built computers from big box stores cut corners you can&apos;t see—cheap power supplies, poor airflow,
            no-name components, and bloatware galore. A custom build means every part is chosen for quality,
            performance, and your specific needs.
          </p>

          <div className="cards">
            <div className="card">
              <h3>Quality Components</h3>
              <p>We use trusted brands and quality parts—no mystery components or corners cut. Every piece is selected for reliability and performance.</p>
            </div>

            <div className="card">
              <h3>Clean Cable Management</h3>
              <p>More than just looks—proper cable management improves airflow and makes future upgrades easier. Your build will look as good inside as it performs.</p>
            </div>

            <div className="card">
              <h3>No Bloatware</h3>
              <p>Your new computer comes with a clean Windows installation. No trial software, no adware, no junk—just a ready-to-use system.</p>
            </div>

            <div className="card">
              <h3>Thoroughly Tested</h3>
              <p>Every build undergoes stress testing before you pick it up. We catch any issues before they become your problem.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Build */}
      <section className="benefits-section">
        <div className="container">
          <h2>We Build It All</h2>
          <p>Whatever you need a computer for, we can build it.</p>

          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-number">1</div>
              <div className="benefit-content">
                <h4>Gaming PCs</h4>
                <p>From competitive esports machines to high-end 4K gaming rigs. Tell us what games you play and we&apos;ll build accordingly.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">2</div>
              <div className="benefit-content">
                <h4>Workstations</h4>
                <p>Video editing, 3D rendering, CAD, music production—we build powerful workstations optimized for creative and professional software.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">3</div>
              <div className="benefit-content">
                <h4>Home &amp; Office</h4>
                <p>Reliable everyday computers for web browsing, documents, email, and general productivity. Built to last without breaking the budget.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">4</div>
              <div className="benefit-content">
                <h4>Budget Builds</h4>
                <p>Need performance on a tight budget? We know how to maximize value and get the most out of every dollar.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">5</div>
              <div className="benefit-content">
                <h4>Servers</h4>
                <p>Business servers, home labs, NAS builds—we handle the hardware side for whatever server solution you need.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">6</div>
              <div className="benefit-content">
                <h4>Business Bulk Builds</h4>
                <p>Outfitting an entire office? We handle bulk builds for businesses—consistent quality across every machine.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="services texture-dots">
        <div className="container">
          <h2>Our Process</h2>
          <p className="text-center" style={{ maxWidth: '700px', margin: '0 auto 3rem' }}>
            We meet you where you are. Whether you&apos;re an expert who knows exactly what you want,
            or you just know what you want to <em>do</em> with the computer—we&apos;ve got you covered.
          </p>

          <div className="cards">
            <div className="card">
              <h3>For the Experts</h3>
              <p>Know your specs? Give us your parts list and we&apos;ll source, build, and test it. You get exactly what you want, professionally assembled.</p>
            </div>

            <div className="card">
              <h3>For Everyone Else</h3>
              <p>Tell us what you want to use the computer for—gaming, work, video editing, whatever. We&apos;ll recommend parts that match your needs and budget.</p>
            </div>

            <div className="card">
              <h3>Your Priorities</h3>
              <p>Want top-tier performance? Maximum value? Whisper-quiet operation? A specific budget? We plan and build according to what matters most to you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="cta" style={{ background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-dark) 100%)' }}>
        <div className="container">
          <h2>Simple, Transparent Pricing</h2>
          <div className="pricing-breakdown">
            <p><strong>Parts:</strong> At cost from our suppliers—no markup games</p>
            <p><strong>Build Labor:</strong> $180 flat rate</p>
            <p>That&apos;s it. Parts plus $180. Windows installation and testing included.</p>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="benefits-section">
        <div className="container">
          <h2>What&apos;s Included</h2>

          <div className="service-details">
            <ul className="feature-list">
              <li>Expert consultation to plan your build</li>
              <li>Quality parts sourced from trusted suppliers</li>
              <li>Professional assembly with clean cable management</li>
              <li>Windows installation (license included)</li>
              <li>Comprehensive stress testing before delivery</li>
              <li>1-year manufacturer warranty on all parts</li>
              <li>Free lifetime diagnostics on your build</li>
            </ul>
          </div>

          <div className="linux-highlight" style={{ marginTop: '3rem' }}>
            <h3>Free Lifetime Diagnostics</h3>
            <p>Every computer we build comes with free diagnostic service for life. If something seems off down the road, bring it in and we&apos;ll check it out at no charge. We stand behind our builds.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Build Your Dream Machine?</h2>
          <p>Let&apos;s talk about what you need. Whether you have a detailed spec list or just a general idea, we&apos;ll help you get there.</p>
          <Link href="/contact" className="btn btn-white">Start Your Build</Link>
        </div>
      </section>
    </>
  );
}
