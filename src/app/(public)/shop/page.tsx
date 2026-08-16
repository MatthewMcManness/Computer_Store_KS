/**
 * SHOP PAGE - Embeds the TDMyshop product catalog via iframe.
 * Checkout and pricing are handled entirely within the TDMyshop iframe.
 *
 * WHEN TO EDIT: When updating the shop intro text or TDMyshop embed URL.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: '/shop' },
};

export default function ShopPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white pt-32 pb-16 text-center">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h1 className="text-white text-[clamp(2rem,4vw,3rem)] font-bold mb-4">Shop Computers &amp; Accessories</h1>
          <p className="text-[clamp(1rem,2vw,1.2rem)] opacity-90 max-w-[650px] mx-auto">
            Browse thousands of products from top brands, all backed by our 20+ years of expertise.
          </p>
        </div>
      </section>

      <section className="bg-bg-light py-10 min-h-[800px]">
        <div className="w-[95%] max-w-[1400px] mx-auto px-2">
          <iframe
            src="https://cmc-td.com/button/clickpath.php?id=78074&pid=56&link=https%3A%2F%2Fcmcengage.com%2Findex.php%3Fid%3D78074"
            width="100%"
            height="2000"
            frameBorder="0"
            title="Computer Store KS Shop"
            style={{ background: '#fff', display: 'block' }}
          />
        </div>
      </section>
    </>
  );
}
