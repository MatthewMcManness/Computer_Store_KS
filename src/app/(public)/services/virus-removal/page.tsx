import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Virus & Malware Removal | Computer Store Kansas',
  description: 'Professional virus and malware removal in Topeka, KS. Complete cleaning to remove viruses, spyware, adware, and get your computer running clean again.',
  openGraph: {
    title: 'Virus & Malware Removal - Computer Store Kansas',
    description: 'Complete virus and malware removal. Get your computer clean and running right.',
    url: 'https://computerstoreks.com/services/virus-removal',
  },
};

export default function VirusRemovalPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h2>Virus &amp; Malware Removal</h2>
          <p>Get the junk out and get your computer back.</p>
        </div>
      </section>

      {/* Main Pricing */}
      <section className="services horizontal-diamond texture-circuit overlap-card-container">
        <div className="diamond-accent diamond-accent-3 rotating-element"></div>
        <div className="container overlap-card">
          <h2>Complete Malware Removal</h2>
          <p style={{ fontSize: '1.15rem', maxWidth: '800px', margin: '0 auto 2rem' }}>
            Viruses, malware, spyware, adware, browser hijackers—whatever&apos;s infected your computer,
            we&apos;ll root it out. Flat-rate pricing no matter how bad the infection.
          </p>

          <div className="cards">
            <div className="card">
              <h3>Complete Cleaning</h3>
              <p>We don&apos;t just run a quick scan. We thoroughly clean your system of all malicious software, unwanted programs, and leftover junk.</p>
            </div>

            <div className="card">
              <h3>Deep Scanning</h3>
              <p>Multiple scanning tools and techniques to catch everything—including the sneaky stuff that hides from basic antivirus.</p>
            </div>

            <div className="card">
              <h3>Browser Cleanup</h3>
              <p>Hijacked homepage? Unwanted toolbars? Constant pop-ups? We clean your browsers and restore your settings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Remove */}
      <section className="benefits-section">
        <div className="container">
          <h2>What We Remove</h2>
          <p>If it&apos;s malicious or unwanted, we get rid of it.</p>

          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-number">1</div>
              <div className="benefit-content">
                <h4>Viruses</h4>
                <p>Traditional viruses that spread and damage files, slow your system, or cause crashes and errors.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">2</div>
              <div className="benefit-content">
                <h4>Malware</h4>
                <p>Malicious software designed to harm your computer, steal information, or give attackers access to your system.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">3</div>
              <div className="benefit-content">
                <h4>Spyware</h4>
                <p>Programs that secretly monitor your activity, track your browsing, or collect personal information.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">4</div>
              <div className="benefit-content">
                <h4>Adware</h4>
                <p>Unwanted software that bombards you with ads, pop-ups, and redirects you to advertising sites.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">5</div>
              <div className="benefit-content">
                <h4>Browser Hijackers</h4>
                <p>Malware that changes your homepage, default search engine, or installs unwanted toolbars and extensions.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">6</div>
              <div className="benefit-content">
                <h4>Rootkits</h4>
                <p>Deeply hidden malware that tries to evade detection. We use specialized tools to find and remove even the sneakiest infections.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Severe Infections */}
      <section className="services texture-dots">
        <div className="container">
          <h2>Severe Infections</h2>
          <p className="text-center" style={{ maxWidth: '700px', margin: '0 auto 3rem' }}>
            Sometimes the damage is too extensive for cleaning to be the best option.
          </p>

          <div className="cards">
            <div className="card">
              <h3>When Cleaning Isn&apos;t Enough</h3>
              <p>For severe infections—especially ransomware or deeply embedded malware—we may recommend a fresh operating system installation instead. It&apos;s often faster, more thorough, and guarantees a clean system.</p>
            </div>

            <div className="card">
              <h3>Fresh Start Option</h3>
              <p>We can install a clean OS and transfer your important files (avoiding the infected ones). Sometimes starting fresh is the safest path forward.</p>
            </div>

            <div className="card">
              <h3>Replacement Recommendation</h3>
              <p>In rare cases with older computers and severe infections, a new computer with a simple data transfer may be more cost-effective than extensive repair. We&apos;ll be honest if that&apos;s the situation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Protection */}
      <section className="cta" style={{ background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-dark) 100%)' }}>
        <div className="container">
          <h2>Stay Protected</h2>
          <p>After cleaning your computer, we&apos;ll recommend protection to help prevent future infections. We offer antivirus software and scam protection tools that we can install for a small fee. Prevention is always easier than cleanup.</p>
          <Link href="/services/antivirus" className="btn btn-white">Learn About Protection</Link>
        </div>
      </section>

      {/* Warning Signs */}
      <section className="benefits-section">
        <div className="container">
          <h2>Signs Your Computer May Be Infected</h2>

          <div className="cards">
            <div className="card">
              <h3>Sluggish Performance</h3>
              <p>Computer suddenly running much slower than usual, programs taking forever to open, or constant freezing.</p>
            </div>

            <div className="card">
              <h3>Pop-ups Everywhere</h3>
              <p>Ads appearing even when you&apos;re not browsing, or pop-ups that won&apos;t go away no matter what you click.</p>
            </div>

            <div className="card">
              <h3>Browser Changes</h3>
              <p>Homepage changed without your permission, unfamiliar search engine, or new toolbars you didn&apos;t install.</p>
            </div>

            <div className="card">
              <h3>Programs You Didn&apos;t Install</h3>
              <p>Unknown programs appearing on your computer, or programs running that you don&apos;t recognize.</p>
            </div>

            <div className="card">
              <h3>Security Software Disabled</h3>
              <p>Antivirus turned off and won&apos;t stay on, or you can&apos;t access security settings.</p>
            </div>

            <div className="card">
              <h3>Strange Messages</h3>
              <p>Warnings claiming your computer is infected (often from fake antivirus), or demands for payment to unlock your files.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Turnaround */}
      <section className="section-sm" style={{ background: 'var(--background-light)' }}>
        <div className="container text-center">
          <h3>Turnaround Time</h3>
          <p>Cleaning time varies depending on the severity of infection. Simple infections may be done same-day; complex infections take longer. We&apos;ll give you an estimate when we assess the situation.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <h2>Think You&apos;re Infected?</h2>
          <p>Don&apos;t wait—the longer malware sits on your system, the more damage it can do. Bring your computer in and let us clean it up.</p>
          <Link href="/contact" className="btn btn-white">Get Help Now</Link>
        </div>
      </section>
    </>
  );
}
