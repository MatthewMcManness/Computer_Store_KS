/**
 * SITE HEADER - The navigation bar at the top of every page.
 * Shows logo and page links.
 *
 * WHEN TO EDIT: When adding/removing navigation links or changing the logo.
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

/** Renders the fixed navigation bar with logo and links. */
export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (path: string) => pathname === path;
  const isServicesActive = pathname?.startsWith('/services') || pathname === '/why-linux' || pathname === '/silver-plan';

  // The homepage has its own mobile header — the scroll-morphing silver
  // plaque badge that shrinks as the user scrolls past the hero. Suppress
  // this header on mobile only when we're on the homepage so the two
  // don't stack. Every other page gets the standard header on mobile too.
  const hideOnMobile = pathname === '/';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[1000] p-4 transition-all duration-normal ${
        hideOnMobile ? 'max-md:hidden' : ''
      }`}
    >
      <div
        className={`flex justify-between items-center bg-primary-100/85 px-6 py-3 rounded-brand-xl border border-primary-300/40 max-w-[1100px] mx-auto backdrop-blur-[12px] transition-shadow duration-normal max-md:rounded-brand-lg max-md:px-4 max-md:py-2 max-md:max-w-none ${
          isScrolled ? 'shadow-header-scrolled' : 'shadow-header'
        }`}
      >
        <Link href="/" className="flex items-center transition-transform duration-fast hover:scale-[1.02]" aria-label="Computer Store Kansas — Home">
          <Image
            src="/assets/csk-logo.svg"
            alt="Computer Store Kansas"
            width={504}
            height={227}
            priority
            style={{ height: '48px', width: 'auto' }}
          />
        </Link>
        <button
          type="button"
          className={`hidden max-md:flex bg-transparent border-none text-gray-900 text-[1.75rem] cursor-pointer p-2 w-11 h-11 items-center justify-center rounded-brand-sm transition-all duration-fast hover:bg-bg-light before:content-['\\2630'] ${
            menuOpen ? "before:content-['\\2715']" : ''
          }`}
          id="hamburger-button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        />
        <nav>
          <ul
            className={`list-none flex flex-wrap gap-2 items-center max-md:hidden max-md:flex-col max-md:w-[calc(100%-2rem)] max-md:bg-white max-md:mt-2 max-md:py-4 max-md:absolute max-md:top-full max-md:left-4 max-md:right-4 max-md:rounded-brand-md max-md:shadow-brand-md ${
              menuOpen ? 'max-md:!flex' : ''
            }`}
          >
            <li className="ml-2 max-md:ml-0 max-md:my-2 max-md:text-left max-md:pl-4 max-md:w-full">
              <Link
                className={`text-gray-700 no-underline font-medium py-2 px-4 rounded-brand-sm transition-all duration-fast inline-block hover:text-primary-600 hover:bg-primary-100 max-md:w-full max-md:block ${
                  isActive('/') ? 'text-primary-600 bg-primary-100' : ''
                }`}
                href="/"
              >
                Home
              </Link>
            </li>
            <li className="ml-2 max-md:ml-0 max-md:my-2 max-md:text-left max-md:pl-4 max-md:w-full">
              <Link
                className={`text-gray-700 no-underline font-medium py-2 px-4 rounded-brand-sm transition-all duration-fast inline-block hover:text-primary-600 hover:bg-primary-100 max-md:w-full max-md:block ${
                  isActive('/about') ? 'text-primary-600 bg-primary-100' : ''
                }`}
                href="/about"
              >
                About
              </Link>
            </li>
            <li className="ml-2 max-md:ml-0 max-md:my-2 max-md:text-left max-md:pl-4 max-md:w-full">
              <Link
                className={`text-gray-700 no-underline font-medium py-2 px-4 rounded-brand-sm transition-all duration-fast inline-block hover:text-primary-600 hover:bg-primary-100 max-md:w-full max-md:block ${
                  isActive('/computers') ? 'text-primary-600 bg-primary-100' : ''
                }`}
                href="/computers"
              >
                Computers
              </Link>
            </li>
            <li className="ml-2 max-md:ml-0 max-md:my-2 max-md:text-left max-md:pl-4 max-md:w-full">
              <Link
                className={`text-gray-700 no-underline font-medium py-2 px-4 rounded-brand-sm transition-all duration-fast inline-block hover:text-primary-600 hover:bg-primary-100 max-md:w-full max-md:block ${
                  isServicesActive ? 'text-primary-600 bg-primary-100' : ''
                }`}
                href="/services"
              >
                Services
              </Link>
            </li>
            <li className="ml-2 max-md:ml-0 max-md:my-2 max-md:text-left max-md:pl-4 max-md:w-full">
              <Link
                className={`no-underline font-semibold py-2.5 px-5 rounded-brand-md whitespace-nowrap transition-all duration-normal shadow-brand-sm inline-block hover:-translate-y-0.5 text-gray-700 bg-gray-100 hover:bg-gray-300 hover:text-gray-900 max-md:w-full max-md:block max-md:text-center ${
                  isActive('/contact') ? 'bg-gray-300 text-gray-900' : ''
                }`}
                href="/contact"
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
