/**
 * Admin product price override API route.
 *
 * POST: Creates or updates a price override for a specific product.
 * DELETE: Removes the price override for a specific product.
 *
 * Price overrides take highest priority in the three-tier pricing system,
 * superseding both category markup rules and the global default markup.
 *
 * Requires employee authentication.
 *
 * @param request - NextRequest (POST body contains PriceOverrideInput)
 * @param params - Route parameters containing the product SKU
 * @returns NextResponse with the created/updated override or deletion confirmation
 *
 * @sideEffects
 * - POST: Upserts a row in store_price_overrides table
 * - DELETE: Deletes a row from store_price_overrides table
 *
 * @functions_called getCurrentUser, isEmployee, getProductBySku, supabaseAdmin
 * @called_by Admin product detail page (pricing section)
 *
 * @version 1.0.0 - 2026-03-02T19:01:25Z - Initial implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { isEmployee } from '@/lib/role-helpers';
import { getProductBySku } from '@/lib/store/products';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const priceOverrideSchema = z.object({
  override_price: z.number().min(0.01).max(999999.99),
  reason: z.string().max(500).optional(),
  expires_at: z.string().datetime().optional(),
  created_by: z.string().max(100).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sku: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const roles = user.roles || [user.role];
    if (!isEmployee(roles)) {
      return NextResponse.json(
        { error: 'Employee access required' },
        { status: 403 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }

    const { sku } = await params;

    // Find the product by SKU
    const product = await getProductBySku(sku);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
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

    const validation = priceOverrideSchema.safeParse(body);
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

    // Upsert the price override
    const { data, error } = await supabaseAdmin
      .from('store_price_overrides')
      .upsert(
        {
          product_id: product.id,
          override_price: validation.data.override_price,
          reason: validation.data.reason || null,
          expires_at: validation.data.expires_at || null,
          created_by: validation.data.created_by || user.name,
        },
        { onConflict: 'product_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error creating price override:', error);
      return NextResponse.json(
        { error: 'Failed to create price override' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, override: data });
  } catch (error) {
    console.error('Error in POST /api/admin/store/products/[sku]/override:', error);
    return NextResponse.json(
      { error: 'Failed to create price override' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sku: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const roles = user.roles || [user.role];
    if (!isEmployee(roles)) {
      return NextResponse.json(
        { error: 'Employee access required' },
        { status: 403 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }

    const { sku } = await params;

    // Find the product by SKU
    const product = await getProductBySku(sku);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const { error } = await supabaseAdmin
      .from('store_price_overrides')
      .delete()
      .eq('product_id', product.id);

    if (error) {
      console.error('Error deleting price override:', error);
      return NextResponse.json(
        { error: 'Failed to delete price override' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/store/products/[sku]/override:', error);
    return NextResponse.json(
      { error: 'Failed to delete price override' },
      { status: 500 }
    );
  }
}
