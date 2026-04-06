/**
 * SITE HEADER - The navigation bar at the top of every page.
 * Shows logo, page links, services dropdown, and login button.
 *
 * WHEN TO EDIT: When adding/removing navigation links, changing
 * the logo, or modifying the services dropdown menu.
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';

const serviceLinks = [
  { href: '/services/custom-computers', label: 'Custom-Built PCs', className: 'featured' },
  { href: '/services/data-services', label: 'Data Transfer & Cloning' },
  { href: '/services/os-installation', label: 'OS Installation' },
  { href: '/services/laptops', label: 'Laptops' },
  { href: '/services/desktops', label: 'Refurbished Desktops' },
  { href: '/services/diagnostics', label: 'Diagnostics' },
  { href: '/services/virus-removal', label: 'Virus & Malware Removal' },
  { href: '/services/upgrades', label: 'Hardware Upgrades' },
  { href: '/services/debloat', label: 'Windows Debloat' },
  { href: '/services/antivirus', label: 'Antivirus & Protection' },
  { href: '/services/recycling', label: 'Free Electronics Recycling', className: 'free' },
  { href: '/why-linux', label: 'Why Linux?', className: 'linux' },
  { href: '/silver-plan', label: 'Protection Plans', className: 'silver' },
];

/** Map from service link className to globals.css dropdown component class */
const dropdownClassMap: Record<string, string> = {
  featured: 'dropdown-featured font-semibold text-primary-600',
  free: 'dropdown-free font-semibold',
  linux: 'dropdown-linux font-semibold',
  silver: 'dropdown-silver font-semibold',
};

/** Renders the fixed navigation bar with logo, links, and services dropdown. */
export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const servicesRef = useRef<HTMLLIElement>(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    setServicesOpen(false);
  }, [pathname]);

  // Close dropdown when clicking outside (desktop only)
  useEffect(() => {
    if (isMobile) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  const isActive = (path: string) => pathname === path;
  const isServicesActive = pathname?.startsWith('/services') || pathname === '/why-linux' || pathname === '/silver-plan';

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] p-4 transition-all duration-normal max-md:p-2">
      <div
        className={`flex justify-between items-center bg-primary-100/85 px-6 py-3 rounded-brand-xl border border-primary-300/40 max-w-[1100px] mx-auto backdrop-blur-[12px] transition-shadow duration-normal max-md:rounded-brand-lg max-md:px-4 max-md:py-2 max-md:max-w-none ${
          isScrolled ? 'shadow-header-scrolled' : 'shadow-header'
        }`}
      >
        <h1 className="flex items-center text-[0px] m-0 p-0 transition-transform duration-fast hover:scale-[1.02]">
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/csk-logo.svg"
              alt="Computer Store Kansas"
              width={504}
              height={227}
              priority
              style={{ height: '48px', width: 'auto' }}
            />
          </Link>
        </h1>
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
            className={`list-none flex flex-wrap gap-2 items-center max-md:hidden max-md:flex-col max-md:w-full max-md:bg-white max-md:mt-2 max-md:py-4 max-md:absolute max-md:top-full max-md:left-0 max-md:right-0 max-md:shadow-brand-md ${
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
            <li
              className={`ml-2 relative max-md:ml-0 max-md:my-2 max-md:text-left max-md:pl-4 max-md:w-full ${isMobile ? 'max-md:static' : ''}`}
              ref={servicesRef}
              onMouseEnter={() => !isMobile && setServicesOpen(true)}
              onMouseLeave={() => !isMobile && setServicesOpen(false)}
            >
              <Link
                className={`text-gray-700 no-underline font-medium py-2 px-4 rounded-brand-sm transition-all duration-fast inline-block hover:text-primary-600 hover:bg-primary-100 max-md:w-full max-md:block flex items-center gap-1 ${
                  isServicesActive ? 'text-primary-600 bg-primary-100' : ''
                }`}
                href="/services"
              >
                Services
                {!isMobile && (
                  <span className="text-[0.7rem] transition-transform duration-fast">
                    ▾
                  </span>
                )}
              </Link>
              {/* Only show dropdown on desktop */}
              {!isMobile && (
                <ul
                  className={`absolute top-full left-1/2 -translate-x-1/2 bg-white rounded-brand-md shadow-brand-lg border border-bg-dark min-w-[220px] py-2 z-[1001] list-none mt-2 transition-all duration-fast before:content-[''] before:absolute before:-top-2 before:left-1/2 before:-translate-x-1/2 before:border-l-[8px] before:border-l-transparent before:border-r-[8px] before:border-r-transparent before:border-b-[8px] before:border-b-white ${
                    servicesOpen
                      ? 'opacity-100 visible'
                      : 'opacity-0 invisible'
                  }`}
                >
                  <li>
                    <Link
                      href="/services"
                      className="block py-2.5 px-5 text-primary-600 no-underline text-[0.95rem] transition-all duration-fast whitespace-nowrap font-semibold border-b border-bg-dark mb-1 pb-3 hover:bg-primary-600 hover:text-white"
                    >
                      View All Services
                    </Link>
                  </li>
                  {serviceLinks.map((service) => {
                    const extraClass = (service as { className?: string }).className;
                    const mappedClass = extraClass ? dropdownClassMap[extraClass] || '' : '';
                    return (
                      <li key={service.href}>
                        <Link
                          href={service.href}
                          className={`block py-2.5 px-5 text-gray-700 no-underline text-[0.95rem] transition-all duration-fast whitespace-nowrap hover:bg-primary-100 hover:text-primary-600 ${
                            isActive(service.href)
                              ? 'bg-primary-100 text-primary-600 font-semibold'
                              : ''
                          } ${mappedClass}`}
                        >
                          {service.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
<li className="ml-2 max-md:ml-0 max-md:my-2 max-md:text-left max-md:pl-4 max-md:w-full">
              <a
                className={`text-gray-700 no-underline font-medium py-2 px-4 rounded-brand-sm transition-all duration-fast inline-block hover:text-primary-600 hover:bg-primary-100 max-md:w-full max-md:block ${
                  pathname?.startsWith('/games') ? 'text-primary-600 bg-primary-100' : ''
                }`}
                href="/games/index.html"
              >
                Games
              </a>
            </li>
            <li className="ml-2 max-md:ml-0 max-md:my-2 max-md:text-left max-md:pl-4 max-md:w-full">
              <Link
                className={`text-gray-700 no-underline font-medium py-2 px-4 rounded-brand-sm transition-all duration-fast inline-block hover:text-primary-600 hover:bg-primary-100 max-md:w-full max-md:block ${
                  isActive('/contact') ? 'text-primary-600 bg-primary-100' : ''
                }`}
                href="/contact"
              >
                Contact
              </Link>
            </li>
            <li className="ml-2 max-md:ml-0 max-md:my-2 max-md:text-left max-md:pl-4 max-md:w-full">
              <Link
                className="bg-primary-600 text-white no-underline font-semibold py-2.5 px-5 rounded-brand-md whitespace-nowrap transition-all duration-normal shadow-brand-sm inline-block hover:bg-primary-800 hover:-translate-y-0.5 hover:shadow-brand-md"
                href="/login"
              >
                Login
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
