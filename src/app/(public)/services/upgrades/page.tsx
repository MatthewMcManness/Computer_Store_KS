/**
 * HARDWARE UPGRADES SERVICE PAGE - Describes hardware upgrade services.
 *
 * WHEN TO EDIT: When updating the description, pricing, or details for this service.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronSection } from '@/components/static/ChevronSection';

export const metadata: Metadata = {
  alternates: { canonical: '/services/upgrades' },
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
      <ChevronSection bottomShape="v" className="hero-overlay text-white pt-32 pb-48 text-center relative overflow-visible z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1920&q=80)' }}>
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[3]">
          <h1>Hardware Upgrades</h1>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] mb-0 max-w-[700px] mx-auto opacity-95">Breathe new life into your computer with the right upgrades.</p>
        </div>
      </ChevronSection>

      {/* Main Value Prop */}
      <ChevronSection topShape="v" bottomShape="v" className="texture-circuit py-20 relative bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12">Upgrade Instead of Replace</h2>
          <p style={{ fontSize: '1.15rem', maxWidth: '800px', margin: '0 auto 2rem' }}>
            A slow computer doesn&apos;t always need to be replaced. Often, a targeted upgrade can dramatically
            improve performance for a fraction of the cost of a new machine. We&apos;ll help you figure out
            what&apos;s worth upgrading—and what isn&apos;t.
          </p>

          <div className="mt-12 p-8 bg-primary-100 rounded-brand-lg border-l-4 border-primary-600">
            <h3 className="text-primary-800 mb-4">Bring Your Own Parts or Buy Through Us</h3>
            <p className="text-gray-600 mb-0">Already have the parts you want? Bring them in and we&apos;ll install them. Need help sourcing components? We can get what you need. Either way, we&apos;ll get your upgrade done right.</p>
          </div>
        </div>
      </ChevronSection>

      {/* Popular Upgrades */}
      <ChevronSection topShape="v" bottomShape="v" className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-4">Most Popular Upgrades</h2>
          <p className="text-center text-gray-500 text-[1.1rem] mb-16 max-w-[700px] mx-auto">These three upgrades deliver the biggest bang for your buck.</p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>SSD Upgrade</h3>
              <p className="inline-block bg-primary-100 text-primary-800 px-4 py-[0.4rem] rounded-brand-sm font-bold text-[1.1rem] mb-4">Biggest Impact</p>
              <p>Replacing an old hard drive with a solid-state drive is the single most noticeable upgrade you can make. Boot times drop from minutes to seconds. Programs open instantly. Everything feels faster.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>RAM Upgrade</h3>
              <p className="inline-block bg-primary-100 text-primary-800 px-4 py-[0.4rem] rounded-brand-sm font-bold text-[1.1rem] mb-4">Multitasking Power</p>
              <p>Running out of memory slows everything down. More RAM means you can run more programs simultaneously without your computer grinding to a halt.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Graphics Card</h3>
              <p className="inline-block bg-primary-100 text-primary-800 px-4 py-[0.4rem] rounded-brand-sm font-bold text-[1.1rem] mb-4">Gaming & Creative</p>
              <p>For gaming, video editing, or 3D work, a graphics card upgrade can transform your experience. Play newer games, render faster, and handle demanding visual tasks.</p>
            </div>
          </div>
        </div>
      </ChevronSection>

      {/* All Upgrades */}
      <ChevronSection topShape="v" bottomShape="v" className="texture-dots py-20 bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12">What We Upgrade</h2>
          <p className="text-center" style={{ maxWidth: '700px', margin: '0 auto 3rem' }}>
            We handle all common hardware upgrades for desktops—and the upgrades that are possible on laptops.
          </p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-12 mt-12">
            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">1</div>
              <div>
                <h4>Storage Drives</h4>
                <p>SSD upgrades, additional storage drives, or replacing failing hard drives. We can also clone your existing drive so you don&apos;t lose anything.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">2</div>
              <div>
                <h4>Memory (RAM)</h4>
                <p>Add more RAM or replace existing memory with faster modules. We&apos;ll check what your system supports and recommend the right upgrade.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">3</div>
              <div>
                <h4>Graphics Cards</h4>
                <p>Install a new GPU for gaming, creative work, or multiple monitor setups. We&apos;ll make sure your power supply can handle it.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">4</div>
              <div>
                <h4>Processors (CPU)</h4>
                <p>Upgrade to a faster processor if your motherboard supports it. We&apos;ll advise on compatibility and whether it&apos;s worth the investment.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">5</div>
              <div>
                <h4>Power Supplies</h4>
                <p>A better power supply supports more powerful components and improves system stability. Essential for major upgrades like high-end graphics cards.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">6</div>
              <div>
                <h4>Cooling &amp; Fans</h4>
                <p>Better cooling means better performance and longer component life. Upgrade case fans, CPU coolers, or add additional cooling.</p>
              </div>
            </div>
          </div>
        </div>
      </ChevronSection>

      {/* Laptop Upgrades */}
      <ChevronSection topShape="v" bottomShape="v" className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-4">Laptop Upgrades</h2>
          <p className="text-center text-gray-500 text-[1.1rem] mb-16 max-w-[700px] mx-auto">Laptops have limited upgrade options, but the ones available can still make a big difference.</p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>RAM Upgrades</h3>
              <p>Many laptops allow RAM upgrades (though some have soldered memory). We&apos;ll check if your laptop can be upgraded and install compatible memory.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>SSD Upgrades</h3>
              <p>Replacing a laptop hard drive with an SSD is transformative. Your laptop will boot faster, run cooler, and feel years newer.</p>
            </div>
          </div>

          <div className="mt-12 p-8 bg-primary-100 rounded-brand-lg border-l-4 border-primary-600" style={{ marginTop: '2rem' }}>
            <h3 className="text-primary-800 mb-4">Not Sure If Your Laptop Can Be Upgraded?</h3>
            <p className="text-gray-600 mb-0">Bring it in and we&apos;ll take a look. We&apos;ll tell you what&apos;s upgradeable and what would make the most difference for how you use it.</p>
          </div>
        </div>
      </ChevronSection>

      {/* Expert Advice */}
      <ChevronSection topShape="v" bottomShape="v" className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 text-center relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Honest Advice</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Not every computer is worth upgrading. Sometimes the money is better spent on a new machine. We&apos;ll give you our honest assessment—what upgrades make sense, what your system can support, and whether upgrading is the right choice for your situation.</p>
        </div>
      </ChevronSection>

      {/* Pricing */}
      <ChevronSection topShape="v" bottomShape="v" className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-4">Pricing</h2>

          <div className="mt-8">
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
      </ChevronSection>

      {/* CTA */}
      <ChevronSection topShape="v" bottomShape="flat" className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 text-center relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Ready to Upgrade?</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Bring in your computer and let&apos;s talk about what upgrades would make the biggest difference for you.</p>
          <Link href="/contact" className="cta-inverse">Upgrade My Computer</Link>
        </div>
      </ChevronSection>
    </>
  );
}
