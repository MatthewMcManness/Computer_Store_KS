/**
 * Public product detail API route.
 *
 * Returns a single active product by its SKU, including joined category,
 * any active price override, and the computed effective price.
 *
 * @param request - NextRequest (unused)
 * @param params - Route parameters containing the product SKU
 * @returns NextResponse with StoreProduct JSON or 404
 *
 * @sideEffects
 * - Reads from store_products, store_categories, store_price_overrides tables
 *
 * @functions_called getProductBySku
 * @called_by Product detail page, cart item resolution
 *
 * @version 1.0.0 - 2026-03-02T19:01:25Z - Initial implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProductBySku } from '@/lib/store/products';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sku: string }> }
) {
  try {
    const { sku } = await params;

    if (!sku) {
      return NextResponse.json(
        { error: 'SKU is required' },
        { status: 400 }
      );
    }

    const product = await getProductBySku(sku);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error in GET /api/store/products/[sku]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
