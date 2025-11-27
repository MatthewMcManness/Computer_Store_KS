import * as React from 'react';
import Link from 'next/link';
import { Container } from './container';
import { BUSINESS_INFO, NAV_ITEMS } from '@/lib/constants';
import { Facebook, MapPin, Phone, Mail, Clock } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-gray-50">
      <Container>
        <div className="py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Company Info */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                {BUSINESS_INFO.shortName}
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Quality refurbished computers and expert repair services in Topeka, Kansas since {BUSINESS_INFO.founded}.
              </p>
              <div className="flex space-x-4">
                <a
                  href={BUSINESS_INFO.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-primary-600"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                Quick Links
              </h3>
              <ul className="space-y-2">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary-600"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                Contact Us
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-600" />
                  <span className="text-sm text-muted-foreground">
                    {BUSINESS_INFO.address}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0 text-primary-600" />
                  <a
                    href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary-600"
                  >
                    {BUSINESS_INFO.phoneFormatted}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 flex-shrink-0 text-primary-600" />
                  <a
                    href={`mailto:${BUSINESS_INFO.email}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary-600"
                  >
                    {BUSINESS_INFO.email}
                  </a>
                </li>
              </ul>
            </div>

            {/* Business Hours */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                Business Hours
              </h3>
              <ul className="space-y-2">
                {BUSINESS_INFO.hours.map((hours, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Clock className="h-4 w-4 flex-shrink-0 text-primary-600" />
                    <span className="text-sm text-muted-foreground">{hours}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} {BUSINESS_INFO.name}. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link
                href="/privacy"
                className="transition-colors hover:text-primary-600"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="transition-colors hover:text-primary-600"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
