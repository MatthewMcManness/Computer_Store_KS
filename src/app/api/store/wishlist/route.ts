/**
 * Wishlist API route (authentication required).
 *
 * GET: Returns the user's wishlist items with joined product details.
 * POST: Adds a product to the user's wishlist.
 * DELETE: Removes a product from the user's wishlist.
 *
 * @param request - NextRequest (POST/DELETE body contains { product_id })
 * @returns NextResponse with wishlist items or operation result
 *
 * @sideEffects
 * - GET: Reads from store_wishlist_items and store_products tables
 * - POST: Inserts a row into store_wishlist_items table
 * - DELETE: Deletes a row from store_wishlist_items table
 *
 * @functions_called getCurrentUser, supabaseAdmin
 * @called_by Wishlist page, product detail page (add/remove wishlist)
 *
 * @version 1.0.0 - 2026-03-02T19:01:25Z - Initial implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const wishlistActionSchema = z.object({
  product_id: z.string().uuid(),
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

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('store_wishlist_items')
      .select(`
        *,
        product:store_products(
          id, sku, name, short_description, manufacturer,
          retail_price, stock_status, stock_quantity, images, is_active
        )
      `)
      .eq('user_profile_id', user.supabaseUserId)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error fetching wishlist:', error);
      return NextResponse.json(
        { error: 'Failed to fetch wishlist' },
        { status: 500 }
      );
    }

    return NextResponse.json({ items: data || [] });
  } catch (error) {
    console.error('Error in GET /api/store/wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
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

    const validation = wishlistActionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid product_id' },
        { status: 400 }
      );
    }

    // Check if already in wishlist
    const { data: existing } = await supabaseAdmin
      .from('store_wishlist_items')
      .select('id')
      .eq('user_profile_id', user.supabaseUserId)
      .eq('product_id', validation.data.product_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, message: 'Already in wishlist' });
    }

    const { error } = await supabaseAdmin
      .from('store_wishlist_items')
      .insert({
        user_profile_id: user.supabaseUserId,
        product_id: validation.data.product_id,
      });

    if (error) {
      console.error('Error adding to wishlist:', error);
      return NextResponse.json(
        { error: 'Failed to add to wishlist' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/store/wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to add to wishlist' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
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

    const validation = wishlistActionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid product_id' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('store_wishlist_items')
      .delete()
      .eq('user_profile_id', user.supabaseUserId)
      .eq('product_id', validation.data.product_id);

    if (error) {
      console.error('Error removing from wishlist:', error);
      return NextResponse.json(
        { error: 'Failed to remove from wishlist' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/store/wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    );
  }
}
