/**
 * REFURBISHED DESKTOPS PAGE - Describes refurbished desktop computers for sale.
 *
 * WHEN TO EDIT: When updating the description, pricing, or details for this service.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronSection } from '@/components/static/ChevronSection';

export const metadata: Metadata = {
  title: 'Refurbished Desktop Computers | Computer Store Kansas',
  description: 'Quality refurbished desktop computers in Topeka, KS. Thoroughly tested, professionally refurbished, and priced for any budget. Great for home, office, or gaming.',
  openGraph: {
    title: 'Refurbished Desktops - Computer Store Kansas',
    description: 'Quality desktop computers at budget-friendly prices. Stress-tested and ready to work.',
    url: 'https://computerstoreks.com/services/desktops',
  },
};

export default function DesktopsPage() {
  return (
    <>
      {/* Hero Section */}
      <ChevronSection bottomShape="v" className="hero-overlay text-white pt-32 pb-48 text-center relative overflow-visible z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1920&q=80)' }}>
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[3]">
          <h2>Refurbished Desktops</h2>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] mb-0 max-w-[700px] mx-auto opacity-95">Reliable computers at budget-friendly prices.</p>
        </div>
      </ChevronSection>

      {/* Main Value Prop */}
      <ChevronSection topShape="v" bottomShape="v" className="texture-circuit py-20 relative bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12">Quality Without the Price Tag</h2>
          <p style={{ fontSize: '1.15rem', maxWidth: '800px', margin: '0 auto 2rem' }}>
            Not everyone needs a brand-new computer. Our refurbished desktops offer excellent performance
            at a fraction of the cost—perfect for home use, office work, or even budget gaming builds.
          </p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Wide Selection</h3>
              <p>From compact small form factor machines to full towers, we stock a variety of desktop styles to fit your space and needs.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Thoroughly Tested</h3>
              <p>Every desktop undergoes intensive stress testing. Components that fail or show signs of wear are replaced before sale.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Ready to Use</h3>
              <p>Fresh operating system installed, updates applied, and set up for you. Take it home and start using it right away.</p>
            </div>
          </div>
        </div>
      </ChevronSection>

      {/* Refurbishment Process */}
      <ChevronSection topShape="v" bottomShape="v" className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-4">Our Refurbishment Process</h2>
          <p className="text-center text-gray-500 text-[1.1rem] mb-16 max-w-[700px] mx-auto">Every desktop we sell goes through the same rigorous process.</p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-12 mt-12">
            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">1</div>
              <div>
                <h4>Sourcing</h4>
                <p>We acquire desktops from corporate lease returns, trade-ins, and business upgrades—machines that were well-maintained and have plenty of life left.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">2</div>
              <div>
                <h4>Inspection</h4>
                <p>Full inspection of every component—case, motherboard, drives, RAM, ports, and power supply. We check everything.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">3</div>
              <div>
                <h4>Stress Testing</h4>
                <p>Intensive testing pushes the hardware to its limits, revealing any components that are failing or close to failure.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">4</div>
              <div>
                <h4>Repair &amp; Upgrade</h4>
                <p>Failed or suspect parts are replaced. Many units receive upgraded storage, additional RAM, or other improvements.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">5</div>
              <div>
                <h4>Fresh Install</h4>
                <p>A clean operating system installation wipes any previous data and ensures optimal performance.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">6</div>
              <div>
                <h4>Final Testing</h4>
                <p>One more round of testing confirms everything works perfectly before it goes on the floor.</p>
              </div>
            </div>
          </div>
        </div>
      </ChevronSection>

      {/* Warranty */}
      <ChevronSection topShape="v" bottomShape="v" className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-dark) 100%)' }}>
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Our Warranty</h2>
          <div className="bg-white/10 rounded-brand-lg p-8 mx-auto my-8 max-w-[500px]">
            <p className="text-white mb-3 text-[1.1rem]"><strong>Parts Warranty:</strong> 3 months</p>
            <p className="text-white mb-3 text-[1.1rem]"><strong>Free Diagnostics:</strong> 6 months</p>
            <p className="text-white mb-3 text-[1.1rem] mt-6 pt-4 border-t border-white/20 font-semibold">We stand behind every machine we sell. If something goes wrong, we&apos;ll take care of it.</p>
          </div>
        </div>
      </ChevronSection>

      {/* Who Benefits */}
      <ChevronSection topShape="v" bottomShape="v" className="texture-dots py-20 bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12">Who Buys Refurbished?</h2>
          <p className="text-center" style={{ maxWidth: '700px', margin: '0 auto 3rem' }}>
            Smart shoppers who want quality without overpaying.
          </p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Home Users</h3>
              <p>A reliable desktop for web browsing, email, streaming, and everyday tasks—without spending hundreds more than necessary.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Budget Businesses</h3>
              <p>Outfit your office with dependable workstations at a fraction of the cost. We can handle bulk orders for multiple machines.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Schools &amp; Organizations</h3>
              <p>Stretch your budget further with reliable machines for computer labs, libraries, or staff workstations.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Budget Gamers</h3>
              <p>A refurbished desktop makes an excellent foundation for a budget gaming rig. Add a graphics card and you&apos;re ready to play.</p>
            </div>
          </div>
        </div>
      </ChevronSection>

      {/* Gaming Tip */}
      <ChevronSection topShape="v" bottomShape="v" className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <div className="mt-12 p-8 bg-primary-100 rounded-brand-lg border-l-4 border-primary-600">
            <h3 className="text-primary-800 mb-4">Budget Gaming Tip</h3>
            <p className="text-gray-600 mb-0">Looking for an affordable gaming setup? Start with a refurbished desktop that has a decent processor and plenty of RAM, then add a graphics card. You can build a capable gaming machine for a fraction of what a new gaming PC would cost. Ask us which desktops make good gaming candidates.</p>
          </div>
        </div>
      </ChevronSection>

      {/* Custom Build CTA */}
      <ChevronSection topShape="v" bottomShape="v" className="py-20" style={{ background: 'var(--background-light)' }}>
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 text-center">
          <h3>Want Something New?</h3>
          <p>If you&apos;re looking for a brand-new desktop built to your exact specifications, check out our <Link href="/services/custom-computers" style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>Custom-Built Computers</Link> service.</p>
        </div>
      </ChevronSection>

      {/* CTA */}
      <ChevronSection topShape="v" bottomShape="flat" className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 text-center relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">See What&apos;s In Stock</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Our inventory changes regularly. Stop by to see our current selection of refurbished desktops.</p>
          <Link href="/contact" className="inline-block px-8 py-[0.8rem] rounded-brand-md no-underline font-semibold text-base transition-all duration-normal cursor-pointer border-none text-center whitespace-nowrap bg-white text-primary-600 shadow-brand-md hover:-translate-y-0.5 hover:shadow-brand-lg">Browse Desktops Today</Link>
        </div>
      </ChevronSection>
    </>
  );
}
