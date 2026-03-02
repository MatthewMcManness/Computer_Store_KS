/**
 * Store landing page (/store).
 *
 * Server component that displays the store homepage with a hero section,
 * featured products grid, category navigation grid, and an optional
 * announcement banner. If the store is disabled via store_enabled config,
 * shows a "Coming Soon" message instead.
 *
 * @returns The store landing page
 *
 * @sideEffects
 * - Reads from store_products, store_categories, store_pricing_config tables
 *
 * @functions_called getFeaturedProducts, getCategories, buildCategoryTree, getPricingConfig, formatPrice
 * @called_by Next.js App Router (route: /store)
 *
 * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  Monitor,
  Cpu,
  HardDrive,
  Keyboard,
  Truck,
  ShieldCheck,
  HeadphonesIcon,
  ArrowRight,
  Tag,
} from 'lucide-react';
import { getFeaturedProducts, getCategories, buildCategoryTree } from '@/lib/store/products';
import { getPricingConfig, formatPrice } from '@/lib/store/pricing';
import type { StoreCategory, StoreProduct } from '@/types/store';

export const metadata: Metadata = {
  title: 'Online Store | Shop Computer Parts & Accessories',
  description:
    'Shop quality computer parts, accessories, and refurbished systems from Computer Store Kansas. Free shipping on qualifying orders.',
};

export const dynamic = 'force-dynamic';

/**
 * Map category slugs to lucide-react icons for the category grid.
 *
 * @param slug - The category URL slug
 * @returns A lucide-react icon component
 *
 * @functions_called none
 * @called_by StoreLandingPage
 *
 * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
 */
function getCategoryIcon(slug: string) {
  const iconMap: Record<string, React.ReactNode> = {
    desktops: <Monitor className="h-8 w-8" />,
    laptops: <Monitor className="h-8 w-8" />,
    processors: <Cpu className="h-8 w-8" />,
    storage: <HardDrive className="h-8 w-8" />,
    peripherals: <Keyboard className="h-8 w-8" />,
  };
  return iconMap[slug] ?? <Cpu className="h-8 w-8" />;
}

export default async function StoreLandingPage() {
  const [featuredProducts, categories, pricingConfig] = await Promise.all([
    getFeaturedProducts(8),
    getCategories(),
    getPricingConfig(),
  ]);

  const categoryTree = buildCategoryTree(categories);
  const storeEnabled = pricingConfig?.store_enabled ?? false;
  const announcement = pricingConfig?.store_announcement ?? null;

  // Store disabled -- show Coming Soon
  if (!storeEnabled) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 max-w-lg">
          <Monitor className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Online Store Coming Soon
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            We are building our online store to bring you the best computer parts
            and accessories. Check back soon, or visit us in-store for everything
            you need.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Contact Us
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Announcement Banner */}
      {announcement && (
        <div className="bg-blue-600 text-white rounded-xl px-6 py-4 text-center">
          <p className="text-sm sm:text-base font-medium">{announcement}</p>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 rounded-2xl p-8 sm:p-12">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight" style={{ color: '#ffffff' }}>
            Shop Computer Parts &amp; Accessories
          </h1>
          <p className="text-lg mb-8 leading-relaxed" style={{ color: '#d1d5db' }}>
            Quality components, peripherals, and refurbished systems from a shop
            you can trust. Backed by local expertise and real customer support.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/store/products"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-500 transition-colors"
            >
              Browse All Products
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/store/products?in_stock=true"
              className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              In Stock Now
            </Link>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex items-center gap-4 bg-white rounded-xl p-5 border border-gray-200">
          <Truck className="h-8 w-8 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900 text-sm">Free Shipping</p>
            <p className="text-gray-500 text-xs">
              On orders over{' '}
              {pricingConfig
                ? formatPrice(pricingConfig.free_shipping_threshold)
                : '$50'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white rounded-xl p-5 border border-gray-200">
          <ShieldCheck className="h-8 w-8 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900 text-sm">Local Support</p>
            <p className="text-gray-500 text-xs">Expert help when you need it</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white rounded-xl p-5 border border-gray-200">
          <HeadphonesIcon className="h-8 w-8 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900 text-sm">Real People</p>
            <p className="text-gray-500 text-xs">Call or visit us anytime</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <Link
              href="/store/products?featured=true"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product: StoreProduct) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Category Grid */}
      {categoryTree.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categoryTree.map((category: StoreCategory) => (
              <Link
                key={category.id}
                href={`/store/products?category=${category.slug}`}
                className="group bg-white rounded-xl border border-gray-200 p-6 text-center hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="text-gray-400 group-hover:text-blue-600 transition-colors flex justify-center mb-3">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      width={48}
                      height={48}
                      className="rounded"
                    />
                  ) : (
                    getCategoryIcon(category.slug)
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                {category.product_count !== undefined && category.product_count > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {category.product_count} product
                    {category.product_count !== 1 ? 's' : ''}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Internal Components
// ---------------------------------------------------------------------------

/**
 * Product card for the featured products grid on the store landing page.
 *
 * @param product - A store product with effective_price populated
 * @returns A product card linking to the product detail page
 *
 * @functions_called formatPrice
 * @called_by StoreLandingPage
 *
 * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
 */
function ProductCard({ product }: { product: StoreProduct }) {
  const price = product.effective_price ?? product.retail_price;
  const hasImage = product.images && product.images.length > 0;

  return (
    <Link
      href={`/store/products/${product.sku}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all"
    >
      {/* Product Image */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {hasImage ? (
          <Image
            src={product.images[0]!}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <Monitor className="h-16 w-16" />
          </div>
        )}
        {product.is_featured && (
          <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
            Featured
          </span>
        )}
        {product.stock_status === 'out_of_stock' && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
            <span className="bg-white text-gray-900 text-sm font-semibold px-3 py-1 rounded">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {product.manufacturer && (
          <p className="text-xs text-gray-500 mb-1">{product.manufacturer}</p>
        )}
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          {price !== null && price !== undefined ? (
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(price)}
            </span>
          ) : (
            <span className="text-sm text-gray-500">Contact for price</span>
          )}
          {product.msrp && price && product.msrp > price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.msrp)}
            </span>
          )}
        </div>
        {product.stock_status === 'low_stock' && (
          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
            <Tag className="h-3 w-3" />
            Low stock
          </p>
        )}
      </div>
    </Link>
  );
}
