import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Windows Debloat Service | Computer Store Kansas',
  description: 'Windows debloat service in Topeka, KS. Remove bloatware, disable unnecessary startup programs, and make Windows 11 run the way it should.',
  openGraph: {
    title: 'Windows Debloat - Computer Store Kansas',
    description: 'Remove the junk and make Windows work the way it should.',
    url: 'https://computerstoreks.com/services/debloat',
  },
};

export default function DebloatPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1920&q=80)' }}>
        <div className="container">
          <h2>Windows Debloat</h2>
          <p>Strip out the junk. Keep what matters.</p>
        </div>
      </section>

      {/* Main Pricing */}
      <section className="services horizontal-diamond texture-circuit overlap-card-container">
        <div className="diamond-accent diamond-accent-3 rotating-element"></div>
        <div className="container overlap-card">
          <h2>Clean Up Your Windows</h2>
          <p style={{ fontSize: '1.15rem', maxWidth: '800px', margin: '0 auto 2rem' }}>
            Windows 11 comes loaded with software you didn&apos;t ask for and don&apos;t need. Manufacturers
            pile on even more. All that junk slows down your computer, clutters your start menu, and runs
            in the background eating up resources. We clean it out.
          </p>

          <div className="linux-highlight">
            <h3>Free When You Buy From Us</h3>
            <p>Every computer we sell is debloated before you take it home—no extra charge. You get a clean, fast Windows experience from day one.</p>
          </div>
        </div>
      </section>

      {/* What We Remove */}
      <section className="benefits-section">
        <div className="container">
          <h2>What We Remove &amp; Optimize</h2>
          <p>A comprehensive cleanup of everything slowing down your Windows experience.</p>

          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-number">1</div>
              <div className="benefit-content">
                <h4>Manufacturer Bloatware</h4>
                <p>Trial software, branded utilities, and junk that came pre-installed from Dell, HP, Lenovo, or whoever made your computer.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">2</div>
              <div className="benefit-content">
                <h4>Unnecessary Windows Apps</h4>
                <p>Built-in Windows apps you&apos;ll never use—games, widgets, and other clutter that Microsoft installs by default.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">3</div>
              <div className="benefit-content">
                <h4>Startup Programs</h4>
                <p>Programs that launch automatically when you turn on your computer, slowing down boot time and hogging memory in the background.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">4</div>
              <div className="benefit-content">
                <h4>Browser Junk</h4>
                <p>Unwanted extensions, toolbars, and browser add-ons that snuck in along the way. We clean up your browsing experience too.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">5</div>
              <div className="benefit-content">
                <h4>Performance Settings</h4>
                <p>Windows settings optimized for speed and responsiveness instead of flashy animations and background telemetry.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">6</div>
              <div className="benefit-content">
                <h4>Accumulated Junk</h4>
                <p>Programs and files that have built up over time—things you installed once, forgot about, and never use.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Windows 11 Section */}
      <section className="cta" style={{ background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-dark) 100%)' }}>
        <div className="container">
          <h2>Make Windows 11 Work the Way It Should</h2>
          <p>Windows 11 has a reputation for being sluggish and cluttered—but it doesn&apos;t have to be. A proper debloat removes the cruft Microsoft and manufacturers pile on, revealing a faster, cleaner operating system underneath. Your computer will boot quicker, run smoother, and actually respond when you click something.</p>
        </div>
      </section>

      {/* Debloat vs Virus Removal */}
      <section className="benefits-section">
        <div className="container">
          <h2>Debloat vs. Virus Removal</h2>
          <p>These are different services for different problems.</p>

          <div className="cards">
            <div className="card">
              <h3>Debloat Service</h3>
              <p>Removes <strong>legitimate but unwanted</strong> software—pre-installed junk, unnecessary Windows features, and programs you don&apos;t use. Your computer isn&apos;t infected, just cluttered.</p>
            </div>

            <div className="card">
              <h3>Virus Removal</h3>
              <p>Removes <strong>malicious software</strong>—viruses, malware, spyware, and other infections designed to harm your computer or steal your information.</p>
            </div>
          </div>

          <p className="text-center" style={{ marginTop: '2rem', color: 'var(--text-muted)' }}>
            Not sure which you need? Bring your computer in and we&apos;ll take a look. We&apos;ll tell you honestly what&apos;s going on.
          </p>
        </div>
      </section>

      {/* Who Needs This */}
      <section className="services texture-dots">
        <div className="container">
          <h2>Who Benefits from Debloating?</h2>

          <div className="cards">
            <div className="card">
              <h3>New Computer Owners</h3>
              <p>Just bought a computer from a big box store? It&apos;s loaded with trial software and manufacturer junk. Start fresh with a clean system.</p>
            </div>

            <div className="card">
              <h3>Windows 11 Upgraders</h3>
              <p>Upgraded to Windows 11 and it feels slower? The new OS brings new bloat. We strip it back to what you actually need.</p>
            </div>

            <div className="card">
              <h3>Long-Time Windows Users</h3>
              <p>Years of installing and forgetting programs adds up. If your computer has accumulated junk over time, a debloat gives you a fresh start.</p>
            </div>

            <div className="card">
              <h3>Anyone Who Wants Speed</h3>
              <p>If you want Windows to boot fast, respond quickly, and stay out of your way—debloating makes that happen.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <h2>Ready for a Cleaner Windows?</h2>
          <p>Bring in your computer and we&apos;ll strip out the bloat. You&apos;ll wonder why you waited so long.</p>
          <Link href="/contact" className="btn btn-white">Speed Up My PC</Link>
        </div>
      </section>
    </>
  );
}
