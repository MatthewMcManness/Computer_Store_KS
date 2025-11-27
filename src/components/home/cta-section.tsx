import * as React from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO } from '@/lib/constants';
import { Phone, MessageCircle } from 'lucide-react';

export function CtaSection() {
  return (
    <section className="bg-primary-600 py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Get Your Computer Fixed?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Whether you need a repair, upgrade, or a quality refurbished computer, we&apos;re here to help.
            Contact us today for a free estimate!
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}>
              <Button
                size="lg"
                variant="secondary"
                leftIcon={<Phone className="h-4 w-4" />}
                className="bg-white text-primary-600 hover:bg-gray-100"
              >
                Call {BUSINESS_INFO.phoneFormatted}
              </Button>
            </a>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                leftIcon={<MessageCircle className="h-4 w-4" />}
                className="border-white text-white hover:bg-white/10"
              >
                Send a Message
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-sm text-primary-100">
            Open {BUSINESS_INFO.hours[0]} | {BUSINESS_INFO.hours[1]}
          </p>
        </div>
      </Container>
    </section>
  );
}
