/**
 * PROTECTION PLANS PAGE - Describes the Silver Plan and other protection plan
 * options for customers.
 *
 * WHEN TO EDIT: When updating plan details, pricing, or descriptions.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ProtectionPlansSection } from '@/components/static/ProtectionPlansSection';
import { ChevronSection } from '@/components/static/ChevronSection';

export const metadata: Metadata = {
  title: 'Protection Plans - Silver & Silver Plus',
  description: 'Computer protection plans starting at $24.99/month. Silver Plan for home users, Silver Plus for businesses. Antivirus, discounts on repairs, remote support, and more.',
  openGraph: {
    title: 'Computer Protection Plans - Silver & Silver Plus',
    description: 'Comprehensive computer protection plans for home and business. Antivirus, repair discounts, remote support, and peace of mind.',
    url: 'https://computerstoreks.com/silver-plan',
  },
};

export default function ProtectionPlansPage() {
  return (
    <>
      {/* Hero Section */}
      <ChevronSection
        bottomShape="v"
        className="hero-overlay text-white pt-32 pb-48 text-center relative overflow-visible z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1920&q=80)' }}
      >
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[3]">
          <h1 className="flex flex-col items-center text-white text-[clamp(2.5rem,5vw,4rem)] font-bold leading-tight tracking-tight mb-4">Protection Plans</h1>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] mb-0 max-w-[700px] mx-auto opacity-95">Comprehensive computer care for home and business</p>
        </div>
      </ChevronSection>

      {/* Plans Section */}
      <ChevronSection topShape="v" bottomShape="v" className="bg-bg-light py-20 relative">
        <ProtectionPlansSection />
      </ChevronSection>

      {/* Call-to-Action Section */}
      <ChevronSection topShape="v" className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 text-center relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Questions About Our Plans?</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Contact us to find the right protection plan for your needs.</p>
          <Link href="/contact" className="inline-block px-8 py-4 rounded-brand-md font-semibold text-base transition-all duration-300 cursor-pointer bg-white text-primary-600 shadow-brand-md hover:-translate-y-0.5 hover:shadow-brand-lg">Contact Us</Link>
        </div>
      </ChevronSection>
    </>
  );
}
