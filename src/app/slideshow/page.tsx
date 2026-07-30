/**
 * SLIDESHOW DISPLAY - Full-screen in-store slideshow for TV/monitor display.
 * Rotates through active slides every 10 seconds with no on-screen chrome.
 * Designed to run unattended on a display in the store.
 *
 * Slides are authored at a fixed 1920x1080. Rendering them into a
 * viewport-sized box clips them on any panel whose browser viewport is
 * smaller (a 720p display shows roughly the top-left two thirds and looks
 * "zoomed in"). So the slide is rendered at its true authored size and
 * scaled to fit, letterboxing on any aspect ratio that is not 16:9.
 *
 * WHEN TO EDIT: When changing rotation timing or the overall display layout.
 */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { SlideshowSlide } from '@/types/slideshow';

const SLIDE_DURATION_MS = 15000; // 15 seconds per slide
const SLIDE_W = 1920;            // Authored slide width, must match slide HTML
const SLIDE_H = 1080;            // Authored slide height, must match slide HTML

/**
 * Full-screen slideshow display page.
 * Fetches active slides from the API and rotates through them automatically.
 */
export default function SlideshowPage() {
  const [slides, setSlides] = useState<SlideshowSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);

  const slideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scale the fixed-size slide to fit whatever panel this is running on
  useEffect(() => {
    const fit = () =>
      setScale(Math.min(window.innerWidth / SLIDE_W, window.innerHeight / SLIDE_H));

    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);
    return () => {
      window.removeEventListener('resize', fit);
      window.removeEventListener('orientationchange', fit);
    };
  }, []);

  // Load slides on mount
  useEffect(() => {
    fetch('/api/slideshow')
      .then((r) => r.json())
      .then((result) => {
        if (result.success && result.data.length > 0) {
          setSlides(result.data);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // Advance to next slide
  const advance = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Restart the rotation timer whenever currentIndex or slides change
  useEffect(() => {
    if (slides.length === 0) return;

    if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    slideTimerRef.current = setTimeout(advance, SLIDE_DURATION_MS);

    return () => {
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    };
  }, [currentIndex, slides.length, advance]);

  // ── Loading state ────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
      </div>
    );
  }

  // ── No slides configured ─────────────────────────────────────
  if (slides.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-white/60 text-xl font-light tracking-wide">No slides configured</p>
        <p className="text-white/30 text-sm">Add slides from the Admin → Slideshow Manager</p>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];
  if (!currentSlide) return null;

  return (
    <>
      <style>{`
        html, body { margin: 0; padding: 0; background: #000; overflow: hidden; }
      `}</style>

      {/* Full-bleed slide content, no progress bar and no dot indicators.
          The inner box stays at the authored 1920x1080 and is scaled to fit. */}
      <div className="fixed inset-0 bg-black overflow-hidden">
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: SLIDE_W,
            height: SLIDE_H,
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          {currentSlide.type === 'image' ? (
            // Image slide — fills area, maintains aspect ratio
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={currentSlide.id}
              src={currentSlide.imageUrl!}
              alt={currentSlide.title}
              className="w-full h-full object-contain"
            />
          ) : (
            // HTML slide — sandboxed iframe at authored size
            <iframe
              key={currentSlide.id}
              srcDoc={currentSlide.content!}
              sandbox="allow-scripts"
              className="w-full h-full border-0 bg-black"
              title={currentSlide.title}
            />
          )}
        </div>
      </div>
    </>
  );
}
