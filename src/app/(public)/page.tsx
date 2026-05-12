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
import { ProtectionPlansSection } from '@/components/static/ProtectionPlansSection';
import { ChevronSection } from '@/components/static/ChevronSection';

export default function HomePage() {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const update = () => {
      const y = window.scrollY;
      const range = heroRef.current?.offsetHeight ?? 160;
      setProgress(Math.min(Math.max(y / range, 0), 1));
      rafRef.current = null;
    };
    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const lerp = (a: number, b: number) => a + (b - a) * progress;
  const morphStyle = {
    paddingLeft: `${lerp(48, 16)}px`,
    paddingRight: `${lerp(48, 16)}px`,
    paddingTop: `${lerp(32, 8)}px`,
    paddingBottom: `${lerp(32, 8)}px`,
    borderRadius: `${lerp(20, 16)}px`,
  };
  const logoMaxWidth = `${lerp(280, 110)}px`;

  return (
    <>
      <div
        className="md:hidden fixed left-2 right-2 top-2 z-[1000] silver-plaque flex items-center justify-center"
        style={morphStyle}
      >
        <Link href="/" className="flex items-center">
          <Image
            src="/assets/csk-logo.svg"
            alt="Computer Store Kansas"
            width={504}
            height={227}
            priority
            className="silver-plaque-img block w-full"
            style={{ maxWidth: logoMaxWidth, height: 'auto' }}
          />
        </Link>
      </div>

      {/* HOME PAGE HERO SECTION */}
      <ChevronSection
        ref={heroRef}
        bottomShape="v"
        className="hero-overlay text-white pt-52 pb-48 text-center relative overflow-visible z-0 bg-cover bg-center bg-no-repeat md:pt-32"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=1920&q=80)' }}
      >
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[3]">
          <div className="flex flex-col items-center">
            <div className="silver-plaque flex flex-col items-center px-12 py-8 rounded-[20px] mb-8 relative max-md:hidden">
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
          <h2 className="text-white text-[clamp(2rem,4vw,3rem)] mb-6 font-bold max-md:hidden">Your Go-To Technology Center Since 2003</h2>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] mb-0 max-w-[700px] mx-auto opacity-95">Count on The Computer Store for all your computer service needs. Fast, friendly, and reliable service you can trust.</p>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] font-bold mt-4 animate-pulse opacity-95">Now we do house calls!</p>
          <Link href="/contact" className="btn-silver mt-6">Schedule a Service Call</Link>
        </div>
      </ChevronSection>

      {/* STATS SECTION */}
      <ChevronSection
        topShape="v"
        bottomShape="v"
        className="bg-gradient-to-br from-bg-light to-white relative overflow-hidden bg-radial-blue py-20 border-t border-b border-bg-dark"
      >
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
      </ChevronSection>

      {/* SERVICES OVERVIEW SECTION */}
      <ChevronSection
        topShape="v"
        bottomShape="v"
        className="texture-circuit py-20 bg-bg-light relative overflow-hidden"
      >
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
      </ChevronSection>

      {/* PROTECTION PLANS SECTION */}
      <ChevronSection
        topShape="v"
        bottomShape="v"
        className="bg-bg-light py-20 relative"
      >
        <ProtectionPlansSection />
      </ChevronSection>

      {/* REVIEWS SECTION */}
      <ChevronSection
        topShape="v"
        bottomShape="v"
        className="texture-terrazzo-blue py-20"
      >
        <ReviewsWidget />
      </ChevronSection>

      {/* CALL-TO-ACTION SECTION */}
      <ChevronSection
        topShape="v"
        bottomShape="flat"
        className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 text-center relative overflow-hidden"
      >
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Ready to Get Started?</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Contact us today for expert computer services and personalized solutions tailored to your needs.</p>
          <Link href="/contact" className="inline-block px-8 py-4 rounded-brand-md font-semibold text-base transition-all duration-300 cursor-pointer bg-white text-primary-600 shadow-brand-md hover:-translate-y-0.5 hover:shadow-brand-lg">Talk to an Expert</Link>
        </div>
      </ChevronSection>
    </>
  );
}