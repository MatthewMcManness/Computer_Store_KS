import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Hardware Upgrades | Computer Store Kansas',
  description: 'Computer hardware upgrades in Topeka, KS. RAM, SSD, graphics cards, CPU, and more. Expert advice on what upgrades will make the biggest difference for your system.',
  openGraph: {
    title: 'Hardware Upgrades - Computer Store Kansas',
    description: 'Upgrade your computer for better performance. Expert installation and honest advice.',
    url: 'https://computerstoreks.com/services/upgrades',
  },
};

export default function UpgradesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1920&q=80)' }}>
        <div className="container">
          <h2>Hardware Upgrades</h2>
          <p>Breathe new life into your computer with the right upgrades.</p>
        </div>
      </section>

      {/* Main Value Prop */}
      <section className="services texture-circuit">
        <div className="container">
          <h2>Upgrade Instead of Replace</h2>
          <p style={{ fontSize: '1.15rem', maxWidth: '800px', margin: '0 auto 2rem' }}>
            A slow computer doesn&apos;t always need to be replaced. Often, a targeted upgrade can dramatically
            improve performance for a fraction of the cost of a new machine. We&apos;ll help you figure out
            what&apos;s worth upgrading—and what isn&apos;t.
          </p>

          <div className="linux-highlight">
            <h3>Bring Your Own Parts or Buy Through Us</h3>
            <p>Already have the parts you want? Bring them in and we&apos;ll install them. Need help sourcing components? We can get what you need. Either way, we&apos;ll get your upgrade done right.</p>
          </div>
        </div>
      </section>

      {/* Popular Upgrades */}
      <section className="benefits-section">
        <div className="container">
          <h2>Most Popular Upgrades</h2>
          <p>These three upgrades deliver the biggest bang for your buck.</p>

          <div className="cards">
            <div className="card">
              <h3>SSD Upgrade</h3>
              <p className="price-tag">Biggest Impact</p>
              <p>Replacing an old hard drive with a solid-state drive is the single most noticeable upgrade you can make. Boot times drop from minutes to seconds. Programs open instantly. Everything feels faster.</p>
            </div>

            <div className="card">
              <h3>RAM Upgrade</h3>
              <p className="price-tag">Multitasking Power</p>
              <p>Running out of memory slows everything down. More RAM means you can run more programs simultaneously without your computer grinding to a halt.</p>
            </div>

            <div className="card">
              <h3>Graphics Card</h3>
              <p className="price-tag">Gaming & Creative</p>
              <p>For gaming, video editing, or 3D work, a graphics card upgrade can transform your experience. Play newer games, render faster, and handle demanding visual tasks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* All Upgrades */}
      <section className="services texture-dots">
        <div className="container">
          <h2>What We Upgrade</h2>
          <p className="text-center" style={{ maxWidth: '700px', margin: '0 auto 3rem' }}>
            We handle all common hardware upgrades for desktops—and the upgrades that are possible on laptops.
          </p>

          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-number">1</div>
              <div className="benefit-content">
                <h4>Storage Drives</h4>
                <p>SSD upgrades, additional storage drives, or replacing failing hard drives. We can also clone your existing drive so you don&apos;t lose anything.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">2</div>
              <div className="benefit-content">
                <h4>Memory (RAM)</h4>
                <p>Add more RAM or replace existing memory with faster modules. We&apos;ll check what your system supports and recommend the right upgrade.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">3</div>
              <div className="benefit-content">
                <h4>Graphics Cards</h4>
                <p>Install a new GPU for gaming, creative work, or multiple monitor setups. We&apos;ll make sure your power supply can handle it.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">4</div>
              <div className="benefit-content">
                <h4>Processors (CPU)</h4>
                <p>Upgrade to a faster processor if your motherboard supports it. We&apos;ll advise on compatibility and whether it&apos;s worth the investment.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">5</div>
              <div className="benefit-content">
                <h4>Power Supplies</h4>
                <p>A better power supply supports more powerful components and improves system stability. Essential for major upgrades like high-end graphics cards.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">6</div>
              <div className="benefit-content">
                <h4>Cooling &amp; Fans</h4>
                <p>Better cooling means better performance and longer component life. Upgrade case fans, CPU coolers, or add additional cooling.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Laptop Upgrades */}
      <section className="benefits-section">
        <div className="container">
          <h2>Laptop Upgrades</h2>
          <p>Laptops have limited upgrade options, but the ones available can still make a big difference.</p>

          <div className="cards">
            <div className="card">
              <h3>RAM Upgrades</h3>
              <p>Many laptops allow RAM upgrades (though some have soldered memory). We&apos;ll check if your laptop can be upgraded and install compatible memory.</p>
            </div>

            <div className="card">
              <h3>SSD Upgrades</h3>
              <p>Replacing a laptop hard drive with an SSD is transformative. Your laptop will boot faster, run cooler, and feel years newer.</p>
            </div>
          </div>

          <div className="linux-highlight" style={{ marginTop: '2rem' }}>
            <h3>Not Sure If Your Laptop Can Be Upgraded?</h3>
            <p>Bring it in and we&apos;ll take a look. We&apos;ll tell you what&apos;s upgradeable and what would make the most difference for how you use it.</p>
          </div>
        </div>
      </section>

      {/* Expert Advice */}
      <section className="cta" style={{ background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-dark) 100%)' }}>
        <div className="container">
          <h2>Honest Advice</h2>
          <p>Not every computer is worth upgrading. Sometimes the money is better spent on a new machine. We&apos;ll give you our honest assessment—what upgrades make sense, what your system can support, and whether upgrading is the right choice for your situation.</p>
        </div>
      </section>

      {/* Pricing */}
      <section className="benefits-section">
        <div className="container">
          <h2>Pricing</h2>

          <div className="service-details">
            <p style={{ fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
              Upgrade pricing depends on your specific computer and the parts involved. Some systems are
              straightforward to work on; others require more disassembly. Some upgrades are quick; others
              take time to do properly.
            </p>
            <p style={{ fontSize: '1.1rem', maxWidth: '700px', margin: '1.5rem auto 0' }}>
              Bring your computer in (or tell us the model) and we&apos;ll give you a quote for the upgrade
              you&apos;re considering. No surprises—you&apos;ll know the cost before we start.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Upgrade?</h2>
          <p>Bring in your computer and let&apos;s talk about what upgrades would make the biggest difference for you.</p>
          <Link href="/contact" className="btn btn-white">Upgrade My Computer</Link>
        </div>
      </section>
    </>
  );
}
