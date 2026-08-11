/**
 * HOME HERO - The homepage hero, and the only full-bleed composition on
 * the site: the navy field runs edge to edge, the type sits in the page
 * container, and the framed bench photo bleeds off the right edge. Every
 * other page's hero is contained, so this one outranks all of them.
 *
 * The h1 is text-display-xl, the top step of the scale and the only use
 * of it on the site. Top-level pages step down to text-display, service
 * detail pages to the h1 default.
 *
 * WHEN TO EDIT: When changing the homepage headline, hero CTAs, or the
 * hero photo. The phone number and address live in src/lib/constants.ts.
 */

import Image from 'next/image';
import { BUSINESS_INFO } from '@/lib/constants';
import {
  Section,
  Eyebrow,
  PhoneLink,
  CTALink,
  PriceStamp,
  BenchFrame,
} from '@/components/ui';

/** Renders the homepage hero: headline, call CTA, diagnostic stamp, bench photo. */
export function HeroBand() {
  return (
    <Section tone="navy" rhythm="hero" className="hero-circuit-field" contained={false}>
      {/* The left padding reproduces Section's own left content edge, so
          the h1 lands on the same vertical spine as the header logo and
          every h2 below it while the right column keeps running off the
          edge. The measure is `100%` of the section, not `100vw`: the
          section's content box excludes the scrollbar, so the spine holds
          on every platform. `(100% - 72rem)/2` is the container's left
          margin and `+2rem` is its `sm:px-8` padding. */}
      <div className="grid w-full grid-cols-[minmax(0,1fr)] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-16 lg:pl-[max(2rem,calc((100%-72rem)/2+2rem))] lg:pr-0">
        <div className="min-w-0 max-w-[42rem]">
          <Eyebrow onNavy>
            Topeka, Kansas. Est. {BUSINESS_INFO.founded}
          </Eyebrow>
          <h1 className="mt-5 max-w-[15ch] text-display-xl text-page">
            Fast, honest computer repair in Topeka
          </h1>
          <p className="mt-7 max-w-[52ch] text-lede text-tint/90">
            Every repair happens in our shop at {BUSINESS_INFO.addressLine1}.
            Your machine and your data never leave the building.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
            <PhoneLink variant="inverse" label="Call" />
            <CTALink
              href="/contact"
              variant="quiet"
              className="text-tint decoration-tint/40 hover:decoration-page"
            >
              Send us a message
            </CTALink>
          </div>
          {/* The diagnostic stamp beside the CTAs: honesty made visible.
              It sits on a light tag panel so the stamp keeps its
              ink-on-white colors against the navy band. The numeral and
              its caption share one optical axis, so the panel is exactly
              as wide as what is in it. */}
          <div className="mt-10 flex max-w-full rounded-brand-md bg-page px-5 py-4 shadow-raised sm:w-fit sm:px-6">
            <PriceStamp
              amount={50}
              caption="diagnostic, applies toward your repair"
              layout="row"
            />
          </div>
        </div>

        {/* The framed photo bleeds off the right edge of the viewport at
            lg. hero-open-build.jpg is cropped to the machine itself, so
            nothing outside the case is in frame and the caption can only
            claim what the picture shows. Graded with the rest of the set
            in one pass, so no in-browser filter is needed here. */}
        <div className="min-w-0">
          <BenchFrame caption="Open machine, side panel off">
            <Image
              src="/assets/hero-open-build.jpg"
              alt="A desktop computer with its side panel removed, showing the motherboard, cooler, graphics card, and power supply"
              width={1150}
              height={1285}
              priority
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="block h-auto w-full"
            />
          </BenchFrame>
        </div>
      </div>
    </Section>
  );
}
