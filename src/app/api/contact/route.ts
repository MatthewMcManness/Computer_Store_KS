import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendContactNotification, sendContactConfirmation } from '@/lib/email';

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
  subject: z.enum(['General', 'Repair', 'Custom Build', 'Silver Plan', 'Other'], {
    message: 'Please select a valid subject',
  }),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be less than 5000 characters')
    .transform((val) => val.trim()),
  // Honeypot field - should always be empty
  website: z.string().optional(),
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

    // Check honeypot field (bot trap)
    if (formData.website) {
      console.log('Bot detected via honeypot from IP:', ip);
      // Return success to not alert the bot
      return NextResponse.json(
        {
          success: true,
          message: 'Thank you for your message!',
        },
        { headers: corsHeaders }
      );
    }

    // Sanitize inputs
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
