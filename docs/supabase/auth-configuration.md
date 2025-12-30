# Supabase Auth Configuration

> Configuration guide for Computer Store KS Supabase Authentication
>
> Project ID: `gzcmwpcxnwlgknhjijic`
> Dashboard: https://supabase.com/dashboard/project/gzcmwpcxnwlgknhjijic

---

## Overview

This document provides step-by-step instructions for configuring Supabase Auth with:
- Email/password authentication
- Custom SMTP via Resend
- Branded email templates
- Session expiration settings
- Rate limiting for security

---

## 1. Enable Email/Password Provider

**Path:** Authentication > Providers > Email

### Configuration

| Setting | Value |
|---------|-------|
| Enable Email Provider | ON |
| Enable Sign Up | ON |
| Confirm Email | ON (require email verification) |
| Double Confirm Email Changes | ON |
| Secure Email Change | ON |

### CAPTCHA Settings (Optional)

If using Cloudflare Turnstile:
| Setting | Value |
|---------|-------|
| Enable Captcha | ON |
| Captcha Provider | Turnstile |
| Site Key | From NEXT_PUBLIC_TURNSTILE_SITE_KEY |
| Secret Key | From TURNSTILE_SECRET_KEY |

---

## 2. Configure Custom SMTP (Resend)

**Path:** Project Settings > Authentication > SMTP Settings

### Enable Custom SMTP

| Setting | Value |
|---------|-------|
| Enable Custom SMTP | ON |
| Sender Email | noreply@computerstoreks.com |
| Sender Name | Computer Store KS |
| SMTP Host | smtp.resend.com |
| SMTP Port | 465 (SSL) |
| Username | resend |
| Password | [RESEND_API_KEY from environment] |

### DNS Configuration for Resend

Ensure the following DNS records are configured for computerstoreks.com:

```
# SPF Record (TXT)
v=spf1 include:_spf.resend.com ~all

# DKIM Record (provided by Resend)
# Add the DKIM record from your Resend domain settings

# DMARC Record (TXT)
v=DMARC1; p=none; rua=mailto:dmarc@computerstoreks.com
```

---

## 3. Session Configuration

**Path:** Authentication > URL Configuration (for redirects)
**Path:** Project Settings > Auth > Session (for JWT settings)

### JWT Settings

| Setting | Value | Notes |
|---------|-------|-------|
| JWT Expiry | 3600 | 1 hour (will be extended in middleware) |
| Refresh Token Rotation | Enabled | Security best practice |
| Refresh Token Reuse Interval | 10 | Seconds before old token invalidated |

### Session Strategy

The base JWT expiry is set to 1 hour. Middleware will handle extended sessions:

| User Type | Session Duration | Implementation |
|-----------|------------------|----------------|
| Employees (admin, technician, receptionist) | 8 hours | Custom refresh logic |
| Customers | 30 days | Remember me functionality |

> **Note:** Custom session extension is implemented in application middleware, not Supabase settings.

---

## 4. URL Configuration

**Path:** Authentication > URL Configuration

### Redirect URLs

| Setting | Development | Production |
|---------|-------------|------------|
| Site URL | http://localhost:3000 | https://computerstoreks.com |
| Redirect URLs | http://localhost:3000/** | https://computerstoreks.com/** |

### Add these redirect URLs:

```
# Development
http://localhost:3000/auth/callback
http://localhost:3000/admin
http://localhost:3000/portal

# Production
https://computerstoreks.com/auth/callback
https://computerstoreks.com/admin
https://computerstoreks.com/portal
```

---

## 5. Rate Limiting

**Path:** Authentication > Rate Limits

### Recommended Settings

| Endpoint | Rate Limit | Time Window |
|----------|------------|-------------|
| Sign Up | 5 requests | 15 minutes |
| Sign In | 5 requests | 15 minutes |
| Password Recovery | 5 requests | 15 minutes |
| Token Refresh | 30 requests | 1 minute |
| Verify | 10 requests | 15 minutes |

> **Note:** These limits help prevent brute force attacks while remaining user-friendly.

---

## 6. Email Templates

**Path:** Authentication > Email Templates

### Template Customization

All templates should:
- Use Computer Store KS branding
- Include business contact information
- Have clear call-to-action buttons
- Be mobile-responsive

See the following files for template HTML:
- `docs/supabase/email-templates/confirm-signup.html`
- `docs/supabase/email-templates/reset-password.html`
- `docs/supabase/email-templates/magic-link.html`
- `docs/supabase/email-templates/invite-user.html`

### Template Variables

Available variables in templates:
| Variable | Description |
|----------|-------------|
| {{ .ConfirmationURL }} | Email verification link |
| {{ .Token }} | OTP token (if using OTP) |
| {{ .TokenHash }} | Hashed token for security |
| {{ .SiteURL }} | Site URL configured in settings |
| {{ .RedirectTo }} | Redirect destination after action |

---

## 7. Verification Checklist

After configuration, verify:

- [ ] Test signup sends email via Resend
- [ ] Confirmation email renders correctly
- [ ] Password reset flow works end-to-end
- [ ] Magic link authentication works
- [ ] Rate limiting blocks excessive attempts
- [ ] Session expires correctly (1 hour JWT)
- [ ] Refresh token rotation works

### Test Commands

```bash
# Check SMTP connectivity (from server)
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"noreply@computerstoreks.com","to":"test@example.com","subject":"Test","html":"Test email"}'
```

---

## Troubleshooting

### Email Not Sending

1. Verify RESEND_API_KEY is correct
2. Check Resend domain verification status
3. Verify DNS records (SPF, DKIM, DMARC)
4. Check Resend dashboard for delivery logs

### Session Issues

1. Verify JWT expiry setting
2. Check refresh token rotation is enabled
3. Verify client-side token storage
4. Check for clock skew issues

### Rate Limit Errors

1. Wait for rate limit window to expire
2. Check if legitimate traffic or attack
3. Adjust limits if too restrictive for normal use

---

## Related Documentation

- [User Profiles Schema](../database/user-profiles-schema.sql)
- [Auth Middleware](../../src/lib/supabase-auth.ts) (to be created)
- [Resend Documentation](https://resend.com/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
