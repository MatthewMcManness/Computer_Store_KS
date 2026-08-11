/**
 * BENCH PHOTO - The art-directed photo element that goes inside a
 * BenchFrame. Wide desktop crops are letterboxed smears on a phone, so
 * the wide exteriors and the wide board macro each ship a second,
 * tighter derivative (square or 4:5) that narrow viewports get instead.
 *
 * Implemented as a <picture> with media-scoped <source> elements ahead
 * of the next/image <img>. The browser picks a narrow file below the
 * breakpoint and next/image still handles the wide one, so we keep the
 * optimizer on the crop that actually needs it.
 *
 * FORMAT NEGOTIATION FOR THE NARROW CROP. A media-scoped <source>
 * pointing at /public bypasses /_next/image entirely, so phones used to
 * be served a raw baseline JPEG with no WebP negotiation at all: on
 * /computers that file is the mobile LCP element and it shipped 157KB.
 * Every narrow crop now ships a WebP sibling, listed first, which cuts
 * that to about a third. The sibling is passed explicitly rather than
 * derived from the JPEG path on purpose: a <source> whose resource 404s
 * does NOT fall through to the next candidate in a <picture>, it paints
 * a broken image, so a missing derivative must be impossible to
 * introduce by forgetting to run a script.
 *
 * Both crops are art-directed derivatives of the same real store photo
 * in public/assets. There is no stock and no generated imagery here.
 *
 * WHEN TO EDIT: When adding a photo that needs a different crop on
 * phones, or when changing the art-direction breakpoint.
 */

import Image from 'next/image';

/** Below this width the narrow crop is served. Matches Tailwind's `sm`. */
const NARROW_MEDIA = '(max-width: 639px)';

interface BenchPhotoProps {
  /** Wide/desktop derivative in public/assets */
  src: string;
  /** Intrinsic width of the wide derivative */
  width: number;
  /** Intrinsic height of the wide derivative */
  height: number;
  alt: string;
  sizes: string;
  /** Tighter derivative served below 640px; omit for photos that already crop well on phones */
  narrowSrc?: string;
  /** WebP sibling of narrowSrc. Must exist on disk; a 404 here paints a broken image. */
  narrowWebpSrc?: string;
  /** Intrinsic width of the narrow derivative, so the browser reserves the right box */
  narrowWidth?: number;
  /** Intrinsic height of the narrow derivative */
  narrowHeight?: number;
  priority?: boolean;
}

/** Renders one framed photo, with an optional tighter crop for phones. */
export function BenchPhoto({
  src,
  width,
  height,
  alt,
  sizes,
  narrowSrc,
  narrowWebpSrc,
  narrowWidth,
  narrowHeight,
  priority = false,
}: BenchPhotoProps) {
  return (
    <picture>
      {narrowSrc && narrowWebpSrc && (
        <source
          media={NARROW_MEDIA}
          type="image/webp"
          srcSet={narrowWebpSrc}
          width={narrowWidth}
          height={narrowHeight}
        />
      )}
      {narrowSrc && (
        <source
          media={NARROW_MEDIA}
          srcSet={narrowSrc}
          width={narrowWidth}
          height={narrowHeight}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        className="block h-auto w-full"
      />
    </picture>
  );
}
