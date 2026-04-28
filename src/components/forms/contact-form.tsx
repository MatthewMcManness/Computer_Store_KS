/**
 * CONTACT FORM - Mode-switching form customers use to send messages.
 * Three prominent buttons at the top pick the inquiry type:
 *   - house-call: scheduled appointment, shows the Availability field
 *   - in-store: walk-in, first-come-first-serve (Silver/Silver+ priority)
 *   - general: questions, callbacks, email replies
 * Includes spam protection (honeypots, Turnstile CAPTCHA, timing checks)
 * and posts to /api/contact with the selected mode.
 *
 * WHEN TO EDIT: When changing form fields, modes, validation rules, or
 * the spam protection strategy.
 */

'use client';

import * as React from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO } from '@/lib/constants';
import { Send, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useBotProtection } from '@/hooks/useBotProtection';
import { useInteractionTracking } from '@/hooks/useInteractionTracking';
import { useFingerprint, getSimpleFingerprint } from '@/hooks/useFingerprint';

export type ContactFormMode = 'house-call' | 'in-store' | 'general';

interface FormData {
  name: string;
  email: string;
  phone: string;
  availability: string;
  message: string;
  website: string; // Honeypot field
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  availability?: string;
  message?: string;
}

interface APIError {
  field: string;
  message: string;
}

interface APIResponse {
  success: boolean;
  message?: string;
  error?: string;
  errors?: APIError[];
}

interface ContactFormProps {
  mode?: ContactFormMode;
  onModeChange?: (mode: ContactFormMode) => void;
}

const MODE_CONFIG: Record<ContactFormMode, { subject: string; label: string; helper: string }> = {
  'house-call': {
    subject: 'Schedule a House Call',
    label: 'We come to you',
    helper: 'Scheduled house call — tell us when you\'re available below.',
  },
  'in-store': {
    subject: 'In-Store Service Inquiry',
    label: 'You come to us',
    helper: 'Walk in any time during business hours. Silver and Silver+ members get priority service.',
  },
  general: {
    subject: 'General Inquiry',
    label: 'General question',
    helper: 'Ask anything — questions, callbacks, email replies.',
  },
};

const MODE_ORDER: ContactFormMode[] = ['house-call', 'in-store', 'general'];

// Turnstile site key - MUST be set in production
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

/**
 * Mode-switching contact form with multi-layered spam protection.
 * Collects name, email, phone, message — plus availability for house-call mode —
 * then POSTs to /api/contact with the selected mode and matching subject.
 */
