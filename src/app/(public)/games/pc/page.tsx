import type { Metadata } from 'next';
import Link from 'next/link';
import { games } from '@/data/games';
import '../games.css';

/**
 * PC Games listing page for the CSK Game Portal.
 *
 * Displays all available browser games with a PC/desktop focus.
 * Each game card links to the play page with the game URL, name,
 * and icon passed as query parameters.
 *
 * @returns Server-rendered PC games listing page
 *
 * @functions_called games (imported data)
 * @called_by PublicLayout (route group layout)
 *
 * @version 1.0.0 - 2026-03-16T00:00:00Z - Initial implementation
 */

export const metadata: Metadata = {
  title: 'PC Games | CSK Games | Computer Store Kansas',
  description:
    'Play free PC browser games at Computer Store Kansas. Keyboard and mouse games for desktop and laptop, no download required. Topeka, KS.',
  openGraph: {
    type: 'website',
    url: 'https://computerstoreks.com/games/pc',
    title: 'PC Games | CSK Games | Computer Store Kansas',
    description:
      'Free keyboard & mouse browser games for desktop and laptop \u2014 no downloads, no installs. From Computer Store Kansas in Topeka, KS.',
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
    title: 'PC Games | CSK Games',
    description:
      'Free keyboard & mouse browser games for desktop and laptop. From Computer Store Kansas in Topeka, KS.',
    images: ['https://computerstoreks.com/assets/games-og.png'],
  },
};

export default function PCGamesPage() {
  const pcGames = games.filter((g) => g.platforms.includes('pc'));

  return (
    <>
      {/* Hero Section */}
      <section className="games-hero games-hero-small">
        <div className="games-hero-orb2" />
        <div className="games-hero-content">
          <div className="games-breadcrumb">
            <Link href="/">CSK</Link>
            <span className="games-breadcrumb-sep">{'\u203A'}</span>
            <Link href="/games">Games</Link>
            <span className="games-breadcrumb-sep">{'\u203A'}</span>
            <span>PC Games</span>
          </div>
          <span className="games-hero-icon">{'\u{1F5A5}\uFE0F'}</span>
          <h1>
            PC <span className="accent">Games</span>
          </h1>
          <p className="games-hero-sub">
            Keyboard &amp; mouse browser games &mdash; full screen, no downloads, no
            installs. Just click and play.
          </p>
          <div className="games-hero-pills">
            <span className="games-hero-pill">{'\u2328\uFE0F'} Keyboard &amp; Mouse</span>
            <span className="games-hero-pill">{'\u{1F5A5}\uFE0F'} Full Screen Support</span>
            <span className="games-hero-pill">{'\u{1F193}'} Always Free</span>
            <span className="games-hero-pill">{'\u{1F680}'} No Downloads</span>
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="games-section">
        <div className="section-header">
          <div>
            <div className="games-section-tag">PC Browser Games</div>
            <h2 className="games-section-title">All PC Games</h2>
          </div>
          <span className="game-count">{pcGames.length} Games Available</span>
        </div>
        <div className="games-grid">
          {pcGames.map((game) => (
            <div key={game.id} className="game-card">
              <div className="game-thumb">
                <div className="game-thumb-bg">{game.icon}</div>
              </div>
              <div className="game-info">
                <div className="game-tags">
                  {game.tags.map((tag) => (
                    <span key={tag} className="game-tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="game-name">{game.name}</div>
                <p className="game-desc">{game.description}</p>
                <Link
                  href={`/games/play?url=${encodeURIComponent(game.url)}&name=${encodeURIComponent(game.name)}&icon=${encodeURIComponent(game.icon)}`}
                  className="game-play-btn"
                >
                  {'\u25B6'} Play Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
