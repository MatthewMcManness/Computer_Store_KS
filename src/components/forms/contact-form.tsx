/**
 * CONTACT FORM - Mode-switching form customers use to send messages.
 * Three segmented buttons at the top pick the inquiry type:
 *   - house-call: scheduled appointment, shows the Availability field
 *   - in-store: walk-in, first-come-first-serve (Silver / Silver Plus priority)
 *   - general: questions, callbacks, email replies
 * Includes spam protection (honeypots, Turnstile CAPTCHA, timing checks)
 * and posts to /api/contact with the selected mode.
 *
 * WHEN TO EDIT: When changing form fields, modes, validation rules, or
 * the spam protection strategy. Field styling lives in the small Field
 * helpers at the bottom of this file.
 */

'use client';

import * as React from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { Button } from '@/components/ui/button';
import { Send, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/cn';
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
    helper: 'Scheduled house call. Tell us when you are available below.',
  },
  'in-store': {
    subject: 'In-Store Service Inquiry',
    label: 'You come to us',
    helper: 'Walk in any time during business hours. Silver and Silver Plus members get priority service.',
  },
  general: {
    subject: 'General Inquiry',
    label: 'General question',
    helper: 'Questions, callbacks, email replies. Ask anything.',
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
  // even when its default differs from ours.
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
    <div>
      {/* Mode switcher: segmented control, one choice active */}
      <p id="contact-mode-label" className="text-eyebrow uppercase text-muted">
        Pick what fits
      </p>
      <div
        role="group"
        aria-labelledby="contact-mode-label"
        className="mt-3 grid grid-cols-1 gap-1 rounded-lg border border-line-control bg-surface p-1 sm:grid-cols-3"
      >
        {MODE_ORDER.map((m) => {
          const isActive = currentMode === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => handleModeChange(m)}
              aria-pressed={isActive}
              disabled={isSubmitting}
              className={cn(
                'min-h-[44px] rounded-md px-3 py-2.5 font-semibold transition-colors duration-fast ease-brand',
                isActive ? 'bg-brand text-page' : 'text-body hover:bg-tint hover:text-brand-deep',
                'disabled:cursor-not-allowed disabled:opacity-60'
              )}
            >
              {MODE_CONFIG[m].label}
            </button>
          );
        })}
      </div>
      <p className="mt-3 max-w-[65ch] text-sm text-muted">{MODE_CONFIG[currentMode].helper}</p>

      {/* Status region: announced politely to assistive tech */}
      <div aria-live="polite">
        {submitStatus === 'success' && (
          <div className="mt-6 flex items-start gap-3 rounded-lg bg-tint p-4 text-brand-deep">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-bold">Message sent.</p>
              <p className="mt-0.5 text-sm">
                Thanks. We will get back to you soon. If it cannot wait, call the shop.
              </p>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mt-6 flex items-start gap-3 rounded-lg bg-danger-surface p-4 text-danger">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-bold">The message did not send</p>
              <p className="mt-0.5 text-sm">{errorMessage || 'Please try again, or call us directly.'}</p>
            </div>
          </div>
        )}

        {submitStatus === 'rate-limited' && (
          <div className="mt-6 flex items-start gap-3 rounded-lg bg-surface p-4 text-body">
            <Clock className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-bold text-ink">Please wait a moment</p>
              <p className="mt-0.5 text-sm">{errorMessage}</p>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
        {/* Honeypot field - hidden from users, filled by bots */}
        <div className="absolute left-[-9999px] opacity-0" aria-hidden="true">
          <label htmlFor="contact-website">Website</label>
          <input
            type="text"
            id="contact-website"
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
          <Field
            id="contact-name"
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            placeholder="Your name"
            disabled={isSubmitting}
          />
          <Field
            id="contact-email"
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
            placeholder="you@example.com"
            disabled={isSubmitting}
          />
        </div>

        <Field
          id="contact-phone"
          label="Phone Number"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="(785) 555-0123"
          disabled={isSubmitting}
        />

        {currentMode === 'house-call' && (
          <Field
            id="contact-availability"
            label="Best Days & Times"
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            error={errors.availability}
            required
            helperText="For example: Monday or Wednesday afternoons, any time after 2pm."
            multiline
            rows={3}
            disabled={isSubmitting}
          />
        )}

        <Field
          id="contact-message"
          label={currentMode === 'house-call' ? 'Describe the Issue' : 'Message'}
          name="message"
          value={formData.message}
          onChange={handleChange}
          error={errors.message}
          required
          placeholder={
            currentMode === 'house-call'
              ? 'Tell us what is going on with your computer'
              : 'Tell us about your computer issue or what you are looking for'
          }
          multiline
          rows={5}
          disabled={isSubmitting}
        />

        {/* Cloudflare Turnstile - Managed CAPTCHA. The widget renders at
            a fixed 300px, so the wrapper has to be allowed to scroll
            rather than force the whole form column wider than a 320px
            viewport. Widget props are untouched. */}
        <div className="flex max-w-full justify-start overflow-x-auto">
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
          className="w-full min-h-[48px] rounded-lg font-bold"
          isLoading={isSubmitting}
          rightIcon={!isSubmitting ? <Send className="h-4 w-4" aria-hidden="true" /> : undefined}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </div>
  );
}

/* ─── Field presentation ─────────────────────────────────────────────
   Brand-styled label + input/textarea rows. Purely visual: names,
   values, and validation all flow through the props unchanged. */

interface FieldProps {
  id: string;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  helperText?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
}

const FIELD_CLASSES =
  'block w-full rounded-lg border bg-page px-4 py-3 text-base text-ink ' +
  'placeholder:text-muted transition-colors duration-fast ease-brand ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

/** Renders one labeled form field with error and helper text wired for assistive tech. */
function Field({
  id,
  label,
  name,
  value,
  onChange,
  error,
  helperText,
  type = 'text',
  placeholder,
  required,
  disabled,
  multiline = false,
  rows,
}: FieldProps) {
  const describedBy = error ? `${id}-error` : helperText ? `${id}-helper` : undefined;
  const borderClass = error ? 'border-danger' : 'border-line-control';

  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between gap-3 text-sm font-semibold text-ink">
        <span>{label}</span>
        {!required && <span className="text-xs font-medium uppercase tracking-wide text-muted">Optional</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          className={cn(FIELD_CLASSES, borderClass, 'min-h-[96px] resize-y')}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          className={cn(FIELD_CLASSES, borderClass, 'h-12', type === 'tel' && 'tabular-nums')}
        />
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${id}-helper`} className="mt-2 text-sm text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
}
