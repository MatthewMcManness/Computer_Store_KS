'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface GalleryItem {
  id: string;
  name: string;
  category: string;
  type: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
  specs: {
    graphicsCard?: string;
    processor?: string;
    memory?: string;
    storage?: string;
  };
  isBlackFridaySale?: boolean;
}

// Sample gallery data - in production this would come from an API
const galleryItems: GalleryItem[] = [
  {
    id: '1',
    name: 'Okinos Blackout',
    category: 'refurbished',
    type: 'desktop',
    price: 750,
    salePrice: 675,
    imageUrl: '/assets/gallery/desktop-1.jpg',
    specs: {
      graphicsCard: 'RTX 3060',
      processor: 'Ryzen 5 5000 Series',
      memory: '16 GB',
      storage: '1 TB NVMe',
    },
    isBlackFridaySale: true,
  },
];

function GalleryContent() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState('all');
  const [items] = useState<GalleryItem[]>(galleryItems);

  useEffect(() => {
    const urlFilter = searchParams.get('filter');
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
          <div className="gallery-grid" id="gallery-grid">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="gallery-card"
                data-category={item.category}
                data-computer-id={item.id}
                data-type={item.type}
              >
                <div className="gallery-card-inner">
                  <div className="gallery-card-front">
                    {item.isBlackFridaySale && <div className="bf-ribbon-corner"></div>}
                    {item.isBlackFridaySale && (
                      <div className="gallery-card-badge badge-black-friday">
                        Black Friday Sale
                      </div>
                    )}
                    <div className="gallery-card-image">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={300}
                        height={200}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/logo.png';
                        }}
                      />
                    </div>
                  </div>
                  <div className="gallery-card-back">
                    <h3 className="gallery-card-title">{item.name}</h3>
                    <div className="gallery-card-price">
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
                    <div className="gallery-card-specs">
                      {item.specs.graphicsCard && (
                        <div className="spec-item">
                          <strong>Graphics Card:</strong> {item.specs.graphicsCard}
                        </div>
                      )}
                      {item.specs.processor && (
                        <div className="spec-item">
                          <strong>Processor:</strong> {item.specs.processor}
                        </div>
                      )}
                      {item.specs.memory && (
                        <div className="spec-item">
                          <strong>Memory:</strong> {item.specs.memory}
                        </div>
                      )}
                      {item.specs.storage && (
                        <div className="spec-item">
                          <strong>Storage:</strong> {item.specs.storage}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default function GalleryPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h2>Our Gallery</h2>
          <p>Browse our collection of custom-built and refurbished computers ready for your home or business.</p>
        </div>
      </section>

      <Suspense fallback={<div className="container" style={{ padding: '2rem', textAlign: 'center' }}>Loading gallery...</div>}>
        <GalleryContent />
      </Suspense>

      {/* Call-to-Action Section */}
      <section className="cta">
        <div className="container">
          <h2>Interested in a Computer?</h2>
          <p>Contact us to learn more about any of our available systems or to request a custom build.</p>
          <Link href="/contact" className="btn btn-white">Get in Touch</Link>
        </div>
      </section>
    </>
  );
}
