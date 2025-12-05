'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

const serviceLinks = [
  { href: '/services/data-services', label: 'Data Transfer & Cloning' },
  { href: '/services/os-installation', label: 'OS Installation' },
  { href: '/services/custom-computers', label: 'Custom-Built PCs' },
  { href: '/services/laptops', label: 'Laptops' },
  { href: '/services/desktops', label: 'Refurbished Desktops' },
  { href: '/services/diagnostics', label: 'Diagnostics' },
  { href: '/services/virus-removal', label: 'Virus & Malware Removal' },
  { href: '/services/upgrades', label: 'Hardware Upgrades' },
  { href: '/services/debloat', label: 'Windows Debloat' },
  { href: '/services/antivirus', label: 'Antivirus & Protection' },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const servicesRef = useRef<HTMLLIElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => pathname === path;
  const isServicesActive = pathname?.startsWith('/services');

  return (
    <header className={isScrolled ? 'scrolled' : ''}>
      <div className="container">
        <h1 className="logo">
          <Link href="/">
            <Image
              src="/assets/title.png"
              alt="Computer Store Kansas"
              width={512}
              height={236}
              priority
              style={{ height: '40px', width: 'auto' }}
            />
          </Link>
        </h1>
        <button
          type="button"
          className={`hamburger ${menuOpen ? 'active' : ''}`}
          id="hamburger-button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        />
        <nav>
          <ul className={menuOpen ? 'show' : ''}>
            <li>
              <Link className={`nav-link ${isActive('/') ? 'active' : ''}`} href="/">
                Home
              </Link>
            </li>
            <li>
              <Link className={`nav-link ${isActive('/about') ? 'active' : ''}`} href="/about">
                About
              </Link>
            </li>
            <li
              className="has-dropdown"
              ref={servicesRef}
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <Link
                className={`nav-link ${isServicesActive ? 'active' : ''}`}
                href="/services"
                onClick={(e) => {
                  // On mobile, toggle dropdown instead of navigating
                  if (menuOpen) {
                    e.preventDefault();
                    setServicesOpen(!servicesOpen);
                  }
                }}
              >
                Services
                <span className="dropdown-arrow">▾</span>
              </Link>
              <ul className={`dropdown-menu ${servicesOpen ? 'show' : ''}`}>
                <li>
                  <Link href="/services" className="dropdown-link view-all">
                    View All Services
                  </Link>
                </li>
                {serviceLinks.map((service) => (
                  <li key={service.href}>
                    <Link
                      href={service.href}
                      className={`dropdown-link ${isActive(service.href) ? 'active' : ''}`}
                    >
                      {service.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <Link className={`nav-link ${isActive('/services/custom-computers') ? 'active' : ''}`} href="/services/custom-computers">
                Custom PCs
              </Link>
            </li>
            <li>
              <Link className={`nav-link ${isActive('/why-linux') ? 'active' : ''}`} href="/why-linux">
                Why Linux?
              </Link>
            </li>
            <li>
              <Link className={`nav-link ${isActive('/gallery') ? 'active' : ''}`} href="/gallery">
                Gallery
              </Link>
            </li>
            <li>
              <Link className={`nav-link ${isActive('/reviews') ? 'active' : ''}`} href="/reviews">
                Reviews
              </Link>
            </li>
            <li className="nav-action black-friday">
              <Link className={`nav-link ${isActive('/black-friday') ? 'active' : ''}`} href="/black-friday">
                Black Friday Sale
              </Link>
            </li>
            <li className="nav-action silver">
              <Link className={`nav-link ${isActive('/silver-plan') ? 'active' : ''}`} href="/silver-plan">
                Silver Plan
              </Link>
            </li>
            <li className="nav-action primary">
              <Link className={`nav-link ${isActive('/contact') ? 'active' : ''}`} href="/contact">
                Contact Us
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
