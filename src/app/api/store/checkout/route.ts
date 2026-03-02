/**
 * Checkout session API route.
 *
 * POST: Starts the checkout process by validating the cart, calculating
 * totals (subtotal, shipping, tax), and returning the computed amounts.
 * Phase 2 will create a Stripe Checkout Session and return the session URL.
 *
 * Rate limited to 5 requests per minute per IP to prevent abuse.
 *
 * @param request - NextRequest with JSON body matching CheckoutRequest
 * @returns NextResponse with validated totals (Phase 1) or Stripe session URL (Phase 2)
 *
 * @sideEffects
 * - Reads from store_products and pricing tables for validation
 *
 * @functions_called validateCart, getCurrentUser
 * @called_by Checkout page
 *
 * @version 1.0.0 - 2026-03-02T19:01:25Z - Initial implementation (Phase 1)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateCart } from '@/lib/store/cart';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;

/**
 * Check rate limit for an IP address.
 *
 * @param ip - Client IP address
 * @returns Object with allowed status, remaining count, and reset time
 *
 * @functions_called none
 * @called_by POST handler
 *
 * @version 1.0.0 - 2026-03-02T19:01:25Z - Initial implementation
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  // Clean up old entries periodically
  if (rateLimitStore.size > 10000) {
    const cutoff = now - RATE_LIMIT_WINDOW;
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < cutoff) {
        rateLimitStore.delete(key);
      }
    }
  }

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetTime: now + RATE_LIMIT_WINDOW };
  }

  if (record.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS - record.count, resetTime: record.resetTime };
}

const orderAddressSchema = z.object({
  full_name: z.string().min(1).max(100),
  address_line1: z.string().min(1).max(200),
  address_line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(2).max(2),
  zip_code: z.string().min(5).max(10),
  phone: z.string().max(20).optional(),
});

const checkoutSchema = z.object({
  items: z.array(z.object({
    product_id: z.string().uuid(),
    sku: z.string().min(1),
    quantity: z.number().int().min(1).max(99),
  })).min(1).max(50),
  shipping_address: orderAddressSchema,
  billing_address: orderAddressSchema.optional(),
  customer_email: z.string().email().max(254),
  customer_name: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfter) },
        }
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

    const validation = checkoutSchema.safeParse(body);
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

    const { items, shipping_address, billing_address, customer_email, customer_name } = validation.data;

    // Validate cart items (stock, pricing)
    const cartValidation = await validateCart(items);

    if (!cartValidation.valid) {
      return NextResponse.json({
        success: false,
        validation: cartValidation,
        message: 'Some items in your cart have changed. Please review the warnings.',
      });
    }

    // Get user profile if authenticated (for linking order to account)
    const user = await getCurrentUser();

    // Phase 1: Return validated totals for review
    // Phase 2 will create a Stripe Checkout Session here
    return NextResponse.json({
      success: true,
      validation: cartValidation,
      checkout: {
        customer_email,
        customer_name,
        shipping_address,
        billing_address: billing_address || shipping_address,
        user_profile_id: user?.supabaseUserId || null,
        subtotal: cartValidation.subtotal,
        shipping: cartValidation.shipping,
        tax: cartValidation.tax,
        total: cartValidation.total,
        // Phase 2: stripe_session_url will be added here
        message: 'Stripe Checkout integration pending (Phase 2). Totals validated successfully.',
      },
    });
  } catch (error) {
    console.error('Error in POST /api/store/checkout:', error);
    return NextResponse.json(
      { error: 'Checkout failed. Please try again.' },
      { status: 500 }
    );
  }
}
