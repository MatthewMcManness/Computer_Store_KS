/**
 * Server-side saved cart API route (authentication required).
 *
 * GET: Retrieves the authenticated user's saved cart with resolved
 *   product details (names, prices, images, stock).
 * PUT: Saves the user's cart items for cross-session persistence.
 *
 * @param request - NextRequest (PUT body contains { items: CartItemData[] })
 * @returns NextResponse with resolved cart items or save confirmation
 *
 * @sideEffects
 * - GET: Reads from store_saved_carts and store_products tables
 * - PUT: Upserts a row in store_saved_carts table
 *
 * @functions_called getCurrentUser, getSavedCart, resolveCartItems, saveCart
 * @called_by Cart page, cart provider (autosave)
 *
 * @version 1.0.0 - 2026-03-02T19:01:25Z - Initial implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { getSavedCart, saveCart, resolveCartItems } from '@/lib/store/cart';

export const dynamic = 'force-dynamic';

const cartItemSchema = z.object({
  product_id: z.string().uuid(),
  sku: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

const saveCartSchema = z.object({
  items: z.array(cartItemSchema).max(50),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const savedCart = await getSavedCart(user.supabaseUserId);

    if (!savedCart || savedCart.items.length === 0) {
      return NextResponse.json({ items: [], updated_at: null });
    }

    const resolvedItems = await resolveCartItems(savedCart.items);

    return NextResponse.json({
      items: resolvedItems,
      updated_at: savedCart.updated_at,
    });
  } catch (error) {
    console.error('Error in GET /api/store/cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const validation = saveCartSchema.safeParse(body);
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

    await saveCart(user.supabaseUserId, validation.data.items);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PUT /api/store/cart:', error);
    return NextResponse.json(
      { error: 'Failed to save cart' },
      { status: 500 }
    );
  }
}
