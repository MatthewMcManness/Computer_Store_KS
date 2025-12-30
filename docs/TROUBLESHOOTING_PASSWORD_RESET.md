# Password Reset Flow - Troubleshooting Guide

**Created:** 2025-12-30
**Status:** Needs Investigation
**Priority:** High - Blocking user password resets

---

## Current Issue

Users clicking the password reset link in their email are being sent to the "Invalid or Expired Link" page instead of the password reset form.

### What Works
- `/reset-password` page - Can request a password reset email
- Password reset emails are being sent successfully (6 users received emails)
- Email links contain the correct URL format with tokens

### What Doesn't Work
- `/reset-password/confirm` page - Shows "Invalid or Expired Link" immediately
- Token detection/session establishment is failing

---

## Things to Check

### 1. Verify the Email Link Format
Open browser console and check the URL when clicking the reset link:
```
Expected format:
https://computerstoreks.com/reset-password/confirm#access_token=XXX&refresh_token=YYY&type=recovery&...
```

**Check:**
- Does the URL have a `#` hash fragment?
- Is `access_token` present?
- Is `type=recovery` present?
- Is the domain correct (`computerstoreks.com`, not `localhost`)?

### 2. Check Supabase Site URL Configuration
In Supabase Dashboard → Authentication → URL Configuration:
- **Site URL** should be: `https://computerstoreks.com`
- **Redirect URLs** should include: `https://computerstoreks.com/reset-password/confirm`

### 3. Check Browser Console for Errors
When on the confirm page, open DevTools (F12) → Console tab. Look for:
- "No hash fragment found" - URL doesn't have tokens
- "No access token in URL" - Token missing from hash
- "Error setting session: [message]" - Supabase rejecting the token
- Any other JavaScript errors

### 4. Check Token Expiry
Password reset tokens expire after a certain time (default: 1 hour in Supabase).
- Try clicking the link immediately after receiving the email
- If that works, the token might be expiring

### 5. Check Supabase Email Template
In Supabase Dashboard → Authentication → Email Templates → Reset Password:
- Verify the `{{ .ConfirmationURL }}` variable is used correctly
- The redirect URL should point to `/reset-password/confirm`

---

## Potential Fixes to Try

### Fix 1: Simplify Token Detection (Already Applied)
The code was updated to:
- Use `useMemo` for Supabase client (prevents recreation)
- Use `useRef` to prevent double execution
- Directly call `setSession` with tokens from URL

**Status:** Code committed but deployment may have been superseded

### Fix 2: Check if Hash is Stripped
Some configurations strip hash fragments. Check if:
- The middleware is modifying URLs
- Next.js is doing server-side redirects that lose the hash

### Fix 3: Use Code Exchange Instead
Supabase sometimes uses `code` parameter instead of `access_token`:
```typescript
const code = hashParams.get('code');
if (code) {
  await supabase.auth.exchangeCodeForSession(code);
}
```

### Fix 4: Add PKCE Flow Support
Check if Supabase project is using PKCE (Proof Key for Code Exchange):
- Go to Supabase Dashboard → Authentication → Settings
- Check "Enable Email Confirmations" and flow type

---

## Files to Review

| File | Purpose |
|------|---------|
| `src/app/(auth)/reset-password/confirm/page.tsx` | Password reset confirmation page |
| `src/app/(auth)/reset-password/page.tsx` | Password reset request page |
| `scripts/send-password-resets.ts` | Script that sends reset emails |
| `docs/supabase/email-templates/reset-password.html` | Email template reference |

---

## Testing Steps

1. **Request a new password reset:**
   - Go to https://computerstoreks.com/reset-password
   - Enter email
   - Check email arrives

2. **Click the link and observe:**
   - Open browser DevTools BEFORE clicking link
   - Click the link in email
   - Check Console tab for log messages
   - Note the URL in the address bar

3. **Manual token test:**
   - Copy the full URL from email (don't click)
   - Paste into browser
   - Check if hash fragment is present

4. **Check Supabase logs:**
   - Go to Supabase Dashboard → Logs → Auth
   - Look for password reset events
   - Check for any errors

---

## Commands for Testing

```bash
# Send a test reset email
cd ~/Bast/projects/clients/Computer_Store_KS
bun run scripts/send-password-resets.ts

# Build and check for errors
bun run build

# Check git status
git status

# Deploy to production (after fixing)
git add .
git commit -m "fix: password reset token detection"
git push origin main
git checkout Production && git merge main && git push origin Production
```

---

## Related Documentation

- [Supabase Password Reset Docs](https://supabase.com/docs/guides/auth/passwords#resetting-a-password)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

---

## Notes

- The fix committed on 2025-12-30 may have been superseded by another deployment
- Check the Render deployment history to see which commit is live
- Consider adding more detailed logging to debug the issue
