/**
 * CONTACT PAGE - Phone-first: a giant click-to-call number, live hours
 * with the open-now chip, the address and map, and the storefront photo.
 * The Turnstile-protected contact form comes second under "Or send a
 * message". All facts render from constants.
 *
 * Each fact appears ONCE on this page. The hours, the open-now chip and
 * the display-scale number all live in the hero; the form's side rail
 * carries a single line and a standard call button, and the footer
 * carries the repeat. Three hours blocks and two display-scale phone
 * numbers is how a phone-first page stops having a single answer.
 *
 * WHEN TO EDIT: When changing the contact page layout. Form logic lives
 * in src/components/forms/contact-form.tsx; hours, address, and phone
 * live in src/lib/constants.ts.
 */

import type { Metadata } from 'next';
import Image from 'next/image';
import { Section } from '@/components/ui/section';
import { Eyebrow } from '@/components/ui/eyebrow';
import { BenchFrame } from '@/components/ui/bench-frame';
import { OpenNowChip } from '@/components/ui/open-now-chip';
import { PhoneLink } from '@/components/ui/phone-link';
import { ContactForm } from '@/components/forms/contact-form';
import { BUSINESS_INFO, LOCATIONS } from '@/lib/constants';
import { pageMetadata } from '@/components/seo/site-meta';

export const metadata: Metadata = pageMetadata({
  title: 'Contact, Call the Shop in Topeka',
  description: `Call ${BUSINESS_INFO.name} at ${BUSINESS_INFO.phoneFormatted}, or send a message from this page. Hours, the address, and a map to ${BUSINESS_INFO.address} are all here.`,
  path: '/contact',
  shareTitle: 'Contact the shop',
  shareDescription: `Call the shop at ${BUSINESS_INFO.phoneFormatted} or visit ${BUSINESS_INFO.addressLine1} in ${BUSINESS_INFO.city}.`,
});

const TEL_HREF = `tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`;

