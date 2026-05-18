/**
 * FREE RECYCLING PAGE - Describes the free electronics recycling service.
 *
 * WHEN TO EDIT: When updating the description, pricing, or details for this service.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronSection } from '@/components/static/ChevronSection';

export const metadata: Metadata = {
  title: 'Free Electronics Recycling | Computer Store Kansas',
  description: 'Free electronics recycling in Topeka, KS. Drop off old computers, TVs, radios, consoles, and more. Data destruction guaranteed. Responsible e-waste disposal.',
  openGraph: {
    title: 'Free Electronics Recycling - Computer Store Kansas',
    description: 'Drop off your old electronics for free, responsible recycling. From vintage radios to modern computers—we accept it all with guaranteed data destruction.',
    url: 'https://computerstoreks.com/services/recycling',
  },
};

export default function RecyclingPage() {
  return (
    <>
      {/* Hero Section */}
      <ChevronSection bottomShape="v" className="hero-overlay text-white pt-32 pb-48 text-center relative overflow-visible z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1920&q=80)' }}>
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[3]">
          <h1>Free Electronics Recycling</h1>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] mb-0 max-w-[700px] mx-auto opacity-95">Responsible disposal for all your old electronics—at no cost to you.</p>
        </div>
      </ChevronSection>

      {/* Main Content */}
      <ChevronSection topShape="v" bottomShape="v" className="texture-circuit py-20 relative bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12">What We Accept</h2>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Computers &amp; Laptops</h3>
              <p>Desktop PCs, laptops, servers, tablets—any computing device regardless of age or condition. Working or not, we&apos;ll take it.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>TVs &amp; Monitors</h3>
              <p>CRT televisions, flat screens, computer monitors of all types. Even that heavy old tube TV you&apos;ve been meaning to get rid of.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Audio &amp; Video Equipment</h3>
              <p>Radios, stereos, VCRs, DVD players, speakers, amplifiers, and home theater equipment from any era.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Gaming Consoles</h3>
              <p>From Atari to PlayStation, NES to Xbox—any gaming console or handheld device, working or broken.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Vintage Electronics</h3>
              <p>Morse code devices, ham radios, old telephones, calculators, typewriters—if it has circuits, we&apos;ll recycle it.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Peripherals &amp; Components</h3>
              <p>Keyboards, mice, printers, cables, power supplies, hard drives, and any other computer parts or accessories.</p>
            </div>
          </div>
        </div>
      </ChevronSection>

      {/* Data Security Section */}
      <ChevronSection topShape="v" bottomShape="v" className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-4">Your Data Is Safe With Us</h2>
          <p className="text-center text-gray-500 text-[1.1rem] mb-16 max-w-[700px] mx-auto">When you drop off electronics that stored your personal information, we guarantee complete data destruction.</p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-12 mt-12">
            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">1</div>
              <div>
                <h4>Hard Drive Destruction</h4>
                <p>All hard drives and storage devices are physically destroyed or securely wiped using industry-standard methods.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">2</div>
              <div>
                <h4>No Data Recovery Possible</h4>
                <p>Once we process your device, your data cannot be recovered by anyone—guaranteed.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">3</div>
              <div>
                <h4>Peace of Mind</h4>
                <p>You don&apos;t need to worry about identity theft or personal information ending up in the wrong hands.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">4</div>
              <div>
                <h4>Responsible Disposal</h4>
                <p>Electronics are recycled through proper channels—not dumped in landfills where they can leak toxic materials.</p>
              </div>
            </div>
          </div>
        </div>
      </ChevronSection>

      {/* Why Recycle Section */}
      <ChevronSection topShape="v" bottomShape="v" className="texture-dots py-20 bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12">Why Recycle Electronics?</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Protect the Environment</h3>
              <p>Electronics contain lead, mercury, and other hazardous materials. Proper recycling keeps these toxins out of our soil and water.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Recover Valuable Materials</h3>
              <p>Gold, silver, copper, and rare earth elements in electronics can be recovered and reused, reducing the need for mining.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Keep It Out of Landfills</h3>
              <p>E-waste is the fastest-growing waste stream. Recycling helps reduce the millions of tons dumped each year.</p>
            </div>
          </div>
        </div>
      </ChevronSection>

      {/* How It Works */}
      <ChevronSection topShape="v" bottomShape="v" className="py-20 bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 text-center">
          <h3>How It Works</h3>
          <p>Simply bring your old electronics to our store during business hours. No appointment needed, no forms to fill out, no cost to you. Just drop it off and we&apos;ll handle the rest responsibly.</p>
        </div>
      </ChevronSection>

      {/* CTA */}
      <ChevronSection topShape="v" bottomShape="flat" className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 text-center relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Ready to Recycle?</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Bring in your old electronics anytime we&apos;re open. It&apos;s free, it&apos;s easy, and it&apos;s the right thing to do.</p>
          <Link href="/contact" className="cta-inverse">Get Directions</Link>
        </div>
      </ChevronSection>
    </>
  );
}
