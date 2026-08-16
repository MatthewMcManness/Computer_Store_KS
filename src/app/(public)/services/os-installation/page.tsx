/**
 * OS INSTALLATION SERVICE PAGE - Describes operating system installation services.
 *
 * WHEN TO EDIT: When updating the description, pricing, or details for this service.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronSection } from '@/components/static/ChevronSection';

export const metadata: Metadata = {
  alternates: { canonical: '/services/os-installation' },
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
      <ChevronSection bottomShape="v" className="hero-overlay text-white pt-32 pb-48 text-center relative overflow-visible z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1920&q=80)' }}>
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[3]">
          <h1>Operating System Installation</h1>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] mb-0 max-w-[700px] mx-auto opacity-95">A fresh start for your computer—Windows or Linux.</p>
        </div>
      </ChevronSection>

      {/* Windows Section */}
      <ChevronSection topShape="v" bottomShape="v" className="texture-circuit py-20 relative bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12">Windows Installation</h2>

          <div className="mt-8">
            <p className="text-[1.1rem] leading-[1.8] mb-6">Need a clean slate? We install a fresh copy of Windows on your computer—and the license is included. No need to hunt down product keys or worry about activation.</p>

            <h3 className="mt-8 mb-4">What&apos;s Included:</h3>
            <ul className="list-none p-0 m-0">
              <li className="py-3 pl-8 relative text-[1.05rem] border-b border-bg-dark last:border-b-0 feature-list-check">Fresh Windows installation with genuine license</li>
              <li className="py-3 pl-8 relative text-[1.05rem] border-b border-bg-dark last:border-b-0 feature-list-check">All drivers installed and configured</li>
              <li className="py-3 pl-8 relative text-[1.05rem] border-b border-bg-dark last:border-b-0 feature-list-check">Windows updates applied</li>
              <li className="py-3 pl-8 relative text-[1.05rem] border-b border-bg-dark last:border-b-0 feature-list-check">Desktop set up and ready to use</li>
              <li className="py-3 pl-8 relative text-[1.05rem] border-b border-bg-dark last:border-b-0 feature-list-check">Any Microsoft Store apps you request installed</li>
            </ul>
          </div>
        </div>
      </ChevronSection>

      {/* Linux Section */}
      <ChevronSection topShape="v" bottomShape="v" className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-4">Linux Installation with Zorin OS</h2>
          <p className="text-center text-gray-500 text-[1.1rem] mb-16 max-w-[700px] mx-auto">The perfect alternative to Windows—especially for older computers that can&apos;t run Windows 11.</p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Linux Standard</h3>
              <p>Zorin OS Core edition installed and configured. We set up the desktop layout to match what you&apos;re used to from Windows, making the transition seamless.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Linux Premium</h3>
              <p>Zorin OS Pro edition with expanded layout options and premium desktop themes. More customization to make your computer truly yours.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Dual-Boot Setup</h3>
              <p>Want both Windows and Linux? We set up dual-boot so you can choose which operating system to use each time you start your computer.</p>
            </div>
          </div>

          <div className="mt-12 p-8 bg-primary-100 rounded-brand-lg border-l-4 border-primary-600">
            <h3 className="text-primary-800 mb-4">Why Zorin OS?</h3>
            <p className="text-gray-600 mb-0">Zorin OS is designed specifically for people switching from Windows. It looks and feels familiar from the moment you start using it. We customize the layout to match what you&apos;re comfortable with—whether that&apos;s a Windows 7, Windows 10, or even macOS-style desktop.</p>
          </div>
        </div>
      </ChevronSection>

      {/* Windows 11 Alternative Callout */}
      <ChevronSection topShape="v" bottomShape="v" className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 text-center relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Computer Too Old for Windows 11?</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Microsoft&apos;s strict hardware requirements leave many perfectly good computers behind. Linux breathes new life into older hardware—your computer could run faster than ever, with a modern, secure operating system that receives regular updates.</p>
          <Link href="/why-linux" className="cta-inverse">Learn More About Linux</Link>
        </div>
      </ChevronSection>

      {/* Why Fresh Install */}
      <ChevronSection topShape="v" bottomShape="v" className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-4">When Do You Need a Fresh Install?</h2>
          <p className="text-center text-gray-500 text-[1.1rem] mb-16 max-w-[700px] mx-auto">A clean operating system installation solves many common computer problems.</p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-12 mt-12">
            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">1</div>
              <div>
                <h4>Sluggish Performance</h4>
                <p>Years of software installs, updates, and accumulated files can bog down any computer. A fresh start eliminates the cruft.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">2</div>
              <div>
                <h4>Corrupted Windows</h4>
                <p>Blue screens, random crashes, or Windows that won&apos;t start properly? Sometimes a clean install is the only reliable fix.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">3</div>
              <div>
                <h4>Malware Damage</h4>
                <p>After a severe virus infection, a fresh install ensures no traces of malware remain hidden in your system.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">4</div>
              <div>
                <h4>Switching Operating Systems</h4>
                <p>Ready to try Linux? Moving from an old Windows version? We handle the transition smoothly.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">5</div>
              <div>
                <h4>New Hard Drive or SSD</h4>
                <p>Upgraded to a faster SSD? A fresh install takes full advantage of your new hardware&apos;s speed.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">6</div>
              <div>
                <h4>Selling or Donating</h4>
                <p>Passing your computer to someone else? A clean install wipes your personal data and gives them a fresh start.</p>
              </div>
            </div>
          </div>
        </div>
      </ChevronSection>

      {/* Note about data */}
      <ChevronSection topShape="v" bottomShape="v" className="py-20 bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 text-center">
          <h3>What About My Files?</h3>
          <p>A fresh install means starting over—your files won&apos;t be on the new system. Need your data transferred? Check out our <Link href="/services/data-services" className="text-primary-600 font-semibold hover:underline">Data Transfer Services</Link> to move your files to the fresh installation.</p>
        </div>
      </ChevronSection>

      {/* CTA */}
      <ChevronSection topShape="v" className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 text-center relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Ready for a Fresh Start?</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Bring in your computer and we&apos;ll have it running like new with a clean operating system.</p>
          <Link href="/contact" className="cta-inverse">Install My OS</Link>
        </div>
      </ChevronSection>
    </>
  );
}
