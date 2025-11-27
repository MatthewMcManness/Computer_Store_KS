'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BUSINESS_INFO } from '@/lib/constants';
import {
  Award,
  Users,
  ShieldCheck,
  Heart,
  Clock,
  Wrench,
  Phone,
  ArrowRight
} from 'lucide-react';

const values = [
  {
    icon: ShieldCheck,
    title: 'Integrity',
    description: 'We provide honest assessments and fair pricing. No hidden fees or unnecessary repairs.',
  },
  {
    icon: Award,
    title: 'Quality',
    description: 'Every computer we sell is thoroughly tested and refurbished to meet our high standards.',
  },
  {
    icon: Users,
    title: 'Customer Focus',
    description: 'Your satisfaction is our priority. We take time to understand your needs and budget.',
  },
  {
    icon: Heart,
    title: 'Community',
    description: 'Proudly serving Topeka and surrounding areas. We treat every customer like a neighbor.',
  },
];

const whyChooseUs = [
  {
    icon: Clock,
    title: 'Fast Turnaround',
    description: 'Most repairs completed within 24-48 hours',
  },
  {
    icon: Wrench,
    title: 'Expert Technicians',
    description: 'Certified professionals with decades of experience',
  },
  {
    icon: ShieldCheck,
    title: 'Warranty Protection',
    description: '90-day warranty on all repairs and refurbished computers',
  },
  {
    icon: Users,
    title: 'Personal Service',
    description: 'Direct access to technicians who work on your computer',
  },
];

export function AboutPageClient() {
  const yearsInBusiness = new Date().getFullYear() - BUSINESS_INFO.founded;

  return (
    <>
      {/* Breadcrumbs */}
      <section className="border-b bg-gray-50 py-4">
        <Container>
          <Breadcrumbs items={[{ label: 'About Us' }]} />
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
              About {BUSINESS_INFO.name}
            </h1>
            <motion.p
              className="mt-6 text-lg text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Serving the Topeka community with quality computer sales and repair services
              for over {yearsInBusiness} years.
            </motion.p>
          </motion.div>
        </Container>
      </section>

      {/* Our Story */}
      <section className="border-y bg-white py-16">
        <Container>
          <motion.div
            className="mx-auto max-w-3xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-foreground">Our Story</h2>
            <div className="mt-6 space-y-4 text-muted-foreground">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                {BUSINESS_INFO.name} was founded in {BUSINESS_INFO.founded} by{' '}
                <strong className="text-foreground">{BUSINESS_INFO.founder}</strong> with a simple
                mission: to provide the Topeka community with honest, reliable computer services at fair prices.
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                What started as a small repair shop has grown into a trusted destination for
                computer sales, repairs, and custom builds. Over the past {yearsInBusiness} years,
                we have helped thousands of customers get the most out of their technology.
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                Unlike big-box stores, we take the time to understand each customer&apos;s unique needs.
                Whether you need a computer for basic tasks, gaming, or professional work, we will
                find the right solution for your budget.
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                Today, we remain committed to the same values that {BUSINESS_INFO.founder} established
                from day one: integrity, quality, and exceptional customer service.
              </motion.p>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Our Values */}
      <section className="py-16 sm:py-24">
        <Container>
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Our Values</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The principles that guide everything we do
            </p>
          </motion.div>

          <motion.div
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15, delayChildren: 0.2 }
              }
            }}
          >
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{
                    y: -8,
                    transition: { duration: 0.2 }
                  }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6 text-center">
                      <div className="mx-auto mb-4 inline-flex rounded-lg bg-primary-50 p-3">
                        <Icon className="h-6 w-6 text-primary-600" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-foreground">
                        {value.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </Container>
      </section>

      {/* Why Choose Us */}
      <section className="border-y bg-gray-50 py-16 sm:py-24">
        <Container>
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Why Choose Us?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              What sets {BUSINESS_INFO.shortName} apart from the competition
            </p>
          </motion.div>

          <motion.div
            className="mt-12 grid gap-8 sm:grid-cols-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1, delayChildren: 0.2 }
              }
            }}
          >
            {whyChooseUs.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  className="flex gap-4"
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                >
                  <div className="flex-shrink-0">
                    <motion.div
                      className="inline-flex rounded-lg bg-primary-100 p-3"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon className="h-6 w-6 text-primary-600" />
                    </motion.div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </Container>
      </section>

      {/* Stats */}
      <section className="py-16">
        <Container>
          <motion.div
            className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15, delayChildren: 0.1 }
              }
            }}
          >
            {[
              { value: `${yearsInBusiness}+`, label: 'Years in Business' },
              { value: '10,000+', label: 'Happy Customers' },
              { value: '25,000+', label: 'Computers Repaired' },
              { value: '98%', label: 'Satisfaction Rate' },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: { opacity: 1, scale: 1 }
                }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
              >
                <div className="text-4xl font-bold text-primary-600">{stat.value}</div>
                <div className="mt-2 text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-16">
        <Container>
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to Experience the Difference?
            </h2>
            <p className="mt-4 text-lg text-primary-100">
              Visit our store or give us a call. We look forward to helping you with all your
              computer needs.
            </p>
            <motion.div
              className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <a href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    variant="secondary"
                    leftIcon={<Phone className="h-4 w-4" />}
                    className="bg-white text-primary-600 hover:bg-gray-100"
                  >
                    Call {BUSINESS_INFO.phoneFormatted}
                  </Button>
                </motion.div>
              </a>
              <Link href="/contact">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                    className="border-white text-white hover:bg-white/10"
                  >
                    Contact Us
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </Container>
      </section>
    </>
  );
}
