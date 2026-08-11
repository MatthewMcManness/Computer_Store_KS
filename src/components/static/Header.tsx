/**
 * SITE HEADER - The sticky navigation bar at the top of every public page.
 * Real logo on the silver plaque badge, the five main links, and a
 * persistent click-to-call phone button.
 *
 * The mobile menu is a disclosure, not a modal: no scrim, no scroll
 * lock, no focus trap. See the note above the panel before adding any
 * overlay back.
 *
 * WHEN TO EDIT: When adding/removing navigation links or changing the
 * header call button. The phone number lives in src/lib/constants.ts.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';
import { PlaqueBadge } from '@/components/ui/plaque-badge';
import { OpenNowChip } from '@/components/ui/open-now-chip';
import { CALL_BAR_SHOW_AFTER_PX } from '@/components/ui/mobile-call-button';
import { cn } from '@/lib/cn';

const NAV_LINKS = [
  { href: '/silver-plan', label: 'Silver Plan' },
  { href: '/services', label: 'Services' },
  { href: '/computers', label: 'Computers' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

const TEL_HREF = `tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`;

/** Renders the sticky site header with plaque logo, nav, and call button. */
export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  /* One rAF-coalesced read per frame. Reading window.scrollY on every
     scroll tick, from here and from the call bar both, is the kind of
     main-thread work that shows up as input delay on a mid-range phone. */
  useEffect(() => {
    let ticking = false;
    const measure = () => {
      ticking = false;
      const y = window.scrollY;
      setIsScrolled(y > 8);
      setPastHero(y > CALL_BAR_SHOW_AFTER_PX);
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

  // Close the mobile menu when the route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Escape closes the panel and hands focus back to the toggle. The panel
  // is a disclosure, not a modal, so no focus trap: only this.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      toggleRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  /** True when this link matches the current page (Services also owns its detail pages). */
  const isActive = (href: string) =>
    href === '/services'
      ? pathname === '/services' || pathname?.startsWith('/services/')
      : pathname === href;

  return (
    <header
      className={cn(
        'sticky top-0 z-[1000] border-b bg-page transition-shadow duration-normal ease-brand',
        isScrolled ? 'border-transparent shadow-shell' : 'border-line'
      )}
    >
      {/* relative z-10: keeps the bar above the disclosure panel painted
          later in the DOM, so its shadow never lands on the controls. */}
      <div className="relative z-10 mx-auto flex h-[72px] w-full max-w-6xl items-center justify-between gap-3 bg-page px-4 sm:px-8">
        <Link
          href="/"
          aria-label={`${BUSINESS_INFO.name} home`}
          className="inline-flex shrink-0 items-center"
        >
          <PlaqueBadge decorative />
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive(href) ? 'page' : undefined}
                  className={cn(
                    'inline-flex min-h-[44px] items-center rounded-lg px-3.5 py-2 font-semibold no-underline transition-colors duration-fast ease-brand',
                    isActive(href)
                      ? 'bg-tint text-brand-deep'
                      : 'text-ink hover:bg-wash hover:text-brand-deep'
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {/* Click-to-call: number on sm+, icon-only on the smallest screens.
              Past the hero on phones the floating call bar takes over, so
              this one steps aside instead of doubling the same CTA. */}
          <a
            href={TEL_HREF}
            aria-label={`Call ${BUSINESS_INFO.name} at ${BUSINESS_INFO.phoneFormatted}`}
            className={cn(
              'min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg bg-brand px-3 py-2.5 font-bold tabular-nums text-page no-underline transition-colors duration-fast ease-brand hover:bg-brand-deep sm:px-5',
              /* Hidden past the hero regardless of the menu state. The
                 old `&& !menuOpen` un-hid this button whenever the
                 disclosure opened, so a visitor scrolled past the hero
                 with the menu open saw three simultaneous call CTAs:
                 this one, the menu's full-width Call button, and the
                 floating bar. Two is the ceiling. */
              pastHero ? 'hidden md:inline-flex' : 'inline-flex'
            )}
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{BUSINESS_INFO.phoneFormatted}</span>
          </a>

          {/* Mobile menu toggle */}
          <button
            ref={toggleRef}
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen(!menuOpen)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink transition-colors duration-fast ease-brand hover:bg-wash lg:hidden"
          >
            {menuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* No scrim. This panel is a DISCLOSURE, not a modal, and it is
          built like one: it sits in flow under the bar, the page keeps
          scrolling behind it, and Tab walks out of it into the page.
          The scrim that used to paint here made it look modal while none
          of the modal contract held, so a keyboard user could focus
          links that a pointer user could not reach through the dim.
          Either commit to a modal (body scroll lock plus `inert` on main
          and footer) or have no scrim; this is the second option, and it
          matches what the component actually is. Escape, the toggle, and
          any route change all close it. */}

      {/* Mobile navigation panel: a designed surface, not a bare list.
          Links on the type scale, then the shop's live status, hours,
          and the call CTA anchored at the bottom. From 640px up it is a
          right-anchored panel, not a stretched full-width dropdown. */}
      <nav
        id="mobile-nav"
        aria-label="Main"
        className={cn(
          'relative z-10 border-t border-line bg-page shadow-shell sm:ml-auto sm:w-full sm:max-w-[26rem] sm:border-l lg:hidden',
          menuOpen ? 'block' : 'hidden'
        )}
      >
        <ul className="w-full px-4 py-3 sm:px-6">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive(href) ? 'page' : undefined}
                className={cn(
                  'flex min-h-[52px] items-center rounded-lg px-4 py-3 text-title-sm no-underline transition-colors duration-fast ease-brand',
                  isActive(href)
                    ? 'bg-tint text-brand-deep'
                    : 'text-ink hover:bg-wash hover:text-brand-deep'
                )}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="w-full border-t border-line px-4 pb-5 pt-4 sm:px-6">
          <OpenNowChip />
          <ul className="mt-3 space-y-0.5 text-sm tabular-nums text-body">
            {BUSINESS_INFO.hours.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <a
            href={TEL_HREF}
            aria-label={`Call ${BUSINESS_INFO.name} at ${BUSINESS_INFO.phoneFormatted}`}
            className="mt-4 flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 font-bold tabular-nums text-page no-underline transition-colors duration-fast ease-brand hover:bg-brand-deep"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Call {BUSINESS_INFO.phoneFormatted}
          </a>
        </div>
      </nav>
    </header>
  );
}
