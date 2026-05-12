/**
 * CHEVRON SECTION - Full-width section wrapper with optional V-shaped
 * top and/or bottom edges. Adjacent V edges puzzle-piece together flush
 * via a single shared --chevron-depth CSS variable.
 *
 * WHEN TO EDIT: To adjust the chevron depth across the whole site,
 * edit --chevron-depth in globals.css. To change which edges are V or
 * flat for a given section, set topShape / bottomShape on the consumer.
 *
 * Padding rule: sections with topShape="v" need padding-top >= the
 * chevron depth so content stays clear of the notch (e.g. py-20 with
 * the default clamp(2rem, 4.5vw, 4.5rem) leaves comfortable clearance).
 */

import { forwardRef, type CSSProperties, type ReactNode } from 'react';

type ChevronShape = 'flat' | 'v';

interface ChevronSectionProps {
  topShape?: ChevronShape;
  bottomShape?: ChevronShape;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export const ChevronSection = forwardRef<HTMLElement, ChevronSectionProps>(
  function ChevronSection(
    { topShape = 'flat', bottomShape = 'flat', className = '', style, children },
    ref,
  ) {
    const classes = [
      topShape === 'v' && 'cs-top-v',
      bottomShape === 'v' && 'cs-bottom-v',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <section ref={ref} className={classes} style={style}>
        {children}
      </section>
    );
  },
);
