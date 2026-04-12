'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

/** How long each slide stays on screen (milliseconds) */
const SLIDE_DURATION_MS = 9000;

interface SlideData {
  id: string;
  business: string;
  tagline: string;
  phone: string;
  address: string;
  hours: string[];
  services: string[];
  website: string;
  theme: SlideTheme;
}

interface SlideTheme {
  bg: string;
  accent: string;
  text: string;
  subtext: string;
  border: string;
  card: string;
  pill: string;
  pillText: string;
  progressFill: string;
}

const slides: SlideData[] = [
  {
    id: 'csk',
    business: 'The Computer Store',
    tagline: 'Your Go-To Technology Center Since 2003',
    phone: '(785) 267-3223',
    address: '2008 SW Gage Blvd, Topeka, KS 66604',
    hours: [
      'Mon – Fri  10 am – 6 pm',
      'Saturday   10 am – 2 pm',
      'Sunday     Closed',
    ],
    services: [
      'Computer Repair & Diagnostics',
      'Virus & Malware Removal',
      'Data Transfer & Recovery',
      'Hardware Upgrades',
      'Custom-Built PCs',
      'Refurbished Laptops & Desktops',
      'OS Installation (Windows / Linux)',
      'Protection Plans',
    ],
    website: 'computerstoreks.com',
    theme: {
      bg: 'linear-gradient(135deg, #0f1f3d 0%, #1a3a6b 50%, #0f2d5a 100%)',
      accent: '#3b82f6',
      text: '#ffffff',
      subtext: '#93c5fd',
      border: 'rgba(59,130,246,0.25)',
      card: 'rgba(255,255,255,0.06)',
      pill: 'rgba(59,130,246,0.18)',
      pillText: '#93c5fd',
      progressFill: '#3b82f6',
    },
  },
  {
    id: 'tpr',
    business: 'Topeka Phone Repair',
    tagline: 'Genuine Parts · Original Techs · Quality Repairs',
    phone: '(785) 260-0660',
    address: '2008 SW Gage Blvd, Topeka, KS 66604',
    hours: [
      'Mon – Fri  10 am – 4 pm',
      'Saturday   By Appointment',
      'Sunday     Closed',
    ],
    services: [
      'iPhone & iPad Repair',
      'Samsung & Android Repair',
      'Mac & Tablet Repair',
      'Motorola & Pixel Repair',
      'PlayStation / Xbox / Nintendo',
      'Microsoldering Services',
      'Data Recovery',
      'Screen & Battery Replacement',
    ],
    website: 'topekaphonerepair.com',
    theme: {
      bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #111111 100%)',
      accent: '#e5e5e5',
      text: '#ffffff',
      subtext: '#a3a3a3',
      border: 'rgba(255,255,255,0.12)',
      card: 'rgba(255,255,255,0.05)',
      pill: 'rgba(255,255,255,0.1)',
      pillText: '#d4d4d4',
      progressFill: '#ffffff',
    },
  },
  {
    id: 'rws',
    business: 'Resilient Web Solutions',
    tagline: 'Web-Based Solutions for Businesses of Every Size',
    phone: '(785) 251-0781',
    address: 'Topeka, KS',
    hours: [
      'Mon – Fri  9 am – 5 pm',
      'Saturday   By Appointment',
      'Sunday     Closed',
    ],
    services: [
      'Custom Website Development',
      'E-Commerce Solutions',
      'Web Application Development',
      'Cybersecurity Audits & Consulting',
      'Penetration Testing',
      'Local SEO Setup & Management',
      'AI Feature Integration',
      'Ongoing Maintenance & Support',
    ],
    website: 'resilientwebsolutions.com',
    theme: {
      bg: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #1e40af 100%)',
      accent: '#fbbf24',
      text: '#ffffff',
      subtext: '#fde68a',
      border: 'rgba(251,191,36,0.3)',
      card: 'rgba(255,255,255,0.07)',
      pill: 'rgba(251,191,36,0.15)',
      pillText: '#fde68a',
      progressFill: '#fbbf24',
    },
  },
];

/**
 * Full-screen kiosk slideshow cycling through all three businesses
 * co-located at 2008 SW Gage Blvd, Topeka, KS.
 *
 * Auto-advances every SLIDE_DURATION_MS milliseconds. Supports manual
 * navigation via left/right arrow keys, clicking the indicator dots,
 * or clicking the left/right edge of the screen.
 *
 * Designed to be pointed at from a store monitor running a browser
 * in full-screen/kiosk mode. The /slideshow/layout.tsx strips all
 * site chrome (header, footer, analytics) so the page runs clean.
 *
 * @returns {JSX.Element} The full-screen slideshow UI
 *
 * @functions_called useEffect, useState, useCallback
 * @called_by Next.js routing for /slideshow
 *
 * @version 1.0.0 - 2026-04-12T00:00:00Z - Initial implementation
 */
