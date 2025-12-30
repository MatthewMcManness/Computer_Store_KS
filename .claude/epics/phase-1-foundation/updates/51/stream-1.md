---
issue: 51
stream: Supabase Auth Configuration
agent: cloud-architect
started: 2025-12-26T22:42:04Z
status: completed
completed: 2025-12-26T23:15:00Z
---

# Stream 1: Supabase Auth Configuration

## Scope
Configure Supabase Auth for email/password authentication, set up custom email templates via Resend SMTP, and configure session expiration settings.

## Files Created/Modified

### Created
- `docs/supabase/auth-configuration.md` - Complete Supabase Dashboard configuration guide
- `docs/supabase/email-templates/confirm-signup.html` - Branded verification email
- `docs/supabase/email-templates/reset-password.html` - Branded password reset email
- `docs/supabase/email-templates/magic-link.html` - Branded magic link email
- `docs/supabase/email-templates/invite-user.html` - Branded employee invitation email
- `src/lib/supabase-auth.ts` - Authentication helper library with session management

### Modified
- `.env.example` - Added SMTP configuration documentation

## Completed Work

### 1. Auth Configuration Documentation
Created comprehensive guide for manual Supabase Dashboard configuration:
- Email/password provider settings
- Custom SMTP via Resend (smtp.resend.com:465)
- Rate limiting (5 attempts per 15 min)
- URL configuration for redirects
- Session settings (JWT expiry, refresh token rotation)

### 2. Custom Email Templates
Created four branded HTML email templates for Computer Store KS:
- **Confirm Signup**: Welcome email with verification link
- **Reset Password**: Security-focused password reset with warning
- **Magic Link**: Passwordless sign-in for customers
- **Invite User**: Employee onboarding invitation

All templates include:
- Computer Store KS branding (#1e3a5f header)
- Business contact information
- Mobile-responsive design
- Clear call-to-action buttons

### 3. Session Duration Implementation
Created `src/lib/supabase-auth.ts` with:
- Role-based session durations:
  - Employees (admin, technician, receptionist): 8 hours
  - Customers: 30 days
- Helper functions: `getSessionDurationForRole()`, `calculateSessionExpiry()`, `shouldExtendSession()`
- Full auth workflow: signUp, signIn, signInWithMagicLink, signOut
- User profile management linked to auth.users
- Admin functions: inviteUser, deleteUser, listUsers

### 4. Environment Configuration
Updated `.env.example` with:
- SMTP settings documentation
- Session configuration notes
- Rate limit settings reference
- Links to email template documentation

## Acceptance Criteria Status

- [x] Email/password provider enabled in Supabase (documented in auth-configuration.md)
- [x] Custom SMTP configured with Resend (documented with settings)
- [x] Email templates customized (4 templates created with branding)
- [x] Session expiration configured (8 hours employees, 30 days customers via supabase-auth.ts)
- [x] Rate limiting configured (5 attempts per 15 min documented)

## Manual Dashboard Steps Required

The following must be configured manually in Supabase Dashboard:

1. **Authentication > Providers > Email**
   - Enable Email Provider: ON
   - Confirm Email: ON
   - Double Confirm Email Changes: ON

2. **Project Settings > Authentication > SMTP Settings**
   - Enable Custom SMTP: ON
   - Host: smtp.resend.com
   - Port: 465
   - Username: resend
   - Password: [RESEND_API_KEY]
   - Sender: noreply@computerstoreks.com

3. **Authentication > Email Templates**
   - Copy content from `docs/supabase/email-templates/*.html`

4. **Authentication > Rate Limits**
   - Sign up/in: 5 per 15 min
   - Password recovery: 5 per 15 min

5. **Project Settings > Auth**
   - JWT Expiry: 3600
   - Refresh Token Rotation: Enabled

## Notes
- Supabase MCP tools were not available, so configuration is documented for manual dashboard setup
- The `supabase-auth.ts` library handles session extension logic in application code
- Email templates use Supabase template variables ({{ .ConfirmationURL }}, etc.)
