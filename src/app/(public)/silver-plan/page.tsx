/**
 * SILVER PLAN PAGE - The flagship product page for the shop's revenue
 * backbone. Plaque hero, hairline coverage list, who it is for
 * (businesses first), business IT beyond the plan, how to start, and
 * the navy call CTA band.
 *
 * WHEN TO EDIT: When plan coverage, audience copy, or the start process
 * changes. Coverage items live in src/components/silver/coverage-list.tsx.
 */

import type { Metadata } from 'next';
import Image from 'next/image';
import { BUSINESS_INFO } from '@/lib/constants';
import { Section, BenchFrame } from '@/components/ui';
import { PlanHero } from '@/components/silver/plan-hero';
import { CoverageList } from '@/components/silver/coverage-list';
import { CTABand } from '@/components/pages/cta-band';
import { pageMetadata } from '@/components/seo/site-meta';
import { SilverPlanSchema } from '@/components/seo/silver-plan-schema';

export const metadata: Metadata = pageMetadata({
  title: 'The Silver Plan, Computer Protection in Topeka, KS',
  description: `The Silver plan bundles antivirus, repair discounts, remote support hours, and priority scheduling for Topeka homes and businesses. Call ${BUSINESS_INFO.phoneFormatted} to set it up.`,
  path: '/silver-plan',
  shareTitle: 'The Silver Plan',
  shareDescription:
    'Antivirus, repair discounts, remote support hours, and priority scheduling in one monthly plan from a real Topeka shop.',
});

export default function SilverPlanPage() {
  return (
    <>
      <SilverPlanSchema />
      <PlanHero />
      <CoverageList />

      {/* Who it is for: businesses first, individuals second.
          The wash ground is load-bearing. This band and the coverage
          list above it used to share one background, so the only thing
          marking the seam was a hairline stranded in 236px of white.
          The band change carries the transition now, and the page reads
          wash, white, wash, white, surface down its length. */}
      <Section tone="wash" rhythm="standard" aria-labelledby="who-heading">
        <h2 id="who-heading">Who it is for</h2>
        <div className="mt-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <h3>Businesses that cannot afford a down machine</h3>
            <p className="mt-4 max-w-[58ch]">
              Picture an emergency animal clinic. If the front desk computer
              goes down, scheduling, records, and payments go down with it.
              The Silver plan exists for that kind of business: every
              workstation covered, remote support hours already in place,
              and priority scheduling when something breaks.
            </p>
          </div>
          <div>
            <h3>Homes and home offices</h3>
            <p className="mt-4 max-w-[52ch]">
              If one computer holds your banking, photos, and email, the
              plan covers it the same way: antivirus handled, half off house
              calls, and free diagnostics whenever something feels off.
            </p>
          </div>
        </div>
      </Section>

      {/* Business IT beyond the plan */}
      <Section
        tone="page"
        rhythm="standard"
        aria-labelledby="beyond-heading"
        containerClassName="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16"
      >
        <div>
          <h2 id="beyond-heading" className="max-w-[22ch]">
            Business IT beyond the plan
          </h2>
          <p className="mt-6 max-w-[58ch]">
            When your business needs more than coverage, we do the work too:
            service calls at your office, house calls, and full IT resets
            with new machines set up and ready. Businesses that want deeper
            coverage can ask about Silver Plus when they call, with more
            remote support hours, business-grade antivirus, and reduced
            service call rates.
          </p>
        </div>
        {/* The marquee on the day it read HOUSE CALL PC REPAIR, which is
            the line this band is about. Square crop, shipped at the
            source's own resolution and capped to that width so it is
            never displayed larger than it really is. */}
        <BenchFrame
          caption="The marquee out at the street"
          className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-[38rem]"
        >
          <Image
            src="/assets/house-call-sign.jpg"
            alt={`The ${BUSINESS_INFO.name} sign at the street, with a marquee reading house call PC repair`}
            width={620}
            height={620}
            sizes="(min-width: 1024px) 38rem, (min-width: 640px) 28rem, 100vw"
            className="block h-auto w-full"
          />
        </BenchFrame>
      </Section>

      {/* The "How to start" band was deleted: it held an h2 and three
          lines, left the whole right half empty, and the CTABand
          directly beneath it made the same point again in one sentence.
          Its one useful fact (it is a single phone call, we set it up
          from our end) now lives in the CTABand line below. */}
      <CTABand
        layout="split"
        headingId="silver-cta-heading"
        title="Start with a phone call"
        line="Tell us what machines you run. We answer your questions, set the plan up from our end, and you are covered. The whole thing is one phone call."
        secondaryLabel="Or send a message"
      />
    </>
  );
}
