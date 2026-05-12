/**
 * DIAGNOSTICS SERVICE PAGE - Describes computer diagnostic services.
 *
 * WHEN TO EDIT: When updating the description, pricing, or details for this service.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronSection } from '@/components/static/ChevronSection';

export const metadata: Metadata = {
  title: 'Computer Diagnostics | Computer Store Kansas',
  description: 'Professional computer diagnostics in Topeka, KS. Flat fee to find out what\'s wrong. Hardware and software troubleshooting, usually same-day results.',
  openGraph: {
    title: 'Computer Diagnostics - Computer Store Kansas',
    description: 'Flat fee diagnostics. We find the problem and give you options.',
    url: 'https://computerstoreks.com/services/diagnostics',
  },
};

export default function DiagnosticsPage() {
  return (
    <>
      {/* Hero Section */}
      <ChevronSection bottomShape="v" className="hero-overlay text-white pt-32 pb-48 text-center relative overflow-visible z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80)' }}>
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[3]">
          <h2>Computer Diagnostics</h2>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] mb-0 max-w-[700px] mx-auto opacity-95">Something wrong? We&apos;ll figure it out.</p>
        </div>
      </ChevronSection>

      {/* Main Pricing */}
      <ChevronSection topShape="v" bottomShape="v" className="texture-circuit py-20 relative bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12">Flat Fee Diagnostics</h2>
          <p style={{ fontSize: '1.15rem', maxWidth: '800px', margin: '0 auto 2rem' }}>
            No guessing games, no hourly charges adding up while we poke around. For a flat fee, we&apos;ll
            thoroughly diagnose your computer and tell you exactly what&apos;s wrong.
          </p>

          <div className="mt-12 p-8 bg-primary-100 rounded-brand-lg border-l-4 border-primary-600">
            <h3 className="text-primary-800 mb-4">Diagnostic Fee Rolls Into Your Repair</h3>
            <p className="text-gray-600 mb-0">If you proceed with the repair, the diagnostic fee gets applied toward the cost of the repair—you&apos;re not paying twice. Small fixes that don&apos;t require parts are included in the diagnostic fee at no extra charge.</p>
          </div>
        </div>
      </ChevronSection>

      {/* What We Check */}
      <ChevronSection topShape="v" bottomShape="v" className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-4">Comprehensive Testing</h2>
          <p className="text-center text-gray-500 text-[1.1rem] mb-16 max-w-[700px] mx-auto">We check everything to find the root cause of your problem.</p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-12 mt-12">
            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">1</div>
              <div>
                <h4>Hardware Testing</h4>
                <p>RAM, hard drives, SSDs, CPU, GPU, power supply, motherboard—we test all the components to identify failures.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">2</div>
              <div>
                <h4>Software Troubleshooting</h4>
                <p>Operating system issues, driver conflicts, corrupted files, malware—we dig into the software side too.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">3</div>
              <div>
                <h4>Performance Analysis</h4>
                <p>Slow computer? We identify what&apos;s causing the bottleneck—whether it&apos;s hardware limitations, software bloat, or something else.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">4</div>
              <div>
                <h4>Boot Issues</h4>
                <p>Computer won&apos;t start? We determine if it&apos;s a drive failure, corrupted OS, hardware problem, or something else entirely.</p>
              </div>
            </div>
          </div>
        </div>
      </ChevronSection>

      {/* Common Problems */}
      <ChevronSection topShape="v" bottomShape="v" className="texture-dots py-20 bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12">Common Symptoms We Diagnose</h2>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Won&apos;t Turn On</h3>
              <p>No power at all? Lights come on but nothing happens? We&apos;ll find out if it&apos;s the power supply, motherboard, or something simpler.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Blue Screens &amp; Crashes</h3>
              <p>Random crashes and blue screens can be caused by failing RAM, overheating, driver issues, or dying drives. We pinpoint the culprit.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Slow Performance</h3>
              <p>Computer running like molasses? Could be a failing drive, insufficient RAM, malware, or just years of accumulated software bloat.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Strange Noises</h3>
              <p>Clicking, grinding, or loud fan noise? These sounds often indicate hardware problems that need attention before they get worse.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Overheating</h3>
              <p>Computer getting hot or shutting down unexpectedly? We check fans, thermal paste, airflow, and identify what&apos;s causing the heat.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Won&apos;t Boot Properly</h3>
              <p>Stuck on a loading screen? Boot loops? We determine if it&apos;s a software corruption issue or hardware failure.</p>
            </div>
          </div>
        </div>
      </ChevronSection>

      {/* The Process */}
      <ChevronSection topShape="v" bottomShape="v" className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-4">How It Works</h2>

          <div className="mt-8">
            <ul className="list-none p-0 m-0">
              <li className="py-3 pl-8 relative text-[1.05rem] border-b border-bg-dark last:border-b-0 feature-list-check">Drop off your computer and describe the problem</li>
              <li className="py-3 pl-8 relative text-[1.05rem] border-b border-bg-dark last:border-b-0 feature-list-check">We run comprehensive diagnostics (usually same day, 48 hours max)</li>
              <li className="py-3 pl-8 relative text-[1.05rem] border-b border-bg-dark last:border-b-0 feature-list-check">If it&apos;s a quick fix, we handle it—included in the diagnostic fee</li>
              <li className="py-3 pl-8 relative text-[1.05rem] border-b border-bg-dark last:border-b-0 feature-list-check">If it needs parts or significant repair, we contact you with options</li>
              <li className="py-3 pl-8 relative text-[1.05rem] border-b border-bg-dark last:border-b-0 feature-list-check">Proceed with repair? The diagnostic fee rolls into the repair cost</li>
              <li className="py-3 pl-8 relative text-[1.05rem] border-b border-bg-dark last:border-b-0 feature-list-check">You decide how to proceed—no work happens without your approval</li>
            </ul>
          </div>

          <div className="mt-12 p-8 bg-primary-100 rounded-brand-lg border-l-4 border-primary-600" style={{ marginTop: '3rem' }}>
            <h3 className="text-primary-800 mb-4">No Surprises</h3>
            <p className="text-gray-600 mb-0">We never proceed with repairs that cost extra without contacting you first. After diagnosis, we explain what&apos;s wrong, what your options are, and what each option costs. You make the call.</p>
          </div>
        </div>
      </ChevronSection>

      {/* Turnaround */}
      <ChevronSection topShape="v" bottomShape="v" className="py-20" style={{ background: 'var(--background-light)' }}>
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 text-center">
          <h3>Turnaround Time</h3>
          <p>Most diagnostics are completed the same day. During busy periods, expect results within 48 hours. We&apos;ll let you know when you drop off if we&apos;re running behind.</p>
        </div>
      </ChevronSection>

      {/* CTA */}
      <ChevronSection topShape="v" bottomShape="flat" className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 text-center relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Let&apos;s Find the Problem</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Bring in your computer and we&apos;ll get to the bottom of it.</p>
          <Link href="/contact" className="inline-block px-8 py-[0.8rem] rounded-brand-md no-underline font-semibold text-base transition-all duration-normal cursor-pointer border-none text-center whitespace-nowrap bg-white text-primary-600 shadow-brand-md hover:-translate-y-0.5 hover:shadow-brand-lg">Schedule a Diagnosis</Link>
        </div>
      </ChevronSection>
    </>
  );
}
