/**
 * CLASS MERGE (BRAND-AWARE) - The public site's `cn()` helper. Identical
 * to the one in utils.ts except that tailwind-merge is extended to know
 * the 2026-08 custom type-scale classes (text-eyebrow, text-lede,
 * text-title-sm, text-title, text-headline, text-display, text-stamp)
 * are FONT SIZES, not text colors.
 *
 * Why this exists: stock tailwind-merge cannot classify unknown `text-*`
 * classes, so it treats them all as one ambiguous group and drops
 * "conflicts". `cn('text-ink', 'text-stamp')` silently lost `text-ink`,
 * which rendered the $50 hero stamp numeral invisible on its light panel.
 * Registering the custom sizes lets a size and a color coexist.
 *
 * WHEN TO EDIT: When adding a new named step to the fontSize scale in
 * tailwind.config.js, register it here too. Admin components keep using
 * the plain cn in utils.ts; every public-site component imports this one.
 *
 * @functions_called clsx, extendTailwindMerge
 * @called_by All public-site UI components that accept className props
 *
 * @version 1.0.0 - 2026-08-10 - Split from utils.ts with the extended merge config
 */

import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge configured with the custom type-scale steps from
 * tailwind.config.js `fontSize` so they merge against other font sizes,
 * never against text colors.
 */
const twMergeBrand = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        { text: ['eyebrow', 'lede', 'title-sm', 'title', 'headline', 'display', 'stamp'] },
      ],
    },
  },
});

/**
 * Merges Tailwind classes with brand-aware conflict resolution.
 *
 * @param inputs - Class values (strings, objects, arrays, conditionals)
 * @returns Single merged className string
 */
export function cn(...inputs: ClassValue[]) {
  return twMergeBrand(clsx(inputs));
}
