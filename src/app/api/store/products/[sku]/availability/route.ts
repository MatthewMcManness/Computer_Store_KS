/**
 * Real-time product availability API route.
 *
 * Returns current stock quantity and status for a product by SKU.
 * Phase 3 will add TD Synnex real-time inventory checks; for now
 * this returns data directly from the database.
 *
 * @param request - NextRequest (unused)
 * @param params - Route parameters containing the product SKU
 * @returns NextResponse with stock_quantity, stock_status, and sku
 *
 * @sideEffects
 * - Reads from store_products table
 *
 * @functions_called getProductBySku
 * @called_by Product detail page (live stock indicator), cart validation
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

    return NextResponse.json({
      sku: product.sku,
      stock_quantity: product.stock_quantity,
      stock_status: product.stock_status,
      last_synced_at: product.last_synced_at,
    });
  } catch (error) {
    console.error('Error in GET /api/store/products/[sku]/availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
