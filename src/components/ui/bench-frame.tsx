/**
 * BENCH FRAME - Signature moment 4: the frame every real photo renders
 * inside. A thin machined silver edge (the locked plaque gradient) wraps
 * the photo on all four sides, with a letterspaced caps caption bar
 * beneath. Semantic figure/figcaption.
 *
 * Photos are never bare, never rounded blobs, never full-bleed behind
 * text. Only the five real store photos go in here — no stock, no AI
 * imagery. Every photo also gets the shared .bench-grade tone layer
 * (low-opacity navy multiply + slight desaturate) so shots taken under
 * different light read as one graded set.
 *
 * WHEN TO EDIT: When changing how photos are framed site-wide. The
 * silver edge is .plaque-frame and the grade is .bench-grade, both in
 * globals.css.
 */

import { cn } from '@/lib/cn';

interface BenchFrameProps {
  /** Caption text, rendered in caps, e.g. "On the bench at the shop" */
  caption: string;
  /** Pass the next/image element (or its wrapper) as the child */
  children: React.ReactNode;
  /** Stretch the frame to fill its column: the photo area grows, the caption stays at the bottom */
  stretch?: boolean;
  className?: string;
}

/** Wraps a real photo in the silver plaque frame with its caption bar. */
export function BenchFrame({ caption, children, stretch = false, className }: BenchFrameProps) {
  return (
    <figure className={cn('max-w-full', stretch && 'flex h-full min-h-0 flex-col', className)}>
      <div className={cn('plaque-frame', stretch && 'flex min-h-0 flex-1 flex-col')}>
        <div
          className={cn(
            'bench-grade overflow-hidden bg-page [&>img]:block [&>img]:h-auto [&>img]:w-full',
            stretch && 'min-h-0 flex-1'
          )}
        >
          {children}
        </div>
      </div>
      {/* The caption bar grows to its content, at every width. It was
          clamped to one line on phones to keep it short under a small
          photo, but two lines still rendered and overflow:hidden sheared
          the second one horizontally through the letterforms. Caps text
          at 12.8px costs ~17px a line; a caption that needs two lines
          gets two lines. Keep the strings short instead of clipping. */}
      <figcaption className="border border-t-0 border-line-strong bg-surface px-4 py-2.5 text-eyebrow uppercase text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}
