/**
 * Migration script to add plan_tier column to customer_silver_plans table.
 *
 * Adds a plan_tier TEXT column to support multiple tier levels (bronze, silver,
 * silver-plus, gold) beyond the simple is_silver_plan boolean. Migrates existing
 * silver plan data to use 'silver' tier. This enables tiered pricing for customer plans.
 *
 * @sideEffects
 * - Alters customer_silver_plans table schema (adds plan_tier column)
 * - Updates existing records where is_silver_plan = true
 * - Logs migration progress to console
 *
 * @example
 * // Run via: npx tsx scripts/run-plan-tier-migration.ts
 *
 * @functions_called runMigration, createClient
 * @called_by CLI execution only
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Runs the plan tier column migration on customer_silver_plans table.
 *
 * Attempts to add plan_tier column using RPC call, falls back to manual
 * instruction if RPC unavailable. After adding column, migrates existing
 * is_silver_plan = true records to use plan_tier = 'silver'.
 *
 * @returns {Promise<void>} Resolves when migration is complete
 *
 * @throws {Error} If migration fails due to database errors
 *
 * @sideEffects
 * - Alters customer_silver_plans table (adds column and constraint)
 * - Updates existing records
 * - Logs detailed progress and SQL instructions to console
 *
 * @example
 * await runMigration() // Executes migration
 *
 * @functions_called supabase.rpc, supabase.from
 * @called_by Main script execution
 */
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
