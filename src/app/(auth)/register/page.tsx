'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Turnstile } from '@marsidev/react-turnstile';
import { useBotProtection } from '@/hooks/useBotProtection';
import { useInteractionTracking } from '@/hooks/useInteractionTracking';
import { useFingerprint, getSimpleFingerprint } from '@/hooks/useFingerprint';

// Turnstile site key
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

// US States for dropdown
const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

/**
 * Loading spinner component
 */
function LoadingSpinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Password requirements display
 */
function PasswordRequirements({ password }: { password: string }) {
  const requirements = [
    {
      label: 'At least 12 characters',
      met: password.length >= 12,
    },
  ];

  return (
    <div className="mt-2 space-y-1">
      {requirements.map((req, index) => (
        <div
          key={index}
          className={`flex items-center gap-2 text-xs ${
            req.met ? 'text-green-600' : 'text-gray-500'
          }`}
        >
          <span className="flex-shrink-0">
            {req.met ? (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </span>
          <span>{req.label}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Registration page with bot protection
 *
 * Implements comprehensive bot detection including Turnstile CAPTCHA,
 * honeypot fields, timing analysis, and interaction tracking.
 * Requires first name, last name, phone, email, and address.
 * Links to existing RepairShopr customers if phone/email matches.
 *
 * @returns Registration form component
 *
 * @sideEffects
 * - Creates user account via API
 * - Links to RepairShopr customer if match found
 * - Redirects on successful registration
 *
 * @functions_called useBotProtection, useInteractionTracking, useFingerprint
 * @called_by App router
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-01-14T00:00:00Z - Added bot protection
 * @version 3.0.0 - 2026-01-14T00:00:00Z - Added required fields and RepairShopr linking
 */
export default function RegisterPage() {
  const router = useRouter();

  // Bot protection hooks
  const { timing, honeypotFields } = useBotProtection();
  const { getInteractionScore } = useInteractionTracking();
  const { fingerprint, getFingerprintSpamScore } = useFingerprint();
  const [honeypots, setHoneypots] = useState(honeypotFields);
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('KS'); // Default to Kansas
  const [zip, setZip] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // UI state
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [linkedCustomer, setLinkedCustomer] = useState<string | null>(null);

  // Check if already authenticated
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        if (mounted && data.authenticated) {
          // Redirect based on user type
          if (data.user?.userType === 'customer') {
            router.replace('/portal');
          } else {
            router.replace('/admin');
          }
        }
      } catch {
        // Not authenticated, stay on register page
      } finally {
        if (mounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [router]);

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const validateForm = (): boolean => {
    // Reset error
    setError('');

    // Validate first name
    if (firstName.trim().length < 1) {
      setError('First name is required.');
      return false;
    }

    // Validate last name
    if (lastName.trim().length < 1) {
      setError('Last name is required.');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    // Validate phone (must have 10 digits)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return false;
    }

    // Validate address
    if (address.trim().length < 5) {
      setError('Please enter your street address.');
      return false;
    }

    // Validate city
    if (city.trim().length < 2) {
      setError('Please enter your city.');
      return false;
    }

    // Validate state
    if (!state) {
      setError('Please select your state.');
      return false;
    }

    // Validate zip
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(zip)) {
      setError('Please enter a valid ZIP code.');
      return false;
    }

    // Validate password length
    if (password.length < 12) {
      setError('Password must be at least 12 characters long.');
      return false;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    // Validate terms agreement
    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service to create an account.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Require Turnstile verification in production
    if (!turnstileToken && process.env.NODE_ENV === 'production') {
      setError('Please complete the security verification.');
      return;
    }

    setIsLoading(true);
    setError('');

    // Gather client-side bot detection data
    const interactionScore = getInteractionScore();
    const fingerprintSpamScore = getFingerprintSpamScore();
    const simpleFingerprint = getSimpleFingerprint();

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.replace(/\D/g, ''), // Send digits only
          address: address.trim(),
          city: city.trim(),
          state,
          zip: zip.trim(),
          password,
          // Timing data
          _timing: timing,
          // Honeypot fields
          _hp_email2: honeypots._hp_email2,
          _hp_phone_confirm: honeypots._hp_phone_confirm,
          _hp_url: honeypots._hp_url,
          // Turnstile token
          _turnstile: turnstileToken,
          // Interaction tracking
          _interaction: {
            score: interactionScore.score,
            maxScore: interactionScore.maxScore,
            isHumanLike: interactionScore.isHumanLike,
            spamScore: interactionScore.spamScore,
          },
          // Browser fingerprint
          _fingerprint: {
            visitorId: fingerprint.visitorId,
            confidence: fingerprint.confidence,
            simpleFingerprint,
            spamScore: fingerprintSpamScore,
          },
        }),
      });

      const data = await response.json();

      if (response.status === 429) {
        setError(data.error || 'Too many attempts. Please wait and try again.');
        return;
      }

      if (!response.ok || !data.success) {
        setError(data.error || 'Registration failed. Please try again.');
        return;
      }

      // Check if linked to existing customer
      if (data.linked) {
        setLinkedCustomer('existing');
      }

      // Success
      setIsSuccess(true);
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking initial auth
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <LoadingSpinner className="mx-auto h-8 w-8" />
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  // Show success message after registration
  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Check Your Email
        </h1>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          We&apos;ve sent a verification link to <strong>{email}</strong>.
          Please check your inbox and click the link to verify your account.
        </p>
        {linkedCustomer && (
          <div className="mb-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            <p>Your account has been linked to your existing customer record.</p>
          </div>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Didn&apos;t receive the email? Check your spam folder or{' '}
          <button
            onClick={() => setIsSuccess(false)}
            className="text-blue-600 hover:underline"
          >
            try again
          </button>
          .
        </p>
        <div className="mt-6">
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Title */}
      <h1 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
        Create Account
      </h1>
      <p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Create a customer portal account to track your repairs and view your history.
      </p>

      {/* Error Message */}
      {error && (
        <div
          className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot fields - hidden from users, filled by bots */}
        <div aria-hidden="true" className="absolute -left-[9999px] -top-[9999px]">
          <input
            type="email"
            name="_hp_email2"
            value={honeypots._hp_email2}
            onChange={(e) => setHoneypots(h => ({...h, _hp_email2: e.target.value}))}
            tabIndex={-1}
            autoComplete="off"
          />
          <input
            type="tel"
            name="_hp_phone_confirm"
            value={honeypots._hp_phone_confirm}
            onChange={(e) => setHoneypots(h => ({...h, _hp_phone_confirm: e.target.value}))}
            tabIndex={-1}
            autoComplete="off"
          />
          <input
            type="url"
            name="_hp_url"
            value={honeypots._hp_url}
            onChange={(e) => setHoneypots(h => ({...h, _hp_url: e.target.value}))}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Name Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              autoComplete="given-name"
              required
              autoFocus
              disabled={isLoading}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:disabled:bg-gray-700"
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              autoComplete="family-name"
              required
              disabled={isLoading}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:disabled:bg-gray-700"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            autoComplete="email"
            required
            disabled={isLoading}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:disabled:bg-gray-700"
          />
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="(785) 555-0123"
            autoComplete="tel"
            required
            disabled={isLoading}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:disabled:bg-gray-700"
          />
        </div>

        {/* Address */}
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Street Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main Street"
            autoComplete="street-address"
            required
            disabled={isLoading}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:disabled:bg-gray-700"
          />
        </div>

        {/* City, State, Zip Row */}
        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-2">
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Topeka"
              autoComplete="address-level2"
              required
              disabled={isLoading}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:disabled:bg-gray-700"
            />
          </div>
          <div className="col-span-2">
            <label
              htmlFor="state"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              State <span className="text-red-500">*</span>
            </label>
            <select
              id="state"
              name="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
              disabled={isLoading}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-700"
            >
              {US_STATES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label
              htmlFor="zip"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              ZIP <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="zip"
              name="zip"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="66604"
              autoComplete="postal-code"
              required
              maxLength={10}
              disabled={isLoading}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:disabled:bg-gray-700"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            autoComplete="new-password"
            required
            minLength={12}
            disabled={isLoading}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:disabled:bg-gray-700"
          />
          <PasswordRequirements password={password} />
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            autoComplete="new-password"
            required
            minLength={12}
            disabled={isLoading}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:disabled:bg-gray-700"
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            name="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            disabled={isLoading}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
          />
          <label
            htmlFor="terms"
            className="text-sm text-gray-600 dark:text-gray-400"
          >
            I agree to the{' '}
            <Link
              href="/terms"
              className="text-blue-600 hover:underline dark:text-blue-400"
              target="_blank"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="text-blue-600 hover:underline dark:text-blue-400"
              target="_blank"
            >
              Privacy Policy
            </Link>
          </label>
        </div>

        {/* Cloudflare Turnstile - Managed CAPTCHA */}
        <div className="flex justify-center">
          <Turnstile
            siteKey={TURNSTILE_SITE_KEY}
            onSuccess={(token) => setTurnstileToken(token)}
            onError={() => setTurnstileToken('')}
            onExpire={() => setTurnstileToken('')}
            options={{
              theme: 'light',
              size: 'normal',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <LoadingSpinner className="mr-2 h-5 w-5" />
              Creating account...
            </span>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Sign in link */}
      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
        >
          Sign in
        </Link>
      </div>
    </>
  );
}
