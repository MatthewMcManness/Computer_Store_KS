/**
 * VISIT BAND - The closing homepage band: the monument sign photo in
 * the bench frame, real hours with the open-now chip, address, a
 * directions link, and the big click-to-call number.
 *
 * WHEN TO EDIT: When changing the visit photo or layout. Hours, address,
 * and phone all render from src/lib/constants.ts, never hardcoded.
 */

import { BUSINESS_INFO } from '@/lib/constants';
import {
  Section,
  Eyebrow,
  PhoneLink,
  CTALink,
  BenchFrame,
  BenchPhoto,
} from '@/components/ui';
/* Direct, not through the barrel: OpenNowChip is a client component and
   the barrel is server-safe only. Every other consumer imports it this
   way too. */
import { OpenNowChip } from '@/components/ui/open-now-chip';

const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  BUSINESS_INFO.address
)}`;

/** Renders the visit band: photo, hours, address, directions, big tel link. */
export function VisitBand() {
  return (
    <Section
      tone="page"
      rhythm="standard"
      aria-labelledby="visit-heading"
      containerClassName="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16"
    >
      <div>
        <Eyebrow>Walk-ins welcome</Eyebrow>
        <h2 id="visit-heading" className="mt-4">
          Bring it by the shop
        </h2>
        <address className="mt-5 not-italic leading-relaxed text-body">
          {BUSINESS_INFO.addressLine1}
          <br />
          {BUSINESS_INFO.city}, {BUSINESS_INFO.state} {BUSINESS_INFO.zip}
        </address>
        <div className="mt-5">
          <OpenNowChip />
        </div>
        <ul className="mt-3 space-y-1 tabular-nums text-body">
          {BUSINESS_INFO.hours.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        {/* -ml-1 cancels the quiet variant's own 4px inset so the link
            sits on the same left rail as the address and the hours; the
            focus ring uses its offset, not padding. */}
        <div className="mt-5">
          <CTALink href={MAPS_URL} variant="quiet" className="-ml-1">
            Get directions
          </CTALink>
        </div>
        <div className="mt-8">
          {/* Fluid size override so the big number never overflows small phones */}
          <PhoneLink
            variant="display"
            className="text-[clamp(2rem,1rem+4.2vw,3.2rem)] font-extrabold leading-none tracking-tight"
          />
        </div>
      </div>

      <BenchFrame caption="The shop and its sign at the street">
        {/* A 2:1 letterbox on desktop, because both the building and the
            marquee have to be in one frame for the band to answer "where
            is it". Phones get the square crop of the sign alone, which
            is the thing you look for from the road. */}
        <BenchPhoto
          src="/assets/visit-storefront.jpg"
          alt="The shop building and its street sign reading walk in PC repair, seen across the parking lot"
          width={1560}
          height={780}
          narrowSrc="/assets/visit-storefront-narrow.jpg"
          narrowWebpSrc="/assets/visit-storefront-narrow.webp"
          narrowWidth={560}
          narrowHeight={560}
          sizes="(min-width: 1024px) 52vw, 100vw"
        />
      </BenchFrame>
    </Section>
  );
}
