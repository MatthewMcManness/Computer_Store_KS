/**
 * Product detail page (/store/products/[sku]).
 *
 * Server component that displays full product information including images,
 * specifications, pricing, stock status, and an add-to-cart form. Generates
 * SEO metadata dynamically from the product data. Returns 404 if the product
 * is not found or inactive.
 *
 * @param params - Route params containing the product SKU
 * @returns Full product detail page
 *
 * @sideEffects
 * - Reads from store_products, store_categories, store_price_overrides tables
 *
 * @functions_called getProductBySku, formatPrice
 * @called_by Next.js App Router (route: /store/products/[sku])
 *
 * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight,
  Monitor,
  Package,
  Truck,
  ShieldCheck,
  AlertTriangle,
  Tag,
  ArrowLeft,
} from 'lucide-react';
import { getProductBySku } from '@/lib/store/products';
import { formatPrice, getPricingConfig } from '@/lib/store/pricing';
import { AddToCartButton } from '@/components/store/AddToCartButton';
import { ProductImageGallery } from '@/components/store/ProductImageGallery';

export const dynamic = 'force-dynamic';

/**
 * Generate dynamic SEO metadata for the product detail page.
 *
 * @param params - Route params with the product SKU
 * @returns Metadata object with title, description, and Open Graph data
 *
 * @functions_called getProductBySku, formatPrice
 * @called_by Next.js metadata API
 *
 * @version 1.0.0 - 2026-03-02T19:01:10Z - Initial implementation
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ sku: string }>;
}): Promise<Metadata> {
  const { sku } = await params;
  const product = await getProductBySku(sku);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  const price = product.effective_price ?? product.retail_price;
  const priceText = price ? ` - ${formatPrice(price)}` : '';

  return {
    title: `${product.name}${priceText}`,
    description:
      product.short_description ??
      product.description?.substring(0, 160) ??
      `${product.name} available at Computer Store Kansas.`,
    openGraph: {
      title: product.name,
      description: product.short_description ?? product.description ?? undefined,
      images: product.images.length > 0 ? [product.images[0]!] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ sku: string }>;
}) {
  const { sku } = await params;
  const [product, pricingConfig] = await Promise.all([
    getProductBySku(sku),
    getPricingConfig(),
  ]);

  if (!product) {
    notFound();
  }

  const price = product.effective_price ?? product.retail_price;
  const isInStock =
    product.stock_status === 'in_stock' || product.stock_status === 'low_stock';
  const freeShippingThreshold = pricingConfig?.free_shipping_threshold ?? 50;
  const qualifiesForFreeShipping = price !== null && price !== undefined && price >= freeShippingThreshold;

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <nav aria-label="Product breadcrumb" className="text-sm text-gray-500">
        <ol className="flex items-center gap-1 flex-wrap">
          <li>
            <Link href="/store" className="hover:text-blue-600 transition-colors">
              Store
            </Link>
          </li>
          <li><ChevronRight className="h-3 w-3 inline" /></li>
          <li>
            <Link href="/store/products" className="hover:text-blue-600 transition-colors">
              Products
            </Link>
          </li>
          {product.category && (
            <>
              <li><ChevronRight className="h-3 w-3 inline" /></li>
              <li>
                <Link
                  href={`/store/products?category=${product.category.slug}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {product.category.name}
                </Link>
              </li>
            </>
          )}
          <li><ChevronRight className="h-3 w-3 inline" /></li>
          <li className="text-gray-900 font-medium truncate max-w-xs">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Main Product Section */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left: Image Gallery */}
          <div className="bg-gray-50 p-6 lg:p-8">
            {product.images.length > 0 ? (
              <ProductImageGallery images={product.images} name={product.name} />
            ) : (
              <div className="aspect-square flex items-center justify-center text-gray-300">
                <Monitor className="h-32 w-32" />
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="p-6 lg:p-8 space-y-6">
            {/* Manufacturer & SKU */}
            <div className="space-y-1">
              {product.manufacturer && (
                <p className="text-sm text-blue-600 font-medium">
                  {product.manufacturer}
                </p>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              <p className="text-xs text-gray-400">
                SKU: {product.sku}
                {product.manufacturer_part && (
                  <> &middot; MPN: {product.manufacturer_part}</>
                )}
              </p>
            </div>

            {/* Price */}
            <div className="space-y-2">
              {price !== null && price !== undefined ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(price)}
                  </span>
                  {product.msrp && product.msrp > price && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(product.msrp)}
                    </span>
                  )}
                  {product.msrp && product.msrp > price && (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
                      Save {formatPrice(product.msrp - price)}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-lg text-gray-500">Contact us for pricing</p>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock_status === 'in_stock' && (
                <span className="flex items-center gap-1.5 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
                  <Package className="h-4 w-4" />
                  In Stock
                  {product.stock_quantity > 0 && (
                    <span className="text-green-500">
                      ({product.stock_quantity} available)
                    </span>
                  )}
                </span>
              )}
              {product.stock_status === 'low_stock' && (
                <span className="flex items-center gap-1.5 text-sm text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full">
                  <AlertTriangle className="h-4 w-4" />
                  Low Stock - Only {product.stock_quantity} left
                </span>
              )}
              {product.stock_status === 'out_of_stock' && (
                <span className="flex items-center gap-1.5 text-sm text-red-700 bg-red-50 px-3 py-1.5 rounded-full">
                  <Tag className="h-4 w-4" />
                  Out of Stock
                </span>
              )}
              {product.stock_status === 'discontinued' && (
                <span className="flex items-center gap-1.5 text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                  Discontinued
                </span>
              )}
            </div>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-gray-600 leading-relaxed">
                {product.short_description}
              </p>
            )}

            {/* Add to Cart */}
            {isInStock && price !== null && price !== undefined && (
              <AddToCartButton
                productId={product.id}
                sku={product.sku}
                name={product.name}
                price={price}
                maxQuantity={product.stock_quantity}
                image={product.images[0] ?? null}
              />
            )}

            {!isInStock && (
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-gray-600 text-sm mb-2">
                  This product is currently unavailable.
                </p>
                <Link
                  href="/contact"
                  className="text-blue-600 text-sm font-medium hover:text-blue-700"
                >
                  Contact us for availability
                </Link>
              </div>
            )}

            {/* Shipping Info */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="h-4 w-4 text-gray-400" />
                {qualifiesForFreeShipping ? (
                  <span className="text-green-600 font-medium">
                    Eligible for FREE shipping
                  </span>
                ) : (
                  <span>
                    Free shipping on orders over {formatPrice(freeShippingThreshold)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ShieldCheck className="h-4 w-4 text-gray-400" />
                <span>Backed by local expert support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Description */}
      {product.description && (
        <section className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
          <div className="prose prose-sm max-w-none text-gray-600">
            {product.description.split('\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </section>
      )}

      {/* Specifications */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <section className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Specifications</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {Object.entries(product.specs).map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between py-2 border-b border-gray-100"
              >
                <dt className="text-sm text-gray-500 font-medium">{key}</dt>
                <dd className="text-sm text-gray-900 text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Back Link */}
      <div className="pt-4">
        <Link
          href="/store/products"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all products
        </Link>
      </div>
    </div>
  );
}