const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  BUSINESS_INFO.address
)}`;

export default function ContactPage() {
  const loc = LOCATIONS.topeka;

  return (
    <>
      {/* Phone-first hero: the number is the page, and the visit facts
          fill the right rail instead of leaving the right half empty. */}
      <Section
        tone="page"
        rhythm="hero"
        containerClassName="grid gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-20"
      >
        <div>
          <Eyebrow>
            {BUSINESS_INFO.name}, {BUSINESS_INFO.city}
          </Eyebrow>
          {/* The h1 sits a step below the display scale the other
              top-level pages use, on purpose: on a phone-first page the
              display-scale element is the number, and the heading that
              introduces it must not compete with it. */}
          <h1 className="mt-5 text-headline">Call the shop</h1>
          <p className="mt-8 max-w-[56ch] text-lede">
            A phone call is the fastest way to get help. Tell us what the machine is doing
            and we will tell you what to do next.
          </p>
          {/* The number gets its own step, well clear of the h1 at every
              width: it is the answer this page exists to give.

              ONE LINE, ALWAYS. The previous rule let it wrap at the area
              code space on phones, so the largest element on the page
              set as an orphaned "(785)" over "267-3223" at exactly the
              moment a visitor is about to tap it. The size is fluid off
              the viewport instead, and `whitespace-nowrap` guarantees
              the break can never happen: at 390px the clamp resolves to
              about 43px, which sets all fourteen characters in 308px
              inside the 350px measure, and it still fits at 320px. */}
          <a
            href={TEL_HREF}
            aria-label={`Call ${BUSINESS_INFO.name} at ${BUSINESS_INFO.phoneFormatted}`}
            className="mt-8 inline-flex min-h-[44px] items-baseline whitespace-nowrap py-2 text-[clamp(2.25rem,11vw,4.75rem)] font-extrabold leading-[1.05] tracking-tight tabular-nums text-ink no-underline transition-colors duration-normal ease-brand hover:text-brand-deep"
          >
            <span aria-hidden="true">{BUSINESS_INFO.phoneFormatted}</span>
          </a>
          <div className="mt-5">
            <OpenNowChip />
          </div>
        </div>

        {/* Hours, address, directions as hairline-ruled typographic rows */}
        <div className="border-t border-line lg:border-t-0 lg:border-l lg:pl-12 lg:pt-0">
          <div className="border-b border-line py-5 lg:border-t-0 lg:pt-0">
            <p className="text-eyebrow uppercase text-muted">Hours</p>
            <ul className="mt-3 space-y-1 tabular-nums text-body">
              {BUSINESS_INFO.hours.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div className="border-b border-line py-5">
            <p className="text-eyebrow uppercase text-muted">Address</p>
            <address className="mt-3 not-italic leading-relaxed text-body">
              {BUSINESS_INFO.addressLine1}
              <br />
              {BUSINESS_INFO.city}, {BUSINESS_INFO.state} {BUSINESS_INFO.zip}
            </address>
          </div>
          <div className="py-5">
            <p className="text-eyebrow uppercase text-muted">Directions</p>
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex min-h-[44px] items-center py-2 font-semibold text-brand-deep underline decoration-line-strong underline-offset-4 transition-colors duration-fast ease-brand hover:decoration-brand-deep"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      </Section>

      {/* The map and the storefront, side by side and in the same
          system: both sit in the bench frame, both run 4:3 in equal
          columns, so their image areas and caption bars line up. The
          embed is desaturated so Google's orange POI pins and yellow
          roads stop being the loudest color on a page locked to blue
          plus one gold. */}
      <Section tone="surface" rhythm="standard">
        <h2>Find the shop</h2>
        <div className="mt-10 grid items-start gap-10 lg:grid-cols-2">
          <BenchFrame caption={`Map to ${BUSINESS_INFO.address}`}>
            <iframe
              src={loc.mapsEmbed}
              className="block aspect-[4/3] w-full bg-wash saturate-[.55] contrast-[1.03]"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map to ${BUSINESS_INFO.name} at ${BUSINESS_INFO.address}`}
            />
          </BenchFrame>
          {/* A DETAIL, not a second elevation. This and the wide
              building shot on /about used to be near-identical takes on
              the same facade from the same spot, differing mainly in
              crop width and exposure. Both are now cut from the same
              frame under the same grade: /about keeps the wide
              environmental view with the sky and the lot, and this one
              crops tight to the sign and the front door. */}
          <BenchFrame caption="The front door, under the store's own sign">
            <Image
              src="/assets/storefront-walkin.jpg"
              alt={`The ${BUSINESS_INFO.name} front door and the lit Open sign, under the Computer Sales Service Store sign`}
              width={896}
              height={672}
              priority
              sizes="(min-width: 1024px) 46vw, calc(100vw - 40px)"
              className="block h-auto w-full"
            />
          </BenchFrame>
        </div>
      </Section>

      {/* The form comes second, on purpose. Two measured columns keep the
          band balanced at desktop width: the form left, the phone
          alternative and hours deliberately filling the right rail. */}
      <Section tone="page" rhythm="generous">
        <h2>Or send a message</h2>
        <p className="mt-4 max-w-measure">
          Messages go straight to the shop&apos;s email. If it cannot wait, call.
        </p>
        {/* The call alternative is a rule-bounded strip above the form,
            not a side rail. As a rail it was one short paragraph beside a
            700px form, so the column under it was dead for the whole
            band, and it restated the hours and the number the hero had
            already given at full scale. */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-10 gap-y-4 border-y border-line py-5">
          <p className="max-w-[46ch] text-body">
            <span className="font-semibold text-ink">Rather talk it through?</span> A
            phone call is faster, and the hours are at the top of this page.
          </p>
          <PhoneLink label="Call" />
        </div>
        {/* min-w-0 lets the column shrink under the Turnstile widget's
            own 300px floor, which used to push a 320px viewport into a
            horizontal scroll. */}
        <div className="mt-12 min-w-0 max-w-3xl">
          <ContactForm />
        </div>
      </Section>
    </>
  );
}
