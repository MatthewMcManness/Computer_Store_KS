# Contact Form Documentation

This document covers the contact form implementation in Computer Store KS Version 3.0, including how it works, email notifications, and customization options.

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Email Notifications](#email-notifications)
- [Bot Protection](#bot-protection)
- [Rate Limiting](#rate-limiting)
- [Customizing Email Templates](#customizing-email-templates)
- [Troubleshooting](#troubleshooting)

## Overview

The contact form allows customers to reach out to Computer Store Kansas with questions about services, repairs, or computer purchases. The form collects customer information and sends an email notification to the business.

### Features

- Client-side and server-side validation
- Multiple service type options
- Email notifications via Resend
- Bot protection measures
- Rate limiting to prevent abuse
- Success and error feedback
- Mobile-responsive design

### Form Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Full Name | Text | Yes | Non-empty |
| Email | Email | Yes | Valid email format |
| Phone Number | Tel | No | Valid phone format |
| Service Needed | Select | Yes | Must select option |
| Message | Textarea | Yes | Min 10 characters |

### Service Options

- Computer Repair
- Buy a Computer
- Custom Build
- Data Recovery
- Virus Removal
- Hardware Upgrade
- Other

## How It Works

### Component Location

The contact form component is located at:
```
src/components/forms/contact-form.tsx
```

### Form Submission Flow

```
┌─────────────┐     Submit      ┌─────────────┐
│   Contact   │ ──────────────> │   Client    │
│    Form     │                 │  Validation │
└─────────────┘                 └──────┬──────┘
                                       │
                                  Valid │
                                       ▼
                                ┌─────────────┐
                                │  API Route  │
                                │   /api/     │
                                │   contact   │
                                └──────┬──────┘
                                       │
                        ┌──────────────┼──────────────┐
                        │              │              │
                        ▼              ▼              ▼
                 ┌───────────┐  ┌───────────┐  ┌───────────┐
                 │  Server   │  │   Bot     │  │   Rate    │
                 │Validation │  │Protection │  │  Limit    │
                 └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
                       │              │              │
                       └──────────────┼──────────────┘
                                      │
                                 Pass │
                                      ▼
                               ┌─────────────┐
                               │   Resend    │
                               │   Email     │
                               └──────┬──────┘
                                      │
                                      ▼
                               ┌─────────────┐
                               │   Success   │
                               │   Message   │
                               └─────────────┘
```

### Client-Side Implementation

The form uses React state for form data and validation:

```typescript
interface FormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  message?: string;
}
```

### Validation Rules

**Name:**
- Required
- Must not be empty after trimming

**Email:**
- Required
- Must match email regex pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**Phone:**
- Optional
- If provided, must match pattern: `/^[\d\s\-\(\)\+]+$/`

**Service:**
- Required
- Must be one of the predefined options

**Message:**
- Required
- Minimum 10 characters after trimming

## Email Notifications

### Resend Setup

The contact form uses [Resend](https://resend.com) for email delivery.

#### Creating a Resend Account

1. Go to https://resend.com
2. Sign up for an account
3. Verify your email
4. Create an API key
5. Add and verify your domain (optional but recommended)

#### Configuration

Add to your environment variables:

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
CONTACT_EMAIL=contact@computerstoreks.com
```

### Email Structure

Emails are sent with the following structure:

**From:** noreply@computerstoreks.com (or your verified domain)
**To:** contact@computerstoreks.com
**Subject:** New Contact Form Submission - [Service Type]

### Example Email Content

```
New Contact Form Submission

From: John Doe
Email: john@example.com
Phone: (785) 555-0123
Service: Computer Repair

Message:
My computer won't turn on. The power light blinks but nothing appears on screen. I've tried unplugging it and waiting but it still doesn't work. Can you help diagnose the issue?

---
Submitted at: 2025-11-19 10:30:00 AM
IP Address: 192.168.1.1
```

### API Route Implementation

Create the API route at `src/app/api/contact/route.ts`:

```typescript
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  service: z.string().min(1, 'Service is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = contactSchema.parse(body);

    await resend.emails.send({
      from: 'noreply@computerstoreks.com',
      to: process.env.CONTACT_EMAIL || 'contact@computerstoreks.com',
      subject: `New Contact Form Submission - ${data.service}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
        <p><strong>Service:</strong> ${data.service}</p>
        <h3>Message:</h3>
        <p>${data.message.replace(/\n/g, '<br>')}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
```

## Bot Protection

### Honeypot Field

Add a hidden field that bots will fill out:

```typescript
// In form state
const [honeypot, setHoneypot] = useState('');

// In form JSX (hidden with CSS)
<input
  type="text"
  name="website"
  value={honeypot}
  onChange={(e) => setHoneypot(e.target.value)}
  style={{ display: 'none' }}
  tabIndex={-1}
  autoComplete="off"
/>

// In submit handler
if (honeypot) {
  // Bot detected, silently fail
  setSubmitStatus('success'); // Fake success
  return;
}
```

### Time-Based Protection

Prevent instant form submissions:

```typescript
const [formLoadTime] = useState(Date.now());

// In submit handler
const submitTime = Date.now();
const timeDiff = submitTime - formLoadTime;

if (timeDiff < 3000) { // Less than 3 seconds
  // Too fast, likely a bot
  return;
}
```

### reCAPTCHA Integration (Optional)

For stronger protection, add Google reCAPTCHA:

1. Get API keys from https://www.google.com/recaptcha
2. Install the package: `bun add react-google-recaptcha`
3. Add to form component

```typescript
import ReCAPTCHA from 'react-google-recaptcha';

// In component
const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

// In JSX
<ReCAPTCHA
  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
  onChange={setRecaptchaToken}
/>

// Verify in API route
const recaptchaResponse = await fetch(
  'https://www.google.com/recaptcha/api/siteverify',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
  }
);
```

## Rate Limiting

### Implementation Options

#### Option 1: In-Memory Rate Limiting

Simple solution for single-server deployments:

```typescript
// src/lib/rate-limit.ts
const rateLimit = new Map<string, number[]>();

export function checkRateLimit(ip: string, limit = 5, window = 60000): boolean {
  const now = Date.now();
  const timestamps = rateLimit.get(ip) || [];

  // Remove old timestamps
  const recent = timestamps.filter(t => now - t < window);

  if (recent.length >= limit) {
    return false; // Rate limited
  }

  recent.push(now);
  rateLimit.set(ip, recent);

  return true;
}

// In API route
const ip = request.headers.get('x-forwarded-for') || 'unknown';
if (!checkRateLimit(ip)) {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429 }
  );
}
```

#### Option 2: Redis Rate Limiting

For production with multiple servers:

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
});

// In API route
const ip = request.headers.get('x-forwarded-for') || 'unknown';
const { success } = await ratelimit.limit(ip);

if (!success) {
  return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429 }
  );
}
```

### Recommended Limits

| Environment | Limit | Window |
|-------------|-------|--------|
| Development | 100 | 1 minute |
| Production | 5 | 1 minute |

## Customizing Email Templates

### Basic HTML Template

```typescript
const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; }
    .content { padding: 20px; background: #f9fafb; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #374151; }
    .value { color: #1f2937; }
    .message { background: white; padding: 15px; border-left: 4px solid #2563eb; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Contact Form Submission</h1>
    </div>
    <div class="content">
      <div class="field">
        <span class="label">Name:</span>
        <span class="value">${data.name}</span>
      </div>
      <div class="field">
        <span class="label">Email:</span>
        <span class="value">${data.email}</span>
      </div>
      <div class="field">
        <span class="label">Phone:</span>
        <span class="value">${data.phone || 'Not provided'}</span>
      </div>
      <div class="field">
        <span class="label">Service:</span>
        <span class="value">${data.service}</span>
      </div>
      <div class="message">
        <div class="label">Message:</div>
        <p>${data.message.replace(/\n/g, '<br>')}</p>
      </div>
    </div>
    <div class="footer">
      <p>This email was sent from the contact form at computerstoreks.com</p>
    </div>
  </div>
</body>
</html>
`;
```

### Using React Email

For more complex templates, use React Email:

```bash
bun add @react-email/components
```

```typescript
// src/emails/contact-form.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface ContactEmailProps {
  name: string;
  email: string;
  phone?: string;
  service: string;
  message: string;
}

export function ContactEmail({
  name,
  email,
  phone,
  service,
  message,
}: ContactEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New contact form submission from {name}</Preview>
      <Body style={{ backgroundColor: '#f6f9fc' }}>
        <Container>
          <Heading>New Contact Form Submission</Heading>
          <Section>
            <Text><strong>Name:</strong> {name}</Text>
            <Text><strong>Email:</strong> {email}</Text>
            <Text><strong>Phone:</strong> {phone || 'Not provided'}</Text>
            <Text><strong>Service:</strong> {service}</Text>
          </Section>
          <Section>
            <Heading as="h3">Message</Heading>
            <Text>{message}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

### Adding Auto-Reply

Send a confirmation email to the customer:

```typescript
// Send to business
await resend.emails.send({
  from: 'noreply@computerstoreks.com',
  to: process.env.CONTACT_EMAIL,
  subject: `New Contact Form Submission - ${data.service}`,
  html: businessEmailHtml,
});

// Send confirmation to customer
await resend.emails.send({
  from: 'noreply@computerstoreks.com',
  to: data.email,
  subject: 'Thank you for contacting Computer Store Kansas',
  html: `
    <h2>Thank you for reaching out!</h2>
    <p>Dear ${data.name},</p>
    <p>We've received your message regarding ${data.service.toLowerCase()} and will respond within 24 hours.</p>
    <p>If you need immediate assistance, please call us at (785) 267-3223.</p>
    <p>Best regards,<br>Computer Store Kansas</p>
  `,
});
```

## Troubleshooting

### Form Not Submitting

**Problem:** Nothing happens when clicking submit

**Solutions:**
1. Check browser console for JavaScript errors
2. Verify form validation is passing
3. Check network tab for failed requests
4. Ensure the API route exists

### Validation Errors Not Showing

**Problem:** Form shows no errors but won't submit

**Solutions:**
1. Check that error state is being set
2. Verify the error display component is rendering
3. Check CSS isn't hiding error messages

### Email Not Received

**Problem:** Form submits successfully but no email arrives

**Solutions:**
1. Check Resend dashboard for delivery status
2. Verify API key is correct
3. Check spam/junk folder
4. Verify the `to` email address
5. Check Resend domain verification status

```bash
# Test Resend connection
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer re_xxxx' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "test@yourdomain.com",
    "to": "your@email.com",
    "subject": "Test",
    "text": "Hello"
  }'
```

### Rate Limit Errors

**Problem:** Users getting "Too many requests" error

**Solutions:**
1. Increase rate limit threshold
2. Increase rate limit window
3. Check if behind proxy (use correct IP header)
4. Clear rate limit cache

### CORS Errors

**Problem:** API returns CORS error

**Solutions:**
1. Verify Next.js API routes (they handle CORS automatically)
2. Check for correct domain in requests
3. Review headers in network tab

### Email Formatting Issues

**Problem:** Email looks broken or unstyled

**Solutions:**
1. Use inline styles (email clients don't support external CSS)
2. Test with multiple email clients
3. Use tables for layout (better email client support)
4. Use Litmus or Email on Acid for testing

### Environment Variables Not Loading

**Problem:** API can't access RESEND_API_KEY

**Solutions:**
1. Verify `.env.local` file exists
2. Restart development server
3. Check variable name matches exactly
4. In production, verify environment variables in hosting dashboard

## Related Documentation

- [README.md](./README.md) - Project overview
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Local development setup
- [SEO_IMPLEMENTATION.md](./SEO_IMPLEMENTATION.md) - SEO features

---

For Resend documentation, visit https://resend.com/docs
