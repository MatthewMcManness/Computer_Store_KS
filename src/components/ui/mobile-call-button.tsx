'use client';

import * as React from 'react';
import { Phone } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';
import { cn } from '@/lib/utils';

/**
 * Sticky mobile call button that appears at the bottom of the screen on mobile devices.
 * Provides an easy one-tap call action for potential customers.
 */
export function MobileCallButton() {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Show button after slight scroll to avoid covering content on initial load
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <a
      href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}
      className={cn(
        'fixed bottom-4 left-4 right-4 z-50 flex items-center justify-center gap-2',
        'rounded-full bg-primary-600 px-6 py-4 text-white shadow-lg',
        'transition-all duration-300 ease-in-out',
        'hover:bg-primary-700 active:scale-95',
        'md:hidden', // Only show on mobile
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
      )}
      aria-label={`Call us at ${BUSINESS_INFO.phoneFormatted}`}
    >
      <Phone className="h-5 w-5 animate-pulse" />
      <span className="font-semibold">Call Now - Same Day Service</span>
    </a>
  );
}
