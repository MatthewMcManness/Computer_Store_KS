# 🚀 Deployment Steps for Contact Form

## Quick Answer: Where to Add Variables?

**You need to create a NEW web service in Render** for your main Next.js app.

Your current setup only has the old gallery API. The contact form is part of the main Next.js app (in `src/app/api/contact/`), which isn't deployed yet.

---

## 📋 Step-by-Step Instructions

### Step 1: Get Resend API Key

1. Go to https://resend.com
2. Sign up (free - 3,000 emails/month)
3. Go to https://resend.com/api-keys
4. Click "Create API Key"
5. Name it: "Computer Store KS Contact Form"
6. Copy the key (starts with `re_`)
7. **Save it somewhere safe - you'll need it in Step 3**

### Step 2: Commit Updated render.yaml

```bash
cd /home/matthew/Bast/Projects/Clients/Computer_Store_KS

# Add the updated render.yaml
git add render.yaml DEPLOYMENT_STEPS.md CONTACT_FORM_MIGRATION.md

# Commit
git commit -m "Add main Next.js app to Render config with contact form support

- Updated render.yaml to include main website service
- Added RESEND_API_KEY for contact form
- Kept legacy gallery API for now
- Added deployment documentation"

# Push to GitHub
git push origin Computer-Store-KS
```

### Step 3: Deploy to Render

**Option A: Create from render.yaml (Recommended)**

1. Go to https://dashboard.render.com
2. Click "New +" → "Blueprint"
3. Select your repository: `Computer_Store_KS`
4. Render will read `render.yaml` automatically
5. Click "Apply"
6. **Add Secret Environment Variables** (these marked `sync: false` in yaml):
   ```
   RESEND_API_KEY = re_your_actual_key_from_step_1
   NEXT_PUBLIC_APP_URL = (will auto-fill with your Render URL)
   GITHUB_TOKEN = your_github_personal_access_token
   ADMIN_PASSWORD = your_admin_password
   NEXTAUTH_SECRET = (generate with: openssl rand -base64 32)
   NEXTAUTH_URL = (will auto-fill with your Render URL)
   ```
7. Click "Create Services"

**Option B: Create Manually**

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect to your GitHub repo
4. Configure:
   - **Name**: `computer-store-ks`
   - **Branch**: `Computer-Store-KS`
   - **Root Directory**: (leave blank)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add all environment variables from Step 3 Option A above
6. Click "Create Web Service"

### Step 4: Wait for Deployment

- First build takes 3-5 minutes
- Watch the logs for any errors
- Look for: "✓ Ready in X seconds"

### Step 5: Test Contact Form

1. Go to your Render URL: `https://computer-store-ks.onrender.com/contact`
2. Fill out the form:
   ```
   Name: Test User
   Email: your-email@gmail.com
   Phone: (785) 555-1234
   Subject: General
   Message: Testing contact form after Render deployment
   ```
3. Click "Send Message"
4. Check for success message
5. Check email at `contact@computerstoreks.com`
6. You should also get a confirmation email at your test address

### Step 6: Verify Everything Works

- [ ] Contact page loads
- [ ] Form submits without errors
- [ ] Notification email arrives at contact@computerstoreks.com
- [ ] Confirmation email arrives at user's email
- [ ] Check Resend dashboard shows emails sent
- [ ] Test from different email addresses
- [ ] Test rate limiting (try 4+ submissions quickly)

---

## 🎯 What This Creates

After deployment, you'll have:

```
Render Services:
├── computer-store-ks (NEW - Main Website)
│   ├── URL: https://computer-store-ks.onrender.com
│   ├── Pages: Home, About, Contact, Gallery, etc.
│   ├── Contact Form: /contact ✅
│   ├── Contact API: /api/contact ✅
│   └── Gallery Manager: /admin/gallery ✅
│
└── computer-store-gallery-api (OLD - Can Remove)
    ├── URL: https://computer-store-gallery-api.onrender.com
    └── Legacy API (not needed if main app handles everything)
```

---

## 💡 Do You Need Both Services?

**Short Answer**: No, probably not.

The old `computer-store-gallery-api` was for self-hosting. Your main Next.js app (`computer-store-ks`) includes everything:
- Contact form ✅
- Gallery management ✅
- All website pages ✅

**You can delete the old gallery API service** after confirming the main app works.

---

## 🔧 Environment Variables Explained

### Required for Contact Form:
```bash
RESEND_API_KEY=re_xxx          # From Resend dashboard
NOTIFICATION_EMAIL=contact@    # Where form submissions go
```

### Required for Next.js:
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.onrender.com
```

### Required for Gallery Manager:
```bash
GITHUB_TOKEN=ghp_xxx          # Personal access token
GITHUB_OWNER=MatthewMcManness
GITHUB_REPO=Computer_Store_KS
GITHUB_BRANCH=Computer-Store-KS
ADMIN_PASSWORD=xxx            # For gallery admin login
```

### Required for NextAuth (if using):
```bash
NEXTAUTH_SECRET=xxx           # Random secret
NEXTAUTH_URL=https://your-app.onrender.com
```

---

## ⚠️ Important Notes

1. **Don't add variables to the old gallery API** - it won't help. You need the main Next.js app deployed.

2. **Resend Domain Verification** (Optional but recommended):
   - Go to https://resend.com/domains
   - Add `computerstoreks.com`
   - Add DNS records they provide
   - This improves email deliverability

3. **Custom Domain** (Optional):
   - In Render dashboard, go to your service
   - Settings → Custom Domain
   - Add `www.computerstoreks.com` or `computerstoreks.com`

4. **Free Tier Limits**:
   - Render: Free tier sleeps after 15 min inactivity
   - Resend: 3,000 emails/month free
   - Both are fine for your use case

---

## 🐛 Troubleshooting

### "Service not found" in Render
- The render.yaml defines it, but you need to apply it
- Use "New Blueprint" option, not "New Web Service"

### "Environment variable not set"
- Variables marked `sync: false` must be added manually
- Go to service → Environment → Add

### "Build failed"
- Check build logs in Render dashboard
- Common issue: Missing dependencies in package.json
- Run locally first: `npm install && npm run build`

### Contact form shows error
- Check Render logs for details
- Verify RESEND_API_KEY is set
- Test API key in Resend dashboard

### No email received
- Check spam folder
- Verify NOTIFICATION_EMAIL is correct
- Check Resend dashboard for delivery status
- Make sure domain is verified in Resend

---

## ✅ Checklist

Before going live:

- [ ] Resend account created
- [ ] API key obtained and saved
- [ ] render.yaml committed to git
- [ ] Pushed to GitHub
- [ ] Created new Render service from blueprint
- [ ] Added all secret environment variables
- [ ] Deployment completed successfully
- [ ] Contact page loads at /contact
- [ ] Test submission works
- [ ] Emails received successfully
- [ ] Tested from multiple email addresses
- [ ] (Optional) Custom domain configured
- [ ] (Optional) Resend domain verified

---

## 🎊 After Deployment

1. **Update your main domain** to point to the new Render service
2. **Test everything thoroughly** before announcing
3. **Monitor Resend dashboard** for email deliverability
4. **Remove old gallery API service** if not needed
5. **Set up uptime monitoring** (optional - uptimerobot.com is free)

---

**Need Help?**
- Render Support: https://render.com/docs
- Resend Support: https://resend.com/docs
- Check logs in Render dashboard for errors

**Estimated Total Time**: 20-30 minutes
**Cost**: $0 (using free tiers)

Good luck! 🚀
