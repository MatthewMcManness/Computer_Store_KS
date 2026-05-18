/**
 * ABOUT PAGE - Tells customers about the store's history, mission, and team.
 *
 * WHEN TO EDIT: When updating the store's story or team info.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronSection } from '@/components/static/ChevronSection';

export const metadata: Metadata = {
  title: 'About Us - Locally Owned Since 2003',
  description: "Learn about Computer Store Kansas - Topeka's oldest locally owned computer repair shop since 2003. Meet our team and discover why customers trust us for computer services.",
  openGraph: {
    title: 'About Us - Computer Store Kansas',
    description: "Topeka's oldest locally owned computer repair shop since 2003. Learn about our story and commitment to quality service.",
    url: 'https://computerstoreks.com/about',
  },
};

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <ChevronSection
        bottomShape="v"
        className="hero-overlay text-white pt-32 pb-48 text-center relative overflow-visible z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1920&q=80)' }}
      >
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[3]">
          <h1 className="text-white text-[clamp(2rem,4vw,3rem)] mb-6 font-bold">About Us</h1>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] mb-0 max-w-[700px] mx-auto opacity-95">Who we are and why we love fixing computers.</p>
        </div>
      </ChevronSection>

      {/* FOUNDER STORY SECTION */}
      <ChevronSection
        topShape="v"
        bottomShape="v"
        className="texture-geometric bg-bg-light py-20 relative z-10"
      >
        <div className="diamond-accent -bottom-[50px] left-[5%] w-[120px] h-[120px]"></div>
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="mb-6 text-gray-900">Locally Owned Since 2003</h2>
            <p className="mb-4 leading-[1.8] text-[1.05rem] text-gray-700">Every computer that comes through our doors has a story — family photos, a small business, a student&apos;s future. We treat each one like it matters, because it does. That&apos;s what it means to be your trusted computer repair shop.</p>
            <p className="italic text-primary-600 mt-6 font-semibold">— Max Beyer, Owner</p>
          </div>
        </div>
      </ChevronSection>

      {/* Company Story Section */}
      <ChevronSection
        topShape="v"
        bottomShape="v"
        className="texture-dots bg-gradient-to-br from-[#e8f0fe] to-[#d6e4fd] py-20 relative"
      >
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-8 text-gray-900">Our Story</h2>
          <p className="max-w-[800px] mx-auto mb-6 text-[1.05rem] leading-[1.8] text-center text-gray-700">The Computer Store has been proudly serving the Topeka community since 2003. We&apos;re passionate about helping our customers get the most out of their technology with fast, friendly and honest service.</p>
          <p className="max-w-[800px] mx-auto mb-6 text-[1.05rem] leading-[1.8] text-center text-gray-700">Our technicians are certified and experienced in working with all major brands and systems. From virus removal and data recovery to upgrades and custom PC builds, we provide a full range of computer services for homes and small businesses.</p>
          <p className="max-w-[800px] mx-auto mb-6 text-[1.05rem] leading-[1.8] text-center text-gray-700">When you work with us, you&apos;re not just another ticket — you&apos;re part of our community.</p>
        </div>
      </ChevronSection>

      {/* NUMBERED BENEFITS SECTION */}
      <ChevronSection
        topShape="v"
        bottomShape="v"
        className="texture-dots py-20 bg-white"
      >
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-4">5 Reasons to Choose Computer Store Kansas</h2>
          <p className="text-center text-gray-500 text-[1.1rem] mb-16 max-w-[700px] mx-auto">Your computer&apos;s an important part of your life—don&apos;t just trust it in the hands of anyone. Here&apos;s why we&apos;re the right choice:</p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-12 mt-12">
            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-300 hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">01</div>
              <div>
                <h3 className="text-[1.3rem] mb-3 text-gray-900">Expertise and Experience</h3>
                <p className="text-base text-gray-700 leading-relaxed mb-0">Over 20 years of experience diagnosing and fixing computer issues. We continue to expand our knowledge in different types of computer systems, software, and hardware.</p>
              </div>
            </div>
            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-300 hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">02</div>
              <div>
                <h3 className="text-[1.3rem] mb-3 text-gray-900">Fast and Reliable Service</h3>
                <p className="text-base text-gray-700 leading-relaxed mb-0">Quick response times, efficient processes, and quality assurance to ensure you always have the best service at your fingertips.</p>
              </div>
            </div>
            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-300 hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">03</div>
              <div>
                <h3 className="text-[1.3rem] mb-3 text-gray-900">Honest, Transparent Pricing</h3>
                <p className="text-base text-gray-700 leading-relaxed mb-0">No surprises. We provide clear estimates upfront so you know exactly what you&apos;ll be paying before we start any work.</p>
              </div>
            </div>
            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-300 hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">04</div>
              <div>
                <h3 className="text-[1.3rem] mb-3 text-gray-900">We Protect Your Data</h3>
                <p className="text-base text-gray-700 leading-relaxed mb-0">Our first priority is to backup and protect your data in case of hardware failure or accidental deletion during the repair process.</p>
              </div>
            </div>
            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-300 hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">05</div>
              <div>
                <h3 className="text-[1.3rem] mb-3 text-gray-900">Local &amp; Personal</h3>
                <p className="text-base text-gray-700 leading-relaxed mb-0">As a locally-owned business, we treat every customer like family. You&apos;re not just another ticket—you&apos;re part of our community.</p>
              </div>
            </div>
          </div>
        </div>
      </ChevronSection>

      {/* Call-to-Action Section */}
      <ChevronSection
        topShape="v"
        bottomShape="flat"
        className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 text-center relative overflow-hidden"
      >
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Ready to Experience the Difference?</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Contact us today to schedule an appointment or drop by our shop. We look forward to serving you.</p>
          <Link href="/contact" className="cta-inverse">Get Your Free Quote</Link>
        </div>
      </ChevronSection>
    </>
  );
}
