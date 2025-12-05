import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Windows & Linux Installation Services | Computer Store Kansas',
  description: 'Professional Windows and Linux installation in Topeka, KS. Fresh OS installs, dual-boot setups, and Zorin OS for older hardware. License included with Windows installs.',
  openGraph: {
    title: 'OS Installation Services - Computer Store Kansas',
    description: 'Windows and Linux installation services. Fresh start for your computer with drivers, updates, and setup included.',
    url: 'https://computerstoreks.com/services/os-installation',
  },
};

export default function OSInstallationPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h2>Operating System Installation</h2>
          <p>A fresh start for your computer—Windows or Linux.</p>
        </div>
      </section>

      {/* Windows Section */}
      <section className="services horizontal-diamond texture-circuit overlap-card-container">
        <div className="diamond-accent diamond-accent-3 rotating-element"></div>
        <div className="container overlap-card">
          <h2>Windows Installation</h2>

          <div className="service-details">
            <p>Need a clean slate? We install a fresh copy of Windows on your computer—and the license is included. No need to hunt down product keys or worry about activation.</p>

            <h3>What&apos;s Included:</h3>
            <ul className="feature-list">
              <li>Fresh Windows installation with genuine license</li>
              <li>All drivers installed and configured</li>
              <li>Windows updates applied</li>
              <li>Desktop set up and ready to use</li>
              <li>Any Microsoft Store apps you request installed</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Linux Section */}
      <section className="benefits-section">
        <div className="container">
          <h2>Linux Installation with Zorin OS</h2>
          <p>The perfect alternative to Windows—especially for older computers that can&apos;t run Windows 11.</p>

          <div className="cards">
            <div className="card">
              <h3>Linux Standard</h3>
              <p>Zorin OS Core edition installed and configured. We set up the desktop layout to match what you&apos;re used to from Windows, making the transition seamless.</p>
            </div>

            <div className="card">
              <h3>Linux Premium</h3>
              <p>Zorin OS Pro edition with expanded layout options and premium desktop themes. More customization to make your computer truly yours.</p>
            </div>

            <div className="card">
              <h3>Dual-Boot Setup</h3>
              <p>Want both Windows and Linux? We set up dual-boot so you can choose which operating system to use each time you start your computer.</p>
            </div>
          </div>

          <div className="linux-highlight">
            <h3>Why Zorin OS?</h3>
            <p>Zorin OS is designed specifically for people switching from Windows. It looks and feels familiar from the moment you start using it. We customize the layout to match what you&apos;re comfortable with—whether that&apos;s a Windows 7, Windows 10, or even macOS-style desktop.</p>
          </div>
        </div>
      </section>

      {/* Windows 11 Alternative Callout */}
      <section className="cta" style={{ background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-dark) 100%)' }}>
        <div className="container">
          <h2>Computer Too Old for Windows 11?</h2>
          <p>Microsoft&apos;s strict hardware requirements leave many perfectly good computers behind. Linux breathes new life into older hardware—your computer could run faster than ever, with a modern, secure operating system that receives regular updates.</p>
          <Link href="/why-linux" className="btn btn-white">Learn More About Linux</Link>
        </div>
      </section>

      {/* Why Fresh Install */}
      <section className="benefits-section">
        <div className="container">
          <h2>When Do You Need a Fresh Install?</h2>
          <p>A clean operating system installation solves many common computer problems.</p>

          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-number">1</div>
              <div className="benefit-content">
                <h4>Sluggish Performance</h4>
                <p>Years of software installs, updates, and accumulated files can bog down any computer. A fresh start eliminates the cruft.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">2</div>
              <div className="benefit-content">
                <h4>Corrupted Windows</h4>
                <p>Blue screens, random crashes, or Windows that won&apos;t start properly? Sometimes a clean install is the only reliable fix.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">3</div>
              <div className="benefit-content">
                <h4>Malware Damage</h4>
                <p>After a severe virus infection, a fresh install ensures no traces of malware remain hidden in your system.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">4</div>
              <div className="benefit-content">
                <h4>Switching Operating Systems</h4>
                <p>Ready to try Linux? Moving from an old Windows version? We handle the transition smoothly.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">5</div>
              <div className="benefit-content">
                <h4>New Hard Drive or SSD</h4>
                <p>Upgraded to a faster SSD? A fresh install takes full advantage of your new hardware&apos;s speed.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">6</div>
              <div className="benefit-content">
                <h4>Selling or Donating</h4>
                <p>Passing your computer to someone else? A clean install wipes your personal data and gives them a fresh start.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Note about data */}
      <section className="section-sm" style={{ background: 'var(--background-light)' }}>
        <div className="container text-center">
          <h3>What About My Files?</h3>
          <p>A fresh install means starting over—your files won&apos;t be on the new system. Need your data transferred? Check out our <Link href="/services/data-services" style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>Data Transfer Services</Link> to move your files to the fresh installation.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <h2>Ready for a Fresh Start?</h2>
          <p>Bring in your computer and we&apos;ll have it running like new with a clean operating system.</p>
          <Link href="/contact" className="btn btn-white">Get Started</Link>
        </div>
      </section>
    </>
  );
}
