import type { Metadata } from 'next';
import Link from 'next/link';

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
      <section
        className="hero-overlay hero-clip text-white pt-32 pb-48 text-center relative overflow-visible z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1920&q=80)' }}
      >
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[3]">
          <h2 className="text-white text-[clamp(2rem,4vw,3rem)] mb-6 font-bold">About Us</h2>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] mb-0 max-w-[700px] mx-auto opacity-95">Who we are and why we love fixing computers.</p>
        </div>
      </section>

      {/* Company Story Section */}
      <section className="hero-next-section texture-dots bg-gradient-to-br from-[#e8f0fe] to-[#d6e4fd] -mt-20 pt-32 relative z-[1]">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-8 text-gray-900">Our Story</h2>
          <p className="max-w-[800px] mx-auto mb-6 text-[1.05rem] leading-[1.8] text-center text-gray-700">The Computer Store has been proudly serving the Topeka community since 2003. We&apos;re passionate about helping our customers get the most out of their technology with fast, friendly and honest service.</p>
          <p className="max-w-[800px] mx-auto mb-6 text-[1.05rem] leading-[1.8] text-center text-gray-700">Our technicians are certified and experienced in working with all major brands and systems. From virus removal and data recovery to upgrades and custom PC builds, we provide a full range of computer services for homes and small businesses.</p>
          <p className="max-w-[800px] mx-auto mb-6 text-[1.05rem] leading-[1.8] text-center text-gray-700">When you work with us, you&apos;re not just another ticket — you&apos;re part of our community.</p>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12 text-gray-900">Why Choose Us?</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm transition-all duration-300 border border-bg-dark hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3 className="text-gray-900 text-[1.4rem] mb-4">Reliability</h3>
              <p className="text-gray-700 text-base leading-relaxed">Count on us for dependable repairs and support you can trust.</p>
            </div>
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm transition-all duration-300 border border-bg-dark hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3 className="text-gray-900 text-[1.4rem] mb-4">Personalized Approach</h3>
              <p className="text-gray-700 text-base leading-relaxed">Solutions tailored to your unique needs and budget.</p>
            </div>
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm transition-all duration-300 border border-bg-dark hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3 className="text-gray-900 text-[1.4rem] mb-4">Timely Delivery</h3>
              <p className="text-gray-700 text-base leading-relaxed">Quick turnaround so you&apos;re back up and running fast.</p>
            </div>
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm transition-all duration-300 border border-bg-dark hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3 className="text-gray-900 text-[1.4rem] mb-4">High Standards</h3>
              <p className="text-gray-700 text-base leading-relaxed">Quality workmanship backed by decades of experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 text-center relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Ready to Experience the Difference?</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Contact us today to schedule an appointment or drop by our shop. We look forward to serving you.</p>
          <Link href="/contact" className="inline-block px-8 py-4 rounded-brand-md font-semibold text-base transition-all duration-300 cursor-pointer bg-white text-primary-600 shadow-brand-md hover:-translate-y-0.5 hover:shadow-brand-lg">Get Your Free Quote</Link>
        </div>
      </section>
    </>
  );
}
