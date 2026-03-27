# Comment Style Guide

This codebase is commented so a non-developer can understand what each file does and where to make changes.

## File Headers (every file)

Every `.ts` and `.tsx` file starts with a JSDoc header:

```typescript
/**
 * SHORT NAME - Plain English description of what this file does.
 *
 * WHEN TO EDIT: When you need to change X.
 */
```

Place this BEFORE `'use client'` if present, or before the first import.

**Examples:**

```typescript
/**
 * SITE HEADER - The navigation bar at the top of every page.
 * Shows logo, page links, services dropdown, and login button.
 *
 * WHEN TO EDIT: When adding/removing navigation links, changing
 * the logo, or modifying the services dropdown menu.
 */
```

```typescript
/**
 * CONTACT FORM API - Receives contact form submissions from the website.
 * Validates input, runs spam detection, rate-limits by IP, and sends
 * emails (notification to business + confirmation to customer).
 *
 * WHEN TO EDIT: When changing form validation rules, spam thresholds,
 * rate limits, or email behavior.
 */
```

## Function Comments (exported functions)

Every exported function gets a 1-3 line plain-English JSDoc:

```typescript
/** Gets all computers currently for sale, with any active sale discount applied. */
export async function getComputers(): Promise<GalleryComputer[]> {
```

```typescript
/**
 * Create a new computer listing in the database.
 * Called from the admin "Add Computer" form. Returns the new computer
 * with any active sale pricing applied.
 */
export async function createComputer(input: CreateComputerInput): Promise<GalleryComputer | null> {
```

Keep it simple. Explain what the function does, not how it does it. A non-developer should be able to read the comment and understand the purpose.

## Business Logic Annotations (complex flows only)

For complex multi-step processes, add a block annotation explaining the pipeline step-by-step. These currently exist in:

- **`middleware.ts`** — Auth flow: how requests are checked, what's public vs protected, how login works
- **`api/contact/route.ts`** — Spam detection pipeline: all 9 layers of spam checking and score thresholds
- **`api/in-store/upload/route.ts`** — Image upload pipeline: validation → Sharp processing → storage → URLs
- **`lib/gallery.ts`** — Sale pricing system: how sales work, how discounts are applied per-category

Format:

```typescript
// ─── PIPELINE NAME ──────────────────────────────────────────────
// Step-by-step explanation of how this system works.
//
//   1. First thing that happens
//   2. Second thing that happens
//   3. etc.
// ────────────────────────────────────────────────────────────────
```

## What NOT to do

- Don't add comments that just restate the code: `// increment counter` above `counter++`
- Don't add `@version`, `@functions_called`, `@called_by` tags — keep it simple
- Don't leave outdated comments — update or remove them when changing code
- Don't comment internal/private helper functions unless the logic is non-obvious
