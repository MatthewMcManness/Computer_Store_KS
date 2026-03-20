import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes with proper conflict resolution.
 *
 * Combines multiple class values using clsx for conditional classes,
 * then uses tailwind-merge to intelligently resolve conflicting Tailwind
 * utilities (e.g., if both "px-2" and "px-4" are present, only "px-4" remains).
 * This is essential for component libraries where props may override default styles.
 *
 * @param inputs - Variable number of class values (strings, objects, arrays, conditionals)
 * @returns Single merged className string with conflicts resolved
 *
 * @example
 * // Basic usage
 * cn('px-2 py-1', 'px-4') // Returns 'py-1 px-4'
 *
 * // With conditionals
 * cn('base-class', isActive && 'active-class', {
 *   'hover:bg-blue': !disabled
 * })
 *
 * // Component props pattern
 * <Button className={cn('btn-default', className)} />
 *
 * @see https://github.com/dcastil/tailwind-merge
 * @see https://github.com/lukeed/clsx
 *
 * @functions_called clsx, twMerge
 * @called_by All UI components that accept className props
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Truncates a string to a specified length with ellipsis.
 *
 * If the string exceeds the specified length, cuts it at the length boundary
 * and appends '...' to indicate truncation. Returns original string unchanged
 * if it's already within the length limit.
 *
 * @param str - The string to potentially truncate
 * @param length - Maximum length before truncation (not including ellipsis)
 * @returns Original string if within limit, or truncated string + '...' if longer
 *
 * @example
 * truncate('Hello World', 20)          // Returns 'Hello World'
 * truncate('Hello World', 5)           // Returns 'Hello...'
 * truncate('Short', 100)               // Returns 'Short'
 * truncate('A very long description that needs truncating', 20)
 *   // Returns 'A very long descript...'
 *
 * @see BlogPostCard for excerpt truncation
 * @see MetaDescription component for SEO description truncation
 *
 * @functions_called String.slice
 * @called_by BlogPostCard, MetaDescription, SearchResults, ComputerCard
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

