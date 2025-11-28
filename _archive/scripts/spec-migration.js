/**
 * Shared spec migration utility
 * Used by both admin-gallery.js and edit-computer.html to ensure consistency
 */

function migrateSpecs(specs, computerName = 'Unknown') {
    console.log(`🔄 Migrating specs for: ${computerName}`);
    console.log('📥 Input specs:', JSON.parse(JSON.stringify(specs)));

    const warrantyLabels = ['Parts Warranty', 'Manufacturer Warranty', 'Free Diagnostics'];
    const migratedSpecs = [];
    const seenLabels = new Set();

    for (const spec of specs) {
        console.log(`  Processing: "${spec.label}" => "${spec.value}"`);

        // Normalize label and value by removing colons and trimming
        const normalizedLabel = spec.label.replace(/::?$/, '').trim();
        const normalizedValue = spec.value.replace(/^:?\s*/, '').trim();

        // Check if the value looks like it's the same as the label (duplicate error)
        // This catches cases like "Processor" === "Processor" or "Processor:" === "Processor"
        if (normalizedLabel === normalizedValue) {
            console.log(`  ⏭️  SKIPPED - label === value (duplicate): "${normalizedLabel}" === "${normalizedValue}"`);
            continue;
        }

        // Check if value contains the label (catches "Processor: Processor" cases)
        if (normalizedValue.toLowerCase().includes(normalizedLabel.toLowerCase()) &&
            normalizedValue.length < normalizedLabel.length + 10) { // Avoid false positives
            console.log(`  ⏭️  SKIPPED - value contains label (likely duplicate)`);
            continue;
        }

        // Check if this is a warranty spec that was stored backwards
        // If the label is a value-like string and value is a warranty label, swap them
        if (warrantyLabels.includes(spec.value) && !warrantyLabels.includes(spec.label)) {
            // Skip if we've already added this warranty spec
            if (seenLabels.has(spec.value)) {
                console.log(`  ⏭️  SKIPPED - duplicate warranty spec "${spec.value}"`);
                continue;
            }

            console.log(`  🔄 SWAPPED - warranty spec (was backwards)`);
            migratedSpecs.push({
                label: spec.value,
                value: spec.label
            });
            seenLabels.add(spec.value);
        }
        // Normal spec
        else {
            // Skip if we've already seen this label (prevents duplicates)
            if (seenLabels.has(normalizedLabel)) {
                console.log(`  ⏭️  SKIPPED - duplicate label "${normalizedLabel}"`);
                continue;
            }

            console.log(`  ✅ KEPT - normal spec`);
            // Store the ORIGINAL values, just use normalized for comparison
            migratedSpecs.push({
                label: spec.label.trim(),
                value: spec.value.trim()
            });
            seenLabels.add(normalizedLabel);
        }
    }

    console.log('📤 Output specs:', JSON.parse(JSON.stringify(migratedSpecs)));
    console.log(`✅ Migration complete: ${specs.length} => ${migratedSpecs.length} specs\n`);

    return migratedSpecs;
}
