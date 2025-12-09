import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Refurbished Desktop Computers | Computer Store Kansas',
  description: 'Quality refurbished desktop computers in Topeka, KS. Thoroughly tested, professionally refurbished, and priced for any budget. Great for home, office, or gaming.',
  openGraph: {
    title: 'Refurbished Desktops - Computer Store Kansas',
    description: 'Quality desktop computers at budget-friendly prices. Stress-tested and ready to work.',
    url: 'https://computerstoreks.com/services/desktops',
  },
};

export default function DesktopsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h2>Refurbished Desktops</h2>
          <p>Reliable computers at budget-friendly prices.</p>
        </div>
      </section>

      {/* Main Value Prop */}
      <section className="services horizontal-diamond texture-circuit overlap-card-container">
        <div className="diamond-accent diamond-accent-3 rotating-element"></div>
        <div className="container overlap-card">
          <h2>Quality Without the Price Tag</h2>
          <p style={{ fontSize: '1.15rem', maxWidth: '800px', margin: '0 auto 2rem' }}>
            Not everyone needs a brand-new computer. Our refurbished desktops offer excellent performance
            at a fraction of the cost—perfect for home use, office work, or even budget gaming builds.
          </p>

          <div className="cards">
            <div className="card">
              <h3>Wide Selection</h3>
              <p>From compact small form factor machines to full towers, we stock a variety of desktop styles to fit your space and needs.</p>
            </div>

            <div className="card">
              <h3>Thoroughly Tested</h3>
              <p>Every desktop undergoes intensive stress testing. Components that fail or show signs of wear are replaced before sale.</p>
            </div>

            <div className="card">
              <h3>Ready to Use</h3>
              <p>Fresh operating system installed, updates applied, and set up for you. Take it home and start using it right away.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Refurbishment Process */}
      <section className="benefits-section">
        <div className="container">
          <h2>Our Refurbishment Process</h2>
          <p>Every desktop we sell goes through the same rigorous process.</p>

          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-number">1</div>
              <div className="benefit-content">
                <h4>Sourcing</h4>
                <p>We acquire desktops from corporate lease returns, trade-ins, and business upgrades—machines that were well-maintained and have plenty of life left.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">2</div>
              <div className="benefit-content">
                <h4>Inspection</h4>
                <p>Full inspection of every component—case, motherboard, drives, RAM, ports, and power supply. We check everything.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">3</div>
              <div className="benefit-content">
                <h4>Stress Testing</h4>
                <p>Intensive testing pushes the hardware to its limits, revealing any components that are failing or close to failure.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">4</div>
              <div className="benefit-content">
                <h4>Repair &amp; Upgrade</h4>
                <p>Failed or suspect parts are replaced. Many units receive upgraded storage, additional RAM, or other improvements.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">5</div>
              <div className="benefit-content">
                <h4>Fresh Install</h4>
                <p>A clean operating system installation wipes any previous data and ensures optimal performance.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">6</div>
              <div className="benefit-content">
                <h4>Final Testing</h4>
                <p>One more round of testing confirms everything works perfectly before it goes on the floor.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Warranty */}
      <section className="cta" style={{ background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-dark) 100%)' }}>
        <div className="container">
          <h2>Our Warranty</h2>
          <div className="pricing-breakdown">
            <p><strong>Parts Warranty:</strong> 3 months</p>
            <p><strong>Free Diagnostics:</strong> 6 months</p>
            <p>We stand behind every machine we sell. If something goes wrong, we&apos;ll take care of it.</p>
          </div>
        </div>
      </section>

      {/* Who Benefits */}
      <section className="services texture-dots">
        <div className="container">
          <h2>Who Buys Refurbished?</h2>
          <p className="text-center" style={{ maxWidth: '700px', margin: '0 auto 3rem' }}>
            Smart shoppers who want quality without overpaying.
          </p>

          <div className="cards">
            <div className="card">
              <h3>Home Users</h3>
              <p>A reliable desktop for web browsing, email, streaming, and everyday tasks—without spending hundreds more than necessary.</p>
            </div>

            <div className="card">
              <h3>Budget Businesses</h3>
              <p>Outfit your office with dependable workstations at a fraction of the cost. We can handle bulk orders for multiple machines.</p>
            </div>

            <div className="card">
              <h3>Schools &amp; Organizations</h3>
              <p>Stretch your budget further with reliable machines for computer labs, libraries, or staff workstations.</p>
            </div>

            <div className="card">
              <h3>Budget Gamers</h3>
              <p>A refurbished desktop makes an excellent foundation for a budget gaming rig. Add a graphics card and you&apos;re ready to play.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gaming Tip */}
      <section className="benefits-section">
        <div className="container">
          <div className="linux-highlight">
            <h3>Budget Gaming Tip</h3>
            <p>Looking for an affordable gaming setup? Start with a refurbished desktop that has a decent processor and plenty of RAM, then add a graphics card. You can build a capable gaming machine for a fraction of what a new gaming PC would cost. Ask us which desktops make good gaming candidates.</p>
          </div>
        </div>
      </section>

      {/* Custom Build CTA */}
      <section className="section-sm" style={{ background: 'var(--background-light)' }}>
        <div className="container text-center">
          <h3>Want Something New?</h3>
          <p>If you&apos;re looking for a brand-new desktop built to your exact specifications, check out our <Link href="/services/custom-computers" style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>Custom-Built Computers</Link> service.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <h2>See What&apos;s In Stock</h2>
          <p>Our inventory changes regularly. Stop by to see our current selection of refurbished desktops.</p>
          <Link href="/contact" className="btn btn-white">Browse Desktops Today</Link>
        </div>
      </section>
    </>
  );
}
