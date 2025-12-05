'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import galleryData from '@/data/gallery.json';

interface GalleryItem {
  id: string;
  name: string;
  category: string;
  type: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
  specs: Array<{ label: string; value: string }>;
  isBlackFridaySale?: boolean;
}

// Transform gallery.json data to the format we need
const galleryItems: GalleryItem[] = galleryData.computers.map((computer) => {
  const price = parseFloat(computer.price.replace(/[$,]/g, ''));
  const salePrice = computer.blackFriday?.enabled
    ? parseFloat(computer.blackFriday.salePrice.replace(/[$,]/g, ''))
    : undefined;

  return {
    id: String(computer.id),
    name: computer.name,
    category: computer.category,
    type: computer.type,
    price,
    salePrice,
    imageUrl: computer.image,
    specs: computer.specs,
    isBlackFridaySale: computer.blackFriday?.enabled || false,
  };
});

function GalleryContent() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState('all');
  const [items] = useState<GalleryItem[]>(galleryItems);

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
                      {item.specs.map((spec, index) => (
                        <div key={index} className="spec-item">
                          <strong>{spec.label}:</strong> {spec.value}
                        </div>
                      ))}
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
