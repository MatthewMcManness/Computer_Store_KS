/**
 * COMPUTERS PAGE - Showcases the three types of computers the store sells/builds:
 * Laptops, Business PCs, and Gaming PCs. Each section alternates the image/text layout.
 *
 * WHEN TO EDIT: When updating computer product offerings or marketing copy.
 */
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronSection } from '@/components/static/ChevronSection';

export const metadata: Metadata = {
  title: 'Computers for Sale - Laptops, Business PCs & Gaming Rigs',
  description:
    'Shop new and refurbished laptops, business desktops, and custom-built gaming PCs in Topeka, KS. Built and tested by local experts at Computer Store Kansas.',
  openGraph: {
    title: 'Computers for Sale - Computer Store Kansas',
    description:
      'Laptops, business PCs, and custom gaming rigs built by local experts in Topeka, KS.',
    url: 'https://computerstoreks.com/computers',
  },
};

/**
 * Computers page displaying laptop, business PC, and gaming PC sections.
 *
 * Each section alternates layout direction (text/image, image/text, text/image)
 * and includes a CTA button linking to the contact page.
 *
 * @returns {JSX.Element} Computers showcase page
 *
 * @called_by PublicLayout (via routing)
 *
 * @version 1.0.0 - 2026-04-06T00:00:00Z - Initial implementation
 */
export default function ComputersPage() {
  return (
    <>
      {/* Hero Section */}
      <ChevronSection bottomShape="v" className="hero-overlay text-white pt-32 pb-48 text-center relative overflow-visible z-0 bg-gray-900">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[3]">
          <h2 className="text-white text-[clamp(2rem,4vw,3rem)] mb-6 font-bold">
            Computers for Sale
          </h2>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] mb-0 max-w-[700px] mx-auto opacity-95">
            New, refurbished, and custom-built — find the right machine for your needs.
          </p>
        </div>
      </ChevronSection>

      {/* Section 1: Laptops — text left, image right */}
      <ChevronSection topShape="v" bottomShape="v" className="texture-dots bg-gradient-to-br from-[#e8f0fe] to-[#d6e4fd] py-20 relative">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">
                Laptops
              </span>
              <h2 className="text-gray-900 text-[clamp(1.8rem,3vw,2.5rem)] font-bold mt-2 mb-6">
                Portable Performance for Every Journey
              </h2>
              <p className="text-gray-700 text-[1.05rem] leading-[1.8] mb-4">
                Whether you need a reliable machine for school, work, or on-the-go productivity,
                we carry a curated selection of new and refurbished laptops. Each one is tested
                and ready to perform — no bloatware, no surprises.
              </p>
              <p className="text-gray-700 text-[1.05rem] leading-[1.8] mb-8">
                From sleek ultrabooks to powerful workstation laptops, we match you with the
                right machine for your lifestyle and budget.
              </p>
              <Link
                href="/contact"
                className="inline-block bg-primary-600 text-white font-semibold py-3 px-8 rounded-brand-md hover:bg-primary-800 hover:-translate-y-0.5 transition-all duration-normal shadow-brand-sm hover:shadow-brand-md"
              >
                Get a Quote
              </Link>
            </div>
            <div className="flex items-center justify-center">
              <Image
                src="/assets/laptop-hero.png"
                alt="Sleek laptop computer"
                width={600}
                height={400}
                className="max-w-full h-auto drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </ChevronSection>

      {/* Section 2: Business PCs — image left, text right */}
      <ChevronSection topShape="v" bottomShape="v" className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image appears second on mobile, first on desktop */}
            <div className="order-2 lg:order-1 flex items-center justify-center">
              <Image
                src="/assets/business-pc-hero.png"
                alt="Business desktop computer"
                width={600}
                height={400}
                className="max-w-full h-auto drop-shadow-2xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">
                Business PCs
              </span>
              <h2 className="text-gray-900 text-[clamp(1.8rem,3vw,2.5rem)] font-bold mt-2 mb-6">
                Workstations Built for Business
              </h2>
              <p className="text-gray-700 text-[1.05rem] leading-[1.8] mb-4">
                From accounting software to multi-monitor spreadsheet setups, our business
                desktops are configured for the real demands of your workday. We stock new,
                refurbished, and custom-built options to fit any office or budget.
              </p>
              <p className="text-gray-700 text-[1.05rem] leading-[1.8] mb-8">
                Need something specific? We can configure a machine to your exact requirements —
                and have it ready faster than any big box store.
              </p>
              <Link
                href="/contact"
                className="inline-block bg-primary-600 text-white font-semibold py-3 px-8 rounded-brand-md hover:bg-primary-800 hover:-translate-y-0.5 transition-all duration-normal shadow-brand-sm hover:shadow-brand-md"
              >
                Get a Quote
              </Link>
            </div>
          </div>
        </div>
      </ChevronSection>

      {/* Section 3: Gaming PCs — text left, image right */}
      <ChevronSection topShape="v" className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">
                Gaming PCs
              </span>
              <h2 className="text-white text-[clamp(1.8rem,3vw,2.5rem)] font-bold mt-2 mb-6">
                Custom Gaming Rigs, Built Right Here in Topeka
              </h2>
              <p className="text-gray-300 text-[1.05rem] leading-[1.8] mb-4">
                We build custom gaming PCs to your exact specs — from entry-level setups to
                high-performance rigs loaded with the latest GPUs. Every machine is assembled
                and tested by our techs so you get maximum performance right out of the box.
              </p>
              <p className="text-gray-300 text-[1.05rem] leading-[1.8] mb-8">
                Skip the markup and the middleman. Tell us what you want to play, and we&apos;ll
                build the perfect rig for your budget.
              </p>
              <Link
                href="/contact"
                className="inline-block bg-blue-600 text-white font-semibold py-3 px-8 rounded-brand-md hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-normal shadow-brand-sm hover:shadow-brand-md"
              >
                Get a Quote
              </Link>
            </div>
            <div className="flex items-center justify-center">
              <Image
                src="/assets/gaming-pc-hero.png"
                alt="Gaming desktop computer"
                width={600}
                height={400}
                className="max-w-full h-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </ChevronSection>
    </>
  );
}
