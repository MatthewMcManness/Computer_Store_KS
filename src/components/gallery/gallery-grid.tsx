'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { FlipCard } from './flip-card';
import { GallerySkeleton } from './gallery-skeleton';
import { Container } from '@/components/layout/container';

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

interface GalleryGridProps {
  computers: Computer[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function GalleryGrid({
  computers,
  isLoading = false,
  emptyMessage = 'No computers found matching your criteria.',
}: GalleryGridProps) {
  if (isLoading) {
    return <GallerySkeleton count={8} />;
  }

  if (computers.length === 0) {
    return (
      <Container>
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">{emptyMessage}</p>
        </div>
      </Container>
    );
  }

  return (
    <motion.div
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1, delayChildren: 0.1 }
        }
      }}
    >
      {computers.map((computer, index) => (
        <motion.div
          key={computer.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.4 }}
        >
          <FlipCard
            id={computer.id}
            name={computer.name}
            category={computer.category}
            price={computer.price}
            imageFront={computer.imageFront}
            imageBack={computer.imageBack}
            specs={computer.specs}
            inStock={computer.inStock}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
