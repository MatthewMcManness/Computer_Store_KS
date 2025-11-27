'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { FAQSchema } from '@/components/seo/json-ld';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BUSINESS_INFO } from '@/lib/constants';
import {
  Shield,
  Phone,
  CheckCircle,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

const features = [
  {
    title: 'Anti-virus Software',
    description: 'Premium anti-virus protection included to keep your computer safe from threats.',
  },
  {
    title: '50% Off Virus Removal',
    description: 'Half price on virus and malware removal services if you do get infected.',
  },
  {
    title: 'Half-Price House Calls',
    description: 'On-site service at your home or office for 50% off regular rates.',
  },
  {
    title: '50% Off Account Recovery',
    description: 'Discounted help recovering locked or compromised online accounts.',
  },
  {
    title: 'Preventive Maintenance',
    description: 'Regular tune-ups to keep your computer running at peak performance.',
  },
  {
    title: 'Help Desk & Remote Support',
    description: 'Access to our help desk for quick questions and remote assistance.',
  },
  {
    title: 'Free Diagnostics',
    description: 'Complimentary computer diagnostics to identify any issues.',
  },
  {
    title: 'Performance Monitoring',
    description: 'We monitor your system health and alert you to potential problems.',
  },
  {
    title: '15% Labor Discount',
    description: '15% off labor costs on repairs not covered by other Silver Plan benefits.',
  },
];

const faqs = [
  {
    question: 'What is the Silver Plan?',
    answer: 'The Silver Plan is our monthly preventive maintenance program designed to keep your computer running smoothly and protected from threats. For $24.99/month, you get anti-virus software, discounted services, free diagnostics, and help desk support.',
  },
  {
    question: 'Is there a contract or commitment?',
    answer: 'Yes, there is a 3-month minimum commitment. After the initial 3 months, you can cancel at any time with 30 days notice.',
  },
  {
    question: 'How do I sign up?',
    answer: 'You can sign up by calling us at ' + BUSINESS_INFO.phoneFormatted + ', visiting our store, or filling out the contact form on our website. We will get you set up and protected right away.',
  },
  {
    question: 'What anti-virus software is included?',
    answer: 'We provide premium anti-virus software that includes real-time protection, malware scanning, and automatic updates. The specific software may vary based on your system requirements.',
  },
  {
    question: 'Can I use the Silver Plan for multiple computers?',
    answer: 'Each Silver Plan subscription covers one computer. If you have multiple computers, you can sign up for additional plans at the same rate.',
  },
  {
    question: 'What if I need repairs not covered by the plan?',
    answer: 'Any repairs not specifically covered by Silver Plan benefits (like 50% off virus removal) will receive a 15% discount on labor costs.',
  },
];

export function SilverPlanClient() {
  return (
    <>
      <FAQSchema questions={faqs} />

      {/* Breadcrumbs */}
      <section className="border-b bg-gray-50 py-4">
        <Container>
          <Breadcrumbs items={[{ label: 'Silver Plan' }]} />
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
            <motion.div
              className="mx-auto mb-6 inline-flex rounded-full bg-primary-100 p-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Shield className="h-12 w-12 text-primary-600" />
            </motion.div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Silver Plan
            </h1>
            <motion.p
              className="mt-4 text-xl text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Preventive Maintenance Program
            </motion.p>
            <motion.p
              className="mt-6 text-lg text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Keep your computer protected, optimized, and running smoothly with our
              comprehensive monthly maintenance plan.
            </motion.p>
          </motion.div>
        </Container>
      </section>

      {/* Pricing Card */}
      <section className="pb-16">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="mx-auto max-w-lg overflow-hidden">
              <CardHeader className="bg-primary-600 text-center text-white">
                <CardTitle className="text-3xl">Silver Plan</CardTitle>
                <motion.div
                  className="mt-4"
                  initial={{ scale: 0.8 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, type: 'spring' }}
                >
                  <span className="text-5xl font-bold">$24.99</span>
                  <span className="text-xl">/month</span>
                </motion.div>
                <p className="mt-2 text-primary-100">3-month minimum commitment</p>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {features.slice(0, 5).map((feature, index) => (
                    <motion.li
                      key={feature.title}
                      className="flex items-start gap-2"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-600" />
                      <span className="text-sm text-foreground">{feature.title}</span>
                    </motion.li>
                  ))}
                </ul>
                <div className="mt-6">
                  <a href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        size="lg"
                        variant="primary"
                        leftIcon={<Phone className="h-4 w-4" />}
                        className="w-full"
                      >
                        Sign Up Now
                      </Button>
                    </motion.div>
                  </a>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    Call {BUSINESS_INFO.phoneFormatted} to get started
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </section>

      {/* All Features */}
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
              Everything Included
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Comprehensive protection and support for your computer
            </p>
          </motion.div>

          <motion.div
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
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
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.2 }
                }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary-600" />
                      <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24">
        <Container>
          <motion.div
            className="mx-auto max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <HelpCircle className="mx-auto h-10 w-10 text-primary-600" />
              </motion.div>
              <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="mt-12 space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <details className="group">
                        <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-foreground">
                          {faq.question}
                          <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180" />
                        </summary>
                        <p className="mt-4 text-muted-foreground">{faq.answer}</p>
                      </details>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
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
              Protect Your Computer Today
            </h2>
            <p className="mt-4 text-lg text-primary-100">
              Join the Silver Plan and enjoy peace of mind knowing your computer is
              protected and maintained by professionals.
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
