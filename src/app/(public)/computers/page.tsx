/**
 * COMPUTERS PAGE - The build showcase: custom builds to spec, machines
 * refurbished for the sales floor, the real burn-in process, and how
 * buying works. No stock listings and no prices; floor stock changes, so
 * the page says to call.
 *
 * ONE PHOTO, and it appears nowhere else on the site: a crop through the
 * populated half of a finished build, card and board in one frame. The
 * hero is a masthead over a letterbox, with the lede and the CTAs seated
 * on a hairline foot beneath it, so this page does not open on the same
 * type-left / object-right lockup as its siblings.
 *
 * WHEN TO EDIT: When the build or refurbishing story changes, or when a
 * live gallery feed replaces the static burn-in section.
 */

import type { Metadata } from 'next';
import { Section } from '@/components/ui/section';
import { Eyebrow } from '@/components/ui/eyebrow';
import { PlaqueRule } from '@/components/ui/plaque-rule';
import { BenchFrame } from '@/components/ui/bench-frame';
import { BenchPhoto } from '@/components/ui/bench-photo';
import { PhoneLink } from '@/components/ui/phone-link';
import { CTALink } from '@/components/ui/cta-link';
import { CTABand } from '@/components/pages/cta-band';
import { BUSINESS_INFO } from '@/lib/constants';
import { pageMetadata } from '@/components/seo/site-meta';

export const metadata: Metadata = pageMetadata({
  title: 'Computers, Built and Refurbished in This Shop',
  description: `Custom computer builds and refurbished machines from ${BUSINESS_INFO.name} in ${BUSINESS_INFO.city}. Every build is assembled and stress tested on our bench before it leaves the shop.`,
  path: '/computers',
  /* Commaless on purpose: the share line is joined to the shop's name
     with the one comma that separates them. */
  shareTitle: 'Computers Built and Refurbished in This Shop',
  shareDescription: `Custom builds and refurbished machines, assembled and tested in ${BUSINESS_INFO.city}.`,
});

/**
 * What the bench watches during burn-in, and why each one is worth
 * watching. Labels alone rendered as a table header with no body; every
 * label now carries the plain reason it is on the list. No test names,
 * durations, or pass rates: none of those are documented anywhere, and
 * this page never states a number the shop has not confirmed.
 */
const BURN_IN_WATCH = [
  {
    term: 'Temperatures',
    detail: 'Load is where a cooler that is not seated right shows itself.',
  },
  {
    term: 'Fans',
    detail: 'We listen for the one that rattles, or never spins up at all.',
  },
  {
    term: 'Storage',
    detail: 'A drive that is going to fail usually fails under a long read and write.',
  },
  {
    term: 'Memory',
    detail: 'Bad memory looks like a dozen other problems, so it gets its own test.',
  },
] as const;

/** The plain steps of buying a machine here, rendered as hairline rows. */
const BUYING_STEPS = [
  {
    title: 'Come in or call',
    detail: 'Tell us what the machine is for and what you want to spend.',
  },
  {
    title: 'Get straight advice',
    detail: 'Nobody here works on commission. We help you pick what actually fits the job.',
  },
  {
    title: 'We build or pull the machine',
    detail: 'Custom builds are assembled on our bench. Refurbished machines come off the floor.',
  },
  {
    title: 'It gets tested before you get it',
    detail: 'Every machine runs on the bench before it goes home with you.',
  },
] as const;

