/**
 * UI COMPONENT EXPORTS - Barrel file for the public site's UI primitives.
 *
 * SERVER-SAFE ONLY. Every public page imports this barrel, so nothing
 * carrying 'use client' belongs here. The two client primitives are
 * imported directly by the files that need them: Button by
 * src/components/forms/contact-form.tsx, and OpenNowChip by the four
 * modules that render it. The barrel used to re-export OpenNowChip,
 * which broke the rule stated in this very header.
 *
 * Badge, Card, Input, Textarea, Select and Skeleton were deleted in the
 * 2026-08 redesign: they had zero consumers anywhere in src/ (the
 * contact form builds its inputs from raw elements inside its own Field
 * wrapper) and were dead weight re-exported into every page.
 *
 * WHEN TO EDIT: When adding a new server-safe UI primitive.
 */

/* 2026-08 redesign primitives ("The Service Counter" design system) */
export { Section } from './section';
export { Eyebrow } from './eyebrow';
export { CTALink } from './cta-link';
export { PhoneLink } from './phone-link';
export { PriceStamp } from './price-stamp';
export { BenchFrame } from './bench-frame';
export { BenchPhoto } from './bench-photo';
export { PlaqueRule } from './plaque-rule';
export { CircuitMotif } from './circuit-motif';
export { PlaqueBadge } from './plaque-badge';
