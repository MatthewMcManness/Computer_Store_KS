'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';

interface NavProps {
  className?: string;
}

export function Nav({ className }: NavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn('hidden md:flex md:items-center md:gap-6', className)}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary-600',
              isActive
                ? 'text-primary-600'
                : 'text-muted-foreground'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
