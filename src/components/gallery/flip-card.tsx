'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface ComputerSpec {
  processor: string;
  ram: string;
  storage: string;
  graphics?: string;
  display?: string;
  os: string;
}

interface FlipCardProps {
  id: string;
  name: string;
  category: 'desktop' | 'laptop' | 'custom' | 'refurbished';
  price: number;
  imageFront: string;
  imageBack?: string;
  specs: ComputerSpec;
  inStock?: boolean;
  className?: string;
}

export function FlipCard({
  id,
  name,
  category,
  price,
  imageFront,
  imageBack,
  specs,
  inStock = true,
  className,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = React.useState(false);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsFlipped(!isFlipped);
    }
  };

  const categoryColors = {
    desktop: 'default',
    laptop: 'info',
    custom: 'success',
    refurbished: 'warning',
  } as const;

  return (
    <div
      className={cn('perspective-1000 h-[400px] w-full cursor-pointer', className)}
      onClick={() => setIsFlipped(!isFlipped)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${name} - Click to ${isFlipped ? 'see image' : 'see specifications'}`}
    >
      <div
        className={cn(
          'relative h-full w-full transform-style-3d transition-transform duration-500',
          isFlipped && 'rotate-y-180'
        )}
      >
        {/* Front Side - Image */}
        <div className="backface-hidden absolute inset-0 rounded-lg border bg-white shadow-sm">
          <div className="relative h-3/5 overflow-hidden rounded-t-lg bg-gray-100">
            <Image
              src={imageFront}
              alt={name}
              fill
              className="object-contain p-4"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            <div className="absolute left-3 top-3">
              <Badge variant={categoryColors[category]}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Badge>
            </div>
            {!inStock && (
              <div className="absolute right-3 top-3">
                <Badge variant="destructive">Out of Stock</Badge>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="mt-1 text-2xl font-bold text-primary-600">
              {formatCurrency(price)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Click to see specifications
            </p>
          </div>
        </div>

        {/* Back Side - Specs */}
        <div className="backface-hidden rotate-y-180 absolute inset-0 rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-foreground">{name}</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="font-medium text-muted-foreground">Processor</dt>
              <dd className="text-foreground">{specs.processor}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-muted-foreground">RAM</dt>
              <dd className="text-foreground">{specs.ram}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-muted-foreground">Storage</dt>
              <dd className="text-foreground">{specs.storage}</dd>
            </div>
            {specs.graphics && (
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Graphics</dt>
                <dd className="text-foreground">{specs.graphics}</dd>
              </div>
            )}
            {specs.display && (
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Display</dt>
                <dd className="text-foreground">{specs.display}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="font-medium text-muted-foreground">OS</dt>
              <dd className="text-foreground">{specs.os}</dd>
            </div>
          </dl>
          <div className="mt-4 border-t pt-4">
            <p className="text-2xl font-bold text-primary-600">
              {formatCurrency(price)}
            </p>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Click to see image
          </p>
        </div>
      </div>
    </div>
  );
}
