/**
 * SERVICES HUB - The /services index page. States the shop's pricing
 * policy up front ($50 diagnostic, fixed prices where they exist), gives
 * business IT and the Silver plan top billing, then lists every service
 * as grouped editorial rows linking to the detail pages.
 *
 * WHEN TO EDIT: To change the page intro or the business band, edit
 * here. Row names and one-line descriptions live in
 * src/components/services/service-content.ts. To add a service, add it
 * there and to SERVICE_GROUPS.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Section, Eyebrow, PhoneLink, PriceStamp, PlaqueRule } from '@/components/ui';
import { CTABand } from '@/components/pages/cta-band';
import { SERVICES, SERVICE_GROUPS } from '@/components/services/service-content';
import { BUSINESS_INFO } from '@/lib/constants';
import { pageMetadata } from '@/components/seo/site-meta';

/* The description says what this page HOLDS, not what it prices. Only
   one fixed price is documented today, so the old "pricing stated up
   front: a $50 diagnostic..." snippet promised a price list the index
   does not carry. It describes the pricing POLICY instead, which the
   page does state in full, and it goes back to naming prices the day
   the blowout, repaste, and cooler-install numbers ship. */
export const metadata: Metadata = pageMetadata({
  title: 'Computer Repair Services in Topeka, KS',
  description: `Computer repair, upgrades, data services, custom builds, and business IT in ${BUSINESS_INFO.city}, ${BUSINESS_INFO.state}. Every repair starts with a $50 diagnostic that applies toward the work, and everything else is quoted before we start. In-house since ${BUSINESS_INFO.founded}.`,
  path: '/services',
  shareTitle: 'Computer Repair Services',
  shareDescription: `Repairs, upgrades, data services, and custom builds in ${BUSINESS_INFO.city}. The $50 diagnostic applies toward your repair.`,
});

