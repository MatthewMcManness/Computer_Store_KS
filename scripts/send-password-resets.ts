#!/usr/bin/env npx ts-node
/**
 * Sends password reset emails to migrated users.
 *
 * After user migration from RepairShopr to Supabase Auth, this script sends
 * password reset emails to a predefined list of users so they can set new
 * passwords. Includes delay between emails to avoid rate limiting.
 *
 * @sideEffects
 * - Sends password reset emails via Supabase Auth
 * - Logs sending status for each user
 * - Exits with code 1 if any emails fail
 *
 * @example
 * // Run via: npx ts-node scripts/send-password-resets.ts
 *
 * @functions_called main, createClient
 * @called_by CLI execution only
 *
 * @see scripts/migrate-users.ts for the migration that creates these users
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

/**
 * Main function that sends password reset emails to all migrated users.
 *
 * Validates environment variables, creates Supabase client, and iterates
 * through MIGRATED_USERS array sending reset emails with appropriate delays
 * to avoid rate limiting. Tracks success/failure counts and exits with
 * error code if any emails fail to send.
 *
 * @returns {Promise<void>} Resolves when all emails are sent
 *
 * @throws {Error} If environment variables are missing (exits process)
 *
 * @sideEffects
 * - Validates and uses environment variables
 * - Sends password reset emails via Supabase Auth API
 * - Logs detailed progress and results to console
 * - Exits process with code 1 if failures occur
 *
 * @example
 * await main() // Sends all password reset emails
 *
 * @functions_called createClient, supabase.auth.resetPasswordForEmail
 * @called_by Script execution via ts-node
 */
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
