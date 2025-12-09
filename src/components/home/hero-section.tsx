'use client';

import * as React from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO } from '@/lib/constants';
import { Phone, ArrowRight, CheckCircle, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';

const highlights = [
  'Expert Computer Repair',
  'Quality Refurbished PCs',
  'Custom PC Builds',
  'Fast Turnaround',
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50 py-16 sm:py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" aria-hidden="true" />

      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <motion.div
            className="text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Your Trusted{' '}
              <span className="text-primary-600">Computer Experts</span> in Topeka
            </h1>

            <motion.p
              className="mt-6 text-lg text-muted-foreground sm:text-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Quality refurbished computers, expert repairs, and exceptional customer service.
              Serving the Topeka community since {BUSINESS_INFO.founded}.
            </motion.p>

            {/* Highlights */}
            <motion.ul
              className="mt-8 grid gap-3 sm:grid-cols-2"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1, delayChildren: 0.3 }
                }
              }}
            >
              {highlights.map((item) => (
                <motion.li
                  key={item}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    visible: { opacity: 1, x: 0 }
                  }}
                >
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary-600" />
                  {item}
                </motion.li>
              ))}
            </motion.ul>

            {/* CTA Buttons */}
            <motion.div
              className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <Link href="/contact">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" variant="primary" leftIcon={<Wrench className="h-4 w-4" />}>
                    Get a Quote
                  </Button>
                </motion.div>
              </Link>
              <a href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" variant="outline" leftIcon={<Phone className="h-4 w-4" />}>
                    Call Now - Same Day Service
                  </Button>
                </motion.div>
              </a>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15, delayChildren: 0.4 }
              }
            }}
          >
            <StatCard value="20+" label="Years Experience" index={0} />
            <StatCard value="10,000+" label="Happy Customers" index={1} />
            <StatCard value="25,000+" label="Computers Repaired" index={2} />
            <StatCard value="98%" label="Satisfaction Rate" index={3} />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

function StatCard({ value, label, index }: { value: string; label: string; index: number }) {
  return (
    <motion.div
      className="rounded-lg border bg-white p-6 text-center shadow-sm"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{
        y: -5,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        transition: { duration: 0.2 }
      }}
    >
      <div className="text-3xl font-bold text-primary-600 sm:text-4xl">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </motion.div>
  );
}
