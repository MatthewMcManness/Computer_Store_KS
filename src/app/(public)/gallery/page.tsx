'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { PHOTO_CATEGORIES, transformPhoto, type PhotoGalleryDisplay } from '@/types/photo-gallery';

/**
 * Professional Photo Gallery Page
 *
 * Masonry-style gallery with skeleton loading and premium lightbox.
 * Uses company color scheme (white background, blue accents).
 *
 * @version 1.0.0 - 2026-01-19T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-01-19T00:00:00Z - Redesigned with professional masonry layout
 * @version 2.1.0 - 2026-01-19T00:00:00Z - Added skeleton loaders, company colors, high-quality images
 */
export default function GalleryPage() {
  const [photos, setPhotos] = useState<PhotoGalleryDisplay[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<PhotoGalleryDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const lightboxRef = useRef<HTMLDivElement>(null);

  // Fetch photos from API
  const fetchPhotos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/photo-gallery');
      const result = await response.json();

      if (result.success && result.data) {
        const transformed = result.data.map(transformPhoto);
        setPhotos(transformed);
        setFilteredPhotos(transformed);
      } else {
        setError(result.error || 'Failed to load gallery');
      }
    } catch (err) {
      console.error('Error fetching gallery:', err);
      setError('Failed to load gallery');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Filter photos when category changes
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredPhotos(photos);
    } else {
      setFilteredPhotos(photos.filter((p) => p.category === selectedCategory));
    }
  }, [selectedCategory, photos]);

  // Track when images load
  const handleImageLoad = (photoId: string) => {
    setLoadedImages((prev) => new Set(prev).add(photoId));
  };

  // Lightbox navigation
  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    setImageLoaded(false);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  };

  const goToPrevious = () => {
    setImageLoaded(false);
    setCurrentIndex((prev) => (prev === 0 ? filteredPhotos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setImageLoaded(false);
    setCurrentIndex((prev) => (prev === filteredPhotos.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, filteredPhotos.length]);

  // Touch swipe support
  useEffect(() => {
    const el = lightboxRef.current;
    if (!lightboxOpen || !el) return;

    let touchStartX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) touchStartX = touch.clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      if (!touch) return;
      const touchEndX = touch.clientX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goToNext();
        else goToPrevious();
      }
    };

    el.addEventListener('touchstart', handleTouchStart);
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [lightboxOpen]);

  const currentPhoto = filteredPhotos[currentIndex];

  // Get available categories (only show categories that have photos)
  const availableCategories = PHOTO_CATEGORIES.filter(
    (cat) => cat.value === 'all' || photos.some((p) => p.category === cat.value)
  );

  // Generate skeleton placeholders with varying heights
  const skeletonHeights = [200, 280, 240, 320, 200, 260, 300, 220, 280, 240, 200, 260];

  return (
    <>
      {/* Hero Section - Company Colors */}
      <section
        className="hero-overlay hero-clip text-white pt-32 pb-48 text-center relative overflow-visible z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1920&q=80)' }}
      >
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[3]">
          <h2 className="text-white text-[clamp(2rem,4vw,3rem)] mb-6 font-bold">Photo Gallery</h2>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] mb-0 max-w-[700px] mx-auto opacity-95">Take a look at our store, custom builds, repairs, and more!</p>
        </div>
      </section>

      {/* Category Filters */}
      <section className="gallery-nav">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <div className="gallery-nav-inner">
            {availableCategories.map((cat) => (
              <button
                key={cat.value}
                className={`gallery-filter ${selectedCategory === cat.value ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Masonry Gallery */}
      <section className="gallery-section">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          {isLoading ? (
            // Skeleton Loading State
            <div className="masonry-grid">
              {skeletonHeights.map((height, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="skeleton-item"
                  style={{ height: `${height}px` }}
                >
                  <div className="skeleton-shimmer"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="gallery-status">
              <p className="gallery-error-text">{error}</p>
              <button onClick={fetchPhotos} className="inline-block px-8 py-4 rounded-brand-md font-semibold text-base transition-all duration-300 cursor-pointer border-none text-center whitespace-nowrap bg-primary-600 text-white shadow-brand-sm hover:bg-primary-800 hover:-translate-y-0.5 hover:shadow-brand-md">
                Try Again
              </button>
            </div>
          ) : filteredPhotos.length === 0 ? (
            <div className="gallery-status">
              <p>No photos yet{selectedCategory !== 'all' ? ` in this category` : ''}.</p>
            </div>
          ) : (
            <div className="masonry-grid">
              {filteredPhotos.map((photo, index) => (
                <figure
                  key={photo.id}
                  className={`masonry-item ${loadedImages.has(photo.id) ? 'loaded' : ''}`}
                  onClick={() => openLightbox(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && openLightbox(index)}
                >
                  {/* Skeleton placeholder until image loads */}
                  {!loadedImages.has(photo.id) && (
                    <div className="image-skeleton">
                      <div className="skeleton-shimmer"></div>
                    </div>
                  )}
                  <Image
                    src={photo.thumbnailUrl || photo.imageUrl}
                    alt={photo.title}
                    width={600}
                    height={600}
                    className="masonry-image"
                    onLoad={() => handleImageLoad(photo.id)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/csk-icon.svg';
                      handleImageLoad(photo.id);
                    }}
                  />
                  <figcaption className="masonry-caption">
                    <span>{photo.title}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Premium Lightbox */}
      {lightboxOpen && currentPhoto && (
        <div
          className="lightbox"
          onClick={closeLightbox}
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
        >
          {/* Close button */}
          <button
            className="lightbox-close"
            onClick={closeLightbox}
            aria-label="Close"
          >
            <X size={28} strokeWidth={1.5} />
          </button>

          {/* Navigation */}
          {filteredPhotos.length > 1 && (
            <>
              <button
                className="lightbox-nav lightbox-prev"
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                aria-label="Previous"
              >
                <ChevronLeft size={48} strokeWidth={1} />
              </button>
              <button
                className="lightbox-nav lightbox-next"
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                aria-label="Next"
              >
                <ChevronRight size={48} strokeWidth={1} />
              </button>
            </>
          )}

          {/* Image Container */}
          <div className="lightbox-stage" onClick={(e) => e.stopPropagation()}>
            {/* Loading spinner */}
            {!imageLoaded && (
              <div className="lightbox-loader">
                <div className="loader-spinner"></div>
              </div>
            )}
            <div className={`lightbox-image-wrap ${imageLoaded ? 'loaded' : ''}`}>
              <Image
                src={currentPhoto.imageUrl}
                alt={currentPhoto.title}
                width={2048}
                height={2048}
                className="lightbox-image"
                priority
                onLoad={() => setImageLoaded(true)}
              />
            </div>

            {/* Caption */}
            <div className={`lightbox-info ${imageLoaded ? 'visible' : ''}`}>
              <h2>{currentPhoto.title}</h2>
              {currentPhoto.description && <p>{currentPhoto.description}</p>}
              <span className="lightbox-count">
                {currentIndex + 1} / {filteredPhotos.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 text-center relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Want to See More?</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Visit our store in Topeka or follow us on social media!</p>
          <a href="/contact" className="inline-block px-8 py-4 rounded-brand-md font-semibold text-base transition-all duration-300 cursor-pointer bg-white text-primary-600 shadow-brand-md hover:-translate-y-0.5 hover:shadow-brand-lg">Contact Us</a>
        </div>
      </section>

      <style jsx>{`
        /* Gallery Navigation - White with blue accents */
        .gallery-nav {
          background: white;
          padding: 1.5rem 0;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .gallery-nav-inner {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .gallery-filter {
          background: none;
          border: none;
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 6px;
        }

        .gallery-filter:hover {
          color: #2563eb;
          background: #dbeafe;
        }

        .gallery-filter.active {
          color: white;
          background: #2563eb;
        }

        /* Gallery Section - White background */
        .gallery-section {
          background: #f9fafb;
          min-height: 50vh;
          padding: 2rem 0;
        }

        .gallery-status {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 40vh;
          color: #6b7280;
          gap: 1rem;
        }

        .gallery-error-text {
          color: #dc2626;
        }

        /* Masonry Grid */
        .masonry-grid {
          column-count: 4;
          column-gap: 8px;
        }

        @media (max-width: 1400px) {
          .masonry-grid { column-count: 3; }
        }

        @media (max-width: 900px) {
          .masonry-grid { column-count: 2; }
        }

        @media (max-width: 500px) {
          .masonry-grid { column-count: 1; }
        }

        /* Skeleton Loading */
        .skeleton-item {
          break-inside: avoid;
          margin: 0 0 8px;
          background: #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
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

        /* Masonry Items */
        .masonry-item {
          break-inside: avoid;
          margin: 0 0 8px;
          position: relative;
          cursor: pointer;
          overflow: hidden;
          border-radius: 8px;
          background: #e5e7eb;
        }

        .image-skeleton {
          position: absolute;
          inset: 0;
          background: #e5e7eb;
          z-index: 1;
        }

        .masonry-item.loaded .image-skeleton {
          display: none;
        }

        :global(.masonry-image) {
          display: block;
          width: 100%;
          height: auto;
          transition: transform 0.4s ease;
          opacity: 0;
        }

        .masonry-item.loaded :global(.masonry-image) {
          opacity: 1;
        }

        .masonry-item:hover :global(.masonry-image) {
          transform: scale(1.03);
        }

        .masonry-caption {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 3rem 1rem 1rem;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
          color: white;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .masonry-item:hover .masonry-caption {
          opacity: 1;
        }

        .masonry-caption span {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .masonry-item:focus {
          outline: none;
        }

        .masonry-item:focus-visible {
          outline: 3px solid #2563eb;
          outline-offset: 2px;
        }

        /* Premium Lightbox */
        .lightbox {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.95);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .lightbox-close {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          padding: 0.5rem;
          transition: color 0.2s;
          z-index: 10;
        }

        .lightbox-close:hover {
          color: white;
        }

        .lightbox-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          padding: 2rem;
          transition: color 0.2s;
          z-index: 10;
        }

        .lightbox-nav:hover {
          color: white;
        }

        .lightbox-prev {
          left: 0;
        }

        .lightbox-next {
          right: 0;
        }

        .lightbox-stage {
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 90vw;
          max-height: 90vh;
          position: relative;
        }

        .lightbox-loader {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .loader-spinner {
          width: 48px;
          height: 48px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .lightbox-image-wrap {
          position: relative;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .lightbox-image-wrap.loaded {
          opacity: 1;
        }

        :global(.lightbox-image) {
          max-width: 85vw;
          max-height: 75vh;
          width: auto;
          height: auto;
          object-fit: contain;
        }

        .lightbox-info {
          text-align: center;
          color: white;
          padding: 1.5rem 1rem;
          max-width: 600px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .lightbox-info.visible {
          opacity: 1;
        }

        .lightbox-info h2 {
          font-size: 1.25rem;
          font-weight: 500;
          margin: 0 0 0.5rem;
        }

        .lightbox-info p {
          font-size: 0.9rem;
          opacity: 0.8;
          margin: 0 0 0.75rem;
        }

        .lightbox-count {
          font-size: 0.8rem;
          opacity: 0.5;
        }

        /* Mobile Lightbox */
        @media (max-width: 768px) {
          .lightbox-nav {
            display: none;
          }

          .lightbox-close {
            top: 1rem;
            right: 1rem;
          }

          :global(.lightbox-image) {
            max-width: 95vw;
            max-height: 70vh;
          }

          .lightbox-info h2 {
            font-size: 1.1rem;
          }

          .gallery-filter {
            font-size: 0.8rem;
            padding: 0.4rem 0.75rem;
          }
        }
      `}</style>
    </>
  );
}
