import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getCustomerSilverPlan, setCustomerSilverPlan } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/silver-plan
 * Get silver plan status for a customer
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customer_id');

  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
  }

  try {
    const plan = await getCustomerSilverPlan(parseInt(customerId, 10));
    return NextResponse.json({
      is_silver_plan: plan?.is_silver_plan ?? false,
      plan
    });
  } catch (error) {
    console.error('[API] Silver plan fetch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/silver-plan
 * Set silver plan status for a customer
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.userType !== 'employee') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { customer_id, is_silver_plan } = body;

  if (!customer_id || typeof is_silver_plan !== 'boolean') {
    return NextResponse.json(
      { error: 'customer_id and is_silver_plan (boolean) are required' },
      { status: 400 }
    );
  }

  try {
    const plan = await setCustomerSilverPlan(customer_id, is_silver_plan);

    if (!plan) {
      return NextResponse.json({ error: 'Failed to update silver plan' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      is_silver_plan: plan.is_silver_plan,
      plan
    });
  } catch (error) {
    console.error('[API] Silver plan update error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
