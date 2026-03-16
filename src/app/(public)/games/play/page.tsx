'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';

/**
 * Game play page wrapping an iframe to load the selected game.
 *
 * This is a client component because it reads URL search params,
 * manages fullscreen toggle state, handles iframe load events,
 * and provides restart functionality. The page renders a full-viewport
 * iframe with top and bottom control bars.
 *
 * @returns Client-rendered game player page
 *
 * @called_by PublicLayout (route group layout)
 *
 * @version 1.0.0 - 2026-03-16T00:00:00Z - Initial implementation
 */

export const dynamic = 'force-dynamic';

/**
 * Inner component that uses useSearchParams (must be inside Suspense).
 */
function GamePlayer() {
  const searchParams = useSearchParams();
  const gameUrl = searchParams.get('url') || '';
  const gameName = searchParams.get('name') || 'Game';
  const gameIcon = searchParams.get('icon') || '\u{1F3AE}';

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /**
   * Syncs the fullscreen state with the browser Fullscreen API events.
   */
  const syncFullscreenClass = useCallback(() => {
    const inFS = !!(
      document.fullscreenElement ||
      (document as Record<string, unknown>).webkitFullscreenElement ||
      (document as Record<string, unknown>).mozFullScreenElement
    );
    setIsFullscreen(inFS);
  }, []);

  useEffect(() => {
    document.addEventListener('fullscreenchange', syncFullscreenClass);
    document.addEventListener('webkitfullscreenchange', syncFullscreenClass);
    document.addEventListener('mozfullscreenchange', syncFullscreenClass);
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreenClass);
      document.removeEventListener('webkitfullscreenchange', syncFullscreenClass);
      document.removeEventListener('mozfullscreenchange', syncFullscreenClass);
    };
  }, [syncFullscreenClass]);

  /**
   * Auto-hide the fullscreen hint after 4 seconds.
   */
  const [hintVisible, setHintVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setHintVisible(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Handles iframe load event to fade out the loading overlay.
   */
  const handleIframeLoad = useCallback(() => {
    setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setLoaderVisible(false), 500);
    }, 600);
  }, []);

  /**
   * Enters browser fullscreen mode on the document element.
   */
  const goFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if ((el as Record<string, unknown>).webkitRequestFullscreen) {
      (el as unknown as { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
    }
  }, []);

  /**
   * Exits browser fullscreen mode.
   */
  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as Record<string, unknown>).webkitExitFullscreen) {
      (document as unknown as { webkitExitFullscreen: () => void }).webkitExitFullscreen();
    }
  }, []);

  /**
   * Reloads the game iframe by clearing and re-setting the src.
   */
  const reloadGame = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.src = '';
      setIsLoading(true);
      setLoaderVisible(true);
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = gameUrl;
        }
      }, 100);
    }
  }, [gameUrl]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#0d1b2e',
        color: '#ffffff',
        fontFamily: "'Barlow', sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          background: '#0d1b2e',
          borderBottom: '2px solid #1a3a5c',
          height: isFullscreen ? 0 : 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isFullscreen ? 0 : '0 1.25rem',
          gap: '1rem',
          flexShrink: 0,
          zIndex: 10,
          transition: 'height 0.3s ease, opacity 0.3s ease',
          opacity: isFullscreen ? 0 : 1,
          overflow: isFullscreen ? 'hidden' : 'visible',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              textDecoration: 'none',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/csk-logo.png"
              alt="CSK"
              style={{
                height: 34,
                width: 'auto',
                display: 'block',
                filter: 'brightness(10)',
                opacity: 0.85,
              }}
            />
          </Link>
          <div
            style={{
              width: 1,
              height: 24,
              background: 'rgba(255,255,255,0.12)',
            }}
          />
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              color: 'rgba(255,255,255,0.75)',
            }}
          >
            Now Playing:{' '}
            <span style={{ color: '#b3d0f5' }}>{gameName}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={reloadGame}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: '0.82rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 6,
              padding: '0.45rem 0.9rem',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.7)',
              transition: 'background 0.2s',
            }}
          >
            {'\u21BA'} Restart
          </button>
          <button
            type="button"
            onClick={goFullscreen}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: '0.82rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              border: 'none',
              borderRadius: 6,
              padding: '0.45rem 0.9rem',
              cursor: 'pointer',
              background: '#0366d6',
              color: '#ffffff',
              transition: 'background 0.2s',
            }}
          >
            {'\u26F6'} Full Screen
          </button>
          <Link
            href="/games"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: '0.82rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 6,
              padding: '0.45rem 0.9rem',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
          >
            {'\u2190'} Games
          </Link>
        </div>
      </div>

      {/* Game Frame Area */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          background: '#0d1b2e',
          overflow: 'hidden',
        }}
      >
        {/* Loading Overlay */}
        {loaderVisible && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#0d1b2e',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.25rem',
              zIndex: 20,
              transition: 'opacity 0.5s ease',
              opacity: isLoading ? 1 : 0,
              pointerEvents: isLoading ? 'auto' : 'none',
            }}
          >
            <div
              style={{
                fontSize: '3.5rem',
                animation: 'pulse 1.5s ease infinite',
              }}
            >
              {gameIcon}
            </div>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800,
                fontSize: '1.6rem',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.06em',
                color: '#ffffff',
              }}
            >
              {gameName}
            </div>
            <div
              style={{
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.45)',
                letterSpacing: '0.04em',
              }}
            >
              Powered by Computer Store Kansas
            </div>
            <div
              style={{
                width: 220,
                height: 4,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: '0%',
                  background: '#0366d6',
                  borderRadius: 2,
                  animation: 'loadbar 1.8s ease forwards',
                }}
              />
            </div>
          </div>
        )}

        {/* Fullscreen Hint */}
        {!isFullscreen && hintVisible && (
          <button
            type="button"
            onClick={goFullscreen}
            style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              background: 'rgba(3,102,214,0.85)',
              backdropFilter: 'blur(6px)',
              color: '#ffffff',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: '0.72rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              padding: '0.4rem 0.8rem',
              borderRadius: 6,
              zIndex: 15,
              cursor: 'pointer',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'opacity 0.5s ease',
            }}
          >
            {'\u26F6'} Click for Full Screen
          </button>
        )}

        {/* Exit Fullscreen Button */}
        {isFullscreen && (
          <button
            type="button"
            onClick={exitFullscreen}
            style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              background: 'rgba(13,27,46,0.85)',
              backdropFilter: 'blur(6px)',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.15)',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: '0.72rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              padding: '0.4rem 0.8rem',
              borderRadius: 6,
              zIndex: 15,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            {'\u2715'} Exit Full Screen
          </button>
        )}

        {/* Game Iframe */}
        <iframe
          ref={iframeRef}
          src={gameUrl}
          onLoad={handleIframeLoad}
          allow="fullscreen; autoplay"
          allowFullScreen
          title={`Playing ${gameName}`}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
            background: '#000',
          }}
        />
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          background: '#0a1628',
          borderTop: '1px solid #1a3a5c',
          height: isFullscreen ? 0 : 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isFullscreen ? 0 : '0 1.25rem',
          flexShrink: 0,
          transition: 'height 0.3s ease, opacity 0.3s ease',
          opacity: isFullscreen ? 0 : 1,
          overflow: isFullscreen ? 'hidden' : 'visible',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 6px #22c55e',
              animation: 'blink 2s ease infinite',
            }}
          />
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            Game Running
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            href="/games"
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase' as const,
              color: 'rgba(255,255,255,0.3)',
              textDecoration: 'none',
            }}
          >
            {'\u2190'} All Games
          </Link>
          <Link
            href="/"
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase' as const,
              color: 'rgba(255,255,255,0.3)',
              textDecoration: 'none',
            }}
          >
            computerstoreks.com
          </Link>
        </div>
      </div>

      {/* Inline keyframe animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        @keyframes loadbar {
          0% { width: 0%; }
          60% { width: 75%; }
          100% { width: 100%; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: '#0d1b2e',
            color: '#ffffff',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '1.5rem',
          }}
        >
          Loading...
        </div>
      }
    >
      <GamePlayer />
    </Suspense>
  );
}
