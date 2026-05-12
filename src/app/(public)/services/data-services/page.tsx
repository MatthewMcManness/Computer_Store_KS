/**
 * DATA SERVICES PAGE - Describes data transfer and cloning services.
 *
 * WHEN TO EDIT: When updating the description, pricing, or details for this service.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronSection } from '@/components/static/ChevronSection';

export const metadata: Metadata = {
  title: 'Data Transfer & Drive Cloning Services | Computer Store Kansas',
  description: 'Professional data transfer and drive cloning services in Topeka, KS. PC-to-PC transfers, drive clones, and data recovery from failing drives.',
  openGraph: {
    title: 'Data Transfer & Drive Cloning - Computer Store Kansas',
    description: 'Professional data transfer and drive cloning services. We restore your files exactly where they belong.',
    url: 'https://computerstoreks.com/services/data-services',
  },
};

export default function DataServicesPage() {
  return (
    <>
      {/* Hero Section */}
      <ChevronSection bottomShape="v" className="hero-overlay text-white pt-32 pb-48 text-center relative overflow-visible z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&q=80)' }}>
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[3]">
          <h2>Data Transfer &amp; Drive Cloning</h2>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] mb-0 max-w-[700px] mx-auto opacity-95">Your files, restored exactly where they belong.</p>
        </div>
      </ChevronSection>

      {/* Main Content */}
      <ChevronSection topShape="v" bottomShape="v" className="texture-circuit py-20 relative bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12">Our Data Services</h2>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Data Transfers</h3>
              <p>Moving to a new computer? We transfer your files from your old PC to your new one, or from an old drive to a new drive. No data left behind.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Drive Cloning</h3>
              <p>An exact copy of your entire drive—operating system, programs, settings, and all your files. Perfect for upgrading to a faster SSD without reinstalling everything.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Data Recovery</h3>
              <p>Have a failing drive? We attempt to recover your precious files before it&apos;s too late. If we can&apos;t recover your data, you don&apos;t pay a thing.</p>
            </div>
          </div>
        </div>
      </ChevronSection>

      {/* What Sets Us Apart */}
      <ChevronSection topShape="v" bottomShape="v" className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-4">Not Just a Data Dump</h2>
          <p className="text-center text-gray-500 text-[1.1rem] mb-16 max-w-[700px] mx-auto">Other shops might copy your files into a single folder on your desktop and call it done. We do things differently.</p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-12 mt-12">
            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">1</div>
              <div>
                <h4>Organized Restoration</h4>
                <p>Your documents go back in Documents. Pictures go in Pictures. Music in Music. Everything exactly where it should be.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">2</div>
              <div>
                <h4>Browser Data Preserved</h4>
                <p>We restore your bookmarks, favorites, and saved passwords so you can pick up right where you left off.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">3</div>
              <div>
                <h4>Secure Handling</h4>
                <p>Your data is handled with care and confidentiality. We treat your files like they&apos;re our own.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">4</div>
              <div>
                <h4>No-Risk Recovery</h4>
                <p>Attempting recovery from a failing drive? If we can&apos;t get your data back, you owe us nothing.</p>
              </div>
            </div>
          </div>
        </div>
      </ChevronSection>

      {/* Who Needs This */}
      <ChevronSection topShape="v" bottomShape="v" className="texture-dots py-20 bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12">Who Benefits from Data Services?</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Upgrading Your Computer</h3>
              <p>Got a new PC? We&apos;ll move everything from your old machine so your new computer feels like home from day one.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Business Migrations</h3>
              <p>Transitioning your business to new hardware? We handle bulk transfers efficiently while keeping your workflow intact.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Failing Hard Drives</h3>
              <p>Hearing clicking sounds? Computer running slow? Don&apos;t wait until it&apos;s too late—let us rescue your data before the drive fails completely.</p>
            </div>
          </div>
        </div>
      </ChevronSection>

      {/* Turnaround Note */}
      <ChevronSection topShape="v" bottomShape="v" className="py-20" style={{ background: 'var(--background-light)' }}>
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 text-center">
          <h3>Turnaround Time</h3>
          <p>Completion time depends on the size and speed of your drives. Older, slower drives naturally take longer to transfer. We&apos;ll give you an estimate when you drop off your equipment.</p>
        </div>
      </ChevronSection>

      {/* CTA */}
      <ChevronSection topShape="v" className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 text-center relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Ready to Transfer Your Data?</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Bring in your old and new devices, or just the drives. We&apos;ll take it from there.</p>
          <Link href="/contact" className="inline-block px-8 py-[0.8rem] rounded-brand-md no-underline font-semibold text-base transition-all duration-normal cursor-pointer border-none text-center whitespace-nowrap bg-white text-primary-600 shadow-brand-md hover:-translate-y-0.5 hover:shadow-brand-lg">Transfer My Data</Link>
        </div>
      </ChevronSection>
    </>
  );
}
