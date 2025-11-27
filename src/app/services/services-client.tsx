'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BUSINESS_INFO } from '@/lib/constants';
import {
  Wrench,
  ShieldAlert,
  Cpu,
  HardDrive,
  Monitor,
  Sparkles,
  Phone,
  ArrowRight,
  CheckCircle,
  Terminal,
} from 'lucide-react';

const services = [
  {
    id: 'computer-repair',
    icon: Wrench,
    title: 'Computer Repair',
    description: 'Expert diagnosis and repair for all PC and laptop issues. We fix hardware failures, software problems, and connectivity issues.',
    benefits: [
      'Free diagnostic assessment',
      'Most repairs completed in 24-48 hours',
      '90-day warranty on all repairs',
      'Both desktop and laptop repair',
    ],
  },
  {
    id: 'virus-removal',
    icon: ShieldAlert,
    title: 'Virus & Malware Removal',
    description: 'Complete removal of viruses, malware, spyware, and ransomware. We restore your computer to peak performance and secure it against future threats.',
    benefits: [
      'Thorough malware scan and removal',
      'System optimization included',
      'Security software recommendations',
      'Data backup before cleaning',
    ],
  },
  {
    id: 'custom-builds',
    icon: Cpu,
    title: 'Custom PC Builds',
    description: 'Tailored computer builds designed for your specific needs. Gaming rigs, workstations, or home office setups - built to your specifications and budget.',
    benefits: [
      'Personalized consultation',
      'Quality components with warranty',
      'Professional assembly and testing',
      'OS installation and setup included',
    ],
  },
  {
    id: 'data-recovery',
    icon: HardDrive,
    title: 'Data Recovery',
    description: 'Recover lost or deleted files from damaged, failed, or corrupted storage devices. We handle hard drives, SSDs, USB drives, and memory cards.',
    benefits: [
      'Free evaluation of recovery chances',
      'No data, no charge policy',
      'Secure and confidential handling',
      'Multiple recovery techniques',
    ],
  },
  {
    id: 'hardware-repair',
    icon: Monitor,
    title: 'Hardware Repair & Upgrades',
    description: 'Repair or upgrade your computer hardware. Screen replacements, RAM upgrades, SSD installations, power supply repairs, and more.',
    benefits: [
      'Quality replacement parts',
      'Competitive pricing',
      'Performance improvement guaranteed',
      'Same-day service for many upgrades',
    ],
  },
  {
    id: 'linux-migration',
    icon: Terminal,
    title: 'Linux Migration Services',
    description: 'Ready to switch to Linux? We help you migrate from Windows or macOS to Linux distributions like Ubuntu, Linux Mint, or Fedora. Enjoy faster performance, better security, and no licensing fees.',
    benefits: [
      'Full data migration and backup',
      'Software alternatives setup',
      'User training and documentation',
      'Post-migration support included',
    ],
  },
];

export function ServicesPageClient() {
  return (
    <>
      {/* Breadcrumbs */}
      <section className="border-b bg-gray-50 py-4">
        <Container>
          <Breadcrumbs items={[{ label: 'Services' }]} />
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
              Our Services
            </h1>
            <motion.p
              className="mt-6 text-lg text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Professional computer services you can trust. From simple repairs to custom builds,
              we have the expertise to handle all your technology needs.
            </motion.p>
          </motion.div>
        </Container>
      </section>

      {/* Services List */}
      <section className="pb-16">
        <Container>
          <div className="space-y-12">
            {services.map((service, index) => {
              const Icon = service.icon;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card id={service.id} className="overflow-hidden">
                    <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                      {/* Icon Section */}
                      <motion.div
                        className="flex items-center justify-center bg-primary-50 p-8 lg:w-1/3"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon className="h-24 w-24 text-primary-600" />
                      </motion.div>

                      {/* Content Section */}
                      <div className="lg:w-2/3">
                        <CardHeader>
                          <CardTitle className="text-2xl">{service.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">{service.description}</p>

                          <motion.ul
                            className="mt-6 grid gap-2 sm:grid-cols-2"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={{
                              hidden: { opacity: 0 },
                              visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.1, delayChildren: 0.2 }
                              }
                            }}
                          >
                            {service.benefits.map((benefit) => (
                              <motion.li
                                key={benefit}
                                className="flex items-start gap-2"
                                variants={{
                                  hidden: { opacity: 0, x: -10 },
                                  visible: { opacity: 1, x: 0 }
                                }}
                              >
                                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-600" />
                                <span className="text-sm text-muted-foreground">{benefit}</span>
                              </motion.li>
                            ))}
                          </motion.ul>
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Silver Plan Promotion */}
      <section className="border-y bg-gray-50 py-16">
        <Container>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="overflow-hidden bg-gradient-to-r from-primary-50 to-primary-100">
              <CardContent className="p-8 sm:p-12">
                <div className="flex flex-col items-center gap-8 lg:flex-row">
                  <motion.div
                    className="flex-shrink-0"
                    whileHover={{ rotate: 15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="inline-flex rounded-full bg-primary-200 p-6">
                      <Sparkles className="h-12 w-12 text-primary-600" />
                    </div>
                  </motion.div>
                  <div className="flex-1 text-center lg:text-left">
                    <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                      Silver Plan - Preventive Maintenance
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                      Keep your computer running smoothly with our monthly maintenance plan.
                      Includes anti-virus protection, 50% off virus removal, free diagnostics,
                      and much more!
                    </p>
                    <p className="mt-4 text-2xl font-bold text-primary-600">
                      Just $24.99/month
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Link href="/silver-plan">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          size="lg"
                          variant="primary"
                          rightIcon={<ArrowRight className="h-4 w-4" />}
                        >
                          Learn More
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
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
              Need Computer Help?
            </h2>
            <p className="mt-4 text-lg text-primary-100">
              Get a free estimate for your repair or project. We offer competitive pricing
              and fast turnaround times.
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
                    Request Quote
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
