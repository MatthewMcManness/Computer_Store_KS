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
 * Formats a phone number string into standard US format.
 *
 * Strips all non-digit characters and reformats 10-digit phone numbers
 * into the format (XXX) XXX-XXXX. If the input doesn't match the expected
 * 10-digit pattern, returns the original string unchanged for graceful degradation.
 *
 * @param phone - The phone number string to format (may contain spaces, dashes, parentheses)
 * @returns Formatted phone number as (XXX) XXX-XXXX, or original string if invalid
 *
 * @example
 * formatPhoneNumber('7852673223')           // Returns '(785) 267-3223'
 * formatPhoneNumber('785-267-3223')         // Returns '(785) 267-3223'
 * formatPhoneNumber('(785) 267-3223')       // Returns '(785) 267-3223'
 * formatPhoneNumber('123')                  // Returns '123' (invalid, returned as-is)
 *
 * @see BUSINESS_INFO.phone in constants.ts
 *
 * @functions_called String.replace, String.match
 * @called_by Header, Footer, ContactPage, BUSINESS_INFO initialization
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

/**
 * Formats a numeric amount as US Dollar currency string.
 *
 * Uses the Intl.NumberFormat API to format numbers as USD with proper
 * locale-specific formatting including dollar sign, comma separators, and
 * two decimal places (e.g., $1,234.56).
 *
 * @param amount - The numeric amount to format (can be integer or decimal)
 * @returns Formatted currency string with $ symbol (e.g., "$1,234.56")
 *
 * @example
 * formatCurrency(1234.56)    // Returns '$1,234.56'
 * formatCurrency(42)         // Returns '$42.00'
 * formatCurrency(0.99)       // Returns '$0.99'
 * formatCurrency(1000000)    // Returns '$1,000,000.00'
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
 *
 * @functions_called Intl.NumberFormat
 * @called_by ComputerCard, GalleryGrid, PricingDisplay, InvoiceDisplay
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Converts text into a URL-friendly slug format.
 *
 * Transforms arbitrary text into a lowercase, hyphen-separated string
 * suitable for URLs and file names by:
 * 1. Converting to lowercase
 * 2. Replacing spaces with hyphens
 * 3. Removing non-word characters (except hyphens)
 * 4. Collapsing multiple hyphens into one
 * 5. Trimming leading/trailing hyphens
 *
 * @param text - The text string to convert to a slug
 * @returns URL-safe slug string (lowercase, hyphens, alphanumeric only)
 *
 * @example
 * slugify('Hello World')              // Returns 'hello-world'
 * slugify('User Profile & Settings')  // Returns 'user-profile-settings'
 * slugify('  Multiple   Spaces  ')    // Returns 'multiple-spaces'
 * slugify('Special!@#$%Characters')   // Returns 'specialcharacters'
 *
 * @see generateSlug in supabase.ts for blog post slug generation
 *
 * @functions_called String.toLowerCase, String.replace (5 calls)
 * @called_by generateSlug (supabase.ts), createPost, BlogEditor
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
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

/**
 * Converts a relative URL path to an absolute URL with the site's base domain.
 *
 * Prepends the application's base URL from environment variables (or default
 * production domain if not set) to create fully-qualified URLs. Essential for
 * generating canonical URLs, OpenGraph tags, and API endpoints that need
 * absolute references.
 *
 * @param path - The relative path to convert (should start with '/')
 * @returns Absolute URL string (e.g., 'https://computerstoreks.com/blog/post-slug')
 *
 * @example
 * // In production (NEXT_PUBLIC_APP_URL not set)
 * absoluteUrl('/blog')                    // Returns 'https://computerstoreks.com/blog'
 * absoluteUrl('/gallery/123')             // Returns 'https://computerstoreks.com/gallery/123'
 *
 * // In development (NEXT_PUBLIC_APP_URL = 'http://localhost:3000')
 * absoluteUrl('/api/auth')                // Returns 'http://localhost:3000/api/auth'
 *
 * @see OpenGraph metadata generation
 * @see Canonical URL tags in layout.tsx
 * @see Sitemap generation
 *
 * @functions_called None (template literal only)
 * @called_by MetaTags, generateMetadata, Sitemap, OpenGraphImage
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export function absoluteUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL || 'https://computerstoreks.com'}${path}`;
}

/**
 * Formats a date as a human-readable time distance from now.
 *
 * Converts a Date object to a relative time string like "5 minutes ago"
 * or "2 hours ago". Falls back to displaying the date if it's more than
 * a day ago.
 *
 * @param date - The date to format
 * @returns Human-readable time distance string
 *
 * @example
 * formatDistanceToNow(new Date(Date.now() - 5 * 60 * 1000))  // "5 minutes ago"
 * formatDistanceToNow(new Date(Date.now() - 2 * 60 * 60 * 1000))  // "2 hours ago"
 *
 * @functions_called Date.now, Math.floor
 * @called_by DeviceCard, DeviceDetail, various admin components
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export function formatDistanceToNow(date: Date): string {
  const now = Date.now();
  const then = date.getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'Just now';
  }
  if (diffMin < 60) {
    return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  }
  if (diffHour < 24) {
    return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
  }
  if (diffDay < 7) {
    return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  }

  // For older dates, show the date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}
