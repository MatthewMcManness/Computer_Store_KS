/**
 * CREDIBILITY STRIP - The compact typographic band listing the shop's
 * real certifications and the in-house line. No icons, no cards, no
 * invented numbers. The certification labels come from
 * src/components/static/shop-facts.ts so this strip and the About page
 * can never word them differently.
 *
 * A slot is reserved for the RepairShopr monthly-ticket stat; it ships
 * absent until Max supplies the real number.
 *
 * WHEN TO EDIT: When certifications change or the real ticket stat
 * arrives.
 */

import { BUSINESS_INFO } from '@/lib/constants';
import { Section } from '@/components/ui';
import { CERTIFICATIONS } from '@/components/static/shop-facts';

/** Renders the compact certifications strip between reviews and the visit band. */
export function CredibilityStrip() {
  return (
    <Section
      tone="surface"
      rhythm="compact"
      aria-labelledby="credibility-heading"
      containerClassName="flex flex-col gap-x-12 gap-y-6 sm:flex-row sm:justify-between"
    >
      <h2 id="credibility-heading" className="sr-only">
        Certifications
      </h2>
      <div>
        {/* Attribution: these are the owner's personal certs, matching the
            About page's "Certifications held by Max Beyer" wording. */}
        <p className="text-sm text-muted">Certifications held by the owner</p>
        <ul className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
        {CERTIFICATIONS.map((cert, i) => (
          <li
            key={cert}
            className="flex items-center gap-x-3 text-eyebrow uppercase text-ink"
          >
            {i > 0 ? (
              <span
                aria-hidden="true"
                className="inline-block h-1 w-1 rounded-full bg-line-strong"
              />
            ) : null}
            {cert}
          </li>
        ))}
        </ul>
      </div>
      {/* The right side mirrors the left's two-line stack, so the eyebrow
          line lands on the badge row's baseline rather than floating
          between the two lines opposite it.

          Wording: "Est. 2003" and "repairs done in-house" are stated
          separately on purpose. BUSINESS_INFO.founded and
          docs/profile/business-info.md support each on its own; that the
          in-house practice ran unbroken since 2003, through a prior
          owner, is not documented anywhere and is not claimed here.

          Reserved slot: the RepairShopr monthly-ticket stat replaces the
          second line once Max supplies the real number. */}
      <div className="shrink-0 sm:text-right">
        <p className="text-sm text-muted">Est. {BUSINESS_INFO.founded}</p>
        <p className="mt-2 text-eyebrow uppercase text-ink">
          Every repair done in-house
        </p>
      </div>
    </Section>
  );
}
