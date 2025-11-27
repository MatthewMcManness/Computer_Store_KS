import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronRight, Home } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const allItems = [{ label: 'Home', href: '/' }, ...items];

  // Schema.org BreadcrumbList
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `${BUSINESS_INFO.website}${item.href}` : undefined,
    })),
  };

  return (
    <>
      {/* Schema.org markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Visual breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className={cn('flex items-center text-sm text-muted-foreground', className)}
      >
        <ol className="flex items-center space-x-1">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            const isFirst = index === 0;

            return (
              <li key={item.label} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="mx-1 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                )}

                {isLast ? (
                  <span className="font-medium text-foreground" aria-current="page">
                    {item.label}
                  </span>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className="inline-flex items-center transition-colors hover:text-primary-600"
                  >
                    {isFirst && <Home className="mr-1 h-4 w-4" aria-hidden="true" />}
                    {isFirst ? <span className="sr-only">Home</span> : item.label}
                  </Link>
                ) : (
                  <span>{item.label}</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
