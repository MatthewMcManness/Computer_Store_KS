/**
 * SLIDESHOW DISPLAY - Full-screen in-store slideshow for TV/monitor display.
 * Rotates through slides every 10 seconds with a progress bar and dot indicators.
 * Designed to run unattended on a display in the store.
 *
 * WHEN TO EDIT: When changing rotation timing, progress bar styling,
 * or the overall display layout.
 */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { SlideshowSlide } from '@/types/slideshow';

const SLIDE_DURATION_MS = 10000; // 10 seconds per slide
const PROGRESS_TICK_MS = 50;     // Progress bar update frequency

/**
 * Full-screen slideshow display page.
 * Fetches active slides from the API and rotates through them automatically.
 */
export default function SlideshowPage() {
  const [slides, setSlides] = useState<SlideshowSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const slideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

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

  // Start timers whenever currentIndex or slides change
  useEffect(() => {
    if (slides.length === 0) return;

    // Clear any running timers
    if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);

    // Reset progress
    setProgress(0);
    startTimeRef.current = Date.now();

    // Smooth progress bar (updates every 50ms)
    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setProgress(Math.min((elapsed / SLIDE_DURATION_MS) * 100, 100));
    }, PROGRESS_TICK_MS);

    // Auto-advance after full duration
    slideTimerRef.current = setTimeout(advance, SLIDE_DURATION_MS);

    return () => {
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [currentIndex, slides.length, advance]);

  // Jump to a specific slide when clicking a dot
  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
  };

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

      <div className="fixed inset-0 bg-black flex flex-col">

        {/* ── Slide content area ───────────────────────────────── */}
        <div className="flex-1 relative overflow-hidden">
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
            // HTML slide — sandboxed iframe, full size
            <iframe
              key={currentSlide.id}
              srcDoc={currentSlide.content!}
              sandbox="allow-scripts"
              className="w-full h-full border-0 bg-black"
              title={currentSlide.title}
            />
          )}
        </div>

        {/* ── Bottom control bar ───────────────────────────────── */}
        <div className="flex-none bg-gradient-to-t from-black to-black/80 px-8 pt-4 pb-5">

          {/* Progress bar track */}
          <div className="h-1 bg-white/15 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-white/80 rounded-full"
              style={{
                width: `${progress}%`,
                transition: `width ${PROGRESS_TICK_MS}ms linear`,
              }}
            />
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2.5">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(i)}
                aria-label={`Go to slide ${i + 1}: ${slide.title}`}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentIndex
                    ? 'w-7 h-2.5 bg-white'
                    : 'w-2.5 h-2.5 bg-white/35 hover:bg-white/55'
                }`}
              />
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
