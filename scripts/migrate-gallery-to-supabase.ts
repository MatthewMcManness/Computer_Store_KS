/**
 * Migration script: Migrate gallery data from JSON to Supabase
 *
 * Prerequisites:
 * 1. Run the gallery-schema.sql in Supabase SQL Editor
 * 2. Ensure SUPABASE_SERVICE_ROLE_KEY is set in .env
 *
 * Usage:
 *   bun run scripts/migrate-gallery-to-supabase.ts
 *
 * This script:
 * - Reads existing gallery.json
 * - Transforms data for Supabase (price string -> number)
 * - Inserts computers into gallery_computers table
 * - Sets the active sale based on globalSale setting
 */

import { createClient } from '@supabase/supabase-js';
import galleryData from '../src/data/gallery.json';

// Types matching the old JSON format
interface OldGalleryComputer {
  id: number;
  name: string;
  type: 'desktop' | 'laptop';
  category: 'custom' | 'refurbished' | 'new';
  price: string;
  image: string;
  specs: Array<{ label: string; value: string }>;
  blackFriday?: {
    enabled: boolean;
    originalPrice: string;
    salePrice: string;
    discount: number;
  };
}

interface OldGalleryData {
  computers: OldGalleryComputer[];
  lastUpdated: string;
  version: string;
  globalSale?: 'none' | 'black-friday';
}

// Parse price string to number
function parsePrice(price: string): number {
  return parseFloat(price.replace(/[$,]/g, '')) || 0;
}

async function migrate() {
  // Get Supabase credentials from environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing Supabase environment variables');
    console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    process.exit(1);
  }

  // Create Supabase admin client
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('Starting gallery migration...\n');

  const data = galleryData as OldGalleryData;
  const computers = data.computers;

  console.log(`Found ${computers.length} computers to migrate`);
  console.log(`Current global sale: ${data.globalSale || 'none'}\n`);

  // Migrate computers
  let successCount = 0;
  let errorCount = 0;

  for (const computer of computers) {
    console.log(`Migrating: ${computer.name} (old ID: ${computer.id})`);

    const { data: inserted, error } = await supabase
      .from('gallery_computers')
      .insert({
        name: computer.name,
        type: computer.type,
        category: computer.category,
        price: parsePrice(computer.price),
        image_url: computer.image || null,
        specs: computer.specs || [],
        is_active: true,
        sort_order: computer.id, // Use old ID as sort order to preserve order
      })
      .select()
      .single();

    if (error) {
      console.error(`  Error: ${error.message}`);
      errorCount++;
    } else {
      console.log(`  Success! New ID: ${inserted.id}`);
      successCount++;
    }
  }

  console.log(`\nComputers migrated: ${successCount} success, ${errorCount} errors`);

  // Set active sale if needed
  if (data.globalSale && data.globalSale !== 'none') {
    console.log(`\nSetting active sale to: ${data.globalSale}`);

    // Deactivate all sales first
    await supabase
      .from('gallery_sales')
      .update({ is_active: false })
      .neq('sale_type', '');

    // Activate the correct sale
    const { error: saleError } = await supabase
      .from('gallery_sales')
      .update({ is_active: true })
      .eq('sale_type', data.globalSale);

    if (saleError) {
      console.error(`Error setting sale: ${saleError.message}`);
    } else {
      console.log('Sale setting updated successfully');
    }
  }

  console.log('\nMigration complete!');
  console.log('\nNext steps:');
  console.log('1. Verify data in Supabase dashboard');
  console.log('2. Test the admin gallery page');
  console.log('3. Remove src/data/gallery.json if everything works');
}

migrate().catch(console.error);
