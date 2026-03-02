/**
 * Public category listing API route.
 *
 * Returns all active store categories with product counts. Supports
 * an optional `tree=true` query parameter to return categories in a
 * nested parent-child hierarchy.
 *
 * @param request - NextRequest with optional `tree` query parameter
 * @returns NextResponse with array of StoreCategory objects
 *
 * @sideEffects
 * - Reads from store_categories and store_products tables
 *
 * @functions_called getCategories, buildCategoryTree
 * @called_by Storefront category navigation, sidebar filters
 *
 * @version 1.0.0 - 2026-03-02T19:01:25Z - Initial implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCategories, buildCategoryTree } from '@/lib/store/products';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tree = searchParams.get('tree') === 'true';

    const categories = await getCategories();

    if (tree) {
      const categoryTree = buildCategoryTree(categories);
      return NextResponse.json(categoryTree);
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error in GET /api/store/categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