export default function ComputersPage() {
  return (
    <>
      {/* Hero: a masthead over a letterbox. The h1 runs the container,
          the photograph is the full width of the page under it, and the
          lede and the CTAs sit on a hairline foot in two cells, so the
          band has no half-empty column anywhere in it. */}
      <Section tone="page" rhythm="hero">
        <Eyebrow>Built here, sold here</Eyebrow>
        <h1 className="mt-5 max-w-[20ch] text-display">
          Computers built and refurbished in this shop
        </h1>
        <BenchFrame className="mt-10" caption="Inside a build we finished on the bench">
          {/* Two crops of one machine, deliberately taken from different
              halves of it. Desktop runs the populated middle: graphics
              card seated on the board. Phones get the lower half instead,
              the board and the power supply, because the phone crop used
              to be a second view of the same card and cooler that leads
              /services/custom-computers, which is the page this one links
              to. The caption covers both, since a <picture> carries one.

              The narrow crop also sits well clear of the blown pump
              highlight the desktop crop was framed to exclude. */}
          <BenchPhoto
            src="/assets/build-detail.jpg"
            alt="Inside a finished custom build, looking at the motherboard and the parts mounted to it"
            width={1560}
            height={800}
            narrowSrc="/assets/build-detail-narrow.jpg"
            narrowWebpSrc="/assets/build-detail-narrow.webp"
            narrowWidth={900}
            narrowHeight={1125}
            priority
            sizes="(min-width: 1216px) 1104px, calc(100vw - 40px)"
          />
        </BenchFrame>
        <div className="mt-10 grid items-center gap-x-12 gap-y-6 border-t border-line pt-8 md:grid-cols-[minmax(0,6fr)_minmax(0,6fr)]">
          <p className="max-w-[56ch] text-lede text-body">
            We build computers to spec and refurbish good machines for the sales
            floor. Every one of them is assembled and tested at{' '}
            {BUSINESS_INFO.addressLine1}.
          </p>
          <div className="flex flex-wrap items-start gap-x-8 gap-y-4 md:justify-end">
            <PhoneLink label="Call about a build" />
            <CTALink href="/contact" variant="quiet">
              Send us a message
            </CTALink>
          </div>
        </div>
      </Section>

      {/* What we build and what we refurbish: asymmetric, no cards.
          The pair sits UNDER the section's own h2 and both columns run
          at h3, matching the homepage business band. Setting one at h2
          scale and the other at h3 while they shared a baseline read as
          a hierarchy error rather than a primary/secondary split. */}
      <Section tone="wash" rhythm="standard" aria-labelledby="computers-ways">
        <h2 id="computers-ways">Two ways to get a machine</h2>
        <div className="mt-12 grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div>
            <h3>Custom builds, to your spec</h3>
            <div className="mt-6 space-y-5">
              <p className="max-w-measure">
                Tell us what the machine needs to do and what you want to spend. We pick
                parts that fit, build it on our bench, and stand behind the work. Office
                desktops, gaming builds, machines for one specific stubborn job: the
                process is the same.
              </p>
              <p className="max-w-measure">
                You are welcome to bring your own parts list, or hand us the whole
                decision. Either way you get a machine put together by the people who
                will service it later.
              </p>
              {/* The left column used to stop 150px above the right one.
                  This is the real next step for a reader in this column,
                  and it lands the two on the same baseline. */}
              <CTALink href="/services/custom-computers" variant="quiet" className="-ml-1">
                How a custom build comes together
              </CTALink>
            </div>
          </div>
          <div className="lg:border-l lg:border-line lg:pl-10">
            <h3>Refurbished, on the floor</h3>
            <div className="mt-6 space-y-5">
              <p className="max-w-measure">
                We also refurbish desktops and laptops and sell them in the store, tested
                and cleaned up before they hit the floor.
              </p>
              <p className="max-w-measure">
                In-store stock and prices change all the time, so the site does not list
                them. Call and ask what is on the floor today.
              </p>
              <PhoneLink label="Call" />
            </div>
          </div>
        </div>
      </Section>

      {/* Burn-in: one measure, h2 above the body, then the watch list at
          full container width. The lede no longer names the four things
          it watches, because the rows underneath name them and say what
          each one catches. */}
      <Section tone="page" rhythm="standard" aria-labelledby="computers-burnin">
        <div className="max-w-[46rem]">
          <h2 id="computers-burnin">Every build gets burned in</h2>
          <p className="mt-6 max-w-[56ch] text-lede text-body">
            Before a build leaves the shop, it runs under load on the bench and we
            watch how it holds up.
          </p>
          <p className="mt-5 max-w-measure">
            If a part is going to act up, we want it to act up here, on our bench, and
            get replaced before you ever see it.
          </p>
        </div>
        {/* The watch list is a definition list, not a label strip. As
            four labels between two hairlines it rendered as a table
            header whose rows had failed to load, and it repeated the
            sentence above it word for word. Each label now answers the
            question the label raises, in the same hairline-row module
            the rest of the site uses for spec rows. */}
        <dl className="mt-12 border-b border-line">
          {BURN_IN_WATCH.map(({ term, detail }) => (
            <div
              key={term}
              className="grid items-baseline gap-x-10 gap-y-1 border-t border-line py-5 md:grid-cols-[minmax(0,3fr)_minmax(0,8fr)]"
            >
              <dt className="text-eyebrow uppercase text-muted">{term}</dt>
              <dd className="max-w-measure text-body">{detail}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <PlaqueRule />

      {/* How buying works: numbered hairline rows, utility rhythm. Stays
          on `page` so it does not merge into the surface CTA band. */}
      <Section tone="page" rhythm="compact">
        <h2>How buying works</h2>
        <ol className="mt-10 list-none border-b border-line p-0">
          {BUYING_STEPS.map(({ title, detail }, index) => (
            <li
              key={title}
              className="grid gap-x-10 gap-y-2 border-t border-line py-6 md:grid-cols-[3.5rem_minmax(0,4fr)_minmax(0,6fr)]"
            >
              <span className="text-title-sm tabular-nums text-brand" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="text-xl">{title}</h3>
              <p className="max-w-measure">{detail}</p>
            </li>
          ))}
        </ol>
      </Section>

      <CTABand
        title="Talk through your next machine"
        line="Call the shop and tell us what you need it to do. We will tell you what makes sense."
      />
    </>
  );
}
