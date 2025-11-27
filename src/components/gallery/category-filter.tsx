'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'desktop', label: 'Desktop' },
  { id: 'laptop', label: 'Laptop' },
  { id: 'custom', label: 'Custom' },
  { id: 'refurbished', label: 'Refurbished' },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  className,
}: CategoryFilterProps) {
  return (
    <div
      className={cn('flex flex-wrap gap-2', className)}
      role="group"
      aria-label="Filter by category"
    >
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id;
        return (
          <Button
            key={category.id}
            variant={isSelected ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(category.id)}
            aria-pressed={isSelected}
          >
            {category.label}
          </Button>
        );
      })}
    </div>
  );
}
