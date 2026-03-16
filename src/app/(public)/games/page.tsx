import type { Metadata } from 'next';
import Link from 'next/link';
import './games.css';

/**
 * Games landing page for the CSK Game Portal.
 *
 * Displays a hero section with stats, two category cards (PC and Mobile),
 * and a features strip highlighting the free/safe/no-download nature of
 * the games. Uses custom games CSS classes rather than Tailwind.
 *
 * @returns Server-rendered games landing page
 *
 * @called_by PublicLayout (route group layout)
 *
 * @version 1.0.0 - 2026-03-16T00:00:00Z - Initial implementation
 */

export const metadata: Metadata = {
  title: 'CSK Games | Free Browser Games | Computer Store Kansas',
  description:
    'Play free browser games at Computer Store Kansas. Mobile and PC games, no download required.',
  openGraph: {
    type: 'website',
    url: 'https://computerstoreks.com/games',
    title: 'CSK Games | Free Browser Games | Computer Store Kansas',
    description:
      'Play free PC and mobile browser games \u2014 no downloads, no installs. Curated by Computer Store Kansas, your local tech experts in Topeka, KS since 2003.',
    images: [
      {
        url: 'https://computerstoreks.com/assets/games-og.png',
        width: 1200,
        height: 630,
      },
    ],
    siteName: 'Computer Store Kansas',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CSK Games | Free Browser Games',
    description:
      'Play free PC and mobile browser games \u2014 no downloads, no installs. From Computer Store Kansas in Topeka, KS.',
    images: ['https://computerstoreks.com/assets/games-og.png'],
  },
};

export default function GamesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="games-hero">
        <div className="games-hero-orb2" />
        <div className="games-hero-content">
          <div className="games-hero-eyebrow">Computer Store Kansas</div>
          <h1>
            Free Browser
            <span className="accent">Games</span>
          </h1>
          <p className="games-hero-sub">
            Play instantly &mdash; no downloads, no installs. Games for every device,
            straight from your browser.
          </p>
          <div className="games-hero-stats">
            <div className="games-hero-stat">
              <div className="games-hero-stat-num">100%</div>
              <div className="games-hero-stat-label">Free to Play</div>
            </div>
            <div className="games-hero-divider" />
            <div className="games-hero-stat">
              <div className="games-hero-stat-num">{'\u{1F5A5}\uFE0F'}</div>
              <div className="games-hero-stat-label">Desktop Games</div>
            </div>
            <div className="games-hero-divider" />
            <div className="games-hero-stat">
              <div className="games-hero-stat-num">{'\u{1F4F1}'}</div>
              <div className="games-hero-stat-label">Mobile Games</div>
            </div>
            <div className="games-hero-divider" />
            <div className="games-hero-stat">
              <div className="games-hero-stat-num">0</div>
              <div className="games-hero-stat-label">Downloads Needed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="games-categories">
        <div className="games-section-header">
          <div className="games-section-tag">Choose Your Platform</div>
          <h2 className="games-section-title">Pick a Category</h2>
          <p className="games-section-desc">
            Select mobile for touch-friendly games on your phone or tablet, or PC
            for keyboard &amp; mouse experiences.
          </p>
        </div>

        <div className="category-grid">
          {/* PC Games Card */}
          <Link href="/games/pc" className="category-card">
            <div className="card-banner card-banner-pc">
              <div className="card-banner-grid" />
              <div className="card-corner card-corner-tl" />
              <div className="card-corner card-corner-br" />
              <div className="card-icon-wrap">
                <span className="card-icon">{'\u{1F5A5}\uFE0F'}</span>
              </div>
            </div>
            <div className="card-body">
              <div className="card-category-tag">Desktop &amp; Laptop</div>
              <h3 className="card-title">PC Games</h3>
              <p className="card-desc">
                Full keyboard &amp; mouse browser games. From 3D racing and FPS
                classics to strategy and roguelikes &mdash; built for your desktop
                setup.
              </p>
              <div className="card-meta">
                <span className="card-pill">{'\u2328\uFE0F'} Keyboard &amp; Mouse</span>
                <span className="card-pill">{'\u{1F5A5}\uFE0F'} Full Screen</span>
              </div>
              <span className="card-cta">Browse PC Games</span>
            </div>
          </Link>

          {/* Mobile Games Card */}
          <Link href="/games/mobile" className="category-card">
            <div className="card-banner card-banner-mobile">
              <div className="card-banner-grid" />
              <div className="card-corner card-corner-tl" />
              <div className="card-corner card-corner-br" />
              <div className="card-icon-wrap">
                <span className="card-icon">{'\u{1F4F1}'}</span>
              </div>
            </div>
            <div className="card-body">
              <div className="card-category-tag">Phone &amp; Tablet</div>
              <h3 className="card-title">Mobile Games</h3>
              <p className="card-desc">
                Touch-optimized games designed for phones and tablets. Tap, swipe,
                and play anywhere &mdash; no installation required.
              </p>
              <div className="card-meta">
                <span className="card-pill">{'\u{1F446}'} Touch Controls</span>
                <span className="card-pill">{'\u{1F4F2}'} Phone &amp; Tablet</span>
                <span className="card-pill">{'\u26A1'} Instant Play</span>
              </div>
              <span className="card-cta">Browse Mobile Games</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Features Strip */}
      <div className="games-features-strip">
        <div className="games-features-inner">
          <div>
            <span className="games-feature-icon">{'\u{1F680}'}</span>
            <div className="games-feature-title">No Downloads</div>
            <p className="games-feature-desc">
              Every game loads directly in your browser. Nothing to install, ever.
            </p>
          </div>
          <div>
            <span className="games-feature-icon">{'\u{1F193}'}</span>
            <div className="games-feature-title">Completely Free</div>
            <p className="games-feature-desc">
              All games on this portal are free to play. No accounts, no paywalls.
            </p>
          </div>
          <div>
            <span className="games-feature-icon">{'\u{1F512}'}</span>
            <div className="games-feature-title">Safe &amp; Trusted</div>
            <p className="games-feature-desc">
              Curated by Computer Store Kansas &mdash; your local tech experts since
              2003.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
