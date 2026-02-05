'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Container } from './container';
import { Nav } from './nav';
import { MobileNav } from './mobile-nav';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO } from '@/lib/constants';
import { Phone } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        isScrolled && 'shadow-sm',
        className
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/assets/csk-icon.svg"
              alt={BUSINESS_INFO.name}
              width={40}
              height={40}
              className="h-10 w-10"
              priority
            />
            <span className="hidden font-bold text-primary-600 sm:inline-block">
              {BUSINESS_INFO.shortName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <Nav />

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Phone CTA - Desktop */}
            <a
              href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}
              className="hidden items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 lg:flex"
            >
              <Phone className="h-4 w-4" />
              {BUSINESS_INFO.phoneFormatted}
            </a>

            {/* CTA Button - Desktop */}
            <Link href="/contact" className="hidden md:block">
              <Button variant="primary" size="sm">
                Free Quote
              </Button>
            </Link>

            {/* Mobile Navigation */}
            <MobileNav />
          </div>
        </div>
      </Container>
    </header>
  );
}
