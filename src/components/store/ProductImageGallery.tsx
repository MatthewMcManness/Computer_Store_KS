/**
 * Product image gallery component with thumbnail navigation.
 *
 * Client component that displays a primary image with clickable thumbnails
 * below. Supports multiple product images and shows the first image by default.
 *
 * @param images - Array of image URLs for the product
 * @param name - Product name for alt text
 * @returns Image gallery with main view and thumbnail strip
 *
 * @functions_called none
 * @called_by ProductDetailPage
 *
 * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  images: string[];
  name: string;
}

export function ProductImageGallery({ images, name }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) return null;

  const selectedImage = images[selectedIndex] ?? images[0]!;

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square relative rounded-xl overflow-hidden bg-white">
        <Image
          src={selectedImage}
          alt={`${name} - Image ${selectedIndex + 1}`}
          fill
          className="object-contain p-4"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                idx === selectedIndex
                  ? 'border-blue-600'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              aria-label={`View image ${idx + 1}`}
            >
              <Image
                src={img}
                alt={`${name} thumbnail ${idx + 1}`}
                width={64}
                height={64}
                className="object-contain p-1 w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
