/**
 * HOMEPAGE - The main landing page customers see at computerstoreks.com.
 * Shows hero banner, services overview, and call-to-action.
 *
 * WHEN TO EDIT: When changing the homepage content, hero image, or featured sections.
 */
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ReviewsWidget } from '@/components/reviews/ReviewsWidget';

export default function HomePage() {
  const plaqueRef = useRef<HTMLDivElement>(null);
  const [showStickyBadge, setShowStickyBadge] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!plaqueRef.current) return;
      setShowStickyBadge(plaqueRef.current.getBoundingClientRect().bottom < 0);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div
        className={`fixed top-0 left-0 right-0 z-[1000] p-2 md:hidden transition-all duration-300 ease-out ${
          showStickyBadge ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
      >
        <div className="silver-plaque flex items-center justify-center px-4 py-2 rounded-brand-lg relative">
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/csk-logo.svg"
              alt="Computer Store Kansas"
              width={504}
              height={227}
              className="silver-plaque-img"
              style={{ height: '40px', width: 'auto' }}
            />
          </Link>
        </div>
      </div>

      {/* HOME PAGE HERO SECTION */}
      <section
        className="hero-overlay hero-clip text-white pt-32 pb-48 text-center relative overflow-visible z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=1920&q=80)' }}
      >
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[3]">
          <div className="flex flex-col items-center">
            <div ref={plaqueRef} className="silver-plaque flex flex-col items-center px-12 py-8 rounded-[20px] mb-8 relative">
              <Image
                src="/assets/csk-logo.svg"
                alt="Computer Store Kansas - Expert Computer Repair Since 2003"
                width={504}
                height={227}
                priority
                className="silver-plaque-img block max-w-[350px] w-full"
              />
            </div>
          </div>
          <h2 className="text-white text-[clamp(2rem,4vw,3rem)] mb-6 font-bold">Your Go-To Technology Center Since 2003</h2>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] mb-0 max-w-[700px] mx-auto opacity-95">Count on The Computer Store for all your computer service needs. Fast, friendly, and reliable service you can trust.</p>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] font-bold mt-4 animate-pulse opacity-95">Now we do house calls!</p>
          <Link href="/contact" className="btn-silver mt-6">Schedule a Service Call</Link>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="hero-next-section-deep bg-gradient-to-br from-bg-light to-white relative overflow-hidden bg-radial-blue -mt-28 pt-40 pb-16 border-t border-b border-bg-dark">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-12 text-center max-w-[900px] mx-auto">
            <div className="p-6 transition-all duration-300 hover:-translate-y-1 animate-float">
              <span className="text-[clamp(2.5rem,5vw,4rem)] font-extrabold text-primary-600 leading-none mb-2 block">20+</span>
              <span className="text-[1.1rem] text-gray-700 font-medium">Years of Experience</span>
            </div>
            <div className="p-6 transition-all duration-300 hover:-translate-y-1 animate-float" style={{ animationDelay: '0.2s' }}>
              <span className="text-[clamp(2.5rem,5vw,4rem)] font-extrabold text-primary-600 leading-none mb-2 block">2003</span>
              <span className="text-[1.1rem] text-gray-700 font-medium">Locally Owned Since</span>
            </div>
            <div className="p-6 transition-all duration-300 hover:-translate-y-1 animate-float" style={{ animationDelay: '0.4s' }}>
              <span className="text-[clamp(2.5rem,5vw,4rem)] font-extrabold text-primary-600 leading-none mb-2 block">1000+</span>
              <span className="text-[1.1rem] text-gray-700 font-medium">Satisfied Customers</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER STORY SECTION */}
      <section className="texture-geometric bg-bg-light py-20 relative z-10">
        <div className="diamond-accent -bottom-[50px] left-[5%] w-[120px] h-[120px]"></div>
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="mb-6 text-gray-900">Locally Owned Since 2003</h2>
            <p className="mb-4 leading-[1.8] text-[1.05rem] text-gray-700">Every computer that comes through our doors has a story — family photos, a small business, a student&apos;s future. We treat each one like it matters, because it does. That&apos;s what it means to be your trusted computer repair shop.</p>
            <p className="italic text-primary-600 mt-6 font-semibold">— Max Beyer, Owner</p>
          </div>
        </div>
      </section>

      {/* SERVICES OVERVIEW SECTION */}
      <section className="texture-circuit py-20 bg-bg-light relative overflow-hidden">
        <div className="diamond-accent top-1/2 -right-[60px] w-[180px] h-[180px] !opacity-5 animate-rotate-slow"></div>
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12 text-gray-900">What We Do</h2>
          <p className="text-center text-gray-500 max-w-[700px] mx-auto mb-8 text-[1.1rem]">
            From computer repairs to protection plans and custom builds, we&apos;ve got everything you need to keep your technology running smoothly.
          </p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="card-enhanced card-gradient-border bg-white rounded-brand-lg p-8 shadow-brand-sm transition-all duration-300 border border-bg-dark hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100 relative overflow-hidden">
              <h3 className="text-gray-900 text-[1.4rem] mb-4">Computer Service</h3>
              <p className="text-gray-700 text-base leading-relaxed">Comprehensive diagnostics, repairs and upgrades for desktops and laptops.</p>
            </div>
            <div className="card-enhanced card-gradient-border bg-white rounded-brand-lg p-8 shadow-brand-sm transition-all duration-300 border border-bg-dark hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100 relative overflow-hidden">
              <h3 className="text-gray-900 text-[1.4rem] mb-4">Protection Plans</h3>
              <p className="text-gray-700 text-base leading-relaxed">Flexible plans to safeguard your system from viruses, malware and identity theft.</p>
            </div>
            <div className="card-enhanced card-gradient-border bg-white rounded-brand-lg p-8 shadow-brand-sm transition-all duration-300 border border-bg-dark hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100 relative overflow-hidden">
              <h3 className="text-gray-900 text-[1.4rem] mb-4">New Computer Sales</h3>
              <p className="text-gray-700 text-base leading-relaxed">Let our non-commissioned team help you build or choose the perfect PC for your needs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* NUMBERED BENEFITS SECTION */}
      <section className="texture-dots py-20 bg-white">
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
      </section>

      {/* REVIEWS SECTION */}
      <ReviewsWidget />

      {/* CALL-TO-ACTION SECTION */}
      <section className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 text-center relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Ready to Get Started?</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Contact us today for expert computer services and personalized solutions tailored to your needs.</p>
          <Link href="/contact" className="inline-block px-8 py-4 rounded-brand-md font-semibold text-base transition-all duration-300 cursor-pointer bg-white text-primary-600 shadow-brand-md hover:-translate-y-0.5 hover:shadow-brand-lg">Talk to an Expert</Link>
        </div>
      </section>
    </>
  );
}