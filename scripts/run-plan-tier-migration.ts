/**
 * Migration script to add plan_tier column to customer_silver_plans table
 * Run with: npx tsx scripts/run-plan-tier-migration.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('Running plan_tier column migration...\n');

  // Step 1: Add the plan_tier column
  console.log('1. Adding plan_tier column...');
  const { error: alterError } = await supabase.rpc('exec_sql', {
    query: `ALTER TABLE customer_silver_plans ADD COLUMN IF NOT EXISTS plan_tier TEXT;`
  });

  if (alterError) {
    // Try direct approach if rpc doesn't exist
    console.log('   RPC not available, trying alternative approach...');

    // Check if column already exists by querying the table
    const { data, error: selectError } = await supabase
      .from('customer_silver_plans')
      .select('*')
      .limit(1);

    if (selectError) {
      console.error('   Error checking table:', selectError.message);
      return;
    }

    // Check if plan_tier is in the result
    if (data && data.length > 0 && 'plan_tier' in data[0]) {
      console.log('   ✓ plan_tier column already exists!');
    } else {
      console.log('   ✗ plan_tier column missing - please run migration manually in Supabase SQL Editor');
      console.log('\n   SQL to run:');
      console.log(`
ALTER TABLE customer_silver_plans
ADD COLUMN IF NOT EXISTS plan_tier TEXT;

ALTER TABLE customer_silver_plans
ADD CONSTRAINT valid_plan_tier
CHECK (plan_tier IS NULL OR plan_tier IN ('bronze', 'silver', 'silver-plus', 'gold'));

UPDATE customer_silver_plans
SET plan_tier = 'silver'
WHERE is_silver_plan = true AND plan_tier IS NULL;
      `);
      return;
    }
  } else {
    console.log('   ✓ Column added successfully');
  }

  // Step 2: Migrate existing data
  console.log('\n2. Migrating existing silver plan data...');
  const { error: updateError } = await supabase
    .from('customer_silver_plans')
    .update({ plan_tier: 'silver' })
    .eq('is_silver_plan', true)
    .is('plan_tier', null);

  if (updateError) {
    console.error('   Error migrating data:', updateError.message);
  } else {
    console.log('   ✓ Existing data migrated');
  }

  console.log('\n✅ Migration complete!');
}

runMigration().catch(console.error);
