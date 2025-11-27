'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';

interface GalleryPageWrapperProps {
  children: ReactNode;
}

export function GalleryPageWrapper({ children }: GalleryPageWrapperProps) {
  return (
    <>
      {/* Breadcrumbs */}
      <section className="border-b bg-gray-50 py-4">
        <Container>
          <Breadcrumbs items={[{ label: 'Gallery' }]} />
        </Container>
      </section>

      {/* Hero Section */}
      <section className="py-16 sm:py-24">
        <Container>
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Computer Gallery
            </h1>
            <motion.p
              className="mt-6 text-lg text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Browse our selection of quality refurbished computers and custom builds.
              Click on any computer to see specifications. Contact us for pricing and availability.
            </motion.p>
          </motion.div>
        </Container>
      </section>

      {/* Filter and Grid */}
      <section className="pb-16 sm:pb-24">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {children}
          </motion.div>

          {/* Note */}
          <motion.p
            className="mt-8 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Inventory changes frequently. Call us at (785) 267-3223 for current availability.
          </motion.p>
        </Container>
      </section>
    </>
  );
}
