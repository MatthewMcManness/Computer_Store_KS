#!/usr/bin/env npx ts-node
/**
 * Send Password Reset Emails
 *
 * Sends password reset emails to migrated users.
 *
 * Usage:
 *   npx ts-node scripts/send-password-resets.ts
 *
 * Environment Variables Required:
 *   - NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
 *   - SUPABASE_SERVICE_ROLE_KEY: Supabase service role key
 */

import { createClient } from '@supabase/supabase-js';

const MIGRATED_USERS = [
  'owner@computerstoreks.com',
  'matthewmcmanness@gmail.com',
  'joseph.pencewb@gmail.com',
  'kruziphotography@gmail.com',
  'owner@mcmannesswebdesign.com',
  'owner@resilientwebsolutions.com',
];

const REDIRECT_URL = 'https://computerstoreks.com/reset-password/confirm';

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('\n========================================');
  console.log('  Sending Password Reset Emails');
  console.log('========================================\n');

  let success = 0;
  let failed = 0;

  for (const email of MIGRATED_USERS) {
    console.log(`Sending to ${email}...`);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: REDIRECT_URL,
    });

    if (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      failed++;
    } else {
      console.log(`  ✅ Sent`);
      success++;
    }

    // Small delay between emails
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n========================================');
  console.log(`  Results: ${success} sent, ${failed} failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
