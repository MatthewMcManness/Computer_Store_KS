# Contact Form Migration Guide
## Moving from Self-Hosted to Render + GitHub

**Date**: November 27, 2024
**Status**: Ready to Deploy
**Current Issue**: Contact form not live on Render deployment

---

## 📋 Current Situation

### What's Working ✅
- Next.js app deployed on Render
- Gallery API running separately
- Contact form component exists in code (`src/app/api/contact/route.ts`)
- Email integration code is ready (uses Resend API)

### What's Missing ❌
- **Environment variables not configured on Render**
- Contact form has no email credentials
- `.env` file doesn't exist locally

---

## 🔧 Required Changes

### 1. Create Resend Account (If Not Done)

**Steps:**
1. Go to https://resend.com
2. Sign up for free account
3. Verify your email
4. Get API key from https://resend.com/api-keys
5. **(Optional but recommended)** Verify your domain `computerstoreks.com`

**Why Resend?**
- 3,000 free emails/month
- Better deliverability than self-hosted SMTP
- Easy API integration
- Already integrated in code

---

### 2. Configure Environment Variables on Render

Go to your Render dashboard → Computer Store KS web service → Environment

**Required Variables:**

```bash
# Email Service (CRITICAL - Contact form won't work without this)
RESEND_API_KEY=re_your_actual_api_key_here
NOTIFICATION_EMAIL=contact@computerstoreks.com

# Application URL
NEXT_PUBLIC_APP_URL=https://your-app.onrender.com

# Node Environment
NODE_ENV=production

# GitHub (for gallery manager - already configured)
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=MatthewMcManness
GITHUB_REPO=Computer_Store_KS
GITHUB_BRANCH=Computer-Store-KS

# Admin (for gallery manager - already configured)
ADMIN_PASSWORD=your_admin_password
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-app.onrender.com
```

**Priority Variables for Contact Form:**
1. `RESEND_API_KEY` ⚠️ **CRITICAL**
2. `NOTIFICATION_EMAIL` (defaults to contact@computerstoreks.com if not set)

---

### 3. Update Render Configuration (render.yaml)

**Current render.yaml only has gallery API.** You need to add the main Next.js app:

```yaml
services:
  # Main Next.js Website
  - type: web
    name: computer-store-ks
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: NEXT_PUBLIC_APP_URL
        sync: false
      - key: RESEND_API_KEY
        sync: false
      - key: NOTIFICATION_EMAIL
        value: contact@computerstoreks.com
      - key: GITHUB_TOKEN
        sync: false
      - key: GITHUB_OWNER
        value: MatthewMcManness
      - key: GITHUB_REPO
        value: Computer_Store_KS
      - key: GITHUB_BRANCH
        value: Computer-Store-KS
      - key: ADMIN_PASSWORD
        sync: false
      - key: NEXTAUTH_SECRET
        sync: false
      - key: NEXTAUTH_URL
        sync: false

  # Gallery API (existing)
  - type: web
    name: computer-store-gallery-api
    env: node
    rootDirectory: ./api
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_VERSION
        value: 18.17.0
      - key: GITHUB_TOKEN
        sync: false
      - key: GITHUB_OWNER
        value: MatthewMcManness
      - key: GITHUB_REPO
        value: Computer_Store_KS
      - key: GITHUB_BRANCH
        value: Computer-Store-KS
      - key: ADMIN_PASSWORD
        sync: false
      - key: PORT
        value: 3001
```

---

### 4. Local Development Setup (Optional)

If you want to test locally:

```bash
# Create .env file
cp .env.example .env

# Edit .env and add:
RESEND_API_KEY=re_your_api_key
NOTIFICATION_EMAIL=contact@computerstoreks.com
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Other variables from .env.example as needed
```

---

## 🚀 Deployment Steps

### Quick Deploy (If Render auto-deploys from GitHub)

1. **Get Resend API Key**
   ```
   - Go to https://resend.com/api-keys
   - Create new API key
   - Copy it (starts with "re_")
   ```

2. **Add to Render**
   ```
   - Go to Render dashboard
   - Select your web service
   - Environment → Add Environment Variable
   - Name: RESEND_API_KEY
   - Value: re_your_actual_key
   - Save
   ```

3. **Trigger Redeploy**
   ```
   - Render → Manual Deploy → Deploy latest commit
   - Wait for build to complete (~2-5 minutes)
   ```

4. **Test Contact Form**
   ```
   - Go to https://your-app.onrender.com/contact
   - Fill out and submit form
   - Check contact@computerstoreks.com for email
   ```

### Manual Deploy (If needed)

