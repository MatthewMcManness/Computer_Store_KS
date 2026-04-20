/**
 * Configurable in-memory rate limiter factory.
 *
 * Creates isolated rate limiter instances with their own stores,
 * supporting both combined check-and-record and separate check/record
 * patterns. Uses size-based cleanup to prevent memory leaks.
 *
 * @module rate-limiter
 *
 * @example
 * // Combined check-and-record (contact, register routes)
 * const limiter = createRateLimiter(10, 60_000);
 * const result = limiter.check(ip);
 * if (!result.allowed) { // rate limited }
 *
 * // Separate check then record (login route)
 * const limiter = createRateLimiter(50, 300_000);
 * const result = limiter.check(ip, false); // check without recording
 * if (result.allowed) { limiter.record(ip); }
 *
 * @version 1.0.0 - 2026-03-20T00:00:00Z - Initial implementation extracted from route files
 */

/**
 * Result returned by the rate limiter check function.
 */
interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * A rate limiter instance with check and record methods.
 */
export interface RateLimiter {
  check: (key: string, recordAttempt?: boolean) => RateLimitResult;
  record: (key: string) => void;
}

/**
 * Create a rate limiter with the given configuration.
 *
 * Returns an object with `check` and `record` methods backed by an
 * in-memory Map. Expired entries are cleaned up when the store exceeds
 * 10,000 entries.
 *
 * @param maxAttempts - Maximum number of attempts allowed within the window
 * @param windowMs - Duration of the rate limit window in milliseconds
 * @returns A rate limiter instance with check and record methods
 *
 * @functions_called None (self-contained)
 * @called_by Login route, Register route, Contact route
 *
 * @version 1.0.0 - 2026-03-20T00:00:00Z - Initial implementation
 */
export function createRateLimiter(maxAttempts: number, windowMs: number): RateLimiter {
  const store = new Map<string, { count: number; resetTime: number }>();

  /**
   * Remove expired entries when the store grows too large.
   */
  function cleanup(): void {
    const now = Date.now();
    const cutoff = now - windowMs;
    for (const [key, value] of store.entries()) {
      if (value.resetTime < cutoff) {
        store.delete(key);
      }
    }
  }

  /**
   * Check whether a key is rate-limited, optionally recording an attempt.
   *
   * @param key - The identifier to check (typically a client IP)
   * @param recordAttempt - Whether to record an attempt as part of the check (default: true)
   * @returns Rate limit result with allowed status, remaining attempts, and reset time
   */
  function check(key: string, recordAttempt: boolean = true): RateLimitResult {
    const now = Date.now();

    // Size-based cleanup
    if (store.size > 10000) {
      cleanup();
    }

    const entry = store.get(key);

    if (!entry || now > entry.resetTime) {
      if (recordAttempt) {
        store.set(key, { count: 1, resetTime: now + windowMs });
        return { allowed: true, remaining: maxAttempts - 1, resetTime: now + windowMs };
      }
      return { allowed: true, remaining: maxAttempts, resetTime: 0 };
    }

    if (entry.count >= maxAttempts) {
      return { allowed: false, remaining: 0, resetTime: entry.resetTime };
    }

    if (recordAttempt) {
      entry.count++;
      return { allowed: true, remaining: maxAttempts - entry.count, resetTime: entry.resetTime };
    }

    return { allowed: true, remaining: maxAttempts - entry.count, resetTime: entry.resetTime };
  }

  /**
   * Record an attempt for a key without checking the limit.
   *
   * @param key - The identifier to record an attempt for (typically a client IP)
   */
  function record(key: string): void {
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetTime) {
      store.set(key, { count: 1, resetTime: now + windowMs });
    } else {
      entry.count++;
    }
  }

  return { check, record };
}
