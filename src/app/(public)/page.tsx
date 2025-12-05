'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ReviewsWidget } from '@/components/reviews/ReviewsWidget';

export default function HomePage() {
  return (
    <>
      {/* BLACK FRIDAY PROMOTIONAL BANNER */}
      <div className="black-friday-banner">
        <div className="bf-banner-content">
          <div className="bf-banner-ribbon"></div>
          <div className="bf-banner-text">
            <span className="bf-banner-title">Black Friday Sale!</span>
            <span className="bf-banner-offer">10% Off All Refurbished Computers</span>
            <span className="bf-banner-dates">Nov 17 - Jan 1</span>
          </div>
          <Link href="/black-friday" className="bf-banner-btn">Shop Now</Link>
        </div>
      </div>

      {/* HOME PAGE HERO SECTION */}
      <section className="hero">
        <div className="container">
          <div className="hero-title">
            <Image
              src="/assets/title.png"
              alt="Computer Store Kansas - Expert Computer Repair Since 2003"
              width={400}
              height={100}
              priority
            />
          </div>
          <h2>Your Go-To Technology Center Since 2003</h2>
          <p>Count on The Computer Store for all your computer service needs. Fast, friendly, and reliable service you can trust.</p>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="stats-section modern horizontal-diamond overlap-card-container">
        <div className="diamond-accent diamond-accent-1"></div>
        <div className="container">
          <div className="stats-grid overlap-card">
            <div className="stat-item floating-element">
              <span className="stat-number">20+</span>
              <span className="stat-label">Years of Experience</span>
            </div>
            <div className="stat-item floating-element" style={{ animationDelay: '0.2s' }}>
              <span className="stat-number">2003</span>
              <span className="stat-label">Locally Owned Since</span>
            </div>
            <div className="stat-item floating-element" style={{ animationDelay: '0.4s' }}>
              <span className="stat-number">1000+</span>
              <span className="stat-label">Satisfied Customers</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER STORY SECTION */}
      <section className="founder texture-geometric section-elevated">
        <div className="diamond-accent diamond-accent-2"></div>
        <div className="container">
          <div className="founder-text-full">
            <h2>Locally Owned Since 2003</h2>
            <p>I had seen computer stores come and go and some not run very professionally; I wanted to make sure to build on the best practices learned from my consulting business to offer better and faster service while remaining local. With this business model in place, The Computer Store opened its doors to customers in 2003 and we are the oldest locally owned professional computer retail store in Topeka.</p>
            <p className="founder-name">— Jim Driggers, Computer Store Founder</p>
          </div>
        </div>
      </section>

      {/* SERVICES OVERVIEW SECTION */}
      <section className="services modern texture-circuit">
        <div className="diamond-accent diamond-accent-3 rotating-element"></div>
        <div className="container">
          <h2>What We Do</h2>
          <p className="text-center text-muted" style={{ maxWidth: '700px', margin: '0 auto 2rem' }}>
            From computer repairs to protection plans and custom builds, we&apos;ve got everything you need to keep your technology running smoothly.
          </p>
          <div className="cards">
            <div className="card card-enhanced">
              <h3>Computer Service</h3>
              <p>Comprehensive diagnostics, repairs and upgrades for desktops and laptops.</p>
            </div>
            <div className="card card-enhanced">
              <h3>Protection Plans</h3>
              <p>Flexible plans to safeguard your system from viruses, malware and identity theft.</p>
            </div>
            <div className="card card-enhanced">
              <h3>New Computer Sales</h3>
              <p>Let our non-commissioned team help you build or choose the perfect PC for your needs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* NUMBERED BENEFITS SECTION */}
      <section className="benefits-section texture-dots">
        <div className="container">
          <h2>5 Reasons to Choose Computer Store Kansas</h2>
          <p>Your computer&apos;s an important part of your life—don&apos;t just trust it in the hands of anyone. Here&apos;s why we&apos;re the right choice:</p>
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-number">01</div>
              <div className="benefit-content">
                <h3>Expertise and Experience</h3>
                <p>Over 20 years of experience diagnosing and fixing computer issues. We continue to expand our knowledge in different types of computer systems, software, and hardware.</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-number">02</div>
              <div className="benefit-content">
                <h3>Fast and Reliable Service</h3>
                <p>Quick response times, efficient processes, and quality assurance to ensure you always have the best service at your fingertips.</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-number">03</div>
              <div className="benefit-content">
                <h3>Honest, Transparent Pricing</h3>
                <p>No surprises. We provide clear estimates upfront so you know exactly what you&apos;ll be paying before we start any work.</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-number">04</div>
              <div className="benefit-content">
                <h3>We Protect Your Data</h3>
                <p>Our first priority is to backup and protect your data in case of hardware failure or accidental deletion during the repair process.</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-number">05</div>
              <div className="benefit-content">
                <h3>Local &amp; Personal</h3>
                <p>As a locally-owned business, we treat every customer like family. You&apos;re not just another ticket—you&apos;re part of our community.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS SECTION */}
      <ReviewsWidget />

      {/* CALL-TO-ACTION SECTION */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Contact us today for expert computer services and personalized solutions tailored to your needs.</p>
          <Link href="/contact" className="btn btn-white">Talk to an Expert</Link>
        </div>
      </section>
    </>
  );
}
