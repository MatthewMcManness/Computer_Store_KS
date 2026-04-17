/**
 * SHOP PAGE - Embeds the TDMyshop product catalog via script injection.
 * Products are fulfilled by TD Synnex; checkout and pricing are handled
 * entirely within the TDMyshop iframe.
 *
 * WHEN TO EDIT: When updating the shop intro text or TDMyshop embed script.
 */
'use client';

import { useEffect, useRef } from 'react';

export default function ShopPage() {
  const shopContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = shopContainerRef.current;
    if (!container) return;

    const script = document.createElement('script');
    script.src = 'https://cmc-td.com/button/productfinder.php?urlid=26552';
    script.async = true;
    container.appendChild(script);

    return () => {
      if (container.contains(script)) container.removeChild(script);
    };
  }, []);

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
          <div ref={shopContainerRef} />
        </div>
      </section>
    </>
  );
}
