/**
 * WINDOWS DEBLOAT SERVICE PAGE - Describes Windows cleanup and optimization services.
 *
 * WHEN TO EDIT: When updating the description, pricing, or details for this service.
 */
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
      <section className="hero-overlay hero-clip text-white pt-32 pb-48 text-center relative overflow-visible z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1920&q=80)' }}>
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[3]">
          <h2>Windows Debloat</h2>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] mb-0 max-w-[700px] mx-auto opacity-95">Strip out the junk. Keep what matters.</p>
        </div>
      </section>

      {/* Main Pricing */}
      <section className="texture-circuit hero-next-section -mt-20 pb-20 pt-32 relative z-[1] bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12">Clean Up Your Windows</h2>
          <p style={{ fontSize: '1.15rem', maxWidth: '800px', margin: '0 auto 2rem' }}>
            Windows 11 comes loaded with software you didn&apos;t ask for and don&apos;t need. Manufacturers
            pile on even more. All that junk slows down your computer, clutters your start menu, and runs
            in the background eating up resources. We clean it out.
          </p>

          <div className="mt-12 p-8 bg-primary-100 rounded-brand-lg border-l-4 border-primary-600">
            <h3 className="text-primary-800 mb-4">Free When You Buy From Us</h3>
            <p className="text-gray-600 mb-0">Every computer we sell is debloated before you take it home—no extra charge. You get a clean, fast Windows experience from day one.</p>
          </div>
        </div>
      </section>

      {/* What We Remove */}
      <section className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-4">What We Remove &amp; Optimize</h2>
          <p className="text-center text-gray-500 text-[1.1rem] mb-16 max-w-[700px] mx-auto">A comprehensive cleanup of everything slowing down your Windows experience.</p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-12 mt-12">
            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">1</div>
              <div>
                <h4>Manufacturer Bloatware</h4>
                <p>Trial software, branded utilities, and junk that came pre-installed from Dell, HP, Lenovo, or whoever made your computer.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">2</div>
              <div>
                <h4>Unnecessary Windows Apps</h4>
                <p>Built-in Windows apps you&apos;ll never use—games, widgets, and other clutter that Microsoft installs by default.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">3</div>
              <div>
                <h4>Startup Programs</h4>
                <p>Programs that launch automatically when you turn on your computer, slowing down boot time and hogging memory in the background.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">4</div>
              <div>
                <h4>Browser Junk</h4>
                <p>Unwanted extensions, toolbars, and browser add-ons that snuck in along the way. We clean up your browsing experience too.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">5</div>
              <div>
                <h4>Performance Settings</h4>
                <p>Windows settings optimized for speed and responsiveness instead of flashy animations and background telemetry.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">6</div>
              <div>
                <h4>Accumulated Junk</h4>
                <p>Programs and files that have built up over time—things you installed once, forgot about, and never use.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Windows 11 Section */}
      <section className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-dark) 100%)' }}>
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Make Windows 11 Work the Way It Should</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Windows 11 has a reputation for being sluggish and cluttered—but it doesn&apos;t have to be. A proper debloat removes the cruft Microsoft and manufacturers pile on, revealing a faster, cleaner operating system underneath. Your computer will boot quicker, run smoother, and actually respond when you click something.</p>
        </div>
      </section>

      {/* Debloat vs Virus Removal */}
      <section className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-4">Debloat vs. Virus Removal</h2>
          <p className="text-center text-gray-500 text-[1.1rem] mb-16 max-w-[700px] mx-auto">These are different services for different problems.</p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Debloat Service</h3>
              <p>Removes <strong>legitimate but unwanted</strong> software—pre-installed junk, unnecessary Windows features, and programs you don&apos;t use. Your computer isn&apos;t infected, just cluttered.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
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
      <section className="texture-dots py-20 bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12">Who Benefits from Debloating?</h2>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>New Computer Owners</h3>
              <p>Just bought a computer from a big box store? It&apos;s loaded with trial software and manufacturer junk. Start fresh with a clean system.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Windows 11 Upgraders</h3>
              <p>Upgraded to Windows 11 and it feels slower? The new OS brings new bloat. We strip it back to what you actually need.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Long-Time Windows Users</h3>
              <p>Years of installing and forgetting programs adds up. If your computer has accumulated junk over time, a debloat gives you a fresh start.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Anyone Who Wants Speed</h3>
              <p>If you want Windows to boot fast, respond quickly, and stay out of your way—debloating makes that happen.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 text-center relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Ready for a Cleaner Windows?</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Bring in your computer and we&apos;ll strip out the bloat. You&apos;ll wonder why you waited so long.</p>
          <Link href="/contact" className="inline-block px-8 py-[0.8rem] rounded-brand-md no-underline font-semibold text-base transition-all duration-normal cursor-pointer border-none text-center whitespace-nowrap bg-white text-primary-600 shadow-brand-md hover:-translate-y-0.5 hover:shadow-brand-lg">Speed Up My PC</Link>
        </div>
      </section>
    </>
  );
}
