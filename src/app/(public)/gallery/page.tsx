'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PhotoGalleryItem } from '@/types/photo-gallery';
import { PHOTO_CATEGORIES, transformPhoto, type PhotoGalleryDisplay } from '@/types/photo-gallery';

/**
 * Public Photo Gallery Page
 *
 * Displays a grid of photos with lightbox functionality.
 * Supports filtering by category.
 *
 * @version 1.0.0 - 2026-01-19T00:00:00Z - Initial implementation
 */
export default function GalleryPage() {
  const [photos, setPhotos] = useState<PhotoGalleryDisplay[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<PhotoGalleryDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

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
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? filteredPhotos.length - 1 : prev - 1));
  };

  const goToNext = () => {
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

  const currentPhoto = filteredPhotos[currentIndex];

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h2>Photo Gallery</h2>
          <p>Take a look at our store, custom builds, repairs, and more!</p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="gallery-filters-section horizontal-diamond texture-dots overlap-card-container">
        <div className="diamond-accent diamond-accent-1"></div>
        <div className="container overlap-card">
          <div className="gallery-filters">
            {PHOTO_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                className={`filter-btn ${selectedCategory === cat.value ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="photo-gallery-section">
        <div className="container">
          {isLoading ? (
            <div className="gallery-loading">
              <p>Loading photos...</p>
            </div>
          ) : error ? (
            <div className="gallery-error">
              <p>{error}</p>
              <button onClick={fetchPhotos} className="btn">
                Try Again
              </button>
            </div>
          ) : filteredPhotos.length === 0 ? (
            <div className="gallery-empty">
              <p>No photos found{selectedCategory !== 'all' ? ` in "${selectedCategory}" category` : ''}.</p>
            </div>
          ) : (
            <div className="photo-gallery-grid">
              {filteredPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="photo-gallery-item"
                  onClick={() => openLightbox(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && openLightbox(index)}
                >
                  <Image
                    src={photo.thumbnailUrl || photo.imageUrl}
                    alt={photo.title}
                    width={400}
                    height={300}
                    className="photo-gallery-thumbnail"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/logo.png';
                    }}
                  />
                  <div className="photo-gallery-overlay">
                    <h4>{photo.title}</h4>
                    {photo.description && <p>{photo.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxOpen && currentPhoto && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              className="lightbox-close"
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              <X size={32} />
            </button>

            {/* Previous button */}
            {filteredPhotos.length > 1 && (
              <button
                className="lightbox-nav lightbox-prev"
                onClick={goToPrevious}
                aria-label="Previous photo"
              >
                <ChevronLeft size={48} />
              </button>
            )}

            {/* Image */}
            <div className="lightbox-image-container">
              <Image
                src={currentPhoto.imageUrl}
                alt={currentPhoto.title}
                width={1200}
                height={900}
                className="lightbox-image"
                priority
              />
            </div>

            {/* Next button */}
            {filteredPhotos.length > 1 && (
              <button
                className="lightbox-nav lightbox-next"
                onClick={goToNext}
                aria-label="Next photo"
              >
                <ChevronRight size={48} />
              </button>
            )}

            {/* Caption */}
            <div className="lightbox-caption">
              <h3>{currentPhoto.title}</h3>
              {currentPhoto.description && <p>{currentPhoto.description}</p>}
              <span className="lightbox-counter">
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
          <p>Visit our store in Topeka or follow us on social media for the latest updates!</p>
          <a href="/contact" className="btn btn-white">Contact Us</a>
        </div>
      </section>

      {/* Lightbox Styles */}
      <style jsx>{`
        .photo-gallery-section {
          padding: 3rem 0;
        }

        .gallery-loading,
        .gallery-error,
        .gallery-empty {
          padding: 3rem;
          text-align: center;
        }

        .gallery-error p {
          color: #dc2626;
          margin-bottom: 1rem;
        }

        .photo-gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .photo-gallery-item {
          position: relative;
          cursor: pointer;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          aspect-ratio: 4 / 3;
        }

        .photo-gallery-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .photo-gallery-item:focus {
          outline: 3px solid var(--primary, #2563eb);
          outline-offset: 2px;
        }

        :global(.photo-gallery-thumbnail) {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo-gallery-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
          color: white;
          padding: 2rem 1rem 1rem;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .photo-gallery-item:hover .photo-gallery-overlay {
          opacity: 1;
        }

        .photo-gallery-overlay h4 {
          margin: 0 0 0.25rem;
          font-size: 1.1rem;
        }

        .photo-gallery-overlay p {
          margin: 0;
          font-size: 0.85rem;
          opacity: 0.9;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Lightbox */
        .lightbox-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lightbox-content {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .lightbox-close {
          position: absolute;
          top: -50px;
          right: 0;
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.5rem;
          z-index: 10;
          opacity: 0.8;
          transition: opacity 0.2s;
        }

        .lightbox-close:hover {
          opacity: 1;
        }

        .lightbox-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          cursor: pointer;
          padding: 1rem;
          border-radius: 50%;
          opacity: 0.7;
          transition: opacity 0.2s, background 0.2s;
          z-index: 10;
        }

        .lightbox-nav:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.2);
        }

        .lightbox-prev {
          left: -80px;
        }

        .lightbox-next {
          right: -80px;
        }

        .lightbox-image-container {
          display: flex;
          align-items: center;
          justify-content: center;
          max-width: 100%;
          max-height: 70vh;
        }

        :global(.lightbox-image) {
          max-width: 100%;
          max-height: 70vh;
          object-fit: contain;
          border-radius: 8px;
        }

        .lightbox-caption {
          text-align: center;
          color: white;
          padding: 1.5rem 1rem;
          max-width: 600px;
        }

        .lightbox-caption h3 {
          margin: 0 0 0.5rem;
          font-size: 1.5rem;
        }

        .lightbox-caption p {
          margin: 0 0 1rem;
          opacity: 0.9;
        }

        .lightbox-counter {
          font-size: 0.9rem;
          opacity: 0.7;
        }

        @media (max-width: 768px) {
          .photo-gallery-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1rem;
          }

          .lightbox-nav {
            display: none;
          }

          .lightbox-close {
            top: 10px;
            right: 10px;
          }

          .lightbox-content {
            max-width: 100vw;
            max-height: 100vh;
            padding: 3rem 1rem;
          }
        }
      `}</style>
    </>
  );
}
