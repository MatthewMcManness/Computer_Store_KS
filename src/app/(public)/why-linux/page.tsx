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
      <section
        className="hero-overlay hero-clip text-white pt-32 pb-48 text-center relative overflow-visible z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1920&q=80)' }}
      >
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[3]">
          <h2 className="text-white text-[clamp(2rem,4vw,3rem)] mb-6 font-bold">Why Linux?</h2>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] mb-0 max-w-[700px] mx-auto opacity-95">Your computer deserves better. Linux delivers.</p>
        </div>
      </section>

      {/* Windows 11 Problem */}
      <section className="hero-next-section texture-circuit py-20 -mt-20 pt-32 relative z-[1]">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12 text-gray-900">The Windows 11 Problem</h2>
          <p className="text-[1.15rem] max-w-[800px] mx-auto mb-8">
            Microsoft&apos;s strict hardware requirements for Windows 11 have left millions of perfectly
            good computers behind. If your PC can&apos;t run Windows 11, you&apos;re facing an uncomfortable choice:
            buy expensive new hardware, stick with an operating system that&apos;s losing support, or try something better.
          </p>

          <div className="mt-12 p-8 bg-primary-100 rounded-brand-lg border-l-4 border-primary-600">
            <h3 className="text-primary-800 mb-4">Windows 10 Support Ends October 2025</h3>
            <p className="text-gray-700 mb-0">After that date, no more security updates. Your computer becomes increasingly vulnerable to malware and attacks. Linux offers a third path: keep your existing hardware, stay secure, and get a faster, cleaner experience than Windows ever gave you.</p>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-4">Why People Switch to Linux</h2>
          <p className="text-center text-gray-500 text-[1.1rem] mb-16 max-w-[700px] mx-auto">Real advantages that make a real difference.</p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-12 mt-12">
            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-300 hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">1</div>
              <div>
                <h4 className="text-[1.3rem] mb-3 text-gray-900">Runs Great on Older Hardware</h4>
                <p className="text-base text-gray-700 leading-relaxed mb-0">Linux breathes new life into computers that Windows has abandoned. That &quot;obsolete&quot; PC could run faster than ever with a lightweight Linux system.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-300 hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">2</div>
              <div>
                <h4 className="text-[1.3rem] mb-3 text-gray-900">Completely Free</h4>
                <p className="text-base text-gray-700 leading-relaxed mb-0">No license fees. No subscriptions. No activation keys. Download it, install it, use it—forever. Your money stays in your pocket.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-300 hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">3</div>
              <div>
                <h4 className="text-[1.3rem] mb-3 text-gray-900">More Secure</h4>
                <p className="text-base text-gray-700 leading-relaxed mb-0">Linux powers the New York Stock Exchange and the International Space Station. Its security model is fundamentally stronger than Windows, with far fewer viruses and malware targeting it.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-300 hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">4</div>
              <div>
                <h4 className="text-[1.3rem] mb-3 text-gray-900">No Bloatware</h4>
                <p className="text-base text-gray-700 leading-relaxed mb-0">No pre-installed junk. No trial software. No apps you didn&apos;t ask for. Just a clean, fast system that does what you need without getting in your way.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-300 hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">5</div>
              <div>
                <h4 className="text-[1.3rem] mb-3 text-gray-900">Respects Your Privacy</h4>
                <p className="text-base text-gray-700 leading-relaxed mb-0">Linux doesn&apos;t track your activity, collect your data, or report back to anyone. Your computer, your business—nobody else&apos;s.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-300 hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">6</div>
              <div>
                <h4 className="text-[1.3rem] mb-3 text-gray-900">No Forced Updates</h4>
                <p className="text-base text-gray-700 leading-relaxed mb-0">You control when updates happen. No surprise restarts in the middle of your work. No waiting 30 minutes to use your own computer.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* More Reasons */}
      <section className="texture-dots py-20 bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12 text-gray-900">More Reasons to Consider Linux</h2>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm transition-all duration-300 border border-bg-dark hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3 className="text-gray-900 text-[1.4rem] mb-4">Reduce E-Waste</h3>
              <p className="text-gray-700 text-base leading-relaxed">Forcing hardware upgrades creates massive electronic waste. Linux lets you keep using perfectly functional computers instead of throwing them away.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm transition-all duration-300 border border-bg-dark hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3 className="text-gray-900 text-[1.4rem] mb-4">No Account Required</h3>
              <p className="text-gray-700 text-base leading-relaxed">Windows 11 requires a Microsoft account just to set up your computer. Linux lets you use your own machine without signing up for anything.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm transition-all duration-300 border border-bg-dark hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3 className="text-gray-900 text-[1.4rem] mb-4">No Vendor Lock-In</h3>
              <p className="text-gray-700 text-base leading-relaxed">Windows pushes you toward Microsoft services at every turn. Linux lets you choose your own tools without being nudged toward a corporate ecosystem.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm transition-all duration-300 border border-bg-dark hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3 className="text-gray-900 text-[1.4rem] mb-4">Lightning Fast</h3>
              <p className="text-gray-700 text-base leading-relaxed">Linux runs lean. Boot times are short, programs open quickly, and your system doesn&apos;t slow down over time like Windows often does.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm transition-all duration-300 border border-bg-dark hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3 className="text-gray-900 text-[1.4rem] mb-4">Regular Updates for Years</h3>
              <p className="text-gray-700 text-base leading-relaxed">Linux distributions provide security updates for years—often longer than Microsoft supports Windows versions. Your system stays secure without forced hardware upgrades.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm transition-all duration-300 border border-bg-dark hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3 className="text-gray-900 text-[1.4rem] mb-4">Fully Customizable</h3>
              <p className="text-gray-700 text-base leading-relaxed">Make your desktop look and work exactly how you want. Linux offers customization options Windows can&apos;t match.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Common Concerns */}
      <section className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-4">Common Questions</h2>
          <p className="text-center text-gray-500 text-[1.1rem] mb-16 max-w-[700px] mx-auto">Concerns people have before switching—and the answers.</p>

          <div className="max-w-[800px] mx-auto mt-8">
            <div className="mb-8 pb-8 border-b border-bg-dark">
              <h3 className="text-primary-800 text-[1.25rem] mb-3">&quot;Can I still use my programs?&quot;</h3>
              <p className="text-gray-700 leading-[1.7] mb-0">Most of what you do on a computer works great on Linux. Web browsers (Chrome, Firefox, Edge), streaming services, email, video calls, document editing—all covered. Linux comes with LibreOffice, which opens and saves Microsoft Office files. For specialized Windows software, we can often set up compatibility tools or find Linux alternatives.</p>
            </div>

            <div className="mb-8 pb-8 border-b border-bg-dark">
              <h3 className="text-primary-800 text-[1.25rem] mb-3">&quot;Is it hard to learn?&quot;</h3>
              <p className="text-gray-700 leading-[1.7] mb-0">Modern Linux looks and works a lot like Windows. Click icons, open programs, browse files—it&apos;s familiar. We set up your Linux installation to match what you&apos;re used to, so the transition is as smooth as possible. Most people are comfortable within a day or two.</p>
            </div>

            <div className="mb-8 pb-8 border-b border-bg-dark">
              <h3 className="text-primary-800 text-[1.25rem] mb-3">&quot;What about gaming?&quot;</h3>
              <p className="text-gray-700 leading-[1.7] mb-0">Linux gaming has come a long way. Steam works natively on Linux, and thousands of games run great—including many Windows games through compatibility layers. It&apos;s not perfect for every game, but casual and many serious gamers find Linux works well for their needs.</p>
            </div>

            <div className="mb-8 pb-8 border-b border-bg-dark">
              <h3 className="text-primary-800 text-[1.25rem] mb-3">&quot;What if I need help?&quot;</h3>
              <p className="text-gray-700 leading-[1.7] mb-0">That&apos;s what we&apos;re here for. We don&apos;t just install Linux and walk away. We set it up for you, show you around, and provide ongoing support if you run into questions later.</p>
            </div>

            <div className="mb-0 pb-0">
              <h3 className="text-primary-800 text-[1.25rem] mb-3">&quot;Can I try it without committing?&quot;</h3>
              <p className="text-gray-700 leading-[1.7] mb-0">Yes. We can set up dual-boot so you have both Windows and Linux on your computer. Choose which one to use each time you start up. Try Linux without losing Windows until you&apos;re ready to commit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who Should Consider */}
      <section className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 text-center relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Is Linux Right for You?</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Linux is a great choice if you have an older computer that can&apos;t run Windows 11, you&apos;re tired of Windows bloat and forced updates, you want a faster and more private computing experience, you&apos;re budget-conscious and don&apos;t want to pay for new hardware or software, or you&apos;re simply curious about trying something different. Come talk to us—we&apos;ll help you figure out if Linux makes sense for your situation.</p>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12 text-gray-900">How We Help</h2>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm transition-all duration-300 border border-bg-dark hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3 className="text-gray-900 text-[1.4rem] mb-4">Consultation</h3>
              <p className="text-gray-700 text-base leading-relaxed">Not sure if Linux is right for you? Bring in your computer and we&apos;ll assess your needs, explain your options, and give you honest advice.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm transition-all duration-300 border border-bg-dark hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3 className="text-gray-900 text-[1.4rem] mb-4">Installation</h3>
              <p className="text-gray-700 text-base leading-relaxed">We handle the entire installation process, configure the desktop to match what you&apos;re used to, and make sure everything works properly.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm transition-all duration-300 border border-bg-dark hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3 className="text-gray-900 text-[1.4rem] mb-4">Setup &amp; Training</h3>
              <p className="text-gray-700 text-base leading-relaxed">We set up your programs, transfer your files, and show you around. You leave with a computer you know how to use.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm transition-all duration-300 border border-bg-dark hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3 className="text-gray-900 text-[1.4rem] mb-4">Ongoing Support</h3>
              <p className="text-gray-700 text-base leading-relaxed">Questions after you take it home? We&apos;re here to help. You&apos;re not on your own after the installation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 text-center relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Ready to Try Something Better?</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Bring in your computer and let&apos;s talk about whether Linux is the right choice for you. No pressure, just honest advice.</p>
          <Link href="/contact" className="inline-block px-8 py-4 rounded-brand-md font-semibold text-base transition-all duration-300 cursor-pointer bg-white text-primary-600 shadow-brand-md hover:-translate-y-0.5 hover:shadow-brand-lg">Let&apos;s Talk</Link>
        </div>
      </section>
    </>
  );
}
