'use client';

import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO } from '@/lib/constants';
import { Home, Phone, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-lg text-center">
          {/* 404 Number */}
          <p className="text-7xl font-bold text-primary-600 sm:text-9xl">404</p>

          {/* Heading */}
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Page Not Found
          </h1>

          {/* Description */}
          <p className="mt-4 text-lg text-muted-foreground">
            Sorry, we could not find the page you are looking for. It may have been moved or deleted.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/">
              <Button
                size="lg"
                variant="primary"
                leftIcon={<Home className="h-4 w-4" />}
              >
                Go Home
              </Button>
            </Link>
            <a href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}>
              <Button
                size="lg"
                variant="outline"
                leftIcon={<Phone className="h-4 w-4" />}
              >
                Call Us
              </Button>
            </a>
          </div>

          {/* Back Link */}
          <div className="mt-8">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Go back to previous page
            </button>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 border-t pt-8">
            <p className="text-sm font-medium text-foreground">
              Looking for something specific?
            </p>
            <ul className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
              <li>
                <Link href="/computers" className="text-primary-600 hover:underline">
                  Computers
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-primary-600 hover:underline">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-primary-600 hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-primary-600 hover:underline">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
