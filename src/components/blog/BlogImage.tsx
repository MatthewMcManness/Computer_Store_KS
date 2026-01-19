'use client';

import { useState } from 'react';
import Image from 'next/image';

interface BlogImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

/**
 * Blog image component with skeleton loading
 *
 * Shows a shimmer animation while the image loads,
 * providing visual feedback similar to YouTube's loading style.
 *
 * @param src - Image URL
 * @param alt - Alt text for accessibility
 * @param width - Image width
 * @param height - Image height
 * @param className - Optional CSS class
 *
 * @version 1.0.0 - 2026-01-19T12:00:00Z - Initial implementation
 */
export default function BlogImage({ src, alt, width, height, className }: BlogImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="blog-image-container">
      <style jsx>{`
        .blog-image-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .image-skeleton {
          position: absolute;
          inset: 0;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .image-skeleton.loaded {
          display: none;
        }

        .skeleton-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.5) 50%,
            transparent 100%
          );
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Skeleton placeholder */}
      <div className={`image-skeleton ${isLoaded ? 'loaded' : ''}`}>
        <div className="skeleton-shimmer"></div>
      </div>

      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}
