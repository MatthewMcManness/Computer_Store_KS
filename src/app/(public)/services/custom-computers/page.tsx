/**
 * CUSTOM COMPUTERS SERVICE PAGE - Describes custom-built PC services.
 *
 * WHEN TO EDIT: When updating the description, pricing, or details for this service.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronSection } from '@/components/static/ChevronSection';

export const metadata: Metadata = {
  alternates: { canonical: '/services/custom-computers' },
  title: 'Custom-Built Computers | Computer Store Kansas',
  description: 'Custom-built PCs in Topeka, KS. Gaming rigs, workstations, home offices, servers, and more. Expert consultation, quality parts, and professional assembly.',
  openGraph: {
    title: 'Custom-Built Computers - Computer Store Kansas',
    description: 'Your vision, expertly built. Custom PCs for gaming, work, or anything in between.',
    url: 'https://computerstoreks.com/services/custom-computers',
  },
};

export default function CustomComputersPage() {
  return (
    <>
      {/* Hero Section */}
      <ChevronSection topShape="flat" bottomShape="v" className="hero-overlay text-white pt-32 pb-48 text-center relative overflow-visible z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1920&q=80)' }}>
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[3]">
          <h1>Custom-Built Computers</h1>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] mb-0 max-w-[700px] mx-auto opacity-95">Your vision, expertly built. From gaming rigs to business servers.</p>
        </div>
      </ChevronSection>

      {/* Main Value Prop */}
      <ChevronSection topShape="v" bottomShape="v" className="texture-circuit py-20 relative bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12">Why Go Custom?</h2>
          <p style={{ fontSize: '1.15rem', maxWidth: '800px', margin: '0 auto 2rem' }}>
            Pre-built computers from big box stores cut corners you can&apos;t see—cheap power supplies, poor airflow,
            no-name components, and bloatware galore. A custom build means every part is chosen for quality,
            performance, and your specific needs.
          </p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Quality Components</h3>
              <p>We use trusted brands and quality parts—no mystery components or corners cut. Every piece is selected for reliability and performance.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Clean Cable Management</h3>
              <p>More than just looks—proper cable management improves airflow and makes future upgrades easier. Your build will look as good inside as it performs.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>No Bloatware</h3>
              <p>Your new computer comes with a clean Windows installation. No trial software, no adware, no junk—just a ready-to-use system.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Thoroughly Tested</h3>
              <p>Every build undergoes stress testing before you pick it up. We catch any issues before they become your problem.</p>
            </div>
          </div>
        </div>
      </ChevronSection>

      {/* What We Build */}
      <ChevronSection topShape="v" bottomShape="v" className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-4">We Build It All</h2>
          <p className="text-center text-gray-500 text-[1.1rem] mb-16 max-w-[700px] mx-auto">Whatever you need a computer for, we can build it.</p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-12 mt-12">
            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">1</div>
              <div>
                <h4>Gaming PCs</h4>
                <p>From competitive esports machines to high-end 4K gaming rigs. Tell us what games you play and we&apos;ll build accordingly.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">2</div>
              <div>
                <h4>Workstations</h4>
                <p>Video editing, 3D rendering, CAD, music production—we build powerful workstations optimized for creative and professional software.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">3</div>
              <div>
                <h4>Home &amp; Office</h4>
                <p>Reliable everyday computers for web browsing, documents, email, and general productivity. Built to last without breaking the budget.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">4</div>
              <div>
                <h4>Budget Builds</h4>
                <p>Need performance on a tight budget? We know how to maximize value and get the most out of every dollar.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">5</div>
              <div>
                <h4>Servers</h4>
                <p>Business servers, home labs, NAS builds—we handle the hardware side for whatever server solution you need.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">6</div>
              <div>
                <h4>Business Bulk Builds</h4>
                <p>Outfitting an entire office? We handle bulk builds for businesses—consistent quality across every machine.</p>
              </div>
            </div>
          </div>
        </div>
      </ChevronSection>

      {/* Our Process */}
      <ChevronSection topShape="v" bottomShape="v" className="texture-dots py-20 bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12">Our Process</h2>
          <p className="text-center" style={{ maxWidth: '700px', margin: '0 auto 3rem' }}>
            We meet you where you are. Whether you&apos;re an expert who knows exactly what you want,
            or you just know what you want to <em>do</em> with the computer—we&apos;ve got you covered.
          </p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>For the Experts</h3>
              <p>Know your specs? Give us your parts list and we&apos;ll source, build, and test it. You get exactly what you want, professionally assembled.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>For Everyone Else</h3>
              <p>Tell us what you want to use the computer for—gaming, work, video editing, whatever. We&apos;ll recommend parts that match your needs and budget.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Your Priorities</h3>
              <p>Want top-tier performance? Maximum value? Whisper-quiet operation? A specific budget? We plan and build according to what matters most to you.</p>
            </div>
          </div>
        </div>
      </ChevronSection>

      {/* Pricing */}
      <ChevronSection topShape="v" bottomShape="v" className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 text-center relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Transparent Pricing</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">You pay for the parts plus a flat build labor fee. Windows installation and testing included. No hidden charges, no surprises—contact us for a quote based on your build.</p>
        </div>
      </ChevronSection>

      {/* What's Included */}
      <ChevronSection topShape="v" bottomShape="v" className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-4">What&apos;s Included</h2>

          <div className="mt-8">
            <ul className="list-none p-0 m-0">
              <li className="py-3 pl-8 relative text-[1.05rem] border-b border-bg-dark last:border-b-0 feature-list-check">Expert consultation to plan your build</li>
              <li className="py-3 pl-8 relative text-[1.05rem] border-b border-bg-dark last:border-b-0 feature-list-check">Quality parts sourced from trusted suppliers</li>
              <li className="py-3 pl-8 relative text-[1.05rem] border-b border-bg-dark last:border-b-0 feature-list-check">Professional assembly with clean cable management</li>
              <li className="py-3 pl-8 relative text-[1.05rem] border-b border-bg-dark last:border-b-0 feature-list-check">Windows installation (license included)</li>
              <li className="py-3 pl-8 relative text-[1.05rem] border-b border-bg-dark last:border-b-0 feature-list-check">Comprehensive stress testing before delivery</li>
              <li className="py-3 pl-8 relative text-[1.05rem] border-b border-bg-dark last:border-b-0 feature-list-check">1-year manufacturer warranty on all parts</li>
              <li className="py-3 pl-8 relative text-[1.05rem] border-b border-bg-dark last:border-b-0 feature-list-check">Free lifetime diagnostics on your build</li>
            </ul>
          </div>

          <div className="mt-12 p-8 bg-primary-100 rounded-brand-lg border-l-4 border-primary-600" style={{ marginTop: '3rem' }}>
            <h3 className="text-primary-800 mb-4">Free Lifetime Diagnostics</h3>
            <p className="text-gray-600 mb-0">Every computer we build comes with free diagnostic service for life. If something seems off down the road, bring it in and we&apos;ll check it out at no charge. We stand behind our builds.</p>
          </div>
        </div>
      </ChevronSection>

      {/* CTA */}
      <ChevronSection topShape="v" bottomShape="flat" className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 text-center relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Ready to Build Your Dream Machine?</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Let&apos;s talk about what you need. Whether you have a detailed spec list or just a general idea, we&apos;ll help you get there.</p>
          <Link href="/contact" className="cta-inverse">Start Your Build</Link>
        </div>
      </ChevronSection>
    </>
  );
}
