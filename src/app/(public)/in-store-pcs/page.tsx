/**
 * IN-STORE PCS PAGE - Shows computers currently available for purchase in the store,
 * with prices and specs.
 *
 * WHEN TO EDIT: When changing how the computer gallery is displayed to customers.
 */
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
    imageUrl: computer.image || '/assets/csk-icon.svg',
    thumbnailUrl: computer.thumbnail || undefined,
    specs: computer.specs || [],
    isBlackFridaySale: computer.blackFriday?.enabled || false,
    stockQuantity: computer.stockQuantity ?? 1,
  };
}

/**
 * Skeleton loading placeholder for gallery rows
 */
function SkeletonRow({ reverse }: { reverse: boolean }) {
  return (
    <div className={`flex flex-col bg-white rounded-brand-lg shadow-gallery-card overflow-hidden transition-all duration-300 ${reverse ? '' : ''}`}>
      <div className="relative aspect-video bg-gradient-to-br from-bg-light to-bg-dark overflow-hidden skeleton-image">
        <div className="skeleton-shimmer"></div>
      </div>
      <div className="p-5 pb-6 flex flex-col grow bg-white skeleton-specs">
        <div className="skeleton-title"></div>
        <div className="skeleton-price"></div>
        <div className="skeleton-spec-list">
          <div className="skeleton-spec"></div>
          <div className="skeleton-spec"></div>
          <div className="skeleton-spec"></div>
          <div className="skeleton-spec"></div>
        </div>
        <div className="skeleton-tags">
          <div className="skeleton-tag"></div>
          <div className="skeleton-tag"></div>
        </div>
      </div>
    </div>
  );
}

