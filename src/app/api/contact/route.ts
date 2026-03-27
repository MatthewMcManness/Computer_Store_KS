/**
 * CONTACT FORM API - Receives contact form submissions from the website.
 * Validates input, runs spam detection, rate-limits by IP, and sends
 * emails (notification to business + confirmation to customer).
 *
 * WHEN TO EDIT: When changing form validation rules, spam thresholds,
 * rate limits, or email behavior.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendContactNotification, sendContactConfirmation } from '@/lib/email';
import { calculateSpamScore, SPAM_THRESHOLDS } from '@/lib/spam-detection';
import { createRateLimiter } from '@/lib/rate-limiter';
import { getClientIP } from '@/lib/request-helpers';

export const dynamic = 'force-dynamic';

const ALLOWED_ORIGINS: [string, ...string[]] = ['https://computerstoreks.com', 'https://www.computerstoreks.com'];

/**
 * Build CORS headers with origin checking instead of wildcard.
 *
 * @param request - The incoming request to extract the Origin header from
 * @returns CORS headers object with the validated origin
 *
 * @version 1.0.0 - 2026-03-20T00:00:00Z - Replace wildcard CORS with origin allowlist
 */
function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin') || '';
  const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

// Rate limit configuration: 10 requests per minute per IP
const rateLimiter = createRateLimiter(10, 60 * 1000);

// Interaction tracking schema
const interactionSchema = z.object({
  score: z.number(),
  maxScore: z.number(),
  isHumanLike: z.boolean(),
  spamScore: z.number(),
}).optional();

// Browser fingerprint schema
const fingerprintSchema = z.object({
  visitorId: z.string(),
  confidence: z.number(),
  simpleFingerprint: z.string(),
  spamScore: z.number(),
}).optional();

// Contact form validation schema
const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .transform((val) => val.trim()),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(254, 'Email must be less than 254 characters')
    .transform((val) => val.trim().toLowerCase()),
  phone: z
    .string()
    .max(20, 'Phone number must be less than 20 characters')
    .optional()
    .transform((val) => val?.trim() || undefined),
  subject: z.enum(['General', 'Repair', 'Custom Build', 'Protection Plans', 'Other'], {
    message: 'Please select a valid subject',
  }),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be less than 5000 characters')
    .transform((val) => val.trim()),
  location: z.enum(['Topeka']).optional().default('Topeka'),
  // Honeypot field - should always be empty
  website: z.string().optional(),
  // Bot protection fields
  _timing: z.string().optional(),  // Page load timestamp
  _hp_email2: z.string().optional(),  // Honeypot 1
  _hp_phone_confirm: z.string().optional(),  // Honeypot 2
  _hp_url: z.string().optional(),  // Honeypot 3
  // Turnstile token
  _turnstile: z.string().optional(),
  // Interaction tracking data
  _interaction: interactionSchema,
  // Browser fingerprint data
  _fingerprint: fingerprintSchema,
});

type ContactFormData = z.infer<typeof contactFormSchema>;

