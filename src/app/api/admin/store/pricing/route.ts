/**
 * Admin pricing management API route.
 *
 * GET: Returns the global pricing configuration and all category pricing rules.
 * PUT: Updates the global pricing configuration or replaces all category
 *   pricing rules. The request body determines which operation is performed:
 *   - If `rules` array is present: replaces all category pricing rules
 *   - Otherwise: updates global pricing config fields
 *
 * Requires employee authentication.
 *
 * @param request - NextRequest (PUT body contains config fields or { rules: PricingRuleInput[] })
 * @returns NextResponse with pricing config and rules
 *
 * @sideEffects
 * - GET: Reads from store_pricing_config and store_pricing_rules tables
 * - PUT: Updates store_pricing_config or replaces store_pricing_rules rows
 *
 * @functions_called getCurrentUser, isEmployee, getPricingConfig, getPricingRules, supabaseAdmin
 * @called_by Admin pricing management page
 *
 * @version 1.0.0 - 2026-03-02T19:01:25Z - Initial implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { isEmployee } from '@/lib/role-helpers';
import { getPricingConfig, getPricingRules } from '@/lib/store/pricing';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const configUpdateSchema = z.object({
  default_markup_percent: z.number().min(0).max(1000).optional(),
  free_shipping_threshold: z.number().min(0).optional(),
  flat_shipping_rate: z.number().min(0).optional(),
  tax_rate: z.number().min(0).max(1).optional(),
  store_enabled: z.boolean().optional(),
  store_announcement: z.string().max(500).nullable().optional(),
});

const pricingRuleSchema = z.object({
  category_id: z.string().uuid(),
  markup_percent: z.number().min(0).max(1000),
});

const rulesUpdateSchema = z.object({
  rules: z.array(pricingRuleSchema),
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

    const roles = user.roles || [user.role];
    if (!isEmployee(roles)) {
      return NextResponse.json(
        { error: 'Employee access required' },
        { status: 403 }
      );
    }

    const [config, rules] = await Promise.all([
      getPricingConfig(),
      getPricingRules(),
    ]);

    return NextResponse.json({ config, rules });
  } catch (error) {
    console.error('Error in GET /api/admin/store/pricing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing config' },
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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Check if this is a rules update
    const rulesValidation = rulesUpdateSchema.safeParse(body);
    if (rulesValidation.success) {
      // Replace all pricing rules
      // Delete existing rules
      await supabaseAdmin
        .from('store_pricing_rules')
        .delete()
        .not('id', 'is', null);

      // Insert new rules
      if (rulesValidation.data.rules.length > 0) {
        const { error: insertError } = await supabaseAdmin
          .from('store_pricing_rules')
          .insert(rulesValidation.data.rules);

        if (insertError) {
          console.error('Error inserting pricing rules:', insertError);
          return NextResponse.json(
            { error: 'Failed to update pricing rules' },
            { status: 500 }
          );
        }
      }

      const updatedRules = await getPricingRules();
      return NextResponse.json({ success: true, rules: updatedRules });
    }

    // Otherwise, update the global config
    const configValidation = configUpdateSchema.safeParse(body);
    if (!configValidation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          errors: configValidation.error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    // Get existing config to find its ID
    const existingConfig = await getPricingConfig();
    if (!existingConfig) {
      return NextResponse.json(
        { error: 'Pricing config not found' },
        { status: 404 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('store_pricing_config')
      .update({
        ...configValidation.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingConfig.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating pricing config:', error);
      return NextResponse.json(
        { error: 'Failed to update pricing config' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, config: data });
  } catch (error) {
    console.error('Error in PUT /api/admin/store/pricing:', error);
    return NextResponse.json(
      { error: 'Failed to update pricing' },
      { status: 500 }
    );
  }
}
