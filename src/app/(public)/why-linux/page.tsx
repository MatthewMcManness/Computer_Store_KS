import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Why Linux? | Computer Store Kansas',
  description: 'Discover why Linux is the smart choice for your computer. Runs on older hardware, more secure, no bloatware, completely free, and respects your privacy.',
  openGraph: {
    title: 'Why Linux? - Computer Store Kansas',
    description: 'Your computer can run faster, safer, and longer with Linux. Find out why.',
    url: 'https://computerstoreks.com/why-linux',
  },
};

export default function WhyLinuxPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1920&q=80)' }}>
        <div className="container">
          <h2>Why Linux?</h2>
          <p>Your computer deserves better. Linux delivers.</p>
        </div>
      </section>

      {/* Windows 11 Problem */}
      <section className="services horizontal-diamond texture-circuit overlap-card-container">
        <div className="diamond-accent diamond-accent-3 rotating-element"></div>
        <div className="container overlap-card">
          <h2>The Windows 11 Problem</h2>
          <p style={{ fontSize: '1.15rem', maxWidth: '800px', margin: '0 auto 2rem' }}>
            Microsoft&apos;s strict hardware requirements for Windows 11 have left millions of perfectly
            good computers behind. If your PC can&apos;t run Windows 11, you&apos;re facing an uncomfortable choice:
            buy expensive new hardware, stick with an operating system that&apos;s losing support, or try something better.
          </p>

          <div className="linux-highlight">
            <h3>Windows 10 Support Ends October 2025</h3>
            <p>After that date, no more security updates. Your computer becomes increasingly vulnerable to malware and attacks. Linux offers a third path: keep your existing hardware, stay secure, and get a faster, cleaner experience than Windows ever gave you.</p>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="benefits-section">
        <div className="container">
          <h2>Why People Switch to Linux</h2>
          <p>Real advantages that make a real difference.</p>

          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-number">1</div>
              <div className="benefit-content">
                <h4>Runs Great on Older Hardware</h4>
                <p>Linux breathes new life into computers that Windows has abandoned. That &quot;obsolete&quot; PC could run faster than ever with a lightweight Linux system.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">2</div>
              <div className="benefit-content">
                <h4>Completely Free</h4>
                <p>No license fees. No subscriptions. No activation keys. Download it, install it, use it—forever. Your money stays in your pocket.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">3</div>
              <div className="benefit-content">
                <h4>More Secure</h4>
                <p>Linux powers the New York Stock Exchange and the International Space Station. Its security model is fundamentally stronger than Windows, with far fewer viruses and malware targeting it.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">4</div>
              <div className="benefit-content">
                <h4>No Bloatware</h4>
                <p>No pre-installed junk. No trial software. No apps you didn&apos;t ask for. Just a clean, fast system that does what you need without getting in your way.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">5</div>
              <div className="benefit-content">
                <h4>Respects Your Privacy</h4>
                <p>Linux doesn&apos;t track your activity, collect your data, or report back to anyone. Your computer, your business—nobody else&apos;s.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">6</div>
              <div className="benefit-content">
                <h4>No Forced Updates</h4>
                <p>You control when updates happen. No surprise restarts in the middle of your work. No waiting 30 minutes to use your own computer.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* More Reasons */}
      <section className="services texture-dots">
        <div className="container">
          <h2>More Reasons to Consider Linux</h2>

          <div className="cards">
            <div className="card">
              <h3>Reduce E-Waste</h3>
              <p>Forcing hardware upgrades creates massive electronic waste. Linux lets you keep using perfectly functional computers instead of throwing them away.</p>
            </div>

            <div className="card">
              <h3>No Account Required</h3>
              <p>Windows 11 requires a Microsoft account just to set up your computer. Linux lets you use your own machine without signing up for anything.</p>
            </div>

            <div className="card">
              <h3>No Vendor Lock-In</h3>
              <p>Windows pushes you toward Microsoft services at every turn. Linux lets you choose your own tools without being nudged toward a corporate ecosystem.</p>
            </div>

            <div className="card">
              <h3>Lightning Fast</h3>
              <p>Linux runs lean. Boot times are short, programs open quickly, and your system doesn&apos;t slow down over time like Windows often does.</p>
            </div>

            <div className="card">
              <h3>Regular Updates for Years</h3>
              <p>Linux distributions provide security updates for years—often longer than Microsoft supports Windows versions. Your system stays secure without forced hardware upgrades.</p>
            </div>

            <div className="card">
              <h3>Fully Customizable</h3>
              <p>Make your desktop look and work exactly how you want. Linux offers customization options Windows can&apos;t match.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Common Concerns */}
      <section className="benefits-section">
        <div className="container">
          <h2>Common Questions</h2>
          <p>Concerns people have before switching—and the answers.</p>

          <div className="faq-section">
            <div className="faq-item">
              <h3>&quot;Can I still use my programs?&quot;</h3>
              <p>Most of what you do on a computer works great on Linux. Web browsers (Chrome, Firefox, Edge), streaming services, email, video calls, document editing—all covered. Linux comes with LibreOffice, which opens and saves Microsoft Office files. For specialized Windows software, we can often set up compatibility tools or find Linux alternatives.</p>
            </div>

            <div className="faq-item">
              <h3>&quot;Is it hard to learn?&quot;</h3>
              <p>Modern Linux looks and works a lot like Windows. Click icons, open programs, browse files—it&apos;s familiar. We set up your Linux installation to match what you&apos;re used to, so the transition is as smooth as possible. Most people are comfortable within a day or two.</p>
            </div>

            <div className="faq-item">
              <h3>&quot;What about gaming?&quot;</h3>
              <p>Linux gaming has come a long way. Steam works natively on Linux, and thousands of games run great—including many Windows games through compatibility layers. It&apos;s not perfect for every game, but casual and many serious gamers find Linux works well for their needs.</p>
            </div>

            <div className="faq-item">
              <h3>&quot;What if I need help?&quot;</h3>
              <p>That&apos;s what we&apos;re here for. We don&apos;t just install Linux and walk away. We set it up for you, show you around, and provide ongoing support if you run into questions later.</p>
            </div>

            <div className="faq-item">
              <h3>&quot;Can I try it without committing?&quot;</h3>
              <p>Yes. We can set up dual-boot so you have both Windows and Linux on your computer. Choose which one to use each time you start up. Try Linux without losing Windows until you&apos;re ready to commit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who Should Consider */}
      <section className="cta" style={{ background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-dark) 100%)' }}>
        <div className="container">
          <h2>Is Linux Right for You?</h2>
          <p>Linux is a great choice if you have an older computer that can&apos;t run Windows 11, you&apos;re tired of Windows bloat and forced updates, you want a faster and more private computing experience, you&apos;re budget-conscious and don&apos;t want to pay for new hardware or software, or you&apos;re simply curious about trying something different. Come talk to us—we&apos;ll help you figure out if Linux makes sense for your situation.</p>
        </div>
      </section>

      {/* What We Offer */}
      <section className="benefits-section">
        <div className="container">
          <h2>How We Help</h2>

          <div className="cards">
            <div className="card">
              <h3>Consultation</h3>
              <p>Not sure if Linux is right for you? Bring in your computer and we&apos;ll assess your needs, explain your options, and give you honest advice.</p>
            </div>

            <div className="card">
              <h3>Installation</h3>
              <p>We handle the entire installation process, configure the desktop to match what you&apos;re used to, and make sure everything works properly.</p>
            </div>

            <div className="card">
              <h3>Setup &amp; Training</h3>
              <p>We set up your programs, transfer your files, and show you around. You leave with a computer you know how to use.</p>
            </div>

            <div className="card">
              <h3>Ongoing Support</h3>
              <p>Questions after you take it home? We&apos;re here to help. You&apos;re not on your own after the installation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Try Something Better?</h2>
          <p>Bring in your computer and let&apos;s talk about whether Linux is the right choice for you. No pressure, just honest advice.</p>
          <Link href="/contact" className="btn btn-white">Let&apos;s Talk</Link>
        </div>
      </section>
    </>
  );
}
