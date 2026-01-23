import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Free Electronics Recycling | Computer Store Kansas',
  description: 'Free electronics recycling in Topeka, KS. Drop off old computers, TVs, radios, consoles, and more. Data destruction guaranteed. Responsible e-waste disposal.',
  openGraph: {
    title: 'Free Electronics Recycling - Computer Store Kansas',
    description: 'Drop off your old electronics for free, responsible recycling. From vintage radios to modern computers—we accept it all with guaranteed data destruction.',
    url: 'https://computerstoreks.com/services/recycling',
  },
};

export default function RecyclingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1920&q=80)' }}>
        <div className="container">
          <h2>Free Electronics Recycling</h2>
          <p>Responsible disposal for all your old electronics—at no cost to you.</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="services horizontal-diamond texture-circuit overlap-card-container">
        <div className="diamond-accent diamond-accent-3 rotating-element"></div>
        <div className="container overlap-card">
          <h2>What We Accept</h2>

          <div className="cards">
            <div className="card">
              <h3>Computers &amp; Laptops</h3>
              <p>Desktop PCs, laptops, servers, tablets—any computing device regardless of age or condition. Working or not, we&apos;ll take it.</p>
            </div>

            <div className="card">
              <h3>TVs &amp; Monitors</h3>
              <p>CRT televisions, flat screens, computer monitors of all types. Even that heavy old tube TV you&apos;ve been meaning to get rid of.</p>
            </div>

            <div className="card">
              <h3>Audio &amp; Video Equipment</h3>
              <p>Radios, stereos, VCRs, DVD players, speakers, amplifiers, and home theater equipment from any era.</p>
            </div>

            <div className="card">
              <h3>Gaming Consoles</h3>
              <p>From Atari to PlayStation, NES to Xbox—any gaming console or handheld device, working or broken.</p>
            </div>

            <div className="card">
              <h3>Vintage Electronics</h3>
              <p>Morse code devices, ham radios, old telephones, calculators, typewriters—if it has circuits, we&apos;ll recycle it.</p>
            </div>

            <div className="card">
              <h3>Peripherals &amp; Components</h3>
              <p>Keyboards, mice, printers, cables, power supplies, hard drives, and any other computer parts or accessories.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Security Section */}
      <section className="benefits-section">
        <div className="container">
          <h2>Your Data Is Safe With Us</h2>
          <p>When you drop off electronics that stored your personal information, we guarantee complete data destruction.</p>

          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-number">1</div>
              <div className="benefit-content">
                <h4>Hard Drive Destruction</h4>
                <p>All hard drives and storage devices are physically destroyed or securely wiped using industry-standard methods.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">2</div>
              <div className="benefit-content">
                <h4>No Data Recovery Possible</h4>
                <p>Once we process your device, your data cannot be recovered by anyone—guaranteed.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">3</div>
              <div className="benefit-content">
                <h4>Peace of Mind</h4>
                <p>You don&apos;t need to worry about identity theft or personal information ending up in the wrong hands.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">4</div>
              <div className="benefit-content">
                <h4>Responsible Disposal</h4>
                <p>Electronics are recycled through proper channels—not dumped in landfills where they can leak toxic materials.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Recycle Section */}
      <section className="services texture-dots">
        <div className="container">
          <h2>Why Recycle Electronics?</h2>
          <div className="cards">
            <div className="card">
              <h3>Protect the Environment</h3>
              <p>Electronics contain lead, mercury, and other hazardous materials. Proper recycling keeps these toxins out of our soil and water.</p>
            </div>

            <div className="card">
              <h3>Recover Valuable Materials</h3>
              <p>Gold, silver, copper, and rare earth elements in electronics can be recovered and reused, reducing the need for mining.</p>
            </div>

            <div className="card">
              <h3>Keep It Out of Landfills</h3>
              <p>E-waste is the fastest-growing waste stream. Recycling helps reduce the millions of tons dumped each year.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-sm" style={{ background: 'var(--background-light)' }}>
        <div className="container text-center">
          <h3>How It Works</h3>
          <p>Simply bring your old electronics to our store during business hours. No appointment needed, no forms to fill out, no cost to you. Just drop it off and we&apos;ll handle the rest responsibly.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Recycle?</h2>
          <p>Bring in your old electronics anytime we&apos;re open. It&apos;s free, it&apos;s easy, and it&apos;s the right thing to do.</p>
          <Link href="/contact" className="btn btn-white">Get Directions</Link>
        </div>
      </section>
    </>
  );
}
