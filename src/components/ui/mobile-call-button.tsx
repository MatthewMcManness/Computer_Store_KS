/**
 * MOBILE CALL BUTTON - Persistent bottom-fixed CTA on mobile devices, letting customers tap to call the store.
 *
 * WHEN TO EDIT: When changing the mobile call button design or phone number (phone number comes from constants.ts).
 */
'use client';

import { Phone } from 'lucide-react';
import { LOCATIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function MobileCallButton() {
  return (
    <div
      className="fixed left-4 right-4 z-50 flex gap-2 md:hidden"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      {Object.values(LOCATIONS).map((loc) => (
        <a
          key={loc.name}
          href={`tel:${loc.phone.replace(/\D/g, '')}`}
          className={cn(
            'btn-inner-glow relative overflow-hidden',
            'flex flex-1 items-center justify-center',
            'rounded-[28px] bg-primary-600 px-8 py-7 text-white shadow-lg',
            'hover:bg-primary-700 active:scale-95 transition-transform'
          )}
          aria-label={`Call Now at ${loc.phoneFormatted}`}
        >
          <span className="relative z-[1] flex items-center justify-center gap-3">
            <Phone className="h-6 w-6" />
            <span className="font-bold text-xl">Call Now</span>
          </span>
        </a>
      ))}
    </div>
  );
}
