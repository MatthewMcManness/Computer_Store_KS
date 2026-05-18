/**
 * LAPTOPS PAGE - Describes laptop sales and services.
 *
 * WHEN TO EDIT: When updating the description, pricing, or details for this service.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronSection } from '@/components/static/ChevronSection';

export const metadata: Metadata = {
  title: 'New & Refurbished Laptops | Computer Store Kansas',
  description: 'New and refurbished laptops in Topeka, KS. Quality Asus and Lenovo laptops, thoroughly tested refurbished units, and expert help choosing the right computer.',
  openGraph: {
    title: 'Laptops - New & Refurbished - Computer Store Kansas',
    description: 'Quality laptops for every budget. New models, refurbished deals, and expert guidance.',
    url: 'https://computerstoreks.com/services/laptops',
  },
};

export default function LaptopsPage() {
  return (
    <>
      {/* Hero Section */}
      <ChevronSection bottomShape="v" className="hero-overlay text-white pt-32 pb-48 text-center relative overflow-visible z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1920&q=80)' }}>
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[3]">
          <h1>Laptops</h1>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] mb-0 max-w-[700px] mx-auto opacity-95">New and refurbished—quality computers for every budget.</p>
        </div>
      </ChevronSection>

      {/* New Laptops Section */}
      <ChevronSection topShape="v" bottomShape="v" className="texture-circuit py-20 relative bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12">New Laptops</h2>
          <p style={{ fontSize: '1.15rem', maxWidth: '800px', margin: '0 auto 2rem' }}>
            We recommend and stock laptops from <strong>Asus</strong> and <strong>Lenovo</strong>—brands known for
            reliability and value. Whether you need a basic machine for everyday tasks or a powerful workstation,
            we have options across a range of prices.
          </p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>In-Stock Selection</h3>
              <p>We keep a variety of laptops on hand at different price points. Stop by to see what&apos;s available and try before you buy.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Custom Orders</h3>
              <p>Need something specific? We can order laptops to match your exact requirements—processor, RAM, storage, screen size, whatever you need.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Free Lifetime Diagnostics</h3>
              <p>Every new laptop purchased through us includes free diagnostic service for life. If something seems wrong, bring it in and we&apos;ll check it out.</p>
            </div>
          </div>
        </div>
      </ChevronSection>

      {/* Refurbished Laptops Section */}
      <ChevronSection topShape="v" bottomShape="v" className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-4">Refurbished Laptops</h2>
          <p className="text-center text-gray-500 text-[1.1rem] mb-16 max-w-[700px] mx-auto">Quality computers at a fraction of the price—thoroughly tested and ready to work.</p>

          <div className="mt-12 p-8 bg-primary-100 rounded-brand-lg border-l-4 border-primary-600" style={{ marginBottom: '3rem' }}>
            <h3 className="text-primary-800 mb-4">Where Do Our Refurbished Laptops Come From?</h3>
            <p className="text-gray-600 mb-0">We source from corporate lease returns, trade-ins, and business upgrades. These are often high-quality machines that were well-maintained and still have years of life left.</p>
          </div>

          <h3 style={{ textAlign: 'center', marginBottom: '2rem' }}>Our Refurbishment Process</h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-12 mt-12">
            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">1</div>
              <div>
                <h4>Thorough Inspection</h4>
                <p>Every laptop is fully inspected for cosmetic and functional issues before we consider it for sale.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">2</div>
              <div>
                <h4>Stress Testing</h4>
                <p>Intensive stress tests push the hardware to identify any components that are failing or close to failure.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">3</div>
              <div>
                <h4>Part Replacement</h4>
                <p>Failed or suspect components are replaced. Many units get upgraded batteries, SSDs, or additional RAM.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">4</div>
              <div>
                <h4>Fresh OS Install</h4>
                <p>A clean operating system installation ensures no leftover data and optimal performance from day one.</p>
              </div>
            </div>
          </div>
        </div>
      </ChevronSection>

      {/* Warranty Info */}
      <ChevronSection topShape="v" bottomShape="v" className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 text-center relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Refurbished Warranty</h2>
          <div className="bg-white/10 rounded-brand-lg p-8 mx-auto my-8 max-w-[500px]">
            <p className="text-white mb-3 text-[1.1rem]"><strong>Parts Warranty:</strong> 3 months</p>
            <p className="text-white mb-3 text-[1.1rem]"><strong>Free Diagnostics:</strong> 6 months</p>
            <p className="text-white mb-3 text-[1.1rem] mt-6 pt-4 border-t border-white/20 font-semibold">We stand behind our refurbished machines. If something goes wrong, we&apos;ll make it right.</p>
          </div>
        </div>
      </ChevronSection>

      {/* Why Buy From Us */}
      <ChevronSection topShape="v" bottomShape="v" className="texture-dots py-20 bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12">More Than Just a Sale</h2>
          <p className="text-center" style={{ maxWidth: '700px', margin: '0 auto 3rem' }}>
            Buying a laptop from us is different from picking one off a shelf at a big box store.
          </p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Expert Guidance</h3>
              <p>Not sure what you need? We&apos;ll ask the right questions and help you find a laptop that fits your actual use case and budget—no upselling, just honest advice.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Setup Included</h3>
              <p>Your laptop is set up and ready to use before you leave. User accounts created, updates installed, desktop organized—just like our OS installation service.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Ongoing Support</h3>
              <p>Having issues after your purchase? We&apos;re here to help. Our support doesn&apos;t end when you walk out the door.</p>
            </div>
          </div>
        </div>
      </ChevronSection>

      {/* Who We Serve */}
      <ChevronSection topShape="v" bottomShape="v" className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-4">Laptops for Everyone</h2>
          <p className="text-center text-gray-500 text-[1.1rem] mb-16 max-w-[700px] mx-auto">We help all kinds of customers find the right machine.</p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Students</h3>
              <p>Reliable laptops for schoolwork, research, and everything college throws at you—without breaking the bank.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Business Users</h3>
              <p>Professional machines built for productivity, security, and all-day battery life. Single units or bulk orders for your team.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Home Users</h3>
              <p>Computers for browsing, streaming, video calls, and staying connected with family and friends.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Budget Shoppers</h3>
              <p>Quality doesn&apos;t have to mean expensive. Our refurbished selection offers excellent value for cost-conscious buyers.</p>
            </div>
          </div>
        </div>
      </ChevronSection>

      {/* CTA */}
      <ChevronSection topShape="v" bottomShape="flat" className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 text-center relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Find Your Perfect Laptop</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Stop by to see our current selection, or tell us what you need and we&apos;ll help you find it.</p>
          <Link href="/contact" className="cta-inverse">Browse Laptops Today</Link>
        </div>
      </ChevronSection>
    </>
  );
}
