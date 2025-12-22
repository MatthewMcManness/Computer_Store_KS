import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendContactNotification, sendContactConfirmation } from '@/lib/email';
import { calculateSpamScore, SPAM_THRESHOLDS } from '@/lib/spam-detection';

export const dynamic = 'force-dynamic';

// CORS headers for cross-origin requests from static site
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute

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
 * Check rate limit for an IP address
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  // Clean up old entries periodically
  if (rateLimitStore.size > 10000) {
    const cutoff = now - RATE_LIMIT_WINDOW;
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < cutoff) {
        rateLimitStore.delete(key);
      }
    }
  }

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetTime: now + RATE_LIMIT_WINDOW };
  }

  if (record.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS - record.count, resetTime: record.resetTime };
}

/**
 * Sanitize string to prevent XSS
 */
function sanitize(str: string): string {
  return str.replace(/[<>]/g, '');
}

/**
 * Get client IP from request headers
 */
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = getClientIP(request);

    // Check rate limit
    const rateLimit = checkRateLimit(ip);
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
            ...corsHeaders,
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
        { status: 400, headers: corsHeaders }
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
        { status: 400, headers: corsHeaders }
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

    // Log spam score for monitoring
    console.log(JSON.stringify({
      type: 'spam_score',
      timestamp: new Date().toISOString(),
      ip,
      score: spamResult.score,
      breakdown: spamResult.breakdown,
      action: spamResult.action,
      message_preview: formData.message.substring(0, 50),
    }));

    // Handle high spam scores (silent success to not alert bots)
    if (spamResult.score >= SPAM_THRESHOLDS.SILENT_SUCCESS_SCORE) {
      console.log(`Silent success for high spam score (${spamResult.score}) from IP: ${ip}`);
      return NextResponse.json({
        success: true,
        message: 'Thank you for your message! We will get back to you within 24 hours.',
      });
    }

    // Block moderate spam scores
    if (spamResult.score >= SPAM_THRESHOLDS.BLOCK_SCORE) {
      console.log(`Blocked submission with spam score (${spamResult.score}) from IP: ${ip}`);
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
      name: sanitize(formData.name),
      email: formData.email, // Already validated as email
      phone: formData.phone ? sanitize(formData.phone) : undefined,
      subject: formData.subject,
      message: sanitize(formData.message),
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

    // Log submission
    console.log('Contact form submission:', {
      ip,
      name: sanitizedData.name,
      email: sanitizedData.email,
      subject: sanitizedData.subject,
      notificationSent: notificationResult.success,
      confirmationSent: confirmationResult.success,
      timestamp: new Date().toISOString(),
    });

    // Return success even if emails partially failed
    // (we don't want to lose the contact)
    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your message! We will get back to you within 24 hours.',
      },
      {
        headers: {
          ...corsHeaders,
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
      { status: 500, headers: corsHeaders }
    );
  }
}

// Optionally support OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
