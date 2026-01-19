'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PhotoGalleryItem } from '@/types/photo-gallery';
import { PHOTO_CATEGORIES, transformPhoto, type PhotoGalleryDisplay } from '@/types/photo-gallery';

/**
 * Professional Photo Gallery Page
 *
 * Masonry-style gallery with premium lightbox.
 * Inspired by professional photographer portfolios (Squarespace, 500px, Unsplash).
 *
 * @version 1.0.0 - 2026-01-19T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-01-19T00:00:00Z - Redesigned with professional masonry layout
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

  return (
    <>
      {/* Minimal Hero */}
      <section className="gallery-hero">
        <h1>Gallery</h1>
        <p>Our store, builds, repairs, and more</p>
      </section>

      {/* Minimal Category Filters */}
      <nav className="gallery-nav">
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
      </nav>

      {/* Masonry Gallery */}
      <section className="gallery-section">
        {isLoading ? (
          <div className="gallery-status">
            <div className="gallery-loader"></div>
          </div>
        ) : error ? (
          <div className="gallery-status">
            <p className="gallery-error-text">{error}</p>
            <button onClick={fetchPhotos} className="gallery-retry">
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
                className="masonry-item"
                onClick={() => openLightbox(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openLightbox(index)}
              >
                <Image
                  src={photo.thumbnailUrl || photo.imageUrl}
                  alt={photo.title}
                  width={600}
                  height={600}
                  className="masonry-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/logo.png';
                  }}
                />
                <figcaption className="masonry-caption">
                  <span>{photo.title}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
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
            <X size={24} strokeWidth={1.5} />
          </button>

          {/* Navigation */}
          {filteredPhotos.length > 1 && (
            <>
              <button
                className="lightbox-nav lightbox-prev"
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                aria-label="Previous"
              >
                <ChevronLeft size={40} strokeWidth={1} />
              </button>
              <button
                className="lightbox-nav lightbox-next"
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                aria-label="Next"
              >
                <ChevronRight size={40} strokeWidth={1} />
              </button>
            </>
          )}

          {/* Image Container */}
          <div className="lightbox-stage" onClick={(e) => e.stopPropagation()}>
            <div className={`lightbox-image-wrap ${imageLoaded ? 'loaded' : ''}`}>
              <Image
                src={currentPhoto.imageUrl}
                alt={currentPhoto.title}
                width={1920}
                height={1080}
                className="lightbox-image"
                priority
                onLoad={() => setImageLoaded(true)}
              />
            </div>

            {/* Caption */}
            <div className="lightbox-info">
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
      <section className="cta">
        <div className="container">
          <h2>Want to See More?</h2>
          <p>Visit our store in Topeka or follow us on social media!</p>
          <a href="/contact" className="btn btn-white">Contact Us</a>
        </div>
      </section>

      <style jsx>{`
        /* Hero - Minimal */
        .gallery-hero {
          text-align: center;
          padding: 4rem 1rem 2rem;
          background: var(--bg-dark, #111);
          color: white;
        }

        .gallery-hero h1 {
          font-size: 2.5rem;
          font-weight: 300;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin: 0 0 0.5rem;
        }

        .gallery-hero p {
          font-size: 1rem;
          opacity: 0.7;
          font-weight: 300;
          margin: 0;
        }

        /* Navigation - Minimal text links */
        .gallery-nav {
          background: var(--bg-dark, #111);
          padding: 1rem 0 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .gallery-nav-inner {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          padding: 0 1rem;
        }

        .gallery-filter {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.8rem;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .gallery-filter:hover {
          color: rgba(255, 255, 255, 0.8);
        }

        .gallery-filter.active {
          color: white;
        }

        /* Gallery Section */
        .gallery-section {
          background: #0a0a0a;
          min-height: 50vh;
          padding: 2px;
        }

        .gallery-status {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 40vh;
          color: rgba(255, 255, 255, 0.6);
          gap: 1rem;
        }

        .gallery-loader {
          width: 40px;
          height: 40px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-top-color: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .gallery-error-text {
          color: #f87171;
        }

        .gallery-retry {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 0.5rem 1.5rem;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .gallery-retry:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        /* Masonry Grid */
        .masonry-grid {
          column-count: 4;
          column-gap: 3px;
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

        .masonry-item {
          break-inside: avoid;
          margin: 0 0 3px;
          position: relative;
          cursor: pointer;
          overflow: hidden;
        }

        :global(.masonry-image) {
          display: block;
          width: 100%;
          height: auto;
          transition: transform 0.4s ease, filter 0.4s ease;
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
          font-weight: 300;
          letter-spacing: 0.05em;
        }

        .masonry-item:focus {
          outline: none;
        }

        .masonry-item:focus-visible {
          outline: 2px solid white;
          outline-offset: -2px;
        }

        /* Premium Lightbox */
        .lightbox {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.97);
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
          color: rgba(255, 255, 255, 0.6);
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
          color: rgba(255, 255, 255, 0.4);
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
        }

        .lightbox-info h2 {
          font-size: 1.25rem;
          font-weight: 300;
          letter-spacing: 0.05em;
          margin: 0 0 0.5rem;
        }

        .lightbox-info p {
          font-size: 0.9rem;
          opacity: 0.7;
          margin: 0 0 0.75rem;
          font-weight: 300;
        }

        .lightbox-count {
          font-size: 0.75rem;
          opacity: 0.4;
          letter-spacing: 0.1em;
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

          .gallery-hero h1 {
            font-size: 2rem;
          }

          .gallery-filter {
            font-size: 0.7rem;
            padding: 0.4rem 0.75rem;
          }
        }
      `}</style>
    </>
  );
}
