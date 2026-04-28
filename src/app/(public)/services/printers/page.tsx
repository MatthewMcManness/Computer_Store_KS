/**
 * PRINTERS SERVICE PAGE - Describes printer sales (Brother brand) and repair services.
 *
 * WHEN TO EDIT: When updating the description, pricing, or details for this service.
 */
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Printer Sales & Repair | Computer Store Kansas',
  description: 'New Brother printer sales and printer repair in Topeka, KS. We sell Brother printers exclusively and repair Brother and other brands. $50 in-home setup with purchase.',
  openGraph: {
    title: 'Printer Sales & Repair - Computer Store Kansas',
    description: 'Brother printer sales plus printer repair for all brands. $50 in-home setup with any new Brother printer purchase.',
    url: 'https://computerstoreks.com/services/printers',
  },
};

export default function PrintersPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-overlay hero-clip text-white pt-32 pb-48 text-center relative overflow-visible z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1650094980833-7373de26feb6?w=1920&q=80)' }}>
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[3]">
          <h2>Printers</h2>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] mb-0 max-w-[700px] mx-auto opacity-95">Now selling and repairing printers—Brother brand sales, all-brand repair.</p>
        </div>
      </section>

      {/* Announcement / Value Prop */}
      <section className="texture-circuit hero-next-section -mt-20 pb-20 pt-32 relative z-[1] bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12">We&apos;ve Started Selling &amp; Repairing Printers</h2>
          <p style={{ fontSize: '1.15rem', maxWidth: '800px', margin: '0 auto 2rem' }}>
            Printers are now part of what we do. We sell <strong>Brother</strong> printers exclusively—chosen for their
            premium reliability and easy serviceability—and repair printers from any brand when they break down.
          </p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Brother Sales</h3>
              <p>New Brother printers in stock and available to order. Inkjet, laser, single-function, and all-in-one models for home and small business.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>All-Brand Repair</h3>
              <p>Bring us any printer that&apos;s acting up—Brother, HP, Canon, Epson, or anything else. We diagnose the issue and tell you whether it&apos;s worth fixing.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Honest Advice</h3>
              <p>Sometimes a new printer is cheaper than the repair. We&apos;ll tell you straight—no upselling, no pressure. You decide what makes sense.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured $50 Offer */}
      <section className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-4">Buy a Printer, Get $50 In-Home Setup</h2>
          <p className="text-center text-gray-500 text-[1.1rem] mb-16 max-w-[700px] mx-auto">A featured offer for new Brother printer customers.</p>

          <div className="mt-12 p-8 bg-primary-100 rounded-brand-lg border-l-4 border-primary-600">
            <h3 className="text-primary-800 mb-4">$50 In-Home Setup with Any New Brother Printer</h3>
            <p className="text-gray-600 mb-3">
              Purchase a Brother printer from us and we&apos;ll come to your home to install it for just <strong>$50</strong>—half off our
              standard <strong>$100</strong> house call rate. We unbox, connect, configure, and test it on your network so it&apos;s working
              before we leave.
            </p>
            <p className="text-gray-600 mb-0">
              Includes driver installation on one computer, Wi-Fi setup, and a quick walkthrough of the features you&apos;ll actually use.
            </p>
          </div>
        </div>
      </section>

      {/* Why Brother */}
      <section className="texture-dots py-20 bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12">Why We Sell Brother Exclusively</h2>
          <p className="text-center" style={{ maxWidth: '700px', margin: '0 auto 3rem' }}>
            We picked one brand and stuck with it for a reason. Brother printers are the ones we&apos;d buy for ourselves.
          </p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Premium Reliability</h3>
              <p>Brother printers run for years without the constant errors, paper jams, and random refusals to print that plague cheaper printers from other brands.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Easy to Service</h3>
              <p>When a Brother does need work, parts are available and the design is sensible. That keeps repair costs reasonable instead of forcing a replacement.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Honest Toner &amp; Ink</h3>
              <p>No aggressive lockouts on third-party cartridges, no firmware games to force expensive supplies. You get to use what you want without fighting the printer.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Models for Every Need</h3>
              <p>From compact home printers to high-volume small-business workhorses. We&apos;ll help you pick the right one for what you actually print.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Repair */}
      <section className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-4">Printer Repair</h2>
          <p className="text-center text-gray-500 text-[1.1rem] mb-16 max-w-[700px] mx-auto">Brother, HP, Canon, Epson—if it prints, we&apos;ll take a look.</p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Paper Jams &amp; Feed Issues</h3>
              <p>Recurring jams, multi-page pickups, and crooked feeds are usually fixable—worn rollers, debris, or sensor problems. We diagnose and replace parts as needed.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Print Quality Problems</h3>
              <p>Streaks, faded prints, lines, or color issues. Could be heads, drums, fusers, or supplies—we&apos;ll figure out what&apos;s actually wrong.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Connectivity &amp; Drivers</h3>
              <p>Won&apos;t connect to Wi-Fi? Computer can&apos;t see it? Driver errors? Often a software fix rather than a hardware repair.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Won&apos;t Power On</h3>
              <p>Dead printer? We&apos;ll determine whether it&apos;s a power supply, board, or something simpler—and tell you honestly if it&apos;s worth fixing.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Error Codes &amp; Lockouts</h3>
              <p>Cryptic error messages, stuck status lights, or printers refusing to recognize supplies. We work through the diagnostics so you don&apos;t have to.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Replace or Repair?</h3>
              <p>If a repair would cost more than a new printer is worth, we&apos;ll say so. We&apos;d rather you spend that money on a Brother that&apos;ll last.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 text-center relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Need a Printer or a Repair?</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Stop in to see our Brother selection or bring in a printer that needs work. We&apos;ll take care of it.</p>
          <Link href="/contact" className="inline-block px-8 py-[0.8rem] rounded-brand-md no-underline font-semibold text-base transition-all duration-normal cursor-pointer border-none text-center whitespace-nowrap bg-white text-primary-600 shadow-brand-md hover:-translate-y-0.5 hover:shadow-brand-lg">Get In Touch</Link>
        </div>
      </section>
    </>
  );
}