export default function ServicesPage() {
  return (
    <>
      {/* ── Hero: no right column at all. This is the index page, so the
             headline runs the full container as a masthead and the band
             resolves into the category list rather than leaving half a
             viewport empty beside a measured paragraph. No CTA pair
             either: the whole page is the call to action. ── */}
      {/* The hero rhythm is cut short on purpose. At the standard hero
          padding this band closed with roughly 95px of empty page under
          the index column before the navy band, on top of the height
          the two columns already differ by, and the masthead read as a
          composition that had run out of content. */}
      <Section tone="page" rhythm="hero-tight">
        <Eyebrow>Services and pricing</Eyebrow>
        {/* The headline promises what this page delivers. Exactly one
            fixed price is documented today (the $50 diagnostic), so the
            old "what it costs up front" line wrote a cheque the index
            could not cash. Restore it once Max confirms the blowout,
            repaste, and cooler-install prices and those rows ship. */}
        <h1 className="mt-5 max-w-[24ch] text-display">
          What we fix, and how pricing works
        </h1>
        <div className="mt-10 grid gap-x-16 gap-y-8 border-t border-line pt-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          {/* The flat-rate jobs are named now. Saying only "jobs that
              are always the same" left a visitor to guess which ones,
              and the home page then labelled one of them, blowout
              cleaning, as quoted after diagnosis. The mechanism is
              stated here; the numbers are a phone call until Max
              confirms them, and they drop into this sentence when he
              does. */}
          <p className="max-w-measure text-lede text-body">
            Every repair starts with a $50 diagnostic, and the whole fee applies toward
            the work. Standard jobs like a blowout cleaning, a thermal repaste, or a
            cooler install run at a flat rate, so call and we will tell you the number.
            Everything else gets quoted after diagnosis, before anything happens to your
            machine.
          </p>
          {/* The category index, in the hero. It fills the half viewport
              that used to sit empty and it does real work: the page is
              long, and this says what is on it before the scroll. */}
          <div>
            <p className="text-eyebrow uppercase text-muted">On this page</p>
            <ul className="mt-3 border-t border-line">
              {SERVICE_GROUPS.map((group) => (
                <li
                  key={group.label}
                  className="flex items-baseline justify-between gap-6 border-b border-line py-2.5"
                >
                  <span className="font-semibold text-ink">{group.label}</span>
                  <span className="text-sm tabular-nums text-muted">
                    {group.slugs.length}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ── Business IT and the Silver plan get top billing ── */}
      <Section tone="navy" rhythm="standard" aria-labelledby="services-business">
        <Eyebrow onNavy>For businesses</Eyebrow>
        <h2 id="services-business" className="mt-4 max-w-[24ch] text-page">
          The Silver plan and full IT support
        </h2>
        <div className="mt-10 grid gap-x-16 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h3 className="text-lg text-page">The Silver plan</h3>
            <p className="mt-3 max-w-measure text-tint/90">
              Our recurring protection plan: ongoing coverage and priority service for the machines
              you count on, from a shop that already knows them when something goes wrong. It fits a
              single home computer or a whole office.
            </p>
          </div>
          {/* This heading used to read "Service calls and house calls",
              word for word the same as the index row further down the
              page, and the two descriptions were the same sentence at
              two lengths. It was the only duplicate heading on the
              site. The band keeps the business framing; the index row
              keeps the service name. */}
          <div className="lg:col-span-7">
            <h3 className="text-lg text-page">On-site work and full IT resets</h3>
            <p className="mt-3 max-w-measure text-tint/90">
              We come to your office or your house, sort out the machines, the printers, and the
              connections between them, and set the place up so it stays working. For a business
              that can run all the way to a full reset.
            </p>
          </div>
        </div>
        {/* Both business lines link out to a page of their own. On-site
            work is revenue priority #2 and used to have no indexable
            destination at all, so its link sits here beside the plan's. */}
        <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
          <PhoneLink variant="inverse" label="Call" />
          <Link
            href="/silver-plan"
            className="inline-flex min-h-[44px] items-center px-1 py-2 font-semibold text-tint underline decoration-tint/40 underline-offset-4 transition-colors duration-normal ease-brand hover:decoration-tint"
          >
            See the Silver plan
          </Link>
          <Link
            href="/services/service-calls"
            className="inline-flex min-h-[44px] items-center px-1 py-2 font-semibold text-tint underline decoration-tint/40 underline-offset-4 transition-colors duration-normal ease-brand hover:decoration-tint"
          >
            How service calls work
          </Link>
        </div>
      </Section>

      {/* ── The full index: grouped editorial rows, no card grid ── */}
      <Section tone="page" rhythm="generous" aria-labelledby="services-index">
        <h2 id="services-index">Every service, listed plainly</h2>
        {/* EVERY CATEGORY BOUNDARY IS TREATED THE SAME WAY: spacing, and
            the eyebrow that opens the next group. The circuit rule used
            to fire at one of the four boundaries (between Software and
            Builds and data) and nowhere else, which made a signature
            moment look like it had been dropped at random: the
            Repair-to-Software boundary is exactly the same kind of seam
            and got nothing. The rule moved to the one real structural
            break on this page, the end of the index, where it closes the
            band on its own continuous ground the way the homepage
            business band closes. */}
        <div className="mt-12 space-y-16">
          {SERVICE_GROUPS.map((group) => (
            <div key={group.label}>
              <Eyebrow>{group.label}</Eyebrow>
              <ul className="mt-5 border-t border-line">
                {group.slugs.map((slug) => {
                  const service = SERVICES[slug];
                  const stamp = slug === 'diagnostics' ? service.cost.stamp : undefined;
                  return (
                    <li key={slug} className="border-b border-line">
                      {/* The row's affordance lives in a right-aligned
                          cell, so every hairline terminates in a real
                          element instead of running a third of the
                          container into nothing fourteen times down the
                          page. The price stamp, where a row has one,
                          sits in that same cell above the arrow. */}
                      <Link
                        href={`/services/${slug}`}
                        className="group grid items-start gap-x-8 gap-y-3 px-2 py-6 no-underline transition-colors duration-fast ease-brand hover:bg-tint sm:grid-cols-[minmax(0,1fr)_auto] sm:px-4"
                      >
                        <span className="block">
                          <h3 className="text-ink transition-colors duration-fast ease-brand group-hover:text-brand-deep">
                            {service.name}
                          </h3>
                          <span className="mt-1.5 block max-w-measure text-body">
                            {service.indexLine}
                          </span>
                        </span>
                        <span className="flex items-center gap-5 sm:justify-end sm:self-center">
                          {stamp && (
                            <PriceStamp
                              amount={stamp.amount}
                              caption="applies toward your repair"
                              size="sm"
                            />
                          )}
                          <ArrowRight
                            aria-hidden="true"
                            className="h-5 w-5 shrink-0 text-brand transition-transform duration-normal ease-brand group-hover:translate-x-1.5"
                          />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <PlaqueRule width="full" className="mt-16" />
      </Section>

      {/* ── Call-first closing band ── */}
      <CTABand
        headingId="services-cta"
        title="Start with the diagnostic"
        line="If you are not sure what the machine needs, bring it in. The $50 diagnostic gets you a plain answer and a real price before any work happens."
      />
    </>
  );
}
