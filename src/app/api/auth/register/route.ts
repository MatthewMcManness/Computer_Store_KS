/**
 * Registration API Route with Bot Protection
 *
 * Handles user registration with comprehensive bot detection including:
 * - Cloudflare Turnstile verification
 * - Honeypot field validation
 * - Timing analysis
 * - Interaction tracking
 * - Browser fingerprinting
 * - Disposable email detection
 * - Rate limiting
 *
 * @version 1.0.0 - 2026-01-14T00:00:00Z - Initial implementation with bot protection
 * @version 1.1.0 - 2026-01-14T00:00:00Z - Added required fields and RepairShopr customer matching
 * @version 2.0.0 - 2026-03-16T00:00:00Z - Removed RepairShopr dependency (archived)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { signUp, createUserProfile } from '@/lib/supabase-auth';
import { calculateSpamScore, SPAM_THRESHOLDS } from '@/lib/spam-detection';
import { isDisposableEmail } from '@/lib/disposable-email';
import { createRateLimiter } from '@/lib/rate-limiter';
import { getClientIP } from '@/lib/request-helpers';

export const dynamic = 'force-dynamic';

// Rate limit configuration - stricter for registration: 5 per hour per IP
const rateLimiter = createRateLimiter(5, 60 * 60 * 1000);

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

// US States for validation
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
] as const;

// Registration form validation schema
const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .transform((val) => val.trim()),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .transform((val) => val.trim()),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(254, 'Email must be less than 254 characters')
    .transform((val) => val.trim().toLowerCase()),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number is too long')
    .transform((val) => val.replace(/\D/g, '')), // Strip non-digits
  address: z
    .string()
    .min(1, 'Address is required')
    .max(200, 'Address must be less than 200 characters')
    .transform((val) => val.trim()),
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters')
    .transform((val) => val.trim()),
  state: z
    .string()
    .refine((val) => US_STATES.includes(val as typeof US_STATES[number]), {
      message: 'Please select a valid state',
    }),
  zip: z
    .string()
    .min(5, 'ZIP code must be at least 5 digits')
    .max(10, 'ZIP code is too long')
    .transform((val) => val.trim()),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters'),
  // Bot protection fields
  _timing: z.string().optional(),
  _hp_email2: z.string().optional(),
  _hp_phone_confirm: z.string().optional(),
  _hp_url: z.string().optional(),
  _turnstile: z.string().optional(),
  _interaction: interactionSchema,
  _fingerprint: fingerprintSchema,
});

type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * POST /api/auth/register
 * Handle user registration with bot protection
 *
 * @param request - Incoming request with registration data and bot protection fields
 * @returns Success response with user data or error response
 *
 * @throws {ValidationError} When form data is invalid (400)
 * @throws {RateLimitError} When too many registration attempts (429)
 * @throws {SpamError} When submission appears to be spam (400)
 *
 * @sideEffects
 * - Creates user in Supabase Auth
 * - Creates user profile in database
 * - Logs registration attempts for security audit
 *
 * @functions_called checkRateLimit, getClientIP, calculateSpamScore, isDisposableEmail, signUp, createUserProfile
 * @called_by RegisterPage
 *
 * @version 1.0.0 - 2026-01-14T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-03-16T00:00:00Z - Removed RepairShopr customer matching
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = getClientIP(request);

    // Check rate limit
    const rateLimit = rateLimiter.check(ip);
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      console.log(`[Register] Rate limited IP: ${ip}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Too many registration attempts. Please try again later.',
        },
        {
          status: 429,
          headers: {
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
        { status: 400 }
      );
    }

    // Validate form data
    const validationResult = registerSchema.safeParse(body);
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
        { status: 400 }
      );
    }

    const formData: RegisterFormData = validationResult.data;

    // Check for disposable email
    if (isDisposableEmail(formData.email)) {
      console.log(`[Register] Blocked disposable email: ${formData.email} from IP: ${ip}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Please use a permanent email address. Temporary/disposable emails are not allowed.',
        },
        { status: 400 }
      );
    }

    // Construct full name from first and last name
    const fullName = `${formData.firstName} ${formData.lastName}`;

    // Extract timing data for spam detection
    const pageLoadTime = formData._timing ? parseInt(formData._timing, 10) : 0;
    const submitTime = Date.now();

    // Prepare data for spam detection
    const spamDetectionData = {
      name: fullName,
      email: formData.email,
      message: '', // No message field for registration
      subject: '', // No subject field for registration
      pageLoadTime,
      submitTime,
      // Honeypot fields
      website: '', // Not used but required by spam detection
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

    // Calculate spam score
    const spamResult = await calculateSpamScore(spamDetectionData, request.headers, ip);

    // Log spam score for monitoring
    console.log(JSON.stringify({
      type: 'registration_spam_score',
      timestamp: new Date().toISOString(),
      ip,
      email: formData.email,
      score: spamResult.score,
      breakdown: spamResult.breakdown,
      action: spamResult.action,
    }));

    // Block high spam scores (be stricter for registration than contact form)
    // Use lower threshold for registration since bots create fake accounts
    if (spamResult.score >= SPAM_THRESHOLDS.BLOCK_SCORE - 10) {
      console.log(`[Register] Blocked spam registration (score: ${spamResult.score}) from IP: ${ip}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Registration could not be completed. Please ensure you complete the security verification and try again.',
        },
        { status: 400 }
      );
    }

    // Require Turnstile in production
    if (process.env.NODE_ENV === 'production' && !formData._turnstile) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please complete the security verification.',
        },
        { status: 400 }
      );
    }

    // Proceed with registration
    const { user, error: signUpError } = await signUp(formData.email, formData.password, {
      full_name: fullName,
    });

    if (signUpError) {
      console.log(`[Register] Sign up error for ${formData.email}: ${signUpError.message}`);
      return NextResponse.json(
        {
          success: false,
          error: getAuthErrorMessage(signUpError.message),
        },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Registration failed. Please try again.',
        },
        { status: 500 }
      );
    }

    // Create user profile
    await createUserProfile(user.id, formData.email, ['customer'], {
      fullName: fullName,
    });

    // Log successful registration
    console.log(JSON.stringify({
      type: 'registration_success',
      timestamp: new Date().toISOString(),
      ip,
      email: formData.email,
    }));

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('[Register] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during registration. Please try again.',
      },
      { status: 500 }
    );
  }
}

/**
 * Get user-friendly error message for auth errors
 *
 * @param message - Error message from Supabase
 * @returns User-friendly error message
 *
 * @functions_called None
 * @called_by POST handler
 *
 * @version 1.0.0 - 2026-01-14T00:00:00Z - Initial implementation
 */
function getAuthErrorMessage(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('user already registered') || lowerMessage.includes('already exists')) {
    return 'An account with this email already exists. Please sign in or use a different email.';
  }
  if (lowerMessage.includes('password')) {
    return 'Password must be at least 12 characters long.';
  }
  if (lowerMessage.includes('email')) {
    return 'Please enter a valid email address.';
  }
  if (lowerMessage.includes('rate limit')) {
    return 'Too many attempts. Please wait a few minutes before trying again.';
  }

  return 'Registration failed. Please try again.';
}
