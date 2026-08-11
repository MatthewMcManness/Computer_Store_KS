/**
 * ABOUT PAGE - The shop's story, the in-house repair model, the team,
 * Max's certifications, and the building itself. Every fact renders
 * from BUSINESS_INFO or docs/profile; nothing is invented and no stock
 * imagery appears. Team headshots ship absent until real ones exist.
 *
 * WHEN TO EDIT: When the store's story, team roster, or certifications
 * change. Address, phone, and founding facts live in src/lib/constants.ts.
 */

import type { Metadata } from 'next';
import { Section } from '@/components/ui/section';
import { Eyebrow } from '@/components/ui/eyebrow';
import { BenchFrame } from '@/components/ui/bench-frame';
import { OpenNowChip } from '@/components/ui/open-now-chip';
import { BenchPhoto } from '@/components/ui/bench-photo';
import { CTABand } from '@/components/pages/cta-band';
import { CERTIFICATIONS } from '@/components/static/shop-facts';
import { BUSINESS_INFO } from '@/lib/constants';
import { pageMetadata } from '@/components/seo/site-meta';

export const metadata: Metadata = pageMetadata({
  title: `About the Shop, In-House Computer Repair in Topeka Since ${BUSINESS_INFO.founded}`,
  description: `${BUSINESS_INFO.name} has repaired, built, and sold computers at ${BUSINESS_INFO.addressLine1} in ${BUSINESS_INFO.city} since ${BUSINESS_INFO.founded}. Every repair happens in-house, so your machine and your data never leave the building.`,
  path: '/about',
  shareTitle: 'About the Shop',
  shareDescription: `A ${BUSINESS_INFO.city} computer shop since ${BUSINESS_INFO.founded}. Every repair happens in-house at ${BUSINESS_INFO.addressLine1}.`,
});