```bash
# From project directory
cd /home/matthew/Bast/Projects/Clients/Computer_Store_KS

# Commit any pending changes
git add .
git commit -m "Configure contact form for Render deployment"

# Push to GitHub
git push origin Computer-Store-KS

# Render will auto-deploy (if configured)
# Or manually deploy from Render dashboard
```

---

## 🔍 How to Verify It's Working

### 1. Check Environment Variables
```bash
# In Render dashboard
# Environment tab should show:
✓ RESEND_API_KEY (hidden value)
✓ NOTIFICATION_EMAIL
```

### 2. Check Build Logs
```bash
# In Render dashboard → Logs
# Should see:
✓ Build completed
✓ Server started
✓ No environment variable warnings
```

### 3. Test Contact Form
```bash
# Go to: https://your-app.onrender.com/contact

# Fill out form:
- Name: Test User
- Email: your-test-email@gmail.com
- Subject: General
- Message: Testing contact form

# Submit and check:
✓ Success message appears
✓ Email arrives at contact@computerstoreks.com
✓ Confirmation email arrives at your test email
```

### 4. Check Resend Dashboard
```bash
# Go to: https://resend.com/emails
# Should see:
✓ Recent emails sent
✓ Delivery status: "Delivered"
```

---

## 🎯 What Changed from Self-Hosted

### Before (Self-Hosted)
- Used direct SMTP configuration
- Email sent from local server
- Required SMTP credentials (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD)
- Contact API endpoint was separate: `https://tcs-contact-api.onrender.com/api/contact`

### After (Render + Resend)
- Uses Resend API for email
- No SMTP configuration needed
- Just one API key: `RESEND_API_KEY`
- Contact API is built into Next.js app: `/api/contact`
- Better deliverability and reliability

---

## 📝 Files Involved

### Already Configured ✅
- `src/app/api/contact/route.ts` - API endpoint
- `src/lib/email.ts` - Email sending logic
- `src/components/forms/contact-form.tsx` - Contact form UI
- `src/app/contact/page.tsx` - Contact page

### Need to Update 🔧
- `render.yaml` - Add main app service (currently only has gallery API)
- Render environment variables - Add RESEND_API_KEY

### Optional 📋
- `.env` - For local development only (gitignored)

---

## 🐛 Troubleshooting

### Contact Form Shows Error
**Problem:** Form submits but shows error message

**Check:**
1. Render logs for error details
2. RESEND_API_KEY is set correctly
3. API key is not expired
4. Resend account is active

### No Email Received
**Problem:** Form submits successfully but no email arrives

**Check:**
1. Spam folder
2. NOTIFICATION_EMAIL is correct
3. Resend dashboard shows email sent
4. Domain verification status (if using custom domain)

### 429 Rate Limit Error
**Problem:** "Too many requests" error

**Solution:**
- Built-in rate limit: 3 requests per minute per IP
- Wait 1 minute and try again
- Normal protection against spam

---

## 💰 Cost Breakdown

### Resend Email Service
- **Free Tier**: 3,000 emails/month
- **Cost**: $0 (unless you send >3,000/month)
- **Typical Usage**: ~50-200 emails/month for contact form
- **Verdict**: ✅ Free tier is plenty

### Render Hosting
- Already paying for hosting
- No additional cost for contact form
- Uses same Next.js deployment

---

## ✅ Checklist

Before marking complete, verify:

- [ ] Resend account created
- [ ] API key obtained from Resend
- [ ] `RESEND_API_KEY` added to Render environment
- [ ] `NOTIFICATION_EMAIL` set (or using default)
- [ ] App redeployed on Render
- [ ] Contact page loads at `/contact`
- [ ] Form submission works
- [ ] Email received at contact@computerstoreks.com
- [ ] Confirmation email sent to user
- [ ] Tested from different email addresses

---

## 📞 Support

**Resend Support:**
- Docs: https://resend.com/docs
- Dashboard: https://resend.com/emails
- Status: https://status.resend.com

**Render Support:**
- Docs: https://render.com/docs
- Dashboard: https://dashboard.render.com
- Support: support@render.com

---

## 🎊 Next Steps

Once contact form is live:

1. ✅ Test thoroughly from multiple devices
2. ✅ Add contact form link to main navigation (if not already there)
3. ✅ Update any documentation with new contact process
4. ✅ Consider adding analytics to track form submissions
5. ✅ Set up email forwarding if needed (contact@ to personal email)

---

**Status**: Ready to implement
**Estimated Time**: 15-30 minutes
**Required Access**: Render dashboard, Resend account

**Last Updated**: November 27, 2024
