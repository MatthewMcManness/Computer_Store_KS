/**
 * Public product listing API route.
 *
 * Returns a paginated, filterable list of active store products with
 * effective prices. Supports full-text search, category filtering,
 * price range, stock status, featured flag, and multiple sort options.
 *
 * @param request - NextRequest with optional query parameters:
 *   page, per_page, category, search, manufacturer, min_price, max_price,
 *   in_stock, featured, sort
 * @returns NextResponse with ProductListResponse JSON
 *
 * @sideEffects
 * - Reads from store_products, store_categories, store_price_overrides tables
 *
 * @functions_called getProducts
 * @called_by Storefront product listing page, search results page
 *
 * @version 1.0.0 - 2026-03-02T19:01:25Z - Initial implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/store/products';
import type { ProductListParams } from '@/types/store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params: ProductListParams = {};

    const page = searchParams.get('page');
    if (page) params.page = parseInt(page, 10);

    const perPage = searchParams.get('per_page');
    if (perPage) params.per_page = parseInt(perPage, 10);

    const category = searchParams.get('category');
    if (category) params.category = category;

    const search = searchParams.get('search');
    if (search) params.search = search;

    const manufacturer = searchParams.get('manufacturer');
    if (manufacturer) params.manufacturer = manufacturer;

    const minPrice = searchParams.get('min_price');
    if (minPrice) params.min_price = parseFloat(minPrice);

    const maxPrice = searchParams.get('max_price');
    if (maxPrice) params.max_price = parseFloat(maxPrice);

    const inStock = searchParams.get('in_stock');
    if (inStock === 'true') params.in_stock = true;

    const featured = searchParams.get('featured');
    if (featured === 'true') params.featured = true;

    const sort = searchParams.get('sort');
    if (sort && ['price_asc', 'price_desc', 'name_asc', 'name_desc', 'newest'].includes(sort)) {
      params.sort = sort as ProductListParams['sort'];
    }

    const result = await getProducts(params);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/store/products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
