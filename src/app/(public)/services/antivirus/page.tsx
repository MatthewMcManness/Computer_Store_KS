import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Antivirus & Scam Protection | Computer Store Kansas',
  description: 'Antivirus and scam protection services in Topeka, KS. We install, configure, and manage your security software so you never have to deal with technical support.',
  openGraph: {
    title: 'Antivirus & Scam Protection - Computer Store Kansas',
    description: 'Protection from viruses and scams. We handle the technical side so you don\'t have to.',
    url: 'https://computerstoreks.com/services/antivirus',
  },
};

export default function AntivirusPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h2>Antivirus &amp; Scam Protection</h2>
          <p>Stay protected. We handle the technical side.</p>
        </div>
      </section>

      {/* Main Value Prop */}
      <section className="services horizontal-diamond texture-circuit overlap-card-container">
        <div className="diamond-accent diamond-accent-3 rotating-element"></div>
        <div className="container overlap-card">
          <h2>Protection Without the Hassle</h2>
          <p style={{ fontSize: '1.15rem', maxWidth: '800px', margin: '0 auto 2rem' }}>
            Security software is essential—but dealing with it can be frustrating. Installation issues,
            confusing settings, subscription renewals, technical support calls... We take care of all of it.
            You get the protection; we handle everything else.
          </p>

          <div className="cards">
            <div className="card">
              <h3>We Install &amp; Configure</h3>
              <p>No fumbling with downloads or confusing setup wizards. We install your security software and configure it properly from the start.</p>
            </div>

            <div className="card">
              <h3>We Handle Support</h3>
              <p>Problem with your antivirus? Don&apos;t spend hours on hold with tech support. Bring it to us and we&apos;ll deal with it for you.</p>
            </div>

            <div className="card">
              <h3>We Manage Renewals</h3>
              <p>Call us within 30 days of your subscription expiring and we&apos;ll handle the renewal over the phone. No hassle, no lapsed protection.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Antivirus Section */}
      <section className="benefits-section">
        <div className="container">
          <h2>Antivirus Protection</h2>
          <p>We recommend and install ESET antivirus—trusted, effective, and lightweight.</p>

          <div className="linux-highlight">
            <h3>Why ESET?</h3>
            <p>ESET is known for excellent malware detection without slowing down your computer. It runs quietly in the background, protecting you without getting in your way. Unlike some antivirus programs that constantly nag you with pop-ups, ESET just works.</p>
          </div>

          <div className="service-details" style={{ marginTop: '2rem' }}>
            <h3>What&apos;s Included:</h3>
            <ul className="feature-list">
              <li>ESET antivirus software (yearly subscription)</li>
              <li>Professional installation and configuration</li>
              <li>Settings optimized for your needs</li>
              <li>Quick tutorial on what you need to know</li>
              <li>Phone renewal support (within 30 days of expiration)</li>
              <li>Ongoing technical support—bring it in if you have issues</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Scam Protection Section */}
      <section className="services texture-dots">
        <div className="container">
          <h2>Scam Protection</h2>
          <p className="text-center" style={{ maxWidth: '700px', margin: '0 auto 3rem' }}>
            Antivirus catches viruses—but scammers use different tactics. They trick you into giving them
            access or clicking dangerous links. That&apos;s where dedicated scam protection comes in.
          </p>

          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-number">1</div>
              <div className="benefit-content">
                <h4>Remote Access Blocking</h4>
                <p>Blocks the remote access tools scammers use to take control of your computer. These aren&apos;t viruses, so antivirus won&apos;t catch them—but scam protection will.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">2</div>
              <div className="benefit-content">
                <h4>Scam Website Detection</h4>
                <p>Blocks known scam websites and alerts you to newly-created sites. Scammers constantly create new fake websites to avoid detection.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">3</div>
              <div className="benefit-content">
                <h4>Fake Pop-up Detection</h4>
                <p>Detects those scary &quot;Your computer is infected!&quot; pop-ups that scammers use to trick you into calling fake support numbers.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">4</div>
              <div className="benefit-content">
                <h4>Phishing Protection</h4>
                <p>Detects and blocks malicious links from emails and ads before you accidentally click something dangerous.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">5</div>
              <div className="benefit-content">
                <h4>Typo Protection</h4>
                <p>Warns you if you accidentally mistype a popular website address. Scammers buy lookalike domains to catch these mistakes.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">6</div>
              <div className="benefit-content">
                <h4>Guardian Alerts</h4>
                <p>Assign a trusted family member to receive alerts when a potential scam is detected—perfect for keeping an eye on loved ones.</p>
              </div>
            </div>
          </div>

          <div className="linux-highlight" style={{ marginTop: '3rem' }}>
            <h3>One-Time Installation</h3>
            <p>Unlike antivirus subscriptions, scam protection is a one-time install. Pay once and you&apos;re protected—no yearly renewals to worry about.</p>
          </div>
        </div>
      </section>

      {/* Why Both */}
      <section className="cta" style={{ background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-dark) 100%)' }}>
        <div className="container">
          <h2>Why You Need Both</h2>
          <p>Antivirus and scam protection work differently. Antivirus catches malicious software trying to infect your computer. Scam protection catches the social engineering tricks that bypass antivirus entirely—fake tech support, phishing emails, fraudulent websites. Together, they cover the full range of threats you face online.</p>
        </div>
      </section>

      {/* Who Needs This */}
      <section className="benefits-section">
        <div className="container">
          <h2>Who Benefits Most?</h2>

          <div className="cards">
            <div className="card">
              <h3>Everyone Online</h3>
              <p>If you use the internet, you need protection. Threats don&apos;t discriminate—everyone from tech experts to casual users can encounter malware and scams.</p>
            </div>

            <div className="card">
              <h3>Online Shoppers &amp; Bankers</h3>
              <p>If you shop or bank online, your financial information is at risk. Proper protection keeps your accounts and identity safe.</p>
            </div>

            <div className="card">
              <h3>Seniors &amp; Less Tech-Savvy Users</h3>
              <p>Scammers specifically target people who may be less familiar with their tactics. The guardian alert feature lets family members help keep loved ones safe.</p>
            </div>

            <div className="card">
              <h3>Anyone Tired of Dealing With It</h3>
              <p>If you just want protection that works without having to think about it, that&apos;s what we provide. We handle the technical side so you can focus on using your computer.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <h2>Get Protected</h2>
          <p>Bring in your computer and we&apos;ll set you up with the protection you need. Installation, configuration, and support—all handled.</p>
          <Link href="/contact" className="btn btn-white">Protect My Computer</Link>
        </div>
      </section>
    </>
  );
}
