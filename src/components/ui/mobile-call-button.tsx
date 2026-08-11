/**
 * MOBILE CALL BUTTON - Persistent bottom-fixed call CTA on phones so the
 * number is always one tap away deep in a page. Scroll-aware: it stays
 * hidden through the hero (where the header call button and hero CTA
 * already show the number) and slides in once the visitor is past it.
 * Hidden on md+ screens where the header call button is always visible.
 *
 * It is built from the system, not around it: the brand fill and the
 * `brand-lg` radius of every other primary button, the `raised`
 * elevation ramp, and a machined plaque edge. The fully-rounded pill
 * with a soft neutral drop shadow it used to be matched nothing else on
 * the site. The plaque edge is what keeps a 3:1 boundary under it on the
 * navy footer, where brand blue alone would sit too close to the ground.
 *
 * The header hides its own call button past the same scroll depth
 * (CALL_BAR_SHOW_AFTER_PX), so only one call CTA is ever on screen. The
 * footer carries the matching bottom padding so the bar never covers
 * content at the end of a page.
 *
 * Motion is opacity/transform only on the approved curve, and the
 * global prefers-reduced-motion rule makes it instant.
 *
 * WHEN TO EDIT: When changing the mobile call CTA design. The phone
 * number comes from src/lib/constants.ts, never hardcode it here.
 */

'use client';

import { useEffect, useState } from 'react';
import { Phone } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';
import { cn } from '@/lib/cn';

/** Scroll depth (px) after which the bar appears: past the hero band. */
export const CALL_BAR_SHOW_AFTER_PX = 480;

/** Renders the fixed bottom call bar for mobile visitors, shown past the hero. */
export function MobileCallButton() {
  const [visible, setVisible] = useState(false);

  /* rAF-coalesced: one scroll read per frame, not one per tick. */
  useEffect(() => {
    let ticking = false;
    const measure = () => {
      ticking = false;
      setVisible(window.scrollY > CALL_BAR_SHOW_AFTER_PX);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={cn(
        'fixed left-4 right-4 z-50 bottom-[max(1rem,env(safe-area-inset-bottom))]',
        'transition-[opacity,transform] duration-normal ease-brand md:hidden',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      )}
      aria-hidden={!visible}
    >
      <div className="plaque-frame rounded-brand-lg shadow-raised">
        <a
          href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}
          aria-label={`Call ${BUSINESS_INFO.name} at ${BUSINESS_INFO.phoneFormatted}`}
          tabIndex={visible ? undefined : -1}
          className="flex min-h-[52px] items-center justify-center gap-3 rounded-[13px] bg-brand px-6 py-3.5 text-page no-underline transition-colors duration-normal ease-brand hover:bg-brand-deep active:bg-brand-deep"
        >
          <Phone className="h-5 w-5" aria-hidden="true" />
          <span className="text-lg font-bold tabular-nums">Call {BUSINESS_INFO.phoneFormatted}</span>
        </a>
      </div>
    </div>
  );
}
