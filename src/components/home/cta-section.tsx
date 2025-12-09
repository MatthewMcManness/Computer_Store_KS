import * as React from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO } from '@/lib/constants';
import { Phone, FileText, Clock } from 'lucide-react';

export function CtaSection() {
  return (
    <section className="bg-primary-600 py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Get Your Quote Today
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Honest pricing. No surprises. Just expert computer service you can trust.
            Most repairs completed same day!
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}>
              <Button
                size="lg"
                variant="secondary"
                leftIcon={<Phone className="h-4 w-4" />}
                className="bg-white text-primary-600 hover:bg-gray-100"
              >
                Call Now - We Answer!
              </Button>
            </a>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                leftIcon={<FileText className="h-4 w-4" />}
                className="border-white text-white hover:bg-white/10"
              >
                Get Your Free Quote
              </Button>
            </Link>
          </div>

          <p className="mt-8 flex items-center justify-center gap-2 text-sm text-primary-100">
            <Clock className="h-4 w-4" />
            Open {BUSINESS_INFO.hours[0]} | {BUSINESS_INFO.hours[1]}
          </p>
        </div>
      </Container>
    </section>
  );
}
