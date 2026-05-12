/**
 * CHEVRON SECTION - Full-width section wrapper with optional V-shaped
 * top and/or bottom edges. Adjacent V edges puzzle-piece together flush
 * via a single shared --chevron-depth CSS variable.
 *
 * When topShape="v", children are wrapped in an inner div that adds
 * padding-top equal to --chevron-depth. This balances the at-center
 * vertical whitespace: the chevron notch eats into the section's top
 * padding while the bottom chevron tail extends past the corner level,
 * so without the extra top padding the title would sit much closer to
 * the top edge than the bottom content sits to the bottom edge.
 *
 * WHEN TO EDIT: To adjust the chevron depth across the whole site,
 * edit --chevron-depth in globals.css. To change which edges are V or
 * flat for a given section, set topShape / bottomShape on the consumer.
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
    const isTopV = topShape === 'v';
    const classes = [
      isTopV && 'cs-top-v',
      bottomShape === 'v' && 'cs-bottom-v',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <section ref={ref} className={classes} style={style}>
        {isTopV ? <div className="cs-clearance-top">{children}</div> : children}
      </section>
    );
  },
);
