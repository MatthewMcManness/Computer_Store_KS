'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

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
            <li>
              <Link className={`nav-link ${isActive('/services') ? 'active' : ''}`} href="/services">
                Services
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