const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  BUSINESS_INFO.address
)}`;

/** The shop facts rendered as hairline spec rows in the hero. */
const SHOP_FACTS = [
  { term: 'Founded', detail: String(BUSINESS_INFO.founded) },
  { term: 'Founder', detail: BUSINESS_INFO.founder },
  { term: 'Owner today', detail: BUSINESS_INFO.owner },
  { term: 'Address', detail: BUSINESS_INFO.addressLine1 },
  { term: 'Repairs', detail: 'In-house, always' },
] as const;

/** The team, listed typographically. Names come from docs/profile/business-info.md. */
/* Exactly what docs/profile/business-info.md records: "Max Beyer
   (owner), Cruz (tech), Matthew (part-time)". No title is invented for
   Matthew here. Calling him a technician is not in any source document,
   and the source deliberately distinguishes Cruz's "(tech)" from
   Matthew's "(part-time)".

   The mixed register (two roles and one schedule) used to sit under an
   unlabelled column that implied all three were job titles, which is
   what made the third row read as a gap in the copy. The column now
   carries an explicit "At the shop" label, which all three answer
   truthfully. Replace with a real title once Max confirms one, and
   record it in docs/profile/business-info.md first. */
const TEAM = [
  { name: 'Max Beyer', detail: 'Owner' },
  { name: 'Cruz', detail: 'Technician' },
  { name: 'Matthew', detail: 'Part-time' },
] as const;

/** How the shop works, as three full-measure hairline rows. */
const VALUES = [
  {
    term: 'In-house',
    detail:
      'Diagnosis and repair happen on our bench, in this building. Nothing gets shipped off to a depot, and nobody outside the shop touches your files. When you call about your machine, the person who answers can walk over and look at it.',
  },
  {
    term: 'Honest pricing',
    detail:
      'The $50 diagnostic applies toward your repair. Jobs that are always the same have fixed prices, and everything else gets quoted after we have looked at the machine. You know the number before we start.',
  },
  {
    term: 'Quick turnaround',
    detail:
      'Working in-house keeps jobs moving. We tell you honestly how long a repair should take, then we get it back to you.',
  },
] as const;

export default function AboutPage() {
  return (
    <>
      {/* Hero: headline on the wash with the visiting facts filling the
          right column, then the building itself full width. The only
          hero on the site built around a full-width photograph.

          The right column is not decoration. It used to be about
          450x360px of empty wash between the header and the photo,
          which is the first thing a visitor sees on this page. It now
          carries the one thing a person reading about the shop asks
          next: when it is open and how to get there. The street address
          is deliberately NOT repeated here; the lede states it, and the
          spec rows below state it again in their own register. */}
      <Section tone="wash" rhythm="compact">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-20">
          <div>
            <Eyebrow>Topeka, Kansas. Est. {BUSINESS_INFO.founded}</Eyebrow>
            <h1 className="mt-5 max-w-[16ch] text-display">The shop behind the counter</h1>
            <p className="mt-8 max-w-[56ch] text-lede">
              We repair, build, and sell computers at {BUSINESS_INFO.addressLine1}. Every
              repair happens in this building, on our bench, by people you can talk to at
              the counter.
            </p>
          </div>
          <div className="border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-2">
            <p className="text-eyebrow uppercase text-muted">Open</p>
            <ul className="mt-3 space-y-1 tabular-nums text-body">
              {BUSINESS_INFO.hours.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <div className="mt-5">
              <OpenNowChip />
            </div>
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-[44px] items-center py-2 font-semibold text-brand-deep underline decoration-line-strong underline-offset-4 transition-colors duration-fast ease-brand hover:decoration-brand-deep"
            >
              Directions to the shop
            </a>
          </div>
        </div>
        <BenchFrame
          className="mt-12"
          caption={`The building at ${BUSINESS_INFO.addressLine1}, end to end`}
        >
          {/* Two crops of the same real photograph. The panoramic runs
              on desktop; phones get the 4:5 crop of the entrance and the
              store's own sign, because the panoramic renders about
              330x118 at 390px and the building becomes a smear. Both
              crops stop left of the neighbouring tenant's wall sign. */}
          <BenchPhoto
            src="/assets/shop-building.jpg"
            alt="The Computer Store Kansas building on SW Gage Blvd, seen end to end from across the parking lot"
            width={1180}
            height={460}
            narrowSrc="/assets/shop-building-narrow.jpg"
            narrowWebpSrc="/assets/shop-building-narrow.webp"
            narrowWidth={500}
            narrowHeight={625}
            priority
            sizes="(min-width: 1216px) 1104px, calc(100vw - 40px)"
          />
        </BenchFrame>
      </Section>

      {/* Story: the standing h2 holds the left rail with the shop's own
          facts under it, which is what the rail is for. The facts used to
          sit under the hero photograph, where they competed with it, and
          the rail here used to be 330px of nothing. */}
      <Section tone="page" rhythm="standard">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <div className="lg:sticky lg:top-28">
              <h2>How the shop got here</h2>
              <dl className="mt-8 border-t border-line">
                {SHOP_FACTS.map(({ term, detail }) => (
                  <div
                    key={term}
                    className="flex items-baseline justify-between gap-6 border-b border-line py-3.5"
                  >
                    <dt className="text-eyebrow uppercase text-muted">{term}</dt>
                    <dd className="text-right font-semibold tabular-nums text-ink">
                      {detail}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <div className="space-y-6">
            <p className="max-w-measure text-lg">
              The store opened on Gage Boulevard in {BUSINESS_INFO.founded}, founded by{' '}
              {BUSINESS_INFO.founder}. {BUSINESS_INFO.owner} owns and runs it today.
            </p>
            <p className="max-w-measure">
              Max got here the usual way for people who are good at this work. He started
              repairing computers young, first for family and friends, then as a side
              income, and eventually as a full business.
            </p>
            <p className="max-w-measure">
              The mission has stayed simple: help people, especially the ones getting left
              behind as technology moves fast. Operating systems change, hardware
              requirements jump, and a lot of good machines get stranded along with their
              owners. This shop exists for them.
            </p>
            <p className="max-w-measure font-semibold text-ink">
              Everything is repaired in-house. Your machine and your data never leave the
              building.
            </p>
          </div>
        </div>
      </Section>

      {/* Team and certifications, typographic only. No headshots exist yet,
          so none are shown; real photos get added when Max supplies them. */}
      <Section tone="surface" rhythm="standard">
        <h2>Behind the counter</h2>
        {/* TWO LISTS, ONE BASELINE AT THE BOTTOM. Three names beside four
            certifications meant the left list's closing rule stopped 74px
            above the right one's, so the shorter column's last hairline
            hung in mid-air next to nothing. Both lists now fill the row's
            height and share their opening and closing rules: each column
            is a flex column, each `ul` grows into it, and each row takes
            an equal share of the slack, so the rules stay evenly pitched
            instead of one list gaining a tall final row. Phones stack the
            columns, where there is no slack to distribute and nothing
            changes. */}
        <div className="mt-10 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div className="flex flex-col">
            <div className="flex items-baseline justify-between gap-6">
              <span className="text-eyebrow uppercase text-muted">Who is here</span>
              <span className="text-eyebrow uppercase text-muted">At the shop</span>
            </div>
            <ul className="mt-3 flex flex-1 flex-col border-b border-line">
              {TEAM.map(({ name, detail }) => (
                <li
                  key={name}
                  className="flex flex-1 flex-wrap content-center items-baseline justify-between gap-x-6 gap-y-1 border-t border-line py-5"
                >
                  <span className="text-title-sm text-ink">{name}</span>
                  <span className="text-eyebrow uppercase text-muted">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Certifications run as hairline rows, exactly like the team
              list beside them: two parallel typographic lists, no panel
              around either.

              The one gold on this page is the same small wedge that
              precedes the Silver plan eyebrow, seated on the label's own
              baseline. It used to hang off the right end of the label
              rule with nothing under it, where it read as clipped
              geometry rather than as the site's one deliberate gold
              mark. */}
          <div className="flex flex-col">
            <div className="flex items-baseline justify-between gap-6">
              <span className="flex items-center gap-2.5 text-eyebrow uppercase text-muted">
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-2.5 shrink-0 bg-accent [clip-path:polygon(0_0,100%_0,100%_100%)]"
                />
                Certified work
              </span>
              <span className="text-eyebrow uppercase text-muted">
                Held by {BUSINESS_INFO.owner}
              </span>
            </div>
            <ul className="mt-3 flex flex-1 flex-col border-b border-line">
              {CERTIFICATIONS.map((cert) => (
                <li
                  key={cert}
                  className="flex flex-1 flex-wrap content-center items-baseline justify-between gap-x-6 gap-y-1 border-t border-line py-5"
                >
                  <span className="text-title-sm text-ink">{cert}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Values: three plain paragraphs at varied widths, never a card grid */}
      <Section tone="page" rhythm="standard">
        <h2>How we work</h2>
        {/* Three items in a two-column grid left an orphan cell and three
            rules of three different lengths, none of which agreed. Three
            full-measure hairline rows resolve it: one rule length, every
            rule terminating on the container edge, and the same
            label-left / body-right module the service pages and the
            /computers buying steps already use. */}
        <ul className="mt-10 border-b border-line">
          {VALUES.map(({ term, detail }) => (
            <li
              key={term}
              className="grid gap-x-12 gap-y-2 border-t border-line py-7 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]"
            >
              <h3 className="text-xl">{term}</h3>
              <p className="max-w-measure">{detail}</p>
            </li>
          ))}
        </ul>
      </Section>

      <CTABand
        title="Bring it in, or call first"
        line="Tell us what the machine is doing and we will tell you what comes next."
      />
    </>
  );
}
