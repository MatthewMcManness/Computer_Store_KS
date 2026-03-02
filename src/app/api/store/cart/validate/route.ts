/**
 * Public cart validation API route.
 *
 * Validates cart items server-side by checking product availability,
 * current pricing, and stock levels. Returns validated items with
 * current prices and any warnings for items that have changed.
 * No authentication required -- anyone can validate a cart.
 *
 * @param request - NextRequest with JSON body { items: CartItemData[] }
 * @returns NextResponse with CartValidationResult
 *
 * @sideEffects
 * - Reads from store_products and pricing tables
 *
 * @functions_called validateCart
 * @called_by Cart page (pre-checkout validation), checkout flow
 *
 * @version 1.0.0 - 2026-03-02T19:01:25Z - Initial implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateCart } from '@/lib/store/cart';

export const dynamic = 'force-dynamic';

const cartItemSchema = z.object({
  product_id: z.string().uuid(),
  sku: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

const validateCartSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(50),
});

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const validation = validateCartSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          errors: validation.error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const result = await validateCart(validation.data.items);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in POST /api/store/cart/validate:', error);
    return NextResponse.json(
      { error: 'Failed to validate cart' },
      { status: 500 }
    );
  }
}
