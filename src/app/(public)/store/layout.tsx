/**
 * Store layout wrapper for the public storefront.
 *
 * Provides breadcrumb navigation and consistent page structure for all
 * store pages. This layout nests inside the (public) layout which already
 * provides the site-wide Header (with Shop link + cart icon) and Footer.
 * CartProvider is provided by the parent (public) layout.
 *
 * @param children - Child route content rendered within the store layout
 * @returns The store layout with breadcrumbs and content area
 *
 * @functions_called none
 * @called_by Next.js App Router (automatic layout nesting)
 *
 * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
 * @version 1.1.0 - 2026-03-02T00:00:00Z - Removed duplicate nav bar; store nav integrated into main Header
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: {
    default: 'Online Store',
    template: '%s | Computer Store Kansas',
  },
  description:
    'Shop computer parts, accessories, and refurbished systems from Computer Store Kansas. Quality products with local support.',
};

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 pt-24">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
          <ol className="flex items-center gap-1">
            <li>
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="h-3 w-3 inline" />
            </li>
            <li>
              <Link
                href="/store"
                className="hover:text-blue-600 transition-colors"
              >
                Store
              </Link>
            </li>
          </ol>
        </nav>
      </div>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {children}
      </main>
    </div>
  );
}
