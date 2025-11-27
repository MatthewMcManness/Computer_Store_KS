'use client';

import { motion } from 'framer-motion';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { ContactForm } from '@/components/forms/contact-form';
import { Card, CardContent } from '@/components/ui/card';
import { BUSINESS_INFO } from '@/lib/constants';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';

export function ContactPageClient() {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BUSINESS_INFO.address)}`;
  const googleMapsEmbedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3097.8!2d${BUSINESS_INFO.geo.longitude}!3d${BUSINESS_INFO.geo.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMznCsDAx&apos;NTIuMyJOIDk1wrA0MiYjMzk7MjQuNSJX!5e0!3m2!1sen!2sus!4v1234567890`;

  return (
    <>
      {/* Breadcrumbs */}
      <section className="border-b bg-gray-50 py-4">
        <Container>
          <Breadcrumbs items={[{ label: 'Contact Us' }]} />
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
              Contact Us
            </h1>
            <motion.p
              className="mt-6 text-lg text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Have a question or need service? We are here to help. Reach out to us
              using the form below, give us a call, or stop by our store.
            </motion.p>
          </motion.div>
        </Container>
      </section>

      {/* Contact Content */}
      <section className="pb-16 sm:pb-24">
        <Container>
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Contact Form */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <ContactForm />
            </motion.div>

            {/* Contact Information Sidebar */}
            <motion.div
              className="space-y-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.15, delayChildren: 0.3 }
                }
              }}
            >
              {/* Address */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: 30 },
                  visible: { opacity: 1, x: 0 }
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-primary-50 p-2">
                        <MapPin className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Address</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {BUSINESS_INFO.addressLine1}
                          <br />
                          {BUSINESS_INFO.city}, {BUSINESS_INFO.state} {BUSINESS_INFO.zip}
                        </p>
                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                          Get Directions
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Phone */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: 30 },
                  visible: { opacity: 1, x: 0 }
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-primary-50 p-2">
                        <Phone className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Phone</h3>
                        <a
                          href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}
                          className="mt-1 block text-sm text-primary-600 hover:text-primary-700"
                        >
                          {BUSINESS_INFO.phoneFormatted}
                        </a>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Click to call
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Email */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: 30 },
                  visible: { opacity: 1, x: 0 }
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-primary-50 p-2">
                        <Mail className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Email</h3>
                        <a
                          href={`mailto:${BUSINESS_INFO.email}`}
                          className="mt-1 block text-sm text-primary-600 hover:text-primary-700"
                        >
                          {BUSINESS_INFO.email}
                        </a>
                        <p className="mt-1 text-xs text-muted-foreground">
                          We typically respond within 24 hours
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Hours */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: 30 },
                  visible: { opacity: 1, x: 0 }
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-primary-50 p-2">
                        <Clock className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Business Hours</h3>
                        <ul className="mt-2 space-y-1">
                          {BUSINESS_INFO.hours.map((hours, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              {hours}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Map Section */}
      <section className="border-t bg-gray-50 py-16">
        <Container>
          <motion.h2
            className="mb-6 text-center text-2xl font-bold text-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Find Us
          </motion.h2>
          <motion.div
            className="overflow-hidden rounded-lg border bg-white shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Google Maps Embed Placeholder */}
            <div className="aspect-video w-full bg-gray-200">
              <iframe
                src={googleMapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${BUSINESS_INFO.name} Location`}
                className="h-full w-full"
              />
            </div>
          </motion.div>
          <motion.p
            className="mt-4 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Located on SW Gage Blvd, just south of SW 21st Street. Free parking available.
          </motion.p>
        </Container>
      </section>
    </>
  );
}