function GalleryContent() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const handleImageLoad = (id: string) => {
    setLoadedImages((prev) => new Set(prev).add(id));
  };

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
      {/* Skeleton Loading Styles */}
      <style jsx>{`
        .skeleton-image {
          background: #e5e7eb;
          position: relative;
          overflow: hidden;
          min-height: 300px;
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

        .skeleton-specs {
          padding: 1.5rem;
        }

        .skeleton-title {
          height: 28px;
          width: 70%;
          background: #e5e7eb;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .skeleton-price {
          height: 32px;
          width: 40%;
          background: #e5e7eb;
          border-radius: 4px;
          margin-bottom: 1.5rem;
        }

        .skeleton-spec-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .skeleton-spec {
          height: 20px;
          width: 90%;
          background: #e5e7eb;
          border-radius: 4px;
        }

        .skeleton-spec:nth-child(2) { width: 85%; }
        .skeleton-spec:nth-child(3) { width: 75%; }
        .skeleton-spec:nth-child(4) { width: 80%; }

        .skeleton-tags {
          display: flex;
          gap: 0.5rem;
        }

        .skeleton-tag {
          height: 24px;
          width: 80px;
          background: #e5e7eb;
          border-radius: 12px;
        }

        .image-container {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 300px;
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
      `}</style>

      {/* Gallery Filters Section */}
      <section className="texture-dots py-8 bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <div className="flex justify-center gap-3 flex-wrap">
            <button
              className={`py-[0.7rem] px-[1.4rem] border-none rounded-full font-semibold text-[0.9rem] cursor-pointer transition-all duration-300 ${filter === 'all' ? 'filter-btn-active-gradient text-white shadow-filter-btn-active' : 'bg-white text-gray-700 shadow-filter-btn hover:bg-bg-light hover:text-primary-600 hover:-translate-y-0.5 hover:shadow-filter-btn-hover'}`}
              onClick={() => handleFilterClick('all')}
            >
              All Computers
            </button>
            <button
              className={`py-[0.7rem] px-[1.4rem] border-none rounded-full font-semibold text-[0.9rem] cursor-pointer transition-all duration-300 ${filter === 'desktop' ? 'filter-btn-active-gradient text-white shadow-filter-btn-active' : 'bg-white text-gray-700 shadow-filter-btn hover:bg-bg-light hover:text-primary-600 hover:-translate-y-0.5 hover:shadow-filter-btn-hover'}`}
              onClick={() => handleFilterClick('desktop')}
            >
              Desktops
            </button>
            <button
              className={`py-[0.7rem] px-[1.4rem] border-none rounded-full font-semibold text-[0.9rem] cursor-pointer transition-all duration-300 ${filter === 'laptop' ? 'filter-btn-active-gradient text-white shadow-filter-btn-active' : 'bg-white text-gray-700 shadow-filter-btn hover:bg-bg-light hover:text-primary-600 hover:-translate-y-0.5 hover:shadow-filter-btn-hover'}`}
              onClick={() => handleFilterClick('laptop')}
            >
              Laptops
            </button>
            <button
              className={`py-[0.7rem] px-[1.4rem] border-none rounded-full font-semibold text-[0.9rem] cursor-pointer transition-all duration-300 ${filter === 'refurbished' ? 'filter-btn-active-gradient text-white shadow-filter-btn-active' : 'bg-white text-gray-700 shadow-filter-btn hover:bg-bg-light hover:text-primary-600 hover:-translate-y-0.5 hover:shadow-filter-btn-hover'}`}
              onClick={() => handleFilterClick('refurbished')}
            >
              Refurbished
            </button>
            <button
              className={`py-[0.7rem] px-[1.4rem] border-none rounded-full font-semibold text-[0.9rem] cursor-pointer transition-all duration-300 ${filter === 'custom' ? 'filter-btn-active-gradient text-white shadow-filter-btn-active' : 'bg-white text-gray-700 shadow-filter-btn hover:bg-bg-light hover:text-primary-600 hover:-translate-y-0.5 hover:shadow-filter-btn-hover'}`}
              onClick={() => handleFilterClick('custom')}
            >
              Custom Builds
            </button>
          </div>
        </div>
      </section>

      {/* Gallery Grid Section */}
      <section className="py-16 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-8 mt-8 px-4" id="gallery-grid">
              {[0, 1, 2, 3].map((i) => (
                <SkeletonRow key={i} reverse={i % 2 === 1} />
              ))}
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchGallery}
                className="mt-4 inline-block px-8 py-4 rounded-brand-md font-semibold text-base transition-all duration-300 cursor-pointer bg-primary-600 text-white shadow-brand-sm hover:bg-primary-800 hover:-translate-y-0.5 hover:shadow-brand-md"
              >
                Try Again
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12 text-center">
              <p>No computers found{filter !== 'all' ? ` in "${filter}" category` : ''}.</p>
            </div>
          ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-8 mt-8 px-4" id="gallery-grid">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="flex flex-col bg-white rounded-brand-lg shadow-gallery-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-gallery-card-hover"
                data-category={item.category}
                data-computer-id={item.id}
                data-type={item.type}
              >
                {/* Image Section - 16:9 aspect ratio */}
                <div className="gallery-image-shadow relative aspect-video bg-gradient-to-br from-bg-light to-bg-dark overflow-hidden">
                  <div className="image-container">
                    {/* Skeleton placeholder */}
                    <div className={`image-skeleton ${loadedImages.has(item.id) ? 'loaded' : ''}`}>
                      <div className="skeleton-shimmer"></div>
                    </div>

                    {item.stockQuantity === 0 && (
                      <div className="out-of-stock-ribbon">
                        <span className="out-of-stock-text">OUT OF STOCK</span>
                      </div>
                    )}
                    {item.isBlackFridaySale && <div className="bf-ribbon-corner"></div>}
                    {item.isBlackFridaySale && (
                      <div className="badge-black-friday absolute top-4 right-4 py-2 px-5 rounded-full text-xs font-bold uppercase tracking-wider shadow-[0_4px_15px_rgba(0,0,0,0.2)] z-[2] backdrop-blur-[4px]">
                        Black Friday Sale
                      </div>
                    )}
                    <Image
                      src={item.thumbnailUrl || item.imageUrl}
                      alt={item.name}
                      width={640}
                      height={360}
                      className="w-full h-full object-cover transition-transform duration-[0.4s] ease-in-out group-hover:scale-[1.06]"
                      onLoad={() => handleImageLoad(item.id)}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/csk-icon.svg';
                        handleImageLoad(item.id);
                      }}
                    />
                  </div>
                </div>

                {/* Specs Section */}
                <div className="p-5 pb-6 flex flex-col grow bg-white">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight tracking-tight">{item.name}</h3>
                  <div className="text-xl font-bold text-primary-600 mb-4 flex flex-wrap gap-2 items-center">
                    {item.salePrice ? (
                      <>
                        <span className="line-through text-gray-700 text-base opacity-70">${item.price.toFixed(2)}</span>
                        <span className="text-red-600 text-[1.35rem] font-extrabold">${item.salePrice.toFixed(2)}</span>
                        <span className="savings-badge text-white py-1 px-[0.65rem] rounded-full text-[0.7rem] font-bold">
                          Save {Math.round(((item.price - item.salePrice) / item.price) * 100)}%
                        </span>
                      </>
                    ) : (
                      <span className="price-gradient-text text-2xl font-extrabold">${item.price.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-[0.35rem] mb-4 py-[0.85rem] border-t border-b border-bg-dark">
                    {item.specs.map((spec, specIndex) => (
                      <div key={specIndex} className="text-sm text-gray-900 py-[0.15rem] leading-snug">
                        <strong className="text-gray-700 font-semibold mr-[0.2rem]">{spec.label}:</strong> {spec.value}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-[0.6rem] flex-wrap">
                    <span className={`py-[0.4rem] px-[0.9rem] rounded-full text-[0.7rem] font-bold uppercase tracking-wider transition-transform duration-200 hover:-translate-y-px text-white ${
                      item.category.toLowerCase() === 'custom' ? 'category-custom-gradient shadow-blue-glow' :
                      item.category.toLowerCase() === 'refurbished' ? 'category-refurbished-gradient shadow-green-glow' :
                      'category-new-gradient shadow-purple-glow'
                    }`}>
                      {item.category.toLowerCase() === 'refurbished' ? 'Refurbished' :
                       (item.category.toLowerCase() === 'custom' && item.type.toLowerCase() === 'laptop') ? 'New' : 'Custom Built'}
                    </span>
                    <span className={`py-[0.4rem] px-[0.9rem] rounded-full text-[0.7rem] font-bold uppercase tracking-wider transition-transform duration-200 hover:-translate-y-px text-white ${
                      item.type.toLowerCase() === 'desktop' ? 'type-desktop-gradient shadow-[0_2px_6px_rgba(71,85,105,0.25)]' :
                      'type-laptop-gradient shadow-[0_2px_6px_rgba(100,116,139,0.25)]'
                    }`}>
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
      <section
        className="hero-overlay hero-clip text-white pt-32 pb-48 text-center relative overflow-visible z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=1920&q=80)' }}
      >
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[3]">
          <h2 className="text-white text-[clamp(2rem,4vw,3rem)] mb-6 font-bold">In-Store PCs</h2>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] mb-0 max-w-[700px] mx-auto opacity-95">Browse our collection of custom-built and refurbished computers ready for your home or business.</p>
        </div>
      </section>

      <Suspense fallback={<div className="w-[90%] max-w-[1200px] mx-auto px-4 py-8 text-center">Loading computers...</div>}>
        <GalleryContent />
      </Suspense>

      {/* Call-to-Action Section */}
      <section className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 text-center relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Interested in a Computer?</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Contact us to learn more about any of our available systems or to request a custom build.</p>
          <Link href="/contact" className="inline-block px-8 py-4 rounded-brand-md font-semibold text-base transition-all duration-300 cursor-pointer bg-white text-primary-600 shadow-brand-md hover:-translate-y-0.5 hover:shadow-brand-lg">Ask About This Computer</Link>
        </div>
      </section>
    </>
  );
}