/**
 * Escape HTML special characters to prevent XSS in email output.
 *
 * @param str - The untrusted user input string to escape
 * @returns The string with HTML special characters replaced by entities
 *
 * @called_by POST handler (contact form)
 *
 * @version 1.0.0 - 2026-03-20T00:00:00Z - Replace naive strip with proper entity escaping
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request: NextRequest) {
  // ─── SPAM DETECTION PIPELINE ──────────────────────────────────────
  // The contact form goes through multiple layers of protection before
  // an email is actually sent. Here's the order:
  //
  //   1. RATE LIMITING (below) — Max 10 submissions per minute per IP.
  //      Stops brute-force spam floods.
  //
  //   2. VALIDATION — Zod schema checks all fields (name, email, subject,
  //      message) for correct format and length.
  //
  //   3. SPAM SCORING — calculateSpamScore() runs ALL of these checks:
  //      a. Honeypot fields: 3 hidden fields (email2, phone_confirm, url)
  //         that humans never see. If any are filled in → bot.
  //      b. Timing check: Records when the page loaded vs. when the form
  //         was submitted. Under 3 seconds → probably a bot.
  //      c. Content analysis: Checks for gibberish, keyboard walks
  //         (qwerty, asdf), random characters, excessive caps/links.
  //      d. Name validation: Is the name real-looking or spam-like?
  //      e. Spam patterns: Known spam keywords (viagra, bitcoin, SEO),
  //         excessive URLs, foreign scripts.
  //      f. Disposable email check: Known throwaway email domains.
  //      g. Interaction tracking: Did the user actually move the mouse,
  //         scroll, and type like a human?
  //      h. Browser fingerprint: Consistency check on browser signals.
  //      i. Turnstile CAPTCHA: Cloudflare's invisible challenge token.
  //
  //   4. SCORE THRESHOLDS:
  //      - Score >= 70 → "Silent success" (pretend email was sent, but don't
  //        actually send it — this tricks bots into thinking they succeeded)
  //      - Score >= 40 → Block with error message
  //      - Score < 40  → Legitimate, send the email
  //
  //   5. EMAIL DELIVERY — Two emails sent in parallel:
  //      a. Notification to the store (contact@computerstoreks.com)
  //      b. Confirmation to the customer ("thanks, we got your message")
  // ──────────────────────────────────────────────────────────────────

  try {
    // Step 1: Rate limiting — max 10 requests per minute per IP
    const ip = getClientIP(request);

    const rateLimit = rateLimiter.check(ip);
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
        },
        {
          status: 429,
          headers: {
            ...getCorsHeaders(request),
            'X-RateLimit-Remaining': '0',
            'Retry-After': String(retryAfter),
          },
        }
      );
    }

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }

    // Validate form data
    const validationResult = contactFormSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors,
        },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }

    const formData: ContactFormData = validationResult.data;

    // Extract timing data for spam detection
    const pageLoadTime = formData._timing ? parseInt(formData._timing, 10) : 0;
    const submitTime = Date.now();

    // Prepare data for spam detection
    const spamDetectionData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message,
      website: formData.website,
      pageLoadTime,
      submitTime,
      // Check additional honeypot fields
      _hp_email2: formData._hp_email2,
      _hp_phone_confirm: formData._hp_phone_confirm,
      _hp_url: formData._hp_url,
      // Turnstile token
      _turnstile: formData._turnstile,
      // Interaction tracking
      _interaction: formData._interaction,
      // Browser fingerprint
      _fingerprint: formData._fingerprint,
    };

    // Calculate spam score (async for Turnstile verification)
    const spamResult = await calculateSpamScore(spamDetectionData, request.headers, ip);

    // Handle high spam scores (silent success to not alert bots)
    if (spamResult.score >= SPAM_THRESHOLDS.SILENT_SUCCESS_SCORE) {
      return NextResponse.json({
        success: true,
        message: 'Thank you for your message! We will get back to you within 24 hours.',
      });
    }

    // Block moderate spam scores
    if (spamResult.score >= SPAM_THRESHOLDS.BLOCK_SCORE) {
      return NextResponse.json(
        {
          success: false,
          error: 'Your submission appears to be spam. If you believe this is an error, please call us at (785) 267-3223.',
        },
        { status: 400 }
      );
    }

    // Sanitize inputs for legitimate submissions
    const sanitizedData = {
      name: escapeHtml(formData.name),
      email: formData.email, // Already validated as email
      phone: formData.phone ? escapeHtml(formData.phone) : undefined,
      subject: formData.subject,
      message: escapeHtml(formData.message),
      location: formData.location,
    };

    // Send emails in parallel
    const [notificationResult, confirmationResult] = await Promise.all([
      sendContactNotification(sanitizedData),
      sendContactConfirmation({
        name: sanitizedData.name,
        email: sanitizedData.email,
        subject: sanitizedData.subject,
      }),
    ]);

    // If the notification email failed, the business won't see this message.
    // Tell the user so they can call instead.
    if (!notificationResult.success) {
      console.error('CRITICAL: Contact notification email failed:', notificationResult.error);
      return NextResponse.json(
        {
          success: false,
          error: 'We had trouble delivering your message. Please call us directly at (785) 267-3223 or email contact@computerstoreks.com.',
        },
        { status: 500, headers: getCorsHeaders(request) }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your message! We will get back to you within 24 hours.',
      },
      {
        headers: {
          ...getCorsHeaders(request),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred. Please try again or call us directly at (785) 267-3223.',
      },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}

// Optionally support OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}
