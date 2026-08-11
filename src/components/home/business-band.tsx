/**
 * BUSINESS BAND - The first-class homepage feature for the revenue
 * backbone: the Silver plan on the left (with its one gold marker),
 * business service calls and house calls on the right, and one shared
 * CTA row. No cards, asymmetric two-column with a hairline divide.
 *
 * WHEN TO EDIT: When changing how the Silver plan or business IT is
 * pitched on the homepage. Full plan details live on /silver-plan.
 */

import { Section, Eyebrow, PhoneLink, CTALink, PlaqueRule } from '@/components/ui';

/** Renders the homepage business band: Silver plan + service calls, shared CTAs. */
export function BusinessBand() {
  return (
    <Section tone="page" rhythm="generous" aria-labelledby="business-heading">
      <Eyebrow>For Topeka businesses</Eyebrow>
      <h2 id="business-heading" className="mt-4 max-w-[24ch]">
        IT that keeps your business running
      </h2>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-0 lg:divide-x lg:divide-line">
        {/* The Silver plan: the one gold marker allowed on this page section */}
        <div className="lg:pr-16">
          <p className="flex items-center gap-2.5 text-eyebrow uppercase text-accent-ink">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 shrink-0 bg-accent [clip-path:polygon(0_0,100%_0,100%_100%)]"
            />
            The Silver plan
          </p>
          <h3 className="mt-3">Covered before anything breaks</h3>
          <p className="mt-4 max-w-[56ch]">
            One monthly plan for the machines you cannot afford to lose:
            antivirus included, remote support hours every month, priority
            scheduling at the counter, and half off when we come to you.
            Businesses put their whole office on it. Individuals cover the
            one computer that matters.
          </p>
        </div>

        {/* Business service calls and house calls */}
        <div className="lg:pl-16">
          <p className="text-eyebrow uppercase text-brand-deep">
            Service calls
          </p>
          <h3 className="mt-3">We come to your office</h3>
          <p className="mt-4 max-w-[56ch]">
            Some work cannot come to the counter. We do service calls and
            house calls for the rest: full IT resets, new machines set up
            and ready to work, networks sorted, printers behaving. The same
            techs who work the bench show up at your door.
          </p>
        </div>
      </div>

      {/* Both columns get a way through. The Silver plan had a link here
          and service calls had none, so one half of a parallel pair was a
          dead end while the other led somewhere; /services/service-calls
          is the on-site work's own page and this is where the homepage
          hands it over. */}
      <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-5">
        <PhoneLink label="Call the shop" />
        <CTALink href="/silver-plan" variant="quiet">
          See the Silver plan
        </CTALink>
        <CTALink href="/services/service-calls" variant="quiet">
          How service calls work
        </CTALink>
      </div>

      {/* The homepage's ONE circuit rule, and it lives inside this band
          rather than between this band and the next. Set in the gap
          between the two sections it sat 14px above a hard background
          edge and read as a mis-registered second border. Here it closes
          the business half of what the shop sells, on one continuous
          ground, and the band change below carries the transition. */}
      <PlaqueRule width="full" className="mt-16" />
    </Section>
  );
}
