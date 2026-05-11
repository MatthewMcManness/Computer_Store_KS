/**
 * MOBILE CALL BUTTON - Floating phone button that appears on mobile devices, letting customers tap to call the store.
 *
 * WHEN TO EDIT: When changing the mobile call button design or phone number (phone number comes from constants.ts).
 */
'use client';

import * as React from 'react';
import { Phone } from 'lucide-react';
import { LOCATIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function MobileCallButton() {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 right-4 z-50 flex gap-2',
        'transition-all duration-300 ease-in-out',
        'md:hidden',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
      )}
    >
      {Object.values(LOCATIONS).map((loc) => (
        <a
          key={loc.name}
          href={`tel:${loc.phone.replace(/\D/g, '')}`}
          className={cn(
            'flex flex-1 items-center justify-center gap-2',
            'rounded-full bg-primary-600 px-4 py-3 text-white shadow-lg',
            'hover:bg-primary-700 active:scale-95 transition-all'
          )}
          aria-label={`Call Now at ${loc.phoneFormatted}`}
        >
          <Phone className="h-4 w-4" />
          <span className="font-semibold text-sm">Call Now</span>
        </a>
      ))}
    </div>
  );
}
