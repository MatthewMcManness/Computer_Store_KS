'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { GalleryComputer } from '@/types/gallery';

interface GalleryItem {
  id: string;
  name: string;
  category: string;
  type: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
  thumbnailUrl?: string;
  specs: Array<{ label: string; value: string }>;
  isBlackFridaySale?: boolean;
  stockQuantity: number;
}

/**
 * Transforms API computer data to the display format.
 *
 * Parses price strings to numbers and extracts sale pricing
 * from Black Friday data when enabled.
 *
 * @param computer - Raw computer data from API
 * @returns Transformed gallery item for display
 *
 * @functions_called parseFloat
 * @called_by GalleryContent
 *
 * @version 1.0.0 - 2026-01-14T18:30:00Z - Initial implementation
 */
function transformComputer(computer: GalleryComputer): GalleryItem {
  const price = parseFloat(computer.price.replace(/[$,]/g, ''));
  const salePrice = computer.blackFriday?.enabled
    ? parseFloat(computer.blackFriday.salePrice.replace(/[$,]/g, ''))
    : undefined;

  return {
    id: computer.id,
    name: computer.name,
    category: computer.category,
    type: computer.type,
    price,
    salePrice,
    imageUrl: computer.image || '/assets/logo.png',
    thumbnailUrl: computer.thumbnail || undefined,
    specs: computer.specs || [],
    isBlackFridaySale: computer.blackFriday?.enabled || false,
    stockQuantity: computer.stockQuantity ?? 1,
  };
}

function GalleryContent() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch gallery data from API (Supabase)
  const fetchGallery = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/in-store');
      const result = await response.json();

      if (result.success && result.data) {
        const transformed = result.data.map(transformComputer);
        setItems(transformed);
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
    fetchGallery();
  }, [fetchGallery]);

  useEffect(() => {
    const urlFilter = searchParams?.get('filter');
    if (urlFilter) {
      setFilter(urlFilter);
    }
  }, [searchParams]);

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    return item.category === filter || item.type === filter;
  });

  const handleFilterClick = (newFilter: string) => {
    setFilter(newFilter);
  };

  return (
    <>
      {/* Gallery Filters Section */}
      <section className="gallery-filters-section horizontal-diamond texture-dots overlap-card-container">
        <div className="diamond-accent diamond-accent-1"></div>
        <div className="container overlap-card">
          <div className="gallery-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterClick('all')}
            >
              All Computers
            </button>
            <button
              className={`filter-btn ${filter === 'desktop' ? 'active' : ''}`}
              onClick={() => handleFilterClick('desktop')}
            >
              Desktops
            </button>
            <button
              className={`filter-btn ${filter === 'laptop' ? 'active' : ''}`}
              onClick={() => handleFilterClick('laptop')}
            >
              Laptops
            </button>
            <button
              className={`filter-btn ${filter === 'refurbished' ? 'active' : ''}`}
              onClick={() => handleFilterClick('refurbished')}
            >
              Refurbished
            </button>
            <button
              className={`filter-btn ${filter === 'custom' ? 'active' : ''}`}
              onClick={() => handleFilterClick('custom')}
            >
              Custom Builds
            </button>
          </div>
        </div>
      </section>

      {/* Gallery Grid Section */}
      <section className="gallery-section">
        <div className="container">
          {isLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <p>Loading gallery...</p>
            </div>
          ) : error ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: '#dc2626' }}>{error}</p>
              <button
                onClick={fetchGallery}
                className="btn"
                style={{ marginTop: '1rem' }}
              >
                Try Again
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <p>No computers found{filter !== 'all' ? ` in "${filter}" category` : ''}.</p>
            </div>
          ) : (
          <div className="gallery-rows" id="gallery-grid">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className={`gallery-row ${index % 2 === 1 ? 'gallery-row-reverse' : ''}`}
                data-category={item.category}
                data-computer-id={item.id}
                data-type={item.type}
              >
                {/* Image Section - 16:9 aspect ratio */}
                <div className="gallery-row-image">
                  {item.stockQuantity === 0 && (
                    <div className="out-of-stock-ribbon">
                      <span className="out-of-stock-text">OUT OF STOCK</span>
                    </div>
                  )}
                  {item.isBlackFridaySale && <div className="bf-ribbon-corner"></div>}
                  {item.isBlackFridaySale && (
                    <div className="gallery-row-badge badge-black-friday">
                      Black Friday Sale
                    </div>
                  )}
                  <Image
                    src={item.thumbnailUrl || item.imageUrl}
                    alt={item.name}
                    width={640}
                    height={360}
                    className="gallery-row-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/logo.png';
                    }}
                  />
                </div>

                {/* Specs Section */}
                <div className="gallery-row-specs">
                  <h3 className="gallery-row-title">{item.name}</h3>
                  <div className="gallery-row-price">
                    {item.salePrice ? (
                      <>
                        <span className="original-price">${item.price.toFixed(2)}</span>
                        <span className="sale-price">${item.salePrice.toFixed(2)}</span>
                        <span className="savings-badge">
                          Save {Math.round(((item.price - item.salePrice) / item.price) * 100)}%
                        </span>
                      </>
                    ) : (
                      <span className="current-price">${item.price.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="gallery-row-specs-list">
                    {item.specs.map((spec, specIndex) => (
                      <div key={specIndex} className="spec-item">
                        <strong>{spec.label}:</strong> {spec.value}
                      </div>
                    ))}
                  </div>
                  <div className="gallery-row-category">
                    <span className={`category-tag category-${item.category.toLowerCase()}`}>
                      {item.category.toLowerCase() === 'refurbished' ? 'Refurbished' :
                       (item.category.toLowerCase() === 'custom' && item.type.toLowerCase() === 'laptop') ? 'New' : 'Custom Built'}
                    </span>
                    <span className={`type-tag type-${item.type.toLowerCase()}`}>
                      {item.type.toLowerCase() === 'desktop' ? 'Desktop' : 'Laptop'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function InStorePCsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h2>In-Store PCs</h2>
          <p>Browse our collection of custom-built and refurbished computers ready for your home or business.</p>
        </div>
      </section>

      <Suspense fallback={<div className="container" style={{ padding: '2rem', textAlign: 'center' }}>Loading computers...</div>}>
        <GalleryContent />
      </Suspense>

      {/* Call-to-Action Section */}
      <section className="cta">
        <div className="container">
          <h2>Interested in a Computer?</h2>
          <p>Contact us to learn more about any of our available systems or to request a custom build.</p>
          <Link href="/contact" className="btn btn-white">Ask About This Computer</Link>
        </div>
      </section>
    </>
  );
}
