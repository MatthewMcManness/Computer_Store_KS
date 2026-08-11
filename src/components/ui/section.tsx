/**
 * SECTION - Standard page band for the public site. Handles background
 * tone, vertical rhythm, and the centered content container so pages
 * never hand-roll section padding.
 *
 * Rhythm varies deliberately (design law): heroes are tight, feature
 * bands generous, utility bands compact. Never give every section the
 * same rhythm down a page.
 *
 * WHEN TO EDIT: When adding a new background tone or changing the
 * site-wide section spacing scale.
 */

import { cn } from '@/lib/cn';

type SectionTone = 'page' | 'surface' | 'wash' | 'navy';
type SectionRhythm = 'hero' | 'hero-tight' | 'generous' | 'standard' | 'compact';

interface SectionProps {
  /** Background: 'page' (default white-tinted), 'surface', 'wash' (faint blue), 'navy' (committed brand band, sets light text) */
  tone?: SectionTone;
  /** Vertical padding: 'hero' | 'generous' | 'standard' (default) | 'compact' */
  rhythm?: SectionRhythm;
  /** Set false to render edge-to-edge content without the centered container */
  contained?: boolean;
  id?: string;
  /** Extra classes for the outer <section> element */
  className?: string;
  /** Extra classes for the inner container div (ignored when contained is false) */
  containerClassName?: string;
  'aria-labelledby'?: string;
  children: React.ReactNode;
}

const TONES: Record<SectionTone, string> = {
  page: 'bg-page',
  surface: 'bg-surface',
  wash: 'bg-wash',
  navy: 'bg-brand-navy text-tint',
};

const RHYTHMS: Record<SectionRhythm, string> = {
  hero: 'pt-14 pb-16 md:pt-20 md:pb-24',
  /* A hero that resolves straight into the next band. For heroes whose
     content ends unevenly (a measured paragraph beside a taller index
     column, say), the full hero foot leaves the shorter column sitting
     over a hundred pixels of nothing before the next background. */
  'hero-tight': 'pt-14 pb-10 md:pt-20 md:pb-14',
  generous: 'py-24 md:py-32',
  standard: 'py-16 md:py-20',
  compact: 'py-12 md:py-16',
};

/** Renders a <section> band with brand tone, rhythm, and centered container. */
export function Section({
  tone = 'page',
  rhythm = 'standard',
  contained = true,
  id,
  className,
  containerClassName,
  'aria-labelledby': ariaLabelledBy,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn(TONES[tone], RHYTHMS[rhythm], className)}
    >
      {contained ? (
        <div className={cn('mx-auto w-full max-w-6xl px-5 sm:px-8', containerClassName)}>
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
}
