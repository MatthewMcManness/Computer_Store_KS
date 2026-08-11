/**
 * SILVER PLAN HERO - The opening band of the shop's highest-revenue
 * page: display headline, the plan's promise, the call CTA, and the
 * coverage promise standing in the right column.
 *
 * WHAT REPLACED WHAT. This hero used to be the silver plaque stretched
 * to the full container as a ~1088x180 chrome slab. The locked gradient
 * is tuned for a nameplate: past ~360px its six stops smear into broad
 * warm-gray bands with a visible diagonal seam, the type inside had
 * three optical sizes with SILVER and PLAN colliding, and the whole
 * thing duplicated the h1 sitting 90px below it. The plaque survives
 * here at the header badge's proportion, as the product's nameplate
 * sitting on top of the coverage promise rather than as a banner.
 *
 * The right column earns its place: the three headline items of the
 * plan, on hairline rows, plus how the plan is priced. It is the answer
 * to "what am I buying", which is the only question this page has to
 * settle. Every item is verbatim from the full coverage list in
 * coverage-list.tsx, which is the single source for what the plan
 * includes; never state coverage here that is not on that list.
 *
 * ONE eyebrow, one gold marker, one h1. The old hero stacked a caps
 * feature line under the plaque and a gold eyebrow under that, so two
 * competing labels ran ahead of the heading.
 *
 * WHEN TO EDIT: When the Silver plan headline, promise, or hero CTAs
 * change. Coverage wording changes go in coverage-list.tsx first.
 */

import { Section, PhoneLink, CTALink } from '@/components/ui';

/** The three items the plan leads with, verbatim from the coverage list. */
const HEADLINE_COVERAGE = [
  'Antivirus software included',
  'Priority scheduling',
  'Free in-store diagnostics',
] as const;

/** Renders the Silver plan hero: headline, promise, call CTA, nameplate. */
export function PlanHero() {
  return (
    <Section tone="wash" rhythm="hero">
      <div className="grid gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start">
        <div>
          {/* The one gold marker allowed in this hero */}
          <p className="flex items-center gap-2.5 text-eyebrow uppercase text-accent-ink">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 shrink-0 bg-accent [clip-path:polygon(0_0,100%_0,100%_100%)]"
            />
            Protection and priority support
          </p>
          <h1 className="mt-5 max-w-[12ch] text-display">The Silver plan</h1>
          <p className="mt-7 max-w-measure text-lede">
            One monthly plan that keeps your computers protected,
            supported, and first in line at the shop. Businesses run their
            whole office on it. Individuals cover the machine they depend
            on.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
            <PhoneLink label="Call to set it up" />
            <CTALink href="/contact" variant="quiet">
              Send us a message
            </CTALink>
          </div>
        </div>

        {/* The nameplate at badge scale, over the promise it names. No
            surface behind the list: the rules carry it, so the plaque
            stays the only object in the column.

            IT IS A LABEL, NOT A CONTROL. This ran as a ~320px beveled
            chrome pill with a groove ring and embossed lettering,
            centered in its own column: unmistakably clickable, and it
            does nothing. It now shrink-wraps the word it prints, sits
            flat (see .silver-plaque), and reads as the plan's name
            stamped on a plate. Do not stretch it back to the column
            width or put the lighting back on it. */}
        <div className="lg:pt-1.5">
          <span className="silver-plaque inline-flex w-fit items-center justify-center rounded-[10px] px-5 py-3">
            <span className="silver-plaque-text text-2xl font-black uppercase leading-none tracking-[0.2em] [text-indent:0.2em]">
              Silver
            </span>
          </span>
          <ul className="mt-8 border-t border-line">
            {HEADLINE_COVERAGE.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3.5 border-b border-line py-3.5 font-semibold text-ink"
              >
                <span
                  aria-hidden="true"
                  className="mt-[0.62em] h-[5px] w-[5px] shrink-0 rounded-full bg-brand"
                />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-eyebrow uppercase text-muted">
            Priced per device, per month
          </p>
        </div>
      </div>
    </Section>
  );
}
