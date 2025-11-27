import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface GallerySkeletonProps {
  count?: number;
}

export function GallerySkeleton({ count = 8 }: GallerySkeletonProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-[400px] rounded-lg border bg-white p-4 shadow-sm">
          {/* Image skeleton */}
          <Skeleton className="h-3/5 w-full rounded-lg" />

          {/* Content skeleton */}
          <div className="mt-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CategoryFilterSkeleton() {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-9 w-24 rounded-md" />
      ))}
    </div>
  );
}
