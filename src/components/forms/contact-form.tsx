'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO } from '@/lib/constants';
import { Send, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useBotProtection } from '@/hooks/useBotProtection';

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  website: string; // Honeypot field
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
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

const subjectOptions = [
  { value: 'General', label: 'General Inquiry' },
  { value: 'Repair', label: 'Computer Repair' },
  { value: 'Custom Build', label: 'Custom Build' },
  { value: 'Silver Plan', label: 'Silver Plan' },
  { value: 'Other', label: 'Other' },
];

export function ContactForm() {
  const { timing, honeypotFields } = useBotProtection();
  const [honeypots, setHoneypots] = React.useState(honeypotFields);

  const [formData, setFormData] = React.useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
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

    if (!formData.subject) {
      newErrors.subject = 'Please select a subject';
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          _timing: timing,
          _hp_email2: honeypots._hp_email2,
          _hp_phone_confirm: honeypots._hp_phone_confirm,
          _hp_url: honeypots._hp_url,
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
            if (err.field in formData) {
              newErrors[err.field as keyof FormErrors] = err.message;
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
        subject: '',
        message: '',
        website: '',
      });
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
          Fill out the form below and we&apos;ll get back to you as soon as possible.
          Or call us at{' '}
          <a
            href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}
            className="font-medium text-primary-600 hover:underline"
          >
            {BUSINESS_INFO.phoneFormatted}
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent>
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

          <div className="grid gap-6 sm:grid-cols-2">
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
            <Select
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              options={subjectOptions}
              error={errors.subject}
              required
              placeholder="Select a subject"
              disabled={isSubmitting}
            />
          </div>

          <Textarea
            label="Message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            error={errors.message}
            required
            placeholder="Tell us about your computer issue or what you're looking for..."
            rows={5}
            disabled={isSubmitting}
          />

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
