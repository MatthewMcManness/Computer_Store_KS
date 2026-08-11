/**
 * SHOP PAGE - A brand-framed shell around the supplier's external
 * catalog iframe. Checkout and pricing happen entirely inside the
 * iframe; the page adds one intro line and routes service questions to
 * the phone.
 *
 * The shop does NOT sell online itself (docs/profile/services.md: no
 * online sales, the drop-ship buy-in was not worth it). The copy here
 * must keep naming the catalog as the supplier's, matching what
 * /privacy and /terms already disclose. Do not retitle this page in a
 * way that implies the store fulfils these orders.
 *
 * WHEN TO EDIT: When updating the intro text or the supplier embed URL.
 */

import type { Metadata } from 'next';
import { Section } from '@/components/ui/section';
import { Eyebrow } from '@/components/ui/eyebrow';
import { PhoneLink } from '@/components/ui/phone-link';
import { BUSINESS_INFO } from '@/lib/constants';
import { pageMetadata } from '@/components/seo/site-meta';

export const metadata: Metadata = pageMetadata({
  title: 'Online Catalog',
  description: `Browse our supplier's online catalog for computers and accessories. For in-store stock, repairs, or pricing, call the shop at ${BUSINESS_INFO.phoneFormatted}.`,
  path: '/shop',
  shareTitle: 'Online Catalog',
  shareDescription:
    "Browse our supplier's online catalog. For anything in the store, call us.",
});

export default function ShopPage() {
  return (
    <>
      <Section tone="page" rhythm="compact">
        <Eyebrow>Online catalog</Eyebrow>
        <h1 className="mt-4">The online catalog</h1>
        <p className="mt-5 max-w-measure text-lg">
          This catalog is run by our supplier and orders ship direct. For anything in
          the store, stock, repairs, or pricing, call us at{' '}
          <PhoneLink variant="inline" />.
        </p>
      </Section>

      <Section tone="surface" rhythm="compact">
        {/* The catalog is a third-party embed. When it is slow, blocked,
            or rate limited it renders as a blank rectangle, so the page
            says what to do about that before the frame loads. */}
        <p className="max-w-measure text-body">
          If the catalog does not load, call the shop at <PhoneLink variant="inline" /> and
          we will check stock for you.
        </p>
        <div className="mt-6 border border-line-strong bg-page">
          <iframe
            src="https://cmc-td.com/button/clickpath.php?id=78074&pid=56&link=https%3A%2F%2Fcmcengage.com%2Findex.php%3Fid%3D78074"
            width="100%"
            height="1600"
            loading="lazy"
            frameBorder="0"
            title={`${BUSINESS_INFO.name} online catalog`}
            className="block h-[min(1600px,180vh)] w-full bg-page"
          />
        </div>
      </Section>
    </>
  );
}
