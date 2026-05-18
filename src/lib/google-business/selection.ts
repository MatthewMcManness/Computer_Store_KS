/**
 * GBP SELECTION - Filters, scores, and rotates the cached reviews into
 * a varied display set. Deterministic per day so visitors see a
 * different lineup over time but a stable one within a single day.
 *
 * WHEN TO EDIT: When tuning the selection algorithm — change the
 * minimum comment length, the recency/length scoring weights, or the
 * rotation seed cadence.
 *
 * PURE: No I/O. Same input + same daySeed = same output.
 */

import type { DisplayReview } from '@/types/google-business';

/** Reviews shorter than this are dropped — typical noise band. */
const MIN_COMMENT_LENGTH = 30;

/** Length sweet spot used by the bell-curve length score. */
const LENGTH_PEAK = 180;
const LENGTH_SIGMA = 220;

/** Recency half-life used by the exponential decay score. */
const RECENCY_HALF_LIFE_DAYS = 365;

/** Bonus multiplier when the review has an owner reply. */
const OWNER_REPLY_BONUS = 1.1;

/** How many top-scored candidates we draw the rotated set from. */
const ROTATION_POOL_MULTIPLIER = 3;

export interface SelectionOptions {
  /** How many reviews to return. */
  count: number;
  /** Seed for the day-stable shuffle. Defaults to today's day-of-epoch. */
  daySeed?: number;
}

/** mulberry32 — small, deterministic 32-bit PRNG. */
function mulberry32(seed: number): () => number {
  let t = seed | 0;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates shuffle, seeded so two calls with the same seed match. */
function seededShuffle<T>(items: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i] as T;
    out[i] = out[j] as T;
    out[j] = tmp;
  }
  return out;
}

/** Day index since Unix epoch — changes once per UTC day. */
function todayDaySeed(): number {
  return Math.floor(Date.now() / (24 * 60 * 60 * 1000));
}

function recencyScore(dateIso: string): number {
  const ageDays = (Date.now() - new Date(dateIso).getTime()) / (1000 * 60 * 60 * 24);
  if (!Number.isFinite(ageDays) || ageDays < 0) return 1;
  // 2^(-age/half-life) — newer reviews score higher; halves every year.
  return Math.pow(2, -ageDays / RECENCY_HALF_LIFE_DAYS);
}

function lengthScore(text: string | undefined): number {
  const len = text?.length ?? 0;
  if (len === 0) return 0;
  // Gaussian-ish bell curve centered on LENGTH_PEAK characters.
  const z = (len - LENGTH_PEAK) / LENGTH_SIGMA;
  return Math.exp(-(z * z) / 2);
}

function scoreReview(review: DisplayReview): number {
  const base = recencyScore(review.date) + lengthScore(review.text);
  return review.reply ? base * OWNER_REPLY_BONUS : base;
}

/** Lowercased first token of the author name, or empty if not derivable. */
function firstNameKey(name: string): string {
  return name.trim().split(/\s+/, 1)[0]?.toLowerCase() ?? '';
}

/**
 * Filter to 5-star reviews with substantive text, score them, take the
 * top pool, deterministically shuffle by day, dedupe first names, then
 * take the requested count.
 */
export function selectReviews(
  reviews: DisplayReview[],
  { count, daySeed }: SelectionOptions,
): DisplayReview[] {
  if (count <= 0) return [];

  const fiveStar = reviews.filter(
    (r) => r.rating === 5 && (r.text?.length ?? 0) >= MIN_COMMENT_LENGTH,
  );
  if (fiveStar.length === 0) return [];

  const scored = fiveStar
    .map((review) => ({ review, score: scoreReview(review) }))
    .sort((a, b) => b.score - a.score);

  const poolSize = Math.max(count * ROTATION_POOL_MULTIPLIER, count);
  const pool = scored.slice(0, poolSize).map(({ review }) => review);

  const shuffled = seededShuffle(pool, daySeed ?? todayDaySeed());

  const seen = new Set<string>();
  const picked: DisplayReview[] = [];
  for (const review of shuffled) {
    const key = firstNameKey(review.authorName);
    if (key && seen.has(key)) continue;
    seen.add(key);
    picked.push(review);
    if (picked.length >= count) break;
  }

  // If first-name dedup left us short, top up with whatever's left.
  if (picked.length < count) {
    for (const review of shuffled) {
      if (picked.includes(review)) continue;
      picked.push(review);
      if (picked.length >= count) break;
    }
  }

  return picked;
}