export default function SlideshowPage() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [progress, setProgress] = useState(0);

  /** Advance to the next slide, wrapping around. */
  const next = useCallback(() => {
    setAnimating(true);
    setTimeout(() => {
      setCurrent((c) => (c + 1) % slides.length);
      setProgress(0);
      setAnimating(false);
    }, 450);
  }, []);

  /** Jump directly to a specific slide index. */
  const goTo = useCallback(
    (index: number) => {
      if (index === current) return;
      setAnimating(true);
      setTimeout(() => {
        setCurrent(index);
        setProgress(0);
        setAnimating(false);
      }, 450);
    },
    [current]
  );

  /** Previous slide for keyboard navigation. */
  const prev = useCallback(() => {
    setAnimating(true);
    setTimeout(() => {
      setCurrent((c) => (c - 1 + slides.length) % slides.length);
      setProgress(0);
      setAnimating(false);
    }, 450);
  }, []);

  // Auto-advance timer
  useEffect(() => {
    const interval = setInterval(next, SLIDE_DURATION_MS);
    return () => clearInterval(interval);
  }, [next]);

  // Progress bar tick (updates every 100 ms)
  useEffect(() => {
    setProgress(0);
    const tick = setInterval(() => {
      setProgress((p) => Math.min(p + 100 / (SLIDE_DURATION_MS / 100), 100));
    }, 100);
    return () => clearInterval(tick);
  }, [current]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev]);

  const slide = slides[current];
  const { theme } = slide;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        html, body, #__next {
          margin: 0; padding: 0;
          width: 100vw; height: 100vh;
          overflow: hidden;
        }

        .slideshow-root {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            Helvetica, Arial, sans-serif;
          transition: background 0.7s ease;
          overflow: hidden;
        }

        /* ── Slide content ── */
        .slide-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 3rem 5vw;
          transition: opacity 0.45s ease, transform 0.45s ease;
        }
        .slide-wrap.fade-out {
          opacity: 0;
          transform: translateY(12px);
        }

        /* ── Logo zone ── */
        .logo-zone {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
          min-height: 120px;
        }
        /* ── Tagline ── */
        .tagline {
          font-size: clamp(1rem, 2.2vw, 1.5rem);
          font-weight: 400;
          letter-spacing: 0.04em;
          text-align: center;
          margin: 0 0 2rem;
          opacity: 0.88;
        }

        /* ── Two-column content area ── */
        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          width: 100%;
          max-width: 1100px;
        }

        /* ── Cards ── */
        .card {
          border-radius: 16px;
          padding: 1.5rem 1.75rem;
          border-width: 1px;
          border-style: solid;
        }
        .card-title {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin: 0 0 0.85rem;
          opacity: 0.65;
        }

        /* Services grid */
        .services-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.45rem;
        }
        .service-pill {
          border-radius: 8px;
          padding: 0.4rem 0.65rem;
          font-size: clamp(0.7rem, 1.1vw, 0.85rem);
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Hours list */
        .hours-list {
          list-style: none;
          margin: 0; padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }
        .hours-item {
          font-size: clamp(0.8rem, 1.3vw, 1rem);
          font-weight: 400;
          font-variant-numeric: tabular-nums;
        }

        /* Contact section */
        .contact-block {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          margin-top: 0.25rem;
        }
        .contact-line {
          font-size: clamp(0.85rem, 1.4vw, 1.05rem);
          font-weight: 400;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .contact-icon {
          font-size: 1.1em;
          flex-shrink: 0;
        }
        .phone-big {
          font-size: clamp(1.3rem, 2.5vw, 2rem);
          font-weight: 700;
          letter-spacing: 0.03em;
          margin-bottom: 0.15rem;
        }
        .website-line {
          font-size: clamp(0.8rem, 1.2vw, 0.95rem);
          opacity: 0.7;
        }

        /* ── Bottom bar ── */
        .bottom-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2.5rem 0.75rem;
          flex-shrink: 0;
        }

        /* Nav dots */
        .nav-dots {
          display: flex;
          gap: 0.6rem;
          align-items: center;
        }
        .dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: transform 0.2s, opacity 0.2s;
          opacity: 0.4;
        }
        .dot.active {
          opacity: 1;
          transform: scale(1.35);
        }

        /* Progress bar */
        .progress-track {
          flex: 1;
          margin: 0 1.5rem;
          height: 3px;
          border-radius: 2px;
          background: rgba(255,255,255,0.15);
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.1s linear;
        }

        /* Slide counter */
        .slide-counter {
          font-size: 0.75rem;
          opacity: 0.45;
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }

        /* ── Edge click zones ── */
        .edge-zone {
          position: fixed;
          top: 0; bottom: 0;
          width: 80px;
          cursor: pointer;
          z-index: 10;
          opacity: 0;
          transition: opacity 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: white;
        }
        .edge-zone:hover { opacity: 0.35; }
        .edge-zone.left { left: 0; background: linear-gradient(to right, rgba(0,0,0,0.4), transparent); }
        .edge-zone.right { right: 0; background: linear-gradient(to left, rgba(0,0,0,0.4), transparent); }

        /* ── Building banner ── */
        .building-banner {
          text-align: center;
          font-size: clamp(0.65rem, 1vw, 0.8rem);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          opacity: 0.35;
          padding: 0.5rem 0 0;
          flex-shrink: 0;
        }
      `}</style>

      {/* Background with theme gradient */}
      <div
        className="slideshow-root"
        style={{ background: theme.bg, color: theme.text }}
      >
        {/* Edge click zones */}
        <button className="edge-zone left" onClick={prev} aria-label="Previous slide">
          ‹
        </button>
        <button className="edge-zone right" onClick={next} aria-label="Next slide">
          ›
        </button>

        {/* Building banner */}
        <p className="building-banner" style={{ color: theme.subtext }}>
          2008 SW Gage Blvd &nbsp;·&nbsp; Topeka, Kansas
        </p>

        {/* Slide content */}
        <div className={`slide-wrap${animating ? ' fade-out' : ''}`}>

          {/* ── Logo Zone ── */}
          <div className="logo-zone">
            {slide.id === 'csk' && (
              <Image
                src="/assets/csk-logo.svg"
                alt="Computer Store Kansas logo"
                width={420}
                height={190}
                priority
                style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5)) brightness(1.1)' }}
              />
            )}
            {slide.id === 'tpr' && (
              <Image
                src="https://images.squarespace-cdn.com/content/v1/683984ef0f3fb80f93653cbd/7fb6c8f6-fa5f-405c-97bd-979ed3ce6d1a/Topeka+Phone+Repair+Version+%232+%28LATEST+in+White%29+1200+x+500.png"
                alt="Topeka Phone Repair logo"
                width={1200}
                height={500}
                priority
                style={{
                  maxWidth: 'min(480px, 60vw)',
                  height: 'auto',
                  width: '100%',
                  filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.6))',
                }}
              />
            )}
            {slide.id === 'rws' && (
              <Image
                src="/assets/rws-logo.svg"
                alt="Resilient Web Solutions logo"
                width={200}
                height={200}
                priority
                style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))' }}
              />
            )}
          </div>

          {/* Tagline */}
          <p className="tagline" style={{ color: theme.subtext }}>
            {slide.tagline}
          </p>

          {/* Two-column grid */}
          <div className="content-grid">

            {/* Left column: Services */}
            <div
              className="card"
              style={{
                background: theme.card,
                borderColor: theme.border,
                color: theme.text,
              }}
            >
              <p className="card-title" style={{ color: theme.subtext }}>Services</p>
              <div className="services-grid">
                {slide.services.map((svc) => (
                  <span
                    key={svc}
                    className="service-pill"
                    style={{ background: theme.pill, color: theme.pillText }}
                  >
                    {svc}
                  </span>
                ))}
              </div>
            </div>

            {/* Right column: Hours + Contact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Hours */}
              <div
                className="card"
                style={{
                  background: theme.card,
                  borderColor: theme.border,
                  color: theme.text,
                  flex: 1,
                }}
              >
                <p className="card-title" style={{ color: theme.subtext }}>Hours</p>
                <ul className="hours-list">
                  {slide.hours.map((h) => (
                    <li key={h} className="hours-item" style={{ color: theme.text }}>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div
                className="card"
                style={{
                  background: theme.card,
                  borderColor: theme.border,
                  color: theme.text,
                }}
              >
                <p className="card-title" style={{ color: theme.subtext }}>Contact</p>
                <div className="contact-block">
                  <p
                    className="phone-big"
                    style={{ color: theme.accent, margin: 0 }}
                  >
                    {slide.phone}
                  </p>
                  <span className="contact-line" style={{ color: theme.text }}>
                    <span className="contact-icon">📍</span>
                    {slide.address}
                  </span>
                  <span className="website-line" style={{ color: theme.subtext }}>
                    🌐 {slide.website}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom navigation bar */}
        <div className="bottom-bar">
          {/* Slide dots */}
          <div className="nav-dots">
            {slides.map((s, i) => (
              <button
                key={s.id}
                className={`dot${i === current ? ' active' : ''}`}
                style={{ background: theme.progressFill }}
                onClick={() => goTo(i)}
                aria-label={`Go to ${s.business}`}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
                background: theme.progressFill,
              }}
            />
          </div>

          {/* Counter */}
          <span className="slide-counter" style={{ color: theme.subtext }}>
            {current + 1} / {slides.length}
          </span>
        </div>
      </div>
    </>
  );
}
