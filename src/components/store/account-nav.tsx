'use client';

/**
 * Store account sidebar navigation.
 *
 * Renders links to Orders, Wishlist, and Addresses with active state
 * based on the current pathname.
 *
 * @functions_called usePathname
 * @called_by AccountLayout, AccountPage
 *
 * @version 1.0.0 - 2026-03-02T19:01:13Z - Initial implementation
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Heart, MapPin } from 'lucide-react';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { href: '/store/account/orders', label: 'Orders', icon: Package },
  { href: '/store/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/store/account/addresses', label: 'Addresses', icon: MapPin },
] as const;

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1" aria-label="Account navigation">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname?.startsWith(href) ?? false;
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <Icon
              className={clsx(
                'h-5 w-5',
                isActive ? 'text-blue-600' : 'text-gray-400'
              )}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