export function ContactForm({ mode = 'general', onModeChange }: ContactFormProps) {
  const { timing, honeypotFields } = useBotProtection();
  const { getInteractionScore } = useInteractionTracking();
  const { fingerprint, getFingerprintSpamScore } = useFingerprint();
  const [honeypots, setHoneypots] = React.useState(honeypotFields);
  const [turnstileToken, setTurnstileToken] = React.useState<string>('');
  const [currentMode, setCurrentMode] = React.useState<ContactFormMode>(mode);

  // Notify parent of the initial mode on mount so it can sync its own state
  // (e.g. swap a sidebar) even when its default differs from ours.
  const onModeChangeRef = React.useRef(onModeChange);
  React.useEffect(() => {
    onModeChangeRef.current = onModeChange;
  }, [onModeChange]);
  React.useEffect(() => {
    onModeChangeRef.current?.(mode);
    // Intentionally only fire once on mount — handleModeChange handles updates afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [formData, setFormData] = React.useState<FormData>({
    name: '',
    email: '',
    phone: '',
    availability: '',
    message: '',
    website: '', // Honeypot - should always be empty
  });

  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<'idle' | 'success' | 'error' | 'rate-limited'>('idle');
  const [errorMessage, setErrorMessage] = React.useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\d\s\-\(\)\+]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (currentMode === 'house-call' && !formData.availability.trim()) {
      newErrors.availability = 'Please tell us when you\'re available';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Clear submit status when user modifies form
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
      setErrorMessage('');
    }
  };

  const handleModeChange = (next: ContactFormMode) => {
    if (next === currentMode) return;
    setCurrentMode(next);
    onModeChange?.(next);
    // Clear stale availability error when leaving house-call mode
    if (next !== 'house-call' && errors.availability) {
      setErrors((prev) => ({ ...prev, availability: undefined }));
    }
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Require Turnstile verification in production
    if (!turnstileToken && process.env.NODE_ENV === 'production') {
      setSubmitStatus('error');
      setErrorMessage('Please complete the security verification.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    // Gather client-side bot detection data
    const interactionScore = getInteractionScore();
    const fingerprintSpamScore = getFingerprintSpamScore();
    const simpleFingerprint = getSimpleFingerprint();

    // Prepend availability to the message body for house-call submissions
    const messageWithAvailability =
      currentMode === 'house-call' && formData.availability.trim()
        ? `Availability: ${formData.availability.trim()}\n\n${formData.message}`
        : formData.message;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: MODE_CONFIG[currentMode].subject,
          message: messageWithAvailability,
          website: formData.website,
          mode: currentMode,
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

      const data: APIResponse = await response.json();

      if (response.status === 429) {
        setSubmitStatus('rate-limited');
        setErrorMessage(data.error || 'Too many requests. Please wait a moment and try again.');
        return;
      }

      if (!response.ok || !data.success) {
        // Handle validation errors from API
        if (data.errors && data.errors.length > 0) {
          const newErrors: FormErrors = {};
          data.errors.forEach((err) => {
            if (err.field === 'name' || err.field === 'email' || err.field === 'phone' || err.field === 'message') {
              newErrors[err.field] = err.message;
            }
          });
          setErrors(newErrors);
        }
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
        return;
      }

      // Success
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        availability: '',
        message: '',
        website: '',
      });
      setTurnstileToken(''); // Reset Turnstile
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Contact Us</CardTitle>
        <CardDescription>
          Pick the option that best matches what you need. Or call us at{' '}
          <a
            href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}
            className="font-medium text-primary-600 hover:underline"
          >
            {BUSINESS_INFO.phoneFormatted}
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Mode switcher — three prominent buttons */}
        <div className="mb-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {MODE_ORDER.map((m) => {
              const isActive = currentMode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleModeChange(m)}
                  aria-pressed={isActive}
                  disabled={isSubmitting}
                  className={`px-4 py-3 rounded-brand-md border-2 text-sm sm:text-base font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-600 text-white border-primary-600 shadow-brand-sm'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-600 hover:text-primary-600'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {MODE_CONFIG[m].label}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-center text-sm text-gray-600">
            {MODE_CONFIG[currentMode].helper}
          </p>
        </div>

        {submitStatus === 'success' && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-800">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Message sent successfully!</p>
              <p className="text-sm">Thank you for contacting us. We&apos;ll get back to you within 24 hours.</p>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-800">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Unable to send message</p>
              <p className="text-sm">{errorMessage || 'Please try again or call us directly.'}</p>
            </div>
          </div>
        )}

        {submitStatus === 'rate-limited' && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-yellow-50 p-4 text-yellow-800">
            <Clock className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Please wait a moment</p>
              <p className="text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Honeypot field - hidden from users, filled by bots */}
          <div className="absolute left-[-9999px] opacity-0" aria-hidden="true">
            <Input
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Additional honeypot fields */}
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

          {/* Timing field */}
          <input type="hidden" name="_timing" value={timing} />

          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
              placeholder="John Doe"
              disabled={isSubmitting}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              placeholder="john@example.com"
              disabled={isSubmitting}
            />
          </div>

          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="(785) 555-0123"
            helperText="Optional"
            disabled={isSubmitting}
          />

          {currentMode === 'house-call' && (
            <Textarea
              label="Best Days & Times"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              error={errors.availability}
              required
              placeholder="e.g. Monday or Wednesday afternoons, any time after 2pm..."
              rows={3}
              disabled={isSubmitting}
            />
          )}

          <Textarea
            label={currentMode === 'house-call' ? 'Describe the Issue' : 'Message'}
            name="message"
            value={formData.message}
            onChange={handleChange}
            error={errors.message}
            required
            placeholder={
              currentMode === 'house-call'
                ? "Tell us what's going on with your computer..."
                : "Tell us about your computer issue or what you're looking for..."
            }
            rows={5}
            disabled={isSubmitting}
          />

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

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isSubmitting}
            rightIcon={!isSubmitting ? <Send className="h-4 w-4" /> : undefined}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
