'use client';

import * as React from 'react';
import { CategoryFilter } from '@/components/gallery/category-filter';
import { GalleryGrid } from '@/components/gallery/gallery-grid';

interface Computer {
  id: string;
  name: string;
  category: 'desktop' | 'laptop' | 'custom' | 'refurbished';
  price: number;
  imageFront: string;
  imageBack?: string;
  specs: {
    processor: string;
    ram: string;
    storage: string;
    graphics?: string;
    display?: string;
    os: string;
  };
  inStock?: boolean;
}

interface GalleryClientProps {
  computers: Computer[];
}

export function GalleryClient({ computers }: GalleryClientProps) {
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [isLoading, setIsLoading] = React.useState(true);

  // Simulate loading state
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredComputers = selectedCategory === 'all'
    ? computers
    : computers.filter((computer) => computer.category === selectedCategory);

  return (
    <>
      {/* Category Filter */}
      <div className="mb-8 flex justify-center">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* Gallery Grid */}
      <GalleryGrid
        computers={filteredComputers}
        isLoading={isLoading}
        emptyMessage="No computers found in this category. Please check back soon!"
      />
    </>
  );
}
