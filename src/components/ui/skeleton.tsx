/**
 * SKELETON LOADER - Placeholder animation shown while content is loading (gray pulsing boxes).
 *
 * WHEN TO EDIT: When changing the loading placeholder design.
 */
import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export { Skeleton };
