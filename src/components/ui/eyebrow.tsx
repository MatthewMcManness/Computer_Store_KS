/**
 * EYEBROW - The small letterspaced caps label that sits above section
 * titles ("TOPEKA, KANSAS. EST. 2003"). One of the editorial devices
 * from the shape brief.
 *
 * WHEN TO EDIT: When changing the eyebrow style site-wide.
 */

import { cn } from '@/lib/cn';

interface EyebrowProps {
  /** 'light' inverts the color for use on navy bands */
  onNavy?: boolean;
  /** Render as a tinted chip instead of bare text */
  chip?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** Renders the letterspaced small-caps eyebrow label used above headings. */
export function Eyebrow({ onNavy = false, chip = false, className, children }: EyebrowProps) {
  return (
    <p
      className={cn(
        'text-eyebrow uppercase',
        onNavy ? 'text-tint/80' : 'text-brand-deep',
        chip && (onNavy
          ? 'inline-block rounded-full bg-page/10 px-3 py-1'
          : 'inline-block rounded-full bg-tint px-3 py-1'),
        className
      )}
    >
      {children}
    </p>
  );
}
