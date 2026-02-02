/**
 * Email utility functions using Resend API
 */

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

const RESEND_API_URL = 'https://api.resend.com/emails';

/**
 * Send an email via Resend API
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Computer Store Kansas <contact@computerstoreks.com>',
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Resend API error:', errorData);
      return { success: false, error: errorData };
    }

    const data = await response.json();
    return { success: true, id: data.id };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send notification email to business when contact form is submitted
 */
export async function sendContactNotification(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  location?: string;
}): Promise<EmailResult> {
  const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'contact@computerstoreks.com';
  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .field { margin-bottom: 15px; }
        .label { font-weight: 600; color: #374151; display: block; margin-bottom: 4px; }
        .value { color: #111827; }
        .message-box { background: white; padding: 15px; border-radius: 6px; border: 1px solid #d1d5db; }
        .footer { text-align: center; padding: 15px; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">New Contact Form Submission${data.location ? ` (${data.location})` : ''}</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">${data.subject}</p>
        </div>
        <div class="content">
          <div class="field">
            <span class="label">Name:</span>
            <span class="value">${data.name}</span>
          </div>
          <div class="field">
            <span class="label">Email:</span>
            <span class="value"><a href="mailto:${data.email}">${data.email}</a></span>
          </div>
          ${data.phone ? `
          <div class="field">
            <span class="label">Phone:</span>
            <span class="value"><a href="tel:${data.phone.replace(/\D/g, '')}">${data.phone}</a></span>
          </div>
          ` : ''}
          ${data.location ? `
          <div class="field">
            <span class="label">Location:</span>
            <span class="value">${data.location}</span>
          </div>
          ` : ''}
          <div class="field">
            <span class="label">Subject:</span>
            <span class="value">${data.subject}</span>
          </div>
          <div class="field">
            <span class="label">Message:</span>
            <div class="message-box">${data.message.replace(/\n/g, '<br>')}</div>
          </div>
        </div>
        <div class="footer">
          Submitted on ${timestamp} CST
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
New Contact Form Submission${data.location ? ` (${data.location})` : ''}

${data.location ? `Location: ${data.location}\n` : ''}Subject: ${data.subject}

Name: ${data.name}
Email: ${data.email}
${data.phone ? `Phone: ${data.phone}` : ''}

Message:
${data.message}

---
Submitted on ${timestamp} CST
  `.trim();

  return sendEmail({
    to: NOTIFICATION_EMAIL,
    subject: `New Contact Form (${data.location || 'Topeka'}): ${data.subject} from ${data.name}`,
    html,
    text,
    replyTo: data.email,
  });
}

/**
 * Send confirmation email to user after contact form submission
 */
export async function sendContactConfirmation(data: {
  name: string;
  email: string;
  subject: string;
}): Promise<EmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 25px 20px; border: 1px solid #e5e7eb; }
        .info-box { background: white; padding: 20px; border-radius: 6px; border: 1px solid #d1d5db; margin-top: 20px; }
        .info-item { margin-bottom: 10px; }
        .info-label { font-weight: 600; color: #374151; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
        a { color: #1e40af; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0 0 10px 0; font-size: 24px;">Thank You for Contacting Us!</h1>
          <p style="margin: 0; opacity: 0.9;">We've received your message</p>
        </div>
        <div class="content">
          <p>Hi ${data.name},</p>
          <p>Thank you for reaching out to Computer Store Kansas! We've received your message regarding <strong>"${data.subject}"</strong> and will get back to you as soon as possible, typically within 24 hours during business days.</p>
          <p>If you need immediate assistance, please don't hesitate to call us directly.</p>

          <div class="info-box">
            <h3 style="margin: 0 0 15px 0; color: #1e40af;">Contact Information</h3>
            <div class="info-item">
              <span class="info-label">Phone:</span> <a href="tel:7852673223">(785) 267-3223</a>
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span> <a href="mailto:contact@computerstoreks.com">contact@computerstoreks.com</a>
            </div>
            <div class="info-item">
              <span class="info-label">Address:</span> 2008 SW Gage Blvd, Topeka, KS 66604
            </div>
            <div class="info-item" style="margin-bottom: 0;">
              <span class="info-label">Hours:</span><br>
              Mon-Fri: 10am-6pm<br>
              Sat: 10am-2pm<br>
              Sun: Closed
            </div>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0;">Computer Store Kansas</p>
          <p style="margin: 5px 0;">Quality computers and expert repairs since 2003</p>
          <p style="margin: 5px 0;"><a href="https://computerstoreks.com">computerstoreks.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Thank You for Contacting Us!

Hi ${data.name},

Thank you for reaching out to Computer Store Kansas! We've received your message regarding "${data.subject}" and will get back to you as soon as possible, typically within 24 hours during business days.

If you need immediate assistance, please don't hesitate to call us directly.

---
CONTACT INFORMATION

Phone: (785) 267-3223
Email: contact@computerstoreks.com
Address: 2008 SW Gage Blvd, Topeka, KS 66604

Hours:
Mon-Fri: 10am-6pm
Sat: 10am-2pm
Sun: Closed

---
Computer Store Kansas
Quality computers and expert repairs since 2003
https://computerstoreks.com
  `.trim();

  return sendEmail({
    to: data.email,
    subject: 'Thank you for contacting Computer Store Kansas',
    html,
    text,
  });
}
